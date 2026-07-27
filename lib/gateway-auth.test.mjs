import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  createGatewaySession,
  GATEWAY_SESSION_EXPIRES,
  GATEWAY_TOKEN_ENV,
  getGatewayToken,
  isGatewaySessionValid,
  matchesGatewayToken,
} from "./gateway-auth.ts";

test("creates one persistent gateway token and reports it once", () => {
  const root = mkdtempSync(join(tmpdir(), "pivot-ui-auth-"));
  const tokenPath = join(root, "config", "gateway-token");
  const logs = [];
  try {
    const options = { tokenPath, env: {} };
    const first = getGatewayToken({ ...options, log: (message) => logs.push(message) });
    const second = getGatewayToken({ ...options, log: (message) => logs.push(message) });
    assert.match(first, /^[A-Za-z0-9_-]{43}$/);
    assert.equal(second, first);
    assert.equal(readFileSync(tokenPath, "utf8"), `${first}\n`);
    assert.equal(logs.length, 1);
    const report = [];
    getGatewayToken({ ...options, report: true, log: (message) => report.push(message) });
    assert.match(report[0], new RegExp(`Loaded from ${tokenPath}`));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("accepts only the configured token and signed perpetual sessions", () => {
  const root = mkdtempSync(join(tmpdir(), "pivot-ui-auth-"));
  const tokenPath = join(root, "gateway-token");
  try {
    writeFileSync(tokenPath, "configured-token\n");
    const options = { tokenPath, env: {} };
    assert.equal(matchesGatewayToken("configured-token", options), true);
    assert.equal(matchesGatewayToken("wrong-token", options), false);
    const session = createGatewaySession(options);
    assert.equal(isGatewaySessionValid(session, options), true);
    assert.equal(isGatewaySessionValid(`${session}x`, options), false);
    assert.doesNotMatch(session, /\./);
    assert.equal(GATEWAY_SESSION_EXPIRES.getUTCFullYear(), 9999);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("environment token overrides the gateway token file", () => {
  const root = mkdtempSync(join(tmpdir(), "pivot-ui-auth-"));
  const tokenPath = join(root, "gateway-token");
  const logs = [];
  try {
    writeFileSync(tokenPath, "file-token\n");
    const options = { tokenPath, env: { [GATEWAY_TOKEN_ENV]: "environment-token" } };
    assert.equal(getGatewayToken({ ...options, report: true, log: (message) => logs.push(message) }), "environment-token");
    assert.equal(matchesGatewayToken("file-token", options), false);
    assert.match(logs[0], new RegExp(`Loaded from ${GATEWAY_TOKEN_ENV}`));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

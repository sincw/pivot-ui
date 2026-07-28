import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("RPC session startup preloads extension-registered providers before restoring models", async () => {
  const source = await readFile(new URL("./rpc-manager.ts", import.meta.url), "utf8");
  const startupSource = source.slice(source.indexOf("export async function startRpcSession"));

  assert.match(startupSource, /createAgentSessionServices\(/);
  assert.match(startupSource, /createAgentSessionFromServices\(/);
  assert.doesNotMatch(startupSource, /await createAgentSession\(/);
});

test("RPC wrapper releases a stuck SDK session and rejects a second prompt", async () => {
  const source = await readFile(new URL("./rpc-manager.ts", import.meta.url), "utf8");

  assert.match(source, /export class AgentBusyError extends Error/);
  assert.match(source, /if \(this\.isRunning\(\)\) throw new AgentBusyError\(\)/);
  assert.match(source, /MODEL_START_TIMEOUT_MS = 300_000/);
  assert.match(source, /this\.inner\.abort\(\)/);
  assert.match(source, /this\.inner\.dispose\(\);/);
});

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export const GATEWAY_SESSION_COOKIE = "pivot-ui-gateway";
export const GATEWAY_SESSION_EXPIRES = new Date("9999-12-31T23:59:59.000Z");
export const GATEWAY_TOKEN_ENV = "PIVOT_GATEWAY_TOKEN";

interface GatewayAuthOptions {
  tokenPath?: string;
  log?: (message: string) => void;
  env?: NodeJS.ProcessEnv;
  report?: boolean;
}

export function getGatewayTokenPath(home = homedir()): string {
  return join(home, ".pivot-ui", "gateway-token");
}

function readToken(tokenPath: string): string | null {
  try {
    return readFileSync(tokenPath, "utf8").trim() || null;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function readConfiguredToken(env: NodeJS.ProcessEnv): string | null {
  const token = env[GATEWAY_TOKEN_ENV]?.trim();
  if (!token) return null;
  if (token.length > 128) throw new Error(`${GATEWAY_TOKEN_ENV} must be at most 128 characters`);
  return token;
}

export function getGatewayToken({ tokenPath = getGatewayTokenPath(), log = console.log, env = process.env, report = false }: GatewayAuthOptions = {}): string {
  const configured = readConfiguredToken(env);
  if (configured) {
    if (report) log(`\nPivot UI gateway token:\n${configured}\nLoaded from ${GATEWAY_TOKEN_ENV}\n`);
    return configured;
  }

  const existing = readToken(tokenPath);
  if (existing) {
    if (report) log(`\nPivot UI gateway token:\n${existing}\nLoaded from ${tokenPath}\n`);
    return existing;
  }

  mkdirSync(dirname(tokenPath), { recursive: true, mode: 0o700 });
  const token = randomBytes(32).toString("base64url");
  try {
    writeFileSync(tokenPath, `${token}\n`, { encoding: "utf8", mode: 0o600, flag: "wx" });
    log(`\nPivot UI gateway token created:\n${token}\nSaved to ${tokenPath}\n`);
    return token;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    const concurrent = readToken(tokenPath);
    if (concurrent) return concurrent;
    throw new Error(`Gateway token file is empty: ${tokenPath}`);
  }
}

function matches(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

export function matchesGatewayToken(value: string, options?: GatewayAuthOptions): boolean {
  return matches(value, getGatewayToken(options));
}

function signSession(token: string): string {
  return createHmac("sha256", token).update(GATEWAY_SESSION_COOKIE).digest("base64url");
}

export function createGatewaySession(options?: GatewayAuthOptions): string {
  return signSession(getGatewayToken(options));
}

export function isGatewaySessionValid(session: string | undefined, options?: GatewayAuthOptions): boolean {
  if (!session) return false;
  return matches(session, signSession(getGatewayToken(options)));
}

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getLibraryMcpServer, type LibraryMcpServer } from "./mcp-library";

export class McpWorkspaceConflict extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readConfig(path: string): Record<string, unknown> {
  if (!existsSync(path)) return {};
  const config = JSON.parse(readFileSync(path, "utf8")) as unknown;
  if (!isRecord(config) || (config.mcpServers !== undefined && !isRecord(config.mcpServers))) {
    throw new Error("workspace MCP configuration is invalid");
  }
  return config;
}

function hasServer(config: Record<string, unknown>, serverKey: string): boolean {
  return Boolean(findServerKey(config, serverKey));
}

function findServerKey(config: Record<string, unknown>, serverKey: string): string | undefined {
  return Object.keys((config.mcpServers as Record<string, unknown> | undefined) ?? {})
    .find((key) => key.toLowerCase() === serverKey.toLowerCase());
}

function workspaceMcpPath(cwd: string): string {
  return join(cwd, ".pi", "mcp.json");
}

function writeConfig(path: string, config: Record<string, unknown>): void {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp-${process.pid}-${Date.now()}`;
  writeFileSync(tmp, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  renameSync(tmp, path);
}

export function installLibraryMcpServer(cwd: string, libraryRoot: string, serverKey: string): LibraryMcpServer {
  const server = getLibraryMcpServer(libraryRoot, serverKey);
  if (!server) throw new Error(`MCP server "${serverKey}" not found in library`);
  if (hasServer(readConfig(join(cwd, ".mcp.json")), server.serverKey)) {
    throw new McpWorkspaceConflict(`MCP server "${server.serverKey}" is configured by the team project`);
  }

  const path = workspaceMcpPath(cwd);
  const config = readConfig(path);
  if (hasServer(config, server.serverKey)) {
    throw new McpWorkspaceConflict(`MCP server "${server.serverKey}" already exists in the project`);
  }
  const mcpServers = (config.mcpServers as Record<string, unknown> | undefined) ?? {};
  writeConfig(path, { ...config, mcpServers: { ...mcpServers, [server.serverKey]: server.definition } });
  return server;
}

/** Remove one direct project entry while preserving every other MCP setting. */
export function removeWorkspaceMcpServer(cwd: string, serverKey: string): void {
  const path = workspaceMcpPath(cwd);
  const config = readConfig(path);
  const currentKey = findServerKey(config, serverKey);
  if (!currentKey) throw new McpWorkspaceConflict(`MCP server "${serverKey}" is not configured in the project`);
  const mcpServers = { ...(config.mcpServers as Record<string, unknown>) };
  delete mcpServers[currentKey];
  writeConfig(path, { ...config, mcpServers });
}

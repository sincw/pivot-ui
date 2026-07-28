import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { readWorkspaceState } from "@/lib/workspace-packs";
import type { WorkspaceMcpServerInfo } from "@/lib/api-types";
import { getLibraryMcpServer } from "@/lib/mcp-library";
import { McpAdapterRequired, requireMcpAdapter } from "@/lib/mcp-adapter";
import { installLibraryMcpServer, McpWorkspaceConflict, removeWorkspaceMcpServer } from "@/lib/workspace-mcp";
import { ensureLibraryRoot, readConfig } from "@/lib/skill-packs-store";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readServerFile(
  path: string,
  source: WorkspaceMcpServerInfo["source"],
  managed: Set<string>,
): WorkspaceMcpServerInfo[] {
  if (!existsSync(path)) return [];
  const config = JSON.parse(readFileSync(path, "utf8")) as unknown;
  if (!isRecord(config) || (config.mcpServers !== undefined && !isRecord(config.mcpServers))) {
    throw new Error("workspace MCP configuration is invalid");
  }
  return Object.entries((config.mcpServers as Record<string, unknown> | undefined) ?? {}).flatMap(([serverKey, definition]) =>
    isRecord(definition) ? [{ serverKey, definition, source, managedByPack: source === "pi-project" && managed.has(serverKey.toLowerCase()) }] : [],
  );
}

function readServers(cwd: string): WorkspaceMcpServerInfo[] {
  const managed = managedServerKeys(cwd);
  return [
    ...readServerFile(join(cwd, ".mcp.json"), "team-project", managed),
    ...readServerFile(join(cwd, ".pi", "mcp.json"), "pi-project", managed),
  ];
}

function managedServerKeys(cwd: string): Set<string> {
  return new Set(Object.keys(readWorkspaceState({ cwd }).mcp.managedServers).map((key) => key.toLowerCase()));
}

// GET /api/mcp/servers?cwd=<path>
export async function GET(req: Request) {
  const cwd = new URL(req.url).searchParams.get("cwd");
  if (!cwd) return NextResponse.json({ error: "cwd required" }, { status: 400 });
  try {
    return NextResponse.json({ servers: readServers(cwd) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// POST /api/mcp/servers
// body: { cwd: string; serverKey: string }
export async function POST(req: Request) {
  try {
    const body = await req.json() as { cwd?: string; serverKey?: string };
    const cwd = body.cwd?.trim();
    const serverKey = body.serverKey?.trim();
    if (!cwd || !serverKey) return NextResponse.json({ error: "cwd and serverKey required" }, { status: 400 });
    const config = ensureLibraryRoot(readConfig());
    if (!config.libraryRoot) return NextResponse.json({ error: "library not configured" }, { status: 400 });
    if (!getLibraryMcpServer(config.libraryRoot, serverKey)) {
      return NextResponse.json({ error: `MCP server "${serverKey}" not found in library` }, { status: 404 });
    }
    requireMcpAdapter(cwd);
    const server = installLibraryMcpServer(cwd, config.libraryRoot, serverKey);
    return NextResponse.json({ success: true, server });
  } catch (error) {
    if (error instanceof McpAdapterRequired) return NextResponse.json({ error: "MCP_ADAPTER_REQUIRED", adapter: error.adapter }, { status: 412 });
    if (error instanceof McpWorkspaceConflict) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// DELETE /api/mcp/servers
// body: { cwd: string; serverKey: string }
export async function DELETE(req: Request) {
  try {
    const body = await req.json() as { cwd?: string; serverKey?: string };
    const cwd = body.cwd?.trim();
    const serverKey = body.serverKey?.trim();
    if (!cwd || !serverKey) return NextResponse.json({ error: "cwd and serverKey required" }, { status: 400 });
    if (managedServerKeys(cwd).has(serverKey.toLowerCase())) {
      return NextResponse.json({ error: "Pack-managed MCP servers must be removed from their Pack" }, { status: 409 });
    }
    requireMcpAdapter(cwd);
    removeWorkspaceMcpServer(cwd, serverKey);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof McpAdapterRequired) return NextResponse.json({ error: "MCP_ADAPTER_REQUIRED", adapter: error.adapter }, { status: 412 });
    if (error instanceof McpWorkspaceConflict) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

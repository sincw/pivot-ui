import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);
const { createLibraryMcpServer } = await jiti.import("./mcp-library.ts");
const { installLibraryMcpServer, McpWorkspaceConflict, removeWorkspaceMcpServer } = await jiti.import("./workspace-mcp.ts");

test("adds a library MCP without overwriting project or team entries", () => {
  const root = mkdtempSync(join(tmpdir(), "pivot-ui-workspace-mcp-"));
  const cwd = join(root, "project");
  const libraryRoot = join(root, "library");
  const mcpPath = join(cwd, ".pi", "mcp.json");
  try {
    mkdirSync(join(cwd, ".pi"), { recursive: true });
    writeFileSync(mcpPath, JSON.stringify({ settings: { keep: true }, mcpServers: { manual: { command: "manual" } } }));
    const alpha = createLibraryMcpServer(libraryRoot, "alpha", { definition: { command: "npx", args: ["alpha"] } });
    const beta = createLibraryMcpServer(libraryRoot, "beta", { definition: { command: "npx", args: ["beta"] } });

    installLibraryMcpServer(cwd, libraryRoot, alpha.serverKey);
    assert.deepEqual(JSON.parse(readFileSync(mcpPath, "utf8")), {
      settings: { keep: true },
      mcpServers: { manual: { command: "manual" }, alpha: alpha.definition },
    });
    assert.throws(() => installLibraryMcpServer(cwd, libraryRoot, "alpha"), McpWorkspaceConflict);

    writeFileSync(join(cwd, ".mcp.json"), JSON.stringify({ mcpServers: { beta: { command: "team" } } }));
    assert.throws(() => installLibraryMcpServer(cwd, libraryRoot, beta.serverKey), McpWorkspaceConflict);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("removes one direct MCP without changing other project configuration", () => {
  const root = mkdtempSync(join(tmpdir(), "pivot-ui-workspace-mcp-"));
  const cwd = join(root, "project");
  const mcpPath = join(cwd, ".pi", "mcp.json");
  try {
    mkdirSync(join(cwd, ".pi"), { recursive: true });
    writeFileSync(mcpPath, JSON.stringify({ settings: { keep: true }, mcpServers: { alpha: { command: "alpha" }, beta: { command: "beta" } } }));

    removeWorkspaceMcpServer(cwd, "ALPHA");

    assert.deepEqual(JSON.parse(readFileSync(mcpPath, "utf8")), {
      settings: { keep: true },
      mcpServers: { beta: { command: "beta" } },
    });
    assert.throws(() => removeWorkspaceMcpServer(cwd, "alpha"), McpWorkspaceConflict);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("directory picker can create and select a named workspace", async () => {
  const sidebar = await readFile(new URL("./SessionSidebar.tsx", import.meta.url), "utf8");

  assert.match(sidebar, /placeholder="Workspace folder name"/);
  assert.match(sidebar, /body: JSON\.stringify\(\{ path: listing\.path, name \}\)/);
  assert.match(sidebar, /const selectError = await onSelect\(data\.path\);/);
});

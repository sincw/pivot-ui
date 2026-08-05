import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("exposes revealInFileTree on the imperative handle with isDir support", async () => {
  const panel = await readFile(new URL("./RightPanel.tsx", import.meta.url), "utf8");

  assert.match(panel, /const revealInFileTree = useCallback\(\(filePath: string, isDir = false\) => \{/);
  assert.match(panel, /setFileTreeRevealRequest\(\(current\) => \(\{ path: filePath, id: \(current\?\.id \?\? 0\) \+ 1, isDir \}\)\);/);
  assert.match(panel, /openTool\("file-tree"\);/);
  assert.match(panel, /useImperativeHandle\(ref, \(\) => \(\{ openFile, revealInFileTree \}\)/);
});

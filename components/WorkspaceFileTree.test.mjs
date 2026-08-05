import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("opens files with one tap on mobile", async () => {
  const tree = await readFile(new URL("./WorkspaceFileTree.tsx", import.meta.url), "utf8");

  assert.match(tree, /const isMobile = useIsMobile\(\);/);
  assert.match(tree, /if \(isMobile && !node\.isDir\) onOpenFile\(joinFilePath\(cwd, path\), node\.name\);/);
});

test("reveal requests expand directories via the isDir flag", async () => {
  const tree = await readFile(new URL("./WorkspaceFileTree.tsx", import.meta.url), "utf8");

  assert.match(tree, /revealRequest\?: \{ path: string; id: number; isDir\?: boolean \} \| null;/);
  assert.match(tree, /void reveal\(path, revealRequest\.isDir === true\)\.finally/);
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("shows cache and compact context usage in the mobile session info button", async () => {
  const appShell = await readFile(new URL("./AppShell.tsx", import.meta.url), "utf8");

  assert.match(appShell, /const showCacheHitRate = cacheHitRate !== null;/);
  assert.match(appShell, /ctxStr = isMobile \? pctStr : `\$\{pctStr\} \/ \$\{fmt\(contextUsage\.contextWindow\)\}`;/);
  assert.match(appShell, /\{isMobile && <Info size=\{14\}/);
  assert.match(appShell, /\{ctxStr && \(/);
});

test("chat-linked directories open the file tree instead of a file tab", async () => {
  const appShell = await readFile(new URL("./AppShell.tsx", import.meta.url), "utf8");

  assert.match(appShell, /const handleOpenLinkedFile = useCallback\(\(filePath: string\) => \{\n\s+const sessionId = selectedSession\?\.id \?\? null;/);
  assert.match(appShell, /void isDirectoryPath\(filePath, sessionId\)\.then\(\(isDir\) => \{/);
  assert.match(appShell, /rightPanelRef\.current\?\..*revealInFileTree\(filePath, true\)/);
  assert.match(appShell, /rightPanelRef\.current\?\..*openFile\(filePath, getFileName\(filePath\), sessionId\)/);
  assert.match(appShell, /new URLSearchParams\(\{ type: "stat" \}\)/);
  assert.match(appShell, /return data\.isDir === true;/);
});

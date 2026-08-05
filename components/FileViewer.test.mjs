import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("markdown preview rewrites local image srcs through the files API", async () => {
  const viewer = await readFile(new URL("./FileViewer.tsx", import.meta.url), "utf8");

  // The markdown preview overrides the img component
  assert.match(viewer, /img\(\{ src, alt, \.\.\.props \}\) \{/);
  // Relative paths resolve against the markdown file's directory
  assert.match(viewer, /resolveLocalFileHref\(src, markdownDirectory, cwd \?\? markdownDirectory\)/);
  // Resolved local images are served through /api/files with read + sessionId
  assert.match(viewer, /getFileApiUrl\(localImage, "read", sourceSessionId\)/);
  // The original file content is never modified — only the rendered src
  assert.match(viewer, /src=\{localImage \? getFileApiUrl\(localImage, "read", sourceSessionId\) : src\}/);
  // Remote/data URIs fall through untouched (resolveLocalFileHref returns null)
  assert.match(viewer, /const localImage = typeof src === "string"/);
});

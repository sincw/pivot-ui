import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("chat input attaches any file type (not just images)", async () => {
  const chatInput = await readFile(new URL("./ChatInput.tsx", import.meta.url), "utf8");

  // The attach button is a generic paperclip, not an image-only icon.
  assert.match(chatInput, /Paperclip size=\{15\}/);
  assert.doesNotMatch(chatInput, /ImagePlus/);

  // The hidden file input no longer restricts to image/*.
  assert.doesNotMatch(chatInput, /accept="image\/\*"/);
  assert.match(chatInput, /type="file"/);
  assert.match(chatInput, /multiple/);

  // The imperative handle exposes addFiles for drag & drop of any files.
  assert.match(chatInput, /addFiles: \(files: File\[\]\) => void;/);
  assert.match(chatInput, /addImages: \(files: File\[\]\) => void;/);
});

test("chat input enforces the configurable attachment size limit", async () => {
  const chatInput = await readFile(new URL("./ChatInput.tsx", import.meta.url), "utf8");

  // Default limit constant + server fetch override.
  assert.match(chatInput, /DEFAULT_MAX_ATTACHMENT_BYTES/);
  assert.match(chatInput, /fetch\("\/api\/attachments"\)/);
  assert.match(chatInput, /setMaxAttachmentBytes\(data\.maxBytes\)/);

  // Oversized files are rejected with a notice, smaller ones attached.
  assert.match(chatInput, /file\.size > maxAttachmentBytes/);
  assert.match(chatInput, /t\("chat\.attachTooLarge"/);
});

test("images stay base64, other files upload as-is via multipart", async () => {
  const chatInput = await readFile(new URL("./ChatInput.tsx", import.meta.url), "utf8");

  // Images: base64 payload + local preview, no upload (status ready at once).
  assert.match(chatInput, /readFileAsBase64/);
  assert.match(chatInput, /reader\.readAsDataURL\(file\)/);
  assert.match(chatInput, /file\.type\.startsWith\("image\/"\)/);
  assert.match(chatInput, /data,\s*previewUrl: URL\.createObjectURL\(file\)/);

  // Non-image files: raw multipart/form-data upload (no base64 encoding).
  assert.match(chatInput, /new FormData\(\)/);
  assert.match(chatInput, /form\.append\("file", file, file\.name/);
  assert.match(chatInput, /fetch\("\/api\/attachments", \{ method: "POST", body: form \}\)/);

  // Upload lifecycle states: placeholder card first, then result swap.
  assert.match(chatInput, /status: "uploading"/);
  assert.match(chatInput, /status: "ready"/);
  assert.match(chatInput, /status: "error"/);

  // Send is disabled until every attachment is ready; errors can retry.
  assert.match(chatInput, /attachmentsReady = attachments\.length === 0 \|\| attachments\.every/);
  assert.match(chatInput, /disabled=\{\(!value\.trim\(\) && !attachments\.length\) \|\| !attachmentsReady\}/);
  assert.match(chatInput, /retryAttachment/);
  assert.match(chatInput, /t\("chat\.attachRetry"\)/);
  assert.match(chatInput, /t\("chat\.attachUploading"\)/);
});

test("send handler sends images as content blocks and files as path refs", async () => {
  const hook = await readFile(new URL("../hooks/useAgentSession.ts", import.meta.url), "utf8");

  // Images become pi image content blocks again.
  assert.match(hook, /piImages\.push\(\{ type: "image", data: att\.data, mimeType: att\.mimeType \}\)/);
  assert.match(hook, /source: \{ type: "base64" as const, media_type: img\.mimeType, data: img\.data \}/);
  assert.match(hook, /images: piImages/);

  // Uploaded files are referenced by their absolute saved path only.
  assert.match(hook, /<file name="\$\{escapeFileTagName\(att\.name\)\}">\$\{att\.savedPath\}<\/file>/);
  assert.doesNotMatch(hook, /was saved to/);
  assert.doesNotMatch(hook, /Use your tools to read it/);
});

test("message view renders <file name=...> tags as chips with clickable path", async () => {
  const messageView = await readFile(new URL("./MessageView.tsx", import.meta.url), "utf8");

  assert.match(messageView, /FILE_TAG_RE = \/<file name="\(\[\^"\]\*\)">/);
  assert.match(messageView, /function splitFileTags\(content: string\)/);
  assert.match(messageView, /function FileTagBlock\(/);
  assert.match(messageView, /ABSOLUTE_PATH_RE = \/\^/);

  // Saved paths render as clickable file links opening in the right panel.
  assert.match(messageView, /className="markdown-inline-code markdown-inline-file"/);
  assert.match(messageView, /onClick=\{\(\) => onOpenFile\?\.\(content\)\}/);
  assert.match(messageView, /title=\{`Open \$\{content\}`\}/);
  assert.match(messageView, /onOpenFile=\{onOpenFile\}/);
});

test("attachment config defaults to 10 MiB and reads maxAttachmentBytes", async () => {
  const config = await readFile(new URL("../lib/attachment-config.ts", import.meta.url), "utf8");

  assert.match(config, /DEFAULT_MAX_ATTACHMENT_BYTES/);
  assert.match(config, /config\.maxAttachmentBytes/);
  assert.match(config, /\.pivot-ui"\)/);
});

test("attachment route accepts multipart uploads", async () => {
  const route = await readFile(new URL("../app/api/attachments/route.ts", import.meta.url), "utf8");

  assert.match(route, /await req\.formData\(\)/);
  assert.match(route, /form\.get\("file"\)/);
  assert.match(route, /file\.size > maxBytes/);
  assert.match(route, /status: 413/);
});

test("proxy body limit is raised for attachment uploads", async () => {
  const config = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");

  assert.match(config, /proxyClientMaxBodySize: "25mb"/);
});

test("attachments dir is browsable for the right-panel file opener", async () => {
  const fileAccess = await readFile(new URL("../lib/file-access.ts", import.meta.url), "utf8");

  assert.match(fileAccess, /getPivotUiAttachmentsDir\(\)/);
  assert.match(fileAccess, /roots\.add\(normalizeSlashes\(getPivotUiAttachmentsDir\(\)\)\)/);
});

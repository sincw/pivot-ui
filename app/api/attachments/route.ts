import { writeFile } from "fs/promises";
import { join } from "path";
import { ensureAttachmentsDir, getMaxAttachmentBytes, sanitizeAttachmentFilename } from "@/lib/attachment-config";

export const dynamic = "force-dynamic";

/**
 * GET /api/attachments → { maxBytes } — attachment limits for the chat UI.
 */
export async function GET() {
  return Response.json({ maxBytes: getMaxAttachmentBytes() });
}

/**
 * POST /api/attachments — save an uploaded file (multipart/form-data, field
 * name "file") as-is to ~/.pivot-ui/attachments/ and return its absolute
 * path. The path is referenced in the prompt text so the agent can read the
 * file with its tools. Enforces the configured size limit.
 */
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file field" }, { status: 400 });
  }
  if (!file.name.trim()) {
    return Response.json({ error: "Missing file name" }, { status: 400 });
  }

  const maxBytes = getMaxAttachmentBytes();
  if (file.size > maxBytes) {
    return Response.json(
      { error: `Attachment exceeds the ${maxBytes} byte limit` },
      { status: 413 },
    );
  }

  const safeName = sanitizeAttachmentFilename(file.name);
  const dir = ensureAttachmentsDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `${timestamp}-${safeName}`;
  const targetPath = join(dir, fileName);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(targetPath, buffer);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ error: `Failed to save attachment: ${message}` }, { status: 500 });
  }

  return Response.json({ path: targetPath, name: safeName, size: file.size });
}

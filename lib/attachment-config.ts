// Server-side attachment configuration.
//
// Reads ~/.pivot-ui/config.json for `maxAttachmentBytes` (default 10 MiB).
// The file is optional; a missing/invalid file falls back to the default.
// This module uses node:fs so it must only be imported from server code
// (API routes); client components should fetch /api/attachments instead.

import { readFileSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { DEFAULT_MAX_ATTACHMENT_BYTES } from "./types";

export function getPivotUiConfigDir(): string {
  return join(homedir(), ".pivot-ui");
}

export function getPivotUiConfigPath(): string {
  return join(getPivotUiConfigDir(), "config.json");
}

/** Attachment files uploaded from the chat are stored here. */
export function getPivotUiAttachmentsDir(): string {
  return join(getPivotUiConfigDir(), "attachments");
}

/** Max attachment size in bytes from ~/.pivot-ui/config.json (default 10 MiB). */
export function getMaxAttachmentBytes(): number {
  try {
    const raw = readFileSync(getPivotUiConfigPath(), "utf-8");
    const config = JSON.parse(raw) as { maxAttachmentBytes?: unknown };
    const value = typeof config.maxAttachmentBytes === "number" ? config.maxAttachmentBytes : undefined;
    if (value !== undefined && Number.isFinite(value) && value > 0) {
      return Math.floor(value);
    }
  } catch {
    // missing or invalid config — fall back to default
  }
  return DEFAULT_MAX_ATTACHMENT_BYTES;
}

/**
 * Sanitize an uploaded file name into a safe basename (no path separators,
 * no control chars, capped length). Empty results fall back to "attachment".
 */
export function sanitizeAttachmentFilename(name: string): string {
  const cleaned = name
    .replace(/[\\/\x00-\x1f\x7f<>:"|?*]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return cleaned || "attachment";
}

/** Ensure the attachments directory exists (no-op if already present). */
export function ensureAttachmentsDir(): string {
  const dir = getPivotUiAttachmentsDir();
  mkdirSync(dir, { recursive: true });
  return dir;
}

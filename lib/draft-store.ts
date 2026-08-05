/** Persistable subset of ChatAttachment (no previewUrl / revocable URLs). */
export interface ChatDraftAttachment {
  name: string;
  size: number;
  mimeType: string;
  savedPath?: string;
}

export interface ChatDraft {
  value: string;
  attachments: ChatDraftAttachment[];
}

const drafts = new Map<string, ChatDraft>();

function cloneDraft(draft: ChatDraft): ChatDraft {
  return {
    value: draft.value,
    attachments: draft.attachments.map((a) => ({ ...a })),
  };
}

function isEmptyDraft(draft: ChatDraft): boolean {
  return !draft.value && draft.attachments.length === 0;
}

export function getDraft(key: string): ChatDraft | null {
  const draft = drafts.get(key);
  return draft ? cloneDraft(draft) : null;
}

export function setDraft(key: string, draft: ChatDraft): void {
  if (isEmptyDraft(draft)) {
    drafts.delete(key);
    return;
  }
  drafts.set(key, cloneDraft(draft));
}

export function clearDraft(key: string): void {
  drafts.delete(key);
}

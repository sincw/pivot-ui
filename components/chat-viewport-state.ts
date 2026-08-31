export function isAtScrollTail(scrollHeight: number, scrollTop: number, clientHeight: number): boolean {
  return scrollHeight - scrollTop - clientHeight <= 1;
}

export function shouldFollowScrollTailOnResize({
  scrollTailPinned,
  completionScrollAllowed,
  contentChanged,
  agentRunning,
}: {
  scrollTailPinned: boolean;
  completionScrollAllowed: boolean;
  contentChanged: boolean;
  agentRunning: boolean;
}): boolean {
  if (!completionScrollAllowed) return false;
  // A prompt deliberately scrolls its user message into view first. During an
  // active run, however, newly-rendered progress/output should still keep the
  // live tail visible even though the viewport is not pinned yet.
  return scrollTailPinned || (contentChanged && agentRunning);
}

export function getCompletionScrollAllowed({
  current,
  atTail,
  now,
  ignoreProgrammaticScrollUntil,
  userScrollIntentUntil,
}: {
  current: boolean;
  atTail: boolean;
  now: number;
  ignoreProgrammaticScrollUntil: number;
  userScrollIntentUntil: number;
}): boolean {
  if (atTail) return true;
  if (now < ignoreProgrammaticScrollUntil || now > userScrollIntentUntil) return current;
  return false;
}

import assert from "node:assert/strict";
import test from "node:test";

async function loadSubject() {
  return import("./chat-viewport-state.ts");
}

test("recognizes the scroll tail with one-pixel tolerance", async () => {
  const { isAtScrollTail } = await loadSubject();
  assert.equal(isAtScrollTail(1_000, 799, 200), true);
  assert.equal(isAtScrollTail(1_000, 798, 200), false);
});

test("changes completion following only after explicit user scroll intent", async () => {
  const { getCompletionScrollAllowed } = await loadSubject();
  const base = { current: true, atTail: false, now: 100, ignoreProgrammaticScrollUntil: 0 };

  assert.equal(getCompletionScrollAllowed({ ...base, userScrollIntentUntil: 200 }), false);
  assert.equal(getCompletionScrollAllowed({ ...base, userScrollIntentUntil: 50 }), true);
  assert.equal(getCompletionScrollAllowed({ ...base, ignoreProgrammaticScrollUntil: 200, userScrollIntentUntil: 200 }), true);
  assert.equal(getCompletionScrollAllowed({ ...base, atTail: true, userScrollIntentUntil: 200 }), true);
});

test("reanchors the pinned tail and active progress after a viewport resize", async () => {
  const { isAtScrollTail, shouldFollowScrollTailOnResize } = await loadSubject();
  const scrollHeight = 2_000;
  const oldClientHeight = 600;
  const oldScrollTop = scrollHeight - oldClientHeight;
  const newClientHeight = oldClientHeight - 60; // plugin status indicator

  // Adding the indicator reduces the viewport without changing messages, so
  // the old bottom position no longer exposes the newest content.
  assert.equal(isAtScrollTail(scrollHeight, oldScrollTop, oldClientHeight), true);
  assert.equal(isAtScrollTail(scrollHeight, oldScrollTop, newClientHeight), false);
  assert.equal(shouldFollowScrollTailOnResize({
    scrollTailPinned: true,
    completionScrollAllowed: true,
    contentChanged: false,
    agentRunning: false,
  }), true);
  assert.equal(isAtScrollTail(scrollHeight, scrollHeight - newClientHeight, newClientHeight), true);

  // A newly-rendered Running/Waiting indicator is content growth during an
  // active run, so it should remain visible after the prompt is scrolled into view.
  assert.equal(shouldFollowScrollTailOnResize({
    scrollTailPinned: false,
    completionScrollAllowed: true,
    contentChanged: true,
    agentRunning: true,
  }), true);

  // A user who was reading higher in the conversation must not be pulled down.
  assert.equal(shouldFollowScrollTailOnResize({
    scrollTailPinned: false,
    completionScrollAllowed: true,
    contentChanged: true,
    agentRunning: false,
  }), false);
  assert.equal(shouldFollowScrollTailOnResize({
    scrollTailPinned: false,
    completionScrollAllowed: false,
    contentChanged: true,
    agentRunning: true,
  }), false);
});

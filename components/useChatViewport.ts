"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentMessage } from "@/lib/types";
import {
  captureScrollDistance,
  getNextVisibleCount,
  restoreScrollTop,
  VISIBLE_PAGE_SIZE,
} from "@/lib/chat-lazy-load";
import { getCompletionScrollAllowed, isAtScrollTail, shouldFollowScrollTailOnResize } from "./chat-viewport-state";

const PROGRAMMATIC_SCROLL_IGNORE_MS = 700;
const USER_SCROLL_INTENT_MS = 1200;
const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Space", "Spacebar"]);

type UseChatViewportOptions = {
  messageCount: number;
  streamingMessage: Partial<AgentMessage> | null;
  agentRunning: boolean;
  loading: boolean;
  promptGeneration: number;
};

export function useChatViewport({
  messageCount,
  streamingMessage,
  agentRunning,
  loading,
  promptGeneration,
}: UseChatViewportOptions) {
  const [visibleCount, setVisibleCount] = useState(VISIBLE_PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const prevScrollDistanceRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<HTMLDivElement>(null);
  // Keep layout changes (for example, a status bar appearing above the
  // viewport) from moving a user who was following the chat tail away from
  // the latest content. This is separate from completionScrollAllowedRef:
  // a new prompt intentionally scrolls its user message into view first.
  const scrollTailPinnedRef = useRef(true);
  const initialScrollDoneRef = useRef(false);
  const completionScrollAllowedRef = useRef(true);
  const userScrollIntentUntilRef = useRef(0);
  const ignoreProgrammaticScrollUntilRef = useRef(0);
  const handledPromptGenerationRef = useRef(promptGeneration);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    scrollTailPinnedRef.current = true;
    if (behavior === "smooth") {
      ignoreProgrammaticScrollUntilRef.current = Date.now() + PROGRAMMATIC_SCROLL_IGNORE_MS;
    }
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const scrollUserMessageToTop = useCallback(() => {
    const container = scrollContainerRef.current;
    const message = lastUserMessageRef.current;
    if (!container || !message) return;
    const top = message.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    scrollTailPinnedRef.current = false;
    ignoreProgrammaticScrollUntilRef.current = Date.now() + PROGRAMMATIC_SCROLL_IGNORE_MS;
    container.scrollTo({ top: top - 16, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = scrollContainerRef.current;
    if (!sentinel || !container) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      prevScrollDistanceRef.current = captureScrollDistance(container.scrollHeight, container.scrollTop);
      setVisibleCount((current) => getNextVisibleCount(current));
    }, { root: container, threshold: 0 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [messageCount, visibleCount]);

  useEffect(() => {
    if (prevScrollDistanceRef.current === null) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTop = restoreScrollTop(container.scrollHeight, prevScrollDistanceRef.current);
    prevScrollDistanceRef.current = null;
  }, [visibleCount]);

  const markUserScrollIntent = useCallback((event: Event) => {
    if (event instanceof KeyboardEvent) {
      if (!SCROLL_KEYS.has(event.key)) return;
      if (event.target instanceof Element && event.target.closest("input, textarea, [contenteditable='true']")) return;
    }
    userScrollIntentUntilRef.current = Date.now() + USER_SCROLL_INTENT_MS;
  }, []);

  const handleScrollPositionChange = useCallback((event: Event) => {
    const container = event.currentTarget as HTMLDivElement;
    const now = Date.now();
    const atTail = isAtScrollTail(container.scrollHeight, container.scrollTop, container.clientHeight);
    if (atTail) {
      scrollTailPinnedRef.current = true;
      completionScrollAllowedRef.current = true;
    } else if (now >= ignoreProgrammaticScrollUntilRef.current && now <= userScrollIntentUntilRef.current) {
      scrollTailPinnedRef.current = false;
    }

    if (!agentRunning) return;
    completionScrollAllowedRef.current = getCompletionScrollAllowed({
      current: completionScrollAllowedRef.current,
      atTail,
      now,
      ignoreProgrammaticScrollUntil: ignoreProgrammaticScrollUntilRef.current,
      userScrollIntentUntil: userScrollIntentUntilRef.current,
    });
  }, [agentRunning]);

  useEffect(() => {
    window.addEventListener("keydown", markUserScrollIntent);
    window.addEventListener("pointerdown", markUserScrollIntent, { passive: true });
    return () => {
      window.removeEventListener("keydown", markUserScrollIntent);
      window.removeEventListener("pointerdown", markUserScrollIntent);
    };
  }, [markUserScrollIntent]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener("wheel", markUserScrollIntent, { passive: true });
    container.addEventListener("touchstart", markUserScrollIntent, { passive: true });
    container.addEventListener("scroll", handleScrollPositionChange, { passive: true });
    return () => {
      container.removeEventListener("wheel", markUserScrollIntent);
      container.removeEventListener("touchstart", markUserScrollIntent);
      container.removeEventListener("scroll", handleScrollPositionChange);
    };
  }, [messageCount, loading, handleScrollPositionChange, markUserScrollIntent]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    // The transient Running/Waiting indicator is rendered inside this content
    // node. Observing only the viewport misses that height change because the
    // viewport itself keeps the same dimensions.
    const content = container.firstElementChild;

    let frame: number | null = null;
    const resizeObserver = new ResizeObserver((entries) => {
      const contentChanged = content !== null && entries.some((entry) => entry.target === content);
      if (!shouldFollowScrollTailOnResize({
        scrollTailPinned: scrollTailPinnedRef.current,
        completionScrollAllowed: completionScrollAllowedRef.current,
        contentChanged,
        agentRunning,
      })) return;
      // One re-anchor per frame is enough even when the status and message
      // nodes report their size changes in separate observer callbacks.
      if (frame !== null) return;
      const followContent = contentChanged;
      frame = requestAnimationFrame(() => {
        frame = null;
        // Check again because the user may have scrolled while the frame was
        // waiting. Never take control back from an intentional scroll.
        if (shouldFollowScrollTailOnResize({
          scrollTailPinned: scrollTailPinnedRef.current,
          completionScrollAllowed: completionScrollAllowedRef.current,
          contentChanged: followContent,
          agentRunning,
        })) {
          scrollToBottom("instant");
        }
      });
    });
    resizeObserver.observe(container);
    if (content) resizeObserver.observe(content);

    return () => {
      resizeObserver.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [agentRunning, loading, scrollToBottom]);

  useEffect(() => {
    if (promptGeneration === handledPromptGenerationRef.current) return;
    handledPromptGenerationRef.current = promptGeneration;
    completionScrollAllowedRef.current = true;
    initialScrollDoneRef.current = true;
    scrollUserMessageToTop();
  }, [promptGeneration, scrollUserMessageToTop]);

  useEffect(() => {
    if (messageCount === 0) return;
    if (!initialScrollDoneRef.current) {
      initialScrollDoneRef.current = true;
      scrollToBottom("instant");
    } else if (!agentRunning && completionScrollAllowedRef.current) {
      scrollToBottom("smooth");
    }
  }, [messageCount, agentRunning, scrollToBottom]);

  useEffect(() => {
    if (streamingMessage && completionScrollAllowedRef.current) {
      scrollToBottom("instant");
    }
  }, [streamingMessage, scrollToBottom]);

  return {
    visibleCount,
    sentinelRef,
    scrollContainerRef,
    messagesEndRef,
    lastUserMessageRef,
  };
}

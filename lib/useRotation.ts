"use client";

import { useEffect, useState } from "react";

/** True when the visitor asked the OS to reduce motion. False during SSR. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/**
 * Cycles an index through 0..count-1 every `intervalMs`.
 * Stops (and holds at 0) when `paused` is true or motion is reduced, skips
 * ticks while the tab is hidden, and resets to 0 whenever `resetKey` changes.
 */
export function useRotation({
  count,
  intervalMs,
  startDelayMs = 0,
  paused = false,
  resetKey,
}: {
  count: number;
  intervalMs: number;
  startDelayMs?: number;
  paused?: boolean;
  resetKey?: unknown;
}) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [resetKey]);

  useEffect(() => {
    if (paused || reduced || count < 2) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const tick = () => {
      if (document.visibilityState === "visible") setIndex((i) => (i + 1) % count);
    };
    const start = setTimeout(() => {
      interval = setInterval(tick, intervalMs);
    }, startDelayMs);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [paused, reduced, count, intervalMs, startDelayMs, resetKey]);

  return { index: reduced ? 0 : index, reduced };
}

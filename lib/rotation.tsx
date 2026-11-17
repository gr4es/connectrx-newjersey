"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LOCALES, type Locale } from "@/lib/locales";
import { useRotation } from "@/lib/useRotation";

const INTERVAL_MS = 3000;

interface LanguageRotation {
  /** Languages in display order: current site language first. */
  order: Locale[];
  index: number;
  /** The language currently on screen. */
  shown: Locale;
  reduced: boolean;
  /** Animations are off (reduced motion). */
  still: boolean;
  /** Pause (on = true) or release a pause for one source, e.g. "title" or "menu". */
  hold: (source: string, on: boolean) => void;
}

const RotationContext = createContext<LanguageRotation | null>(null);

/**
 * One shared clock for every multilingual animation (hero title, language
 * button), so they always show the same language at the same moment.
 * Any component can pause it; it runs again once every pause is released.
 */
export function LanguageRotationProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useI18n();
  const [holds, setHolds] = useState<Record<string, boolean>>({});

  const order = useMemo<Locale[]>(() => [locale, ...LOCALES.filter((c) => c !== locale)], [locale]);
  const paused = Object.values(holds).some(Boolean);
  const { index, reduced } = useRotation({
    count: order.length,
    intervalMs: INTERVAL_MS,
    paused,
    resetKey: locale,
  });

  const hold = useCallback((source: string, on: boolean) => {
    setHolds((h) => (h[source] === on ? h : { ...h, [source]: on }));
  }, []);

  // Changing language never stops the rotation: it restarts from the new language.
  const value = useMemo(
    () => ({ order, index, shown: order[index], reduced, still: reduced, hold }),
    [order, index, reduced, hold],
  );

  return <RotationContext.Provider value={value}>{children}</RotationContext.Provider>;
}

export function useLanguageRotation(): LanguageRotation {
  const ctx = useContext(RotationContext);
  if (!ctx) throw new Error("useLanguageRotation must be used inside <LanguageRotationProvider>");
  return ctx;
}

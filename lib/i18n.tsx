"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LOCALE,
  DICTIONARIES,
  LOCALE_COOKIE,
  LOCALE_META,
  type Dictionary,
  type Locale,
  isLocale,
} from "@/lib/locales";

type Vars = Record<string, string | number>;

interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
  /** True once the visitor has picked a language during this visit. */
  chosen: boolean;
  /** Switch language. A deliberate visitor choice: pauses the animations for this visit. */
  setLocale: (locale: Locale) => void;
  /** Look up a dot-path string (e.g. "hero.title") and interpolate {vars}. */
  t: (path: string, vars?: Vars) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

function lookup(dict: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((node, key) => {
    if (node && typeof node === "object" && key in (node as Record<string, unknown>)) {
      return (node as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);
}

export function translate(locale: Locale, path: string, vars?: Vars): string {
  const value = lookup(DICTIONARIES[locale], path) ?? lookup(DICTIONARIES[DEFAULT_LOCALE], path);
  if (typeof value !== "string") {
    if (process.env.NODE_ENV !== "production") console.warn(`[i18n] Missing string: ${path}`);
    return path;
  }
  return interpolate(value, vars);
}

/**
 * The initial locale comes from the server (cookie → Accept-Language → "en"),
 * so the server-rendered HTML and the first client render always match.
 */
export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  // In memory only: a choice pauses the animations for this visit, and the
  // next page load animates again (starting from the saved language).
  const [chosen, setChosen] = useState(false);

  // Support shareable links such as /?lang=ko (client-only, after hydration).
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("lang");
    // A shared link switches the language but is not the visitor's own choice,
    // so the animations keep running (starting from that language).
    if (isLocale(param)) setLocaleState(param);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const dict = DICTIONARIES[locale];
    document.documentElement.lang = LOCALE_META[locale].htmlLang;
    document.title = dict.meta.title;
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
  }, [locale]);

  // Clear the old year-long "chosen" cookie from an earlier version of the site.
  useEffect(() => {
    document.cookie = "connectrx-lang-chosen=; path=/; max-age=0; samesite=lax";
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    setChosen(true);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dict: DICTIONARIES[locale],
      chosen,
      setLocale,
      t: (path, vars) => translate(locale, path, vars),
    }),
    [locale, chosen, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LocaleProvider>");
  return ctx;
}

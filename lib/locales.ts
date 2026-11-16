import en from "@/locales/en.json";
import es from "@/locales/es.json";
import zh from "@/locales/zh.json";
import ru from "@/locales/ru.json";
import pt from "@/locales/pt.json";
import ko from "@/locales/ko.json";
import hi from "@/locales/hi.json";

/** The English dictionary is the source of truth for the shape of every locale. */
export type Dictionary = typeof en;

export const LOCALES = ["en", "es", "zh", "ru", "pt", "ko", "hi"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "saferx-locale";

export interface LocaleMeta {
  code: Locale;
  /** BCP 47 tag used for <html lang> and per-option lang attributes */
  htmlLang: string;
  /** Name in its own language */
  nativeName: string;
  /** Name in English (helps non-speakers & screen readers) */
  englishName: string;
  /** Short badge shown in the compact switcher */
  short: string;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  en: { code: "en", htmlLang: "en", nativeName: "English", englishName: "English", short: "EN" },
  es: { code: "es", htmlLang: "es", nativeName: "Español", englishName: "Spanish", short: "ES" },
  zh: { code: "zh", htmlLang: "zh-Hans", nativeName: "中文", englishName: "Simplified Chinese", short: "中文" },
  ru: { code: "ru", htmlLang: "ru", nativeName: "Русский", englishName: "Russian", short: "RU" },
  pt: { code: "pt", htmlLang: "pt-BR", nativeName: "Português", englishName: "Portuguese", short: "PT" },
  ko: { code: "ko", htmlLang: "ko", nativeName: "한국어", englishName: "Korean", short: "한국어" },
  hi: { code: "hi", htmlLang: "hi", nativeName: "हिन्दी", englishName: "Hindi", short: "हिन्दी" },
};

// JSON imports are widened to the English shape; scripts/check-locales.mjs
// enforces at build time that every locale has exactly the same keys.
export const DICTIONARIES: Record<Locale, Dictionary> = {
  en,
  es: es as Dictionary,
  zh: zh as Dictionary,
  ru: ru as Dictionary,
  pt: pt as Dictionary,
  ko: ko as Dictionary,
  hi: hi as Dictionary,
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Best-effort match of an Accept-Language / navigator.language value. */
export function matchLocale(input: string | null | undefined): Locale | null {
  if (!input) return null;
  const tags = input
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase())
    .filter(Boolean);
  for (const tag of tags) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return null;
}

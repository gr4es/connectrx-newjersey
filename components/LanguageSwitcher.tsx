"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { DICTIONARIES, LOCALES, LOCALE_META, type Locale } from "@/lib/locales";
import { useLanguageRotation } from "@/lib/rotation";
import { CheckIcon, ChevronDownIcon, GlobeIcon } from "@/components/icons";

/** Fire this to open the header language picker from anywhere on the page. */
export const OPEN_LANGUAGE_EVENT = "connectrx:open-language";
export const openLanguageSwitcher = () => window.dispatchEvent(new Event(OPEN_LANGUAGE_EVENT));

/**
 * Accessible listbox-style language picker (WAI-ARIA "select-only combobox"
 * pattern): Enter/Space/↓ opens, ↑/↓/Home/End move, Enter selects, Esc closes.
 * Each option carries its own lang attribute so screen readers pronounce it
 * correctly.
 */
export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number>(LOCALES.indexOf(locale));
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const listId = `${id}-list`;
  const optionId = (i: number) => `${id}-opt-${i}`;

  useEffect(() => {
    if (!open) return;
    setActive(LOCALES.indexOf(locale));
    listRef.current?.focus();
    const onPointer = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open, locale]);

  useEffect(() => {
    const onOpen = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setOpen(true);
    };
    window.addEventListener(OPEN_LANGUAGE_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_LANGUAGE_EVENT, onOpen);
  }, []);

  const choose = (code: Locale) => {
    setLocale(code);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => (i + 1) % LOCALES.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => (i - 1 + LOCALES.length) % LOCALES.length);
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(LOCALES.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(LOCALES[active]);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  const current = LOCALE_META[locale];

  // Button text cycles "Your language" through every language, in step with the
  // hero headline (shared clock), so visitors spot the switcher in their language.
  const { order, index: phraseIndex, hold } = useLanguageRotation();
  useEffect(() => {
    hold("menu", open);
  }, [open, hold]);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${t("nav.language")}: ${current.nativeName}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-sage-200 bg-white px-3.5 py-2 text-sm font-semibold text-teal transition-colors hover:border-teal"
      >
        <GlobeIcon className="h-5 w-5 shrink-0" />
        {/* All phrases share one grid cell: the button is as wide as the longest and never resizes */}
        <span aria-hidden="true" className="grid">
          {order.map((code, i) => (
            <span
              key={code}
              lang={LOCALE_META[code].htmlLang}
              className={`whitespace-nowrap transition-all duration-500 ease-out [grid-area:1/1] ${
                i === phraseIndex ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
              }`}
            >
              {DICTIONARIES[code].nav.yourLanguage}
            </span>
          ))}
        </span>
        <ChevronDownIcon className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={t("nav.chooseLanguage")}
          aria-activedescendant={optionId(active)}
          onKeyDown={onListKeyDown}
          className="absolute right-0 z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] animate-fade-up overflow-hidden rounded-3xl border border-sage-200 bg-white p-2 shadow-card focus:outline-none"
        >
          {LOCALES.map((code, i) => {
            const meta = LOCALE_META[code];
            const selected = code === locale;
            return (
              <li
                key={code}
                id={optionId(i)}
                role="option"
                aria-selected={selected}
                onClick={() => choose(code)}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 py-2.5 ${
                  i === active ? "bg-teal-50 ring-2 ring-teal/30" : ""
                }`}
              >
                <span className="flex flex-col">
                  <span lang={meta.htmlLang} className="font-semibold text-ink">{meta.nativeName}</span>
                  <span lang="en" className="text-xs text-slate">{meta.englishName}</span>
                </span>
                {selected && <CheckIcon className="h-5 w-5 shrink-0 text-teal" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useI18n } from "@/lib/i18n";
import { DICTIONARIES, LOCALE_META, type Locale } from "@/lib/locales";
import { useLanguageRotation } from "@/lib/rotation";
import { ArrowRightIcon } from "@/components/icons";

// Chinese doesn't put spaces between words and can break between any two characters.
const isHanEnd = (s: string) => /[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]$/.test(s);

/** Plain-text title (for screen readers). */
function titleFor(code: Locale): string {
  const { titleLead, titleHighlight } = DICTIONARIES[code].hero;
  return `${titleLead}${isHanEnd(titleLead) ? "" : " "}${titleHighlight}`;
}

/**
 * Visual title. For Chinese, each half is kept whole so a line can only break
 * between them (never leaving one character alone on a line).
 */
function TitleText({ code }: { code: Locale }) {
  const { titleLead, titleHighlight } = DICTIONARIES[code].hero;
  if (!isHanEnd(titleLead)) return <>{titleFor(code)}</>;
  return (
    <>
      <span className="inline-block">{titleLead}</span>
      <span className="inline-block">{titleHighlight}</span>
    </>
  );
}

/**
 * Hero headline that cycles through all 7 languages.
 * Screen readers and search engines get one stable <h1> in the site language;
 * the animated layer is visual only. All titles share one grid cell, so the
 * block is always as tall as the longest title and the page never shifts.
 */
export default function RotatingTitle() {
  const { locale, setLocale } = useI18n();
  // Shared with the header language button, so both always show the same language.
  const { order, index, shown, still, hold } = useLanguageRotation();
  const setPaused = (on: boolean) => hold("title", on);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <h1 id="hero-title" className="h1 mt-5">
        <span className="sr-only">{titleFor(locale)}</span>
        <span aria-hidden="true" className="grid">
          {/* With reduced motion only the site language renders */}
          {(still ? order.slice(0, 1) : order).map((code, i) => (
            <span
              key={code}
              lang={LOCALE_META[code].htmlLang}
              className={`pointer-events-none transition-all duration-500 ease-out [grid-area:1/1] ${
                i === index ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
            >
              <TitleText code={code} />
            </span>
          ))}
        </span>
      </h1>

      {/* "Read in <language>" shortcut, written in the language currently on screen */}
      {still ? (
        <div className="h-4" />
      ) : (
        <div className="mt-4 h-10">
          {shown !== locale && (
            <button
              key={shown}
              type="button"
              lang={LOCALE_META[shown].htmlLang}
              onClick={() => {
                setLocale(shown);
                setPaused(false); // the button unmounts, so its blur event never fires
              }}
              className="inline-flex min-h-[40px] animate-fade-up items-center gap-2 rounded-full border border-sage-200 bg-white/80 px-4 text-sm font-semibold text-teal backdrop-blur hover:border-teal"
            >
              {DICTIONARIES[shown].hero.readIn}
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

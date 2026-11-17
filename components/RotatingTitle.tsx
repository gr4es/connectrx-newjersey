"use client";

import { useI18n } from "@/lib/i18n";
import { DICTIONARIES, LOCALE_META, type Locale } from "@/lib/locales";
import { useLanguageRotation } from "@/lib/rotation";
import { ArrowRightIcon, GlobeIcon } from "@/components/icons";
import { openLanguageSwitcher } from "@/components/LanguageSwitcher";

// Chinese doesn't put spaces between words and can break between any two characters.
const isHanEnd = (s: string) => /[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]$/.test(s);

/** Plain-text title (for screen readers). */
function titleFor(code: Locale): string {
  const { titleLead, titleHighlight } = DICTIONARIES[code].hero;
  return `${titleLead}${isHanEnd(titleLead) ? "" : " "}${titleHighlight}`;
}

/**
 * Visual title. Every language breaks the same way, lead on one line and
 * highlight on the next, so all titles share the same shape and centre cleanly.
 * Each half is balanced if it has to wrap on narrow screens.
 */
function TitleText({ code }: { code: Locale }) {
  const { titleLead, titleHighlight } = DICTIONARIES[code].hero;
  return (
    <>
      <TitleLine text={titleLead} />
      <TitleLine text={titleHighlight} />
    </>
  );
}

// Full-width CJK punctuation (。，、！？) draws its mark in the left half of a
// full em box, so a line ending in one looks shifted left when centred.
const FULLWIDTH_END = /[\u3001\u3002\uff0c\uff01\uff1f]$/;

function TitleLine({ text }: { text: string }) {
  if (!FULLWIDTH_END.test(text)) return <span className="block text-balance">{text}</span>;
  return (
    <span className="block text-balance">
      {text.slice(0, -1)}
      <span className="-mr-[0.5em]">{text.slice(-1)}</span>
    </span>
  );
}

const PILL =
  "inline-flex min-h-[40px] animate-fade-up items-center gap-2 rounded-full border border-sage-200 bg-white/80 px-4 text-sm font-semibold text-teal backdrop-blur hover:border-teal";

/**
 * Hero headline that cycles through all 7 languages.
 * Screen readers and search engines get one stable <h1> in the site language;
 * the animated layer is visual only. All titles share one grid cell, so the
 * block is always as tall as the longest title and the page never shifts.
 */
export default function RotatingTitle() {
  const { locale, setLocale, t } = useI18n();
  // Shared with the header language button, so both always show the same language.
  const { order, index, shown, still, hold } = useLanguageRotation();
  const setPaused = (on: boolean) => hold("title", on);

  return (
    <div
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <h1 id="hero-title" className="h1 mt-6">
        <span className="sr-only">{titleFor(locale)}</span>
        <span aria-hidden="true" className="grid place-items-center">
          {/* With reduced motion only the site language renders */}
          {(still ? order.slice(0, 1) : order).map((code, i) => (
            <span
              key={code}
              lang={LOCALE_META[code].htmlLang}
              className={`pointer-events-none w-full transition-all duration-500 ease-out [grid-area:1/1] ${
                i === index ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
            >
              <TitleText code={code} />
            </span>
          ))}
        </span>
      </h1>

      {/*
        Under the title: "Read in <language>" while another language is on screen,
        otherwise "Choose your language", which opens the header language picker.
      */}
      <div className="mt-3 flex h-10 justify-center">
        {!still && shown !== locale ? (
          <button
            key={shown}
            type="button"
            lang={LOCALE_META[shown].htmlLang}
            onClick={() => {
              setLocale(shown);
              setPaused(false); // the button unmounts, so its blur event never fires
            }}
            className={PILL}
          >
            {DICTIONARIES[shown].hero.readIn}
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        ) : (
          <button
            key="choose"
            type="button"
            onClick={() => {
              setPaused(false);
              openLanguageSwitcher();
            }}
            className={PILL}
          >
            <GlobeIcon className="h-4 w-4" />
            {t("hero.chooseLanguage")}
          </button>
        )}
      </div>
    </div>
  );
}

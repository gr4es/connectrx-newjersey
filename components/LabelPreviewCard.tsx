"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LOCALES, LOCALE_META, type Locale } from "@/lib/locales";
import RxLabel from "@/components/RxLabel";

/** Hero card: a sample prescription label you can switch between all 7 languages. */
export default function LabelPreviewCard() {
  const { t, locale: siteLocale } = useI18n();
  // Start on a translation even for English visitors, so the point is obvious at a glance.
  const [selected, setSelected] = useState<Locale>(siteLocale === "en" ? "es" : siteLocale);
  const [bilingual, setBilingual] = useState(true);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Follow the site language when it changes (the visitor can still pick another tab).
  useEffect(() => {
    if (siteLocale !== "en") setSelected(siteLocale);
  }, [siteLocale]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % LOCALES.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + LOCALES.length) % LOCALES.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = LOCALES.length - 1;
    if (next === null) return;
    e.preventDefault();
    setSelected(LOCALES[next]);
    tabRefs.current[next]?.focus();
  };

  return (
    <div id="preview" className="card overflow-hidden shadow-lift">
      {/* Title, then the language tabs across the top */}
      <div className="border-b border-sage-200/70 bg-gradient-to-b from-sage-50 to-white px-4 pb-5 pt-6 text-center sm:px-8">
        <h2 id="preview-title" className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          {t("hero.cardTitle")}
        </h2>

        <div className="mt-4 flex justify-center">
          <div
            role="tablist"
            aria-label={t("preview.tablistLabel")}
            aria-orientation="horizontal"
            className="flex max-w-full flex-wrap justify-center gap-1 rounded-3xl border border-sage-200 bg-white p-1 shadow-sm sm:flex-nowrap sm:rounded-full"
          >
            {LOCALES.map((code, i) => {
              const meta = LOCALE_META[code];
              const isSelected = code === selected;
              return (
                <button
                  key={code}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  role="tab"
                  id={`preview-tab-${code}`}
                  aria-selected={isSelected}
                  aria-controls="preview-panel"
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setSelected(code)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  lang={meta.htmlLang}
                  title={meta.englishName}
                  className={`min-h-[40px] shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors ${
                    isSelected ? "bg-teal text-white shadow-sm" : "text-slate hover:bg-sage-50 hover:text-ink"
                  }`}
                >
                  {meta.nativeName}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        id="preview-panel"
        role="tabpanel"
        aria-labelledby={`preview-tab-${selected}`}
        tabIndex={0}
        className="bg-canvas p-4 sm:p-8"
      >
        <div key={selected} className="mx-auto max-w-xl animate-fade-up text-left">
          <RxLabel locale={selected} bilingual={bilingual} />
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-sage-200/70 px-4 py-4 text-center sm:flex-row sm:px-8 sm:text-left">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={bilingual}
            onChange={(e) => setBilingual(e.target.checked)}
            className="h-4 w-4 rounded accent-teal"
          />
          {t("preview.bilingual")}
        </label>
        <p className="text-xs text-slate">{t("preview.disclaimer")}</p>
      </div>
    </div>
  );
}

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
    <div id="preview" className="card p-4 shadow-lift sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <h2 id="preview-title" className="text-lg font-semibold text-ink">{t("hero.cardTitle")}</h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate">
          <input
            type="checkbox"
            checked={bilingual}
            onChange={(e) => setBilingual(e.target.checked)}
            className="h-4 w-4 rounded accent-teal"
          />
          {t("preview.bilingual")}
        </label>
      </div>

      {/* Languages on the side (a scrolling row on small screens), label beside them */}
      <div className="mt-4 grid gap-4 sm:grid-cols-[8.5rem_1fr]">
        <div
          role="tablist"
          aria-label={t("preview.tablistLabel")}
          aria-orientation="vertical"
          className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-col sm:overflow-visible sm:px-0 sm:pb-0"
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
                className={`flex min-h-[38px] shrink-0 items-center whitespace-nowrap rounded-full border px-3.5 text-left text-sm font-semibold transition-colors sm:rounded-lg ${
                  isSelected
                    ? "border-teal bg-teal text-white"
                    : "border-sage-200 bg-white text-ink hover:border-teal"
                }`}
              >
                {meta.nativeName}
              </button>
            );
          })}
        </div>

        <div
          id="preview-panel"
          role="tabpanel"
          aria-labelledby={`preview-tab-${selected}`}
          tabIndex={0}
          className="min-w-0 rounded-2xl"
        >
          <div key={selected} className="animate-fade-up">
            <RxLabel locale={selected} bilingual={bilingual} />
          </div>
        </div>
      </div>
      <p className="mt-4 px-1 text-xs text-slate">{t("preview.disclaimer")}</p>
    </div>
  );
}

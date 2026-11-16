"use client";

import { useI18n } from "@/lib/i18n";
import SectionHeading from "@/components/SectionHeading";
import { CheckIcon, ExternalIcon } from "@/components/icons";

/**
 * Official citations and sources stay in English (they are legal identifiers).
 * Facts verified against the statute text, Nov 2026:
 *  - NY Education Law § 6829 (nysenate.gov)
 *  - CA Bus. & Prof. Code § 4076.6, added by AB 1073 (Stats. 2015, ch. 784);
 *    board translation languages from pharmacy.ca.gov/publications/translations.shtml
 */
const STATES = [
  {
    key: "ny",
    citation: "N.Y. Education Law § 6829",
    url: "https://www.nysenate.gov/legislation/laws/EDN/6829",
  },
  {
    key: "ca",
    citation: "Cal. Bus. & Prof. Code § 4076.6",
    url: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=4076.6",
  },
] as const;

const ROWS = ["passed", "who", "what", "languages"] as const;

export default function StateLaws() {
  const { t, dict } = useI18n();

  return (
    <section id="laws" aria-labelledby="laws-title" className="section bg-sage-50">
      <div className="container-page">
        <SectionHeading
          id="laws-title"
          eyebrow={t("laws.eyebrow")}
          title={t("laws.title")}
          subtitle={t("laws.subtitle")}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {STATES.map(({ key, citation, url }) => {
            const law = dict.laws[key];
            return (
              <article key={key} aria-labelledby={`law-${key}`} className="card flex flex-col p-7 sm:p-8">
                <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                  <h3 id={`law-${key}`} className="text-2xl font-semibold text-ink sm:text-3xl">
                    {law.name}
                  </h3>
                  <span className="rounded-full bg-sage px-3 py-1 text-sm font-semibold text-ink">{law.law}</span>
                </header>
                <p lang="en" className="mt-1 text-sm text-slate">{citation}</p>

                <dl className="mt-6 divide-y divide-sage-200 border-y border-sage-200">
                  {ROWS.map((row) => (
                    <div key={row} className="grid gap-1 py-3.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
                      <dt className="text-sm font-medium text-slate">{t(`laws.rows.${row}`)}</dt>
                      <dd className="text-ink">{law[row]}</dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-5 flex gap-2 text-slate">
                  <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-teal" />
                  {law.extra}
                </p>

                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-teal underline underline-offset-4 hover:text-teal-800"
                >
                  {t("laws.source")}
                  <ExternalIcon className="h-4 w-4" />
                </a>
              </article>
            );
          })}
        </div>

        <p className="mt-8 rounded-card bg-teal px-7 py-6 text-lg font-medium text-white sm:text-xl">
          {t("laws.takeaway")}
        </p>
      </div>
    </section>
  );
}

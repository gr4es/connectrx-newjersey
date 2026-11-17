import type { Dictionary, Locale } from "@/lib/locales";
import { DICTIONARIES, LOCALE_META } from "@/lib/locales";
import { AlertIcon } from "@/components/icons";

// Proper nouns and identifiers stay the same in every language, as on a real label.
const SAMPLE = {
  pharmacy: "Garden State Community Pharmacy",
  address: "100 Main St · Newark, NJ",
  patient: "M. Rivera",
  rx: "0423-118",
  qty: "30",
  refills: "0",
  date: "11/16/2026",
};

interface RxLabelProps {
  locale: Locale;
  /** Show the English original under each translated line */
  bilingual?: boolean;
}

/** A sample prescription label, compact enough for the hero card. */
export default function RxLabel({ locale, bilingual = false }: RxLabelProps) {
  const L: Dictionary["label"] = DICTIONARIES[locale].label;
  const EN = DICTIONARIES.en.label;
  const showEnglish = bilingual && locale !== "en";

  const meta = [
    { label: L.patientLabel, value: SAMPLE.patient },
    { label: L.rxLabel, value: `#${SAMPLE.rx}` },
    { label: `${L.qtyLabel} · ${L.refillsLabel}`, value: `${SAMPLE.qty} · ${SAMPLE.refills}` },
  ];

  return (
    <figure lang={LOCALE_META[locale].htmlLang} className="overflow-hidden rounded-2xl border border-sage-200 bg-white">
      {/* Pharmacy header strip */}
      <div className="flex items-center justify-between gap-3 bg-teal px-4 py-2.5 text-white sm:px-5">
        <div lang="en" className="min-w-0">
          <p className="truncate text-sm font-semibold">{SAMPLE.pharmacy}</p>
          <p className="truncate text-xs text-teal-100">{SAMPLE.address}</p>
        </div>
        <span lang="en" className="shrink-0 text-xs font-semibold text-teal-100">{SAMPLE.date}</span>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <dl className="grid grid-cols-3 gap-3">
          {meta.map((m) => (
            <div key={m.label} className="min-w-0">
              <dt className="truncate text-xs text-slate">{m.label}</dt>
              <dd lang="en" className="truncate text-sm font-semibold text-ink">{m.value}</dd>
            </div>
          ))}
        </dl>

        <div>
          <p className="font-semibold text-ink">{L.drug}</p>
          {showEnglish && <p lang="en" className="text-xs text-slate">{EN.drug}</p>}
        </div>

        <div className="border-l-4 border-teal pl-3">
          <p className="text-xs font-semibold text-teal">{L.directionsLabel}</p>
          <p className="mt-0.5 text-lg font-semibold leading-snug text-ink">{L.directions}</p>
          {showEnglish && <p lang="en" className="mt-0.5 text-xs text-slate">{EN.directions}</p>}
        </div>

        <div>
          <p className="text-xs font-semibold text-teal">{DICTIONARIES[locale].preview.stickersHeading}</p>
          <ul className="mt-1.5 space-y-2">
            {L.warnings.map((warning, i) => (
              <li key={i} className="flex gap-2 text-sm leading-snug text-ink">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral-700" />
                <span>
                  {warning}
                  {showEnglish && <span lang="en" className="block text-xs text-slate">{EN.warnings[i]}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <figcaption className="border-t border-dashed border-sage-200 pt-3 text-sm font-semibold text-teal">
          {L.counseling}
        </figcaption>
      </div>
    </figure>
  );
}

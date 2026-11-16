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

const STICKER_STYLES = [
  "bg-coral-50 border-coral/50",
  "bg-sage-50 border-sage",
  "bg-teal-50 border-teal/40",
];

interface RxLabelProps {
  locale: Locale;
  /** Show the English original under each translated line */
  bilingual?: boolean;
  compact?: boolean;
  /** Narrow container (hero card): tighter padding, stickers stacked in one column */
  inCard?: boolean;
}

export default function RxLabel({ locale, bilingual = false, compact = false, inCard = false }: RxLabelProps) {
  const tight = compact || inCard;
  const L: Dictionary["label"] = DICTIONARIES[locale].label;
  const EN = DICTIONARIES.en.label;
  const lang = LOCALE_META[locale].htmlLang;
  const showEnglish = bilingual && locale !== "en";

  return (
    <figure
      lang={lang}
      className={`relative overflow-hidden rounded-card border-2 border-teal/15 bg-white ${tight ? "p-5" : "p-6 sm:p-8"}`}
    >
      {/* Pharmacy header strip */}
      <div
        className={`mb-5 flex items-center justify-between gap-3 bg-teal py-3 text-white ${
          tight ? "-mx-5 -mt-5 px-5" : "-mx-6 -mt-6 px-6 sm:-mx-8 sm:-mt-8 sm:px-8"
        }`}
      >
        <div lang="en" className="min-w-0">
          <p className="truncate text-sm font-semibold">{SAMPLE.pharmacy}</p>
          <p className="truncate text-xs text-teal-100">{SAMPLE.address}</p>
        </div>
        <span lang="en" className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
          {SAMPLE.date}
        </span>
      </div>

      <dl className={`grid grid-cols-2 gap-x-4 gap-y-2 text-sm ${inCard ? "" : "sm:grid-cols-4"}`}>
        <div className="col-span-2">
          <dt className="text-xs font-semibold text-slate">{L.patientLabel}</dt>
          <dd lang="en" className="font-semibold text-ink">{SAMPLE.patient}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate">{L.rxLabel}</dt>
          <dd lang="en" className="font-semibold text-ink">#{SAMPLE.rx}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate">
            {L.qtyLabel} · {L.refillsLabel}
          </dt>
          <dd lang="en" className="font-semibold text-ink">{SAMPLE.qty} · {SAMPLE.refills}</dd>
        </div>
      </dl>

      <p className="mt-4 text-base font-semibold text-ink">{L.drug}</p>
      {showEnglish && <p lang="en" className="text-sm text-slate">{EN.drug}</p>}

      <div className="mt-4 rounded-2xl bg-canvas p-4">
        <p className="text-xs font-semibold text-teal">{L.directionsLabel}</p>
        <p className={`mt-1 font-semibold text-ink ${tight ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"}`}>{L.directions}</p>
        {showEnglish && <p lang="en" className="mt-1 text-sm text-slate">{EN.directions}</p>}
      </div>

      {!compact && (
        <>
        <p className="mt-4 text-xs font-semibold text-teal">
          {DICTIONARIES[locale].preview.stickersHeading}
        </p>
        <ul className={`mt-2 grid gap-2.5 ${inCard ? "" : "sm:grid-cols-3"}`}>
          {L.warnings.map((warning, i) => (
            <li
              key={i}
              className={`flex gap-2 rounded-2xl border-2 p-3 text-sm font-semibold text-ink ${STICKER_STYLES[i % STICKER_STYLES.length]}`}
            >
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral-700" />
              <span>
                {warning}
                {showEnglish && <span lang="en" className="mt-1 block text-xs font-normal text-slate">{EN.warnings[i]}</span>}
              </span>
            </li>
          ))}
        </ul>
        </>
      )}

      <figcaption className="mt-4 flex items-center gap-2 border-t border-dashed border-sage-200 pt-3 text-sm font-semibold text-teal">
        <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-coral" aria-hidden="true" />
        {L.counseling}
      </figcaption>
    </figure>
  );
}

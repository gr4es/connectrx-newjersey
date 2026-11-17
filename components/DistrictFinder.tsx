"use client";

import { useEffect, useId, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CAMPAIGN, NJ_DISTRICTS } from "@/lib/campaign";
import { matchDistrict, searchTowns, type Town } from "@/lib/districts";
import { CheckIcon, ExternalIcon } from "@/components/icons";

interface Props {
  zip: string;
  district: number | "";
  onDistrict: (d: number | "") => void;
  error?: string;
  /** id for the manual <select>, so the parent can focus it on validation errors */
  selectId: string;
  errorId: string;
}

/**
 * Finds the visitor's legislative district from their ZIP code:
 *  1. ZIP entirely in one district → done.
 *  2. ZIP covers several towns in different districts → "Which town do you live in?"
 *  3. A split city (Newark, Jersey City) → choose between its districts.
 * Town search and a manual district list are always available as fallbacks.
 */
export default function DistrictFinder({ zip, district, onDistrict, error, selectId, errorId }: Props) {
  const { t } = useI18n();
  const uid = useId();
  const match = matchDistrict(zip);
  const [town, setTown] = useState<Town | null>(
    match.status === "pickTown" && match.towns.length === 1 ? match.towns[0] : null,
  );
  const [query, setQuery] = useState("");
  const results = searchTowns(query);

  // ZIP fully inside one district: select it straight away.
  useEffect(() => {
    if (match.status === "matched" && district === "") onDistrict(match.district);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zip]);

  const chooseTown = (tw: Town) => {
    setTown(tw);
    setQuery("");
    onDistrict(tw.districts.length === 1 ? tw.districts[0] : "");
  };

  const county = (tw: Town) => t("action.countyName", { county: tw.county });

  return (
    <div className="mt-4 space-y-5">
      <p className="text-sm font-medium text-slate">{t("action.signed")}</p>

      {/* 1. ZIP is in one district */}
      {match.status === "matched" && !town && (
        <Result>{t("action.matched", { zip, district: match.district })}</Result>
      )}

      {/* 2. Several towns: ask which one */}
      {match.status === "pickTown" && match.towns.length > 1 && (
        <fieldset>
          <legend className="font-semibold text-ink">{t("action.pickTown", { zip })}</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {match.towns.map((tw) => (
              <label
                key={tw.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                  town?.id === tw.id ? "border-teal bg-teal-50" : "border-sage-200 hover:border-teal"
                }`}
              >
                <input
                  type="radio"
                  name={`${uid}-town`}
                  checked={town?.id === tw.id}
                  onChange={() => chooseTown(tw)}
                  className="h-4 w-4 shrink-0 accent-teal"
                />
                <span lang="en" className="min-w-0">
                  <span className="block font-semibold text-ink">{tw.name}</span>
                  <span className="block text-xs text-slate">{county(tw)}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {match.status === "none" && <p className="font-semibold text-ink">{t("action.noZip", { zip })}</p>}

      {/* A town has been chosen (from the list or search) */}
      {town && town.districts.length === 1 && (
        <Result>{t("action.townDistrict", { town: town.name, district: town.districts[0] })}</Result>
      )}
      {town && town.districts.length > 1 && (
        <div className="rounded-2xl bg-sage-50 p-4">
          <p className="font-semibold text-ink">{t("action.splitTown", { town: town.name })}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {town.districts.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={district === d}
                onClick={() => onDistrict(d)}
                className={`min-h-[44px] rounded-full border px-5 font-semibold transition-colors ${
                  district === d ? "border-teal bg-teal text-white" : "border-sage-200 bg-white text-ink hover:border-teal"
                }`}
              >
                {t("action.districtOption", { district: d })}
              </button>
            ))}
          </div>
          <OfficialLink label={t("action.lookupLink")} />
        </div>
      )}

      {/* Town search: always available */}
      <div>
        <label htmlFor={`${uid}-search`} className="field-label">{t("action.searchTown")}</label>
        <input
          id={`${uid}-search`}
          type="search"
          autoComplete="address-level2"
          placeholder={t("action.searchTownPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="field-input"
        />
        {query.trim().length >= 2 && (
          results.length ? (
            <ul className="mt-2 overflow-hidden rounded-2xl border border-sage-200">
              {results.map((tw) => (
                <li key={tw.id} className="border-b border-sage-200 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => chooseTown(tw)}
                    lang="en"
                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-teal-50"
                  >
                    <span className="font-semibold text-ink">{tw.name}</span>
                    <span className="shrink-0 text-xs text-slate">{county(tw)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate">{t("action.noTownMatch")}</p>
          )
        )}
      </div>

      {/* Manual fallback */}
      <details open={!!error || match.status === "none"} className="rounded-2xl border border-sage-200 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-teal">{t("action.manualPick")}</summary>
        <div className="mt-3">
          <label htmlFor={selectId} className="field-label">{t("action.districtLabel")}</label>
          <select
            id={selectId}
            value={district}
            onChange={(e) => onDistrict(e.target.value === "" ? "" : Number(e.target.value))}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className="field-input"
          >
            <option value="">{t("action.districtPlaceholder")}</option>
            {NJ_DISTRICTS.map((n) => (
              <option key={n} value={n}>
                {t("action.districtOption", { district: n })}
              </option>
            ))}
          </select>
          <OfficialLink label={t("action.lookupLink")} />
        </div>
      </details>

      {error && (
        <p id={errorId} role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

function Result({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="flex items-start gap-2 rounded-2xl bg-sage-50 p-4 font-semibold text-teal-800">
      <CheckIcon className="mt-0.5 h-5 w-5 shrink-0" />
      {children}
    </p>
  );
}

function OfficialLink({ label }: { label: string }) {
  return (
    <a
      href={CAMPAIGN.officialDistrictMapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal underline underline-offset-4 hover:text-teal-800"
    >
      {label}
      <ExternalIcon className="h-4 w-4" />
    </a>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { interpolate, useI18n } from "@/lib/i18n";
import { DICTIONARIES, type Locale } from "@/lib/locales";
import { CAMPAIGN, NJ_DISTRICTS } from "@/lib/campaign";
import { isNjZip, isValidEmail, isValidName } from "@/lib/validation";
import type { DistrictMatch } from "@/lib/districts";
import SectionHeading from "@/components/SectionHeading";
import {
  AlertIcon,
  ArrowRightIcon,
  CapitolIcon,
  CheckIcon,
  CopyIcon,
  ExternalIcon,
  MailIcon,
  UsersIcon,
} from "@/components/icons";

type Step = 1 | 2 | 3 | 4;
type FieldErrors = Partial<Record<"name" | "email" | "zip" | "district" | "form", string>>;

interface Details {
  name: string;
  email: string;
  zip: string;
  optIn: boolean;
}

function buildLetter(locale: Locale, d: Details & { district: number }) {
  const L = DICTIONARIES[locale].action.letter;
  const vars = { name: d.name.trim(), email: d.email.trim(), zip: d.zip, district: d.district };
  return {
    subject: L.subject,
    body: [interpolate(L.greeting, vars), L.body, `${L.closing}\n${interpolate(L.signature, vars)}`].join("\n\n"),
  };
}

export default function ActionCenter() {
  const { t, dict, locale } = useI18n();
  const uid = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [details, setDetails] = useState<Details>({ name: "", email: "", zip: "", optIn: false });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [match, setMatch] = useState<DistrictMatch | null>(null);
  const [district, setDistrict] = useState<number | "">("");

  const [letterLang, setLetterLang] = useState<"en" | "mine">("en");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [edited, setEdited] = useState(false);
  const [copied, setCopied] = useState(false);

  const fieldId = (name: string) => `${uid}-${name}`;
  const errId = (name: string) => `${uid}-${name}-error`;

  // Move focus to the step heading whenever the step changes (screen reader + keyboard users).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  // (Re)generate the letter when entering step 3, switching letter language, or switching site
  // language in "mine" mode: but never overwrite the supporter's own edits.
  useEffect(() => {
    if (step !== 3 || edited || district === "") return;
    const letter = buildLetter(letterLang === "en" ? "en" : locale, { ...details, district });
    setSubject(letter.subject);
    setBody(letter.body);
  }, [step, letterLang, locale, details, district, edited]);

  const update = (key: keyof Details, value: string | boolean) => {
    setDetails((d) => ({ ...d, [key]: value }));
    if (errors[key as keyof FieldErrors]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const focusFirstError = (errs: FieldErrors) => {
    const first = (["name", "email", "zip", "district"] as const).find((k) => errs[k]);
    if (first) document.getElementById(fieldId(first))?.focus();
  };

  async function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    const next: FieldErrors = {};
    if (!isValidName(details.name)) next.name = t("action.errors.name");
    if (!isValidEmail(details.email)) next.email = t("action.errors.email");
    if (!isNjZip(details.zip)) next.zip = t("action.errors.zip");
    setErrors(next);
    if (Object.keys(next).length) return focusFirstError(next);

    setBusy(true);
    try {
      const res = await fetch("/api/pledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data: { match: DistrictMatch } = await res.json();
      setMatch(data.match);
      setDistrict(data.match.status === "matched" ? data.match.districts[0] : "");
      setStep(2);
    } catch {
      setErrors({ form: t("action.errors.network") });
    } finally {
      setBusy(false);
    }
  }

  function confirmDistrict(e: React.FormEvent) {
    e.preventDefault();
    if (district === "") {
      const next = { district: t("action.errors.district") };
      setErrors(next);
      return focusFirstError(next);
    }
    setErrors({});
    setEdited(false);
    setStep(3);
  }

  async function sendLetter(e: React.FormEvent) {
    e.preventDefault();
    if (district === "") return;
    setBusy(true);
    setErrors({});
    try {
      const res = await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...details, district }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data: { recipients: string[] } = await res.json();
      const to = data.recipients.map(encodeURIComponent).join(",");
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStep(4);
    } catch {
      setErrors({ form: t("action.errors.network") });
    } finally {
      setBusy(false);
    }
  }

  async function copyLetter() {
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* Clipboard unavailable (e.g. insecure context): the textarea remains selectable. */
    }
  }

  function reset() {
    setStep(1);
    setMatch(null);
    setDistrict("");
    setEdited(false);
    setErrors({});
  }

  const stepTitles = dict.action.steps;
  const visibleStep = Math.min(step, 3);

  return (
    <section id="action" aria-labelledby="action-title" className="section bg-teal text-white">
      <div className="container-page grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeading
            id="action-title"
            eyebrow={t("action.eyebrow")}
            title={t("action.title")}
            subtitle={t("action.subtitle")}
            invert
          />
          <ol className="mt-10 space-y-4" aria-label={t("action.stepLabel", { current: visibleStep, total: 3 })}>
            {stepTitles.map((title, i) => {
              const n = i + 1;
              const done = step > n;
              const current = visibleStep === n && step !== 4;
              return (
                <li key={title} className="flex items-center gap-4" aria-current={current ? "step" : undefined}>
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-base font-semibold ${
                      done || step === 4
                        ? "border-sage bg-sage text-ink"
                        : current
                          ? "border-white bg-white text-teal"
                          : "border-white/40 text-white/80"
                    }`}
                  >
                    {done || step === 4 ? <CheckIcon className="h-5 w-5" /> : n}
                  </span>
                  <span className={`text-lg font-semibold ${current ? "text-white" : "text-sage-100"}`}>{title}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="card p-6 text-ink sm:p-8">
          <p className="text-sm font-semibold text-slate" aria-hidden={step === 4}>
            {step < 4 && t("action.stepLabel", { current: visibleStep, total: 3 })}
          </p>

          {errors.form && (
            <p role="alert" className="field-error mb-4 rounded-2xl bg-coral-50 p-3">
              <AlertIcon className="h-5 w-5 shrink-0" />
              {errors.form}
            </p>
          )}

          {/* STEP 1: supporter details */}
          {step === 1 && (
            <form noValidate onSubmit={submitDetails} className="animate-fade-up">
              <h3 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-semibold focus:outline-none">
                {stepTitles[0]}
              </h3>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field id={fieldId("name")} label={t("action.fields.name")} error={errors.name} errorId={errId("name")} className="sm:col-span-2">
                  <input
                    id={fieldId("name")}
                    type="text"
                    autoComplete="name"
                    required
                    value={details.name}
                    onChange={(e) => update("name", e.target.value)}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? errId("name") : undefined}
                    className="field-input"
                  />
                </Field>
                <Field id={fieldId("email")} label={t("action.fields.email")} error={errors.email} errorId={errId("email")}>
                  <input
                    id={fieldId("email")}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={details.email}
                    onChange={(e) => update("email", e.target.value)}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? errId("email") : undefined}
                    className="field-input"
                  />
                </Field>
                <Field id={fieldId("zip")} label={t("action.fields.zip")} error={errors.zip} errorId={errId("zip")}>
                  <input
                    id={fieldId("zip")}
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    pattern="0[78][0-9]{3}"
                    maxLength={5}
                    required
                    value={details.zip}
                    onChange={(e) => update("zip", e.target.value.replace(/\D/g, "").slice(0, 5))}
                    aria-invalid={!!errors.zip}
                    aria-describedby={`${fieldId("zip")}-hint${errors.zip ? ` ${errId("zip")}` : ""}`}
                    className="field-input"
                  />
                  <p id={`${fieldId("zip")}-hint`} className="mt-1.5 text-sm text-slate">
                    {t("action.fields.zipHint")}
                  </p>
                </Field>
              </div>
              <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-slate">
                <input
                  type="checkbox"
                  checked={details.optIn}
                  onChange={(e) => update("optIn", e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded accent-teal"
                />
                {t("action.fields.updates")}
              </label>
              <button type="submit" disabled={busy} className="btn-primary mt-6 w-full text-lg">
                {busy ? t("action.finding") : t("action.findDistrict")}
                {!busy && <ArrowRightIcon className="h-5 w-5" />}
              </button>
            </form>
          )}

          {/* STEP 2: district confirmation */}
          {step === 2 && match && (
            <form noValidate onSubmit={confirmDistrict} className="animate-fade-up">
              <h3 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-semibold focus:outline-none">
                {stepTitles[1]}
              </h3>
              <p role="status" className="mt-4 rounded-2xl bg-sage-50 p-4 font-semibold text-teal-800">
                {match.status === "matched"
                  ? t("action.matched", { zip: details.zip, district: match.districts[0] })
                  : match.status === "multiple"
                    ? t("action.multiMatch", { zip: details.zip })
                    : t("action.noMatch", { zip: details.zip })}
              </p>

              <Field id={fieldId("district")} label={t("action.districtLabel")} error={errors.district} errorId={errId("district")} className="mt-5">
                <select
                  id={fieldId("district")}
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value === "" ? "" : Number(e.target.value));
                    setErrors({});
                  }}
                  aria-invalid={!!errors.district}
                  aria-describedby={errors.district ? errId("district") : undefined}
                  className="field-input"
                >
                  <option value="">{t("action.districtPlaceholder")}</option>
                  {(match.status === "multiple" ? match.districts : NJ_DISTRICTS).map((n) => (
                    <option key={n} value={n}>
                      {t("action.districtOption", { district: n })}
                    </option>
                  ))}
                </select>
              </Field>

              <a
                href={CAMPAIGN.officialDistrictLookupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal underline underline-offset-4 hover:text-teal-800"
              >
                {t("action.lookupLink")}
                <ExternalIcon className="h-4 w-4" />
              </a>

              {district !== "" && (
                <div className="mt-6 rounded-2xl border-2 border-sage-200 p-4">
                  <p className="text-sm font-semibold text-slate">{t("action.recipientsTitle")}</p>
                  <ul className="mt-3 space-y-2">
                    <li className="flex items-center gap-3 font-semibold">
                      <CapitolIcon className="h-5 w-5 shrink-0 text-teal" />
                      {t("action.senator", { district })}
                    </li>
                    <li className="flex items-center gap-3 font-semibold">
                      <UsersIcon className="h-5 w-5 shrink-0 text-teal" />
                      {t("action.assembly", { district })}
                    </li>
                  </ul>
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button type="button" onClick={() => setStep(1)} className="btn-ghost">
                  {t("action.back")}
                </button>
                <button type="submit" className="btn-primary">
                  {t("action.continue")}
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: letter review & dispatch */}
          {step === 3 && (
            <form onSubmit={sendLetter} className="animate-fade-up">
              <h3 ref={headingRef} tabIndex={-1} className="mt-1 text-2xl font-semibold focus:outline-none">
                {t("action.letterTitle")}
              </h3>

              {locale !== "en" && (
                <fieldset className="mt-5">
                  <legend className="field-label">{t("action.letterLanguage")}</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(["en", "mine"] as const).map((opt) => (
                      <label
                        key={opt}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3 text-sm font-semibold ${
                          letterLang === opt ? "border-teal bg-teal-50" : "border-sage-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`${uid}-letter-lang`}
                          checked={letterLang === opt}
                          onChange={() => {
                            setEdited(false);
                            setLetterLang(opt);
                          }}
                          className="h-5 w-5 shrink-0 accent-teal"
                        />
                        {opt === "en" ? t("action.letterInEnglish") : t("action.letterInMine")}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <div className="mt-5">
                <label htmlFor={fieldId("subject")} className="field-label">{t("action.subjectLabel")}</label>
                <input
                  id={fieldId("subject")}
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setEdited(true);
                  }}
                  className="field-input"
                />
              </div>
              <div className="mt-4">
                <label htmlFor={fieldId("body")} className="field-label">{t("action.bodyLabel")}</label>
                <textarea
                  id={fieldId("body")}
                  value={body}
                  rows={12}
                  onChange={(e) => {
                    setBody(e.target.value);
                    setEdited(true);
                  }}
                  lang={letterLang === "en" ? "en" : undefined}
                  className="field-input min-h-[16rem] resize-y leading-relaxed"
                />
              </div>

              <p className="mt-3 text-sm text-slate">{t("action.sendNote")}</p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <button type="submit" disabled={busy || !body.trim()} className="btn-primary sm:flex-1">
                  <MailIcon className="h-5 w-5" />
                  {busy ? t("action.sending") : t("action.send")}
                </button>
                <button type="button" onClick={copyLetter} className="btn-secondary">
                  {copied ? <CheckIcon className="h-5 w-5" /> : <CopyIcon className="h-5 w-5" />}
                  <span aria-live="polite">{copied ? t("action.copied") : t("action.copy")}</span>
                </button>
                <button type="button" onClick={() => setStep(2)} className="btn-ghost">
                  {t("action.back")}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: success */}
          {step === 4 && (
            <div className="animate-fade-up py-6 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage text-ink">
                <CheckIcon className="h-8 w-8" />
              </span>
              <h3 ref={headingRef} tabIndex={-1} className="mt-5 text-2xl font-semibold focus:outline-none">
                {t("action.successTitle", { name: details.name.trim().split(/\s+/)[0] })}
              </h3>
              <p className="mx-auto mt-3 max-w-md text-slate">{t("action.successBody")}</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button type="button" onClick={copyLetter} className="btn-secondary">
                  <CopyIcon className="h-5 w-5" />
                  <span aria-live="polite">{copied ? t("action.copied") : t("action.copy")}</span>
                </button>
                <button type="button" onClick={reset} className="btn-ghost">
                  {t("action.startOver")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  errorId,
  className = "",
  children,
}: {
  id: string;
  label: string;
  error?: string;
  errorId: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">{label}</label>
      {children}
      {error && (
        <p id={errorId} className="field-error">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

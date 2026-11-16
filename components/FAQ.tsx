"use client";

import { useId, useState } from "react";
import { useI18n } from "@/lib/i18n";
import SectionHeading from "@/components/SectionHeading";
import { PlusIcon } from "@/components/icons";

export default function FAQ() {
  const { t, dict } = useI18n();
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();

  return (
    <section id="faq" aria-labelledby="faq-title" className="section bg-white">
      <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading id="faq-title" eyebrow={t("faq.eyebrow")} title={t("faq.title")} />

        <div className="space-y-3">
          {dict.faq.items.map((item, i) => {
            const isOpen = open === i;
            const buttonId = `${uid}-q-${i}`;
            const panelId = `${uid}-a-${i}`;
            return (
              <div
                key={i}
                className={`rounded-3xl border-2 transition-colors ${isOpen ? "border-teal bg-teal-50/60" : "border-sage-200 bg-white"}`}
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 rounded-3xl px-6 py-5 text-left text-lg font-semibold text-ink"
                  >
                    <span>{item.q}</span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform ${
                        isOpen ? "rotate-45 bg-coral-600 text-white" : "bg-sage-100 text-teal"
                      }`}
                    >
                      <PlusIcon className="h-5 w-5" />
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="px-6 pb-6 text-slate"
                >
                  <p className="max-w-prose">{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

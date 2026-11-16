"use client";

import { useI18n } from "@/lib/i18n";
import SectionHeading from "@/components/SectionHeading";
import { CapitolIcon, HandIcon, TrophyIcon, UsersIcon } from "@/components/icons";

const STEP_ICONS = [HandIcon, UsersIcon, CapitolIcon, TrophyIcon];

export default function Workflow() {
  const { t, dict } = useI18n();

  return (
    <section id="journey" aria-labelledby="journey-title" className="section bg-white">
      <div className="container-page">
        <SectionHeading
          id="journey-title"
          eyebrow={t("journey.eyebrow")}
          title={t("journey.title")}
          subtitle={t("journey.subtitle")}
          align="center"
        />

        <div className="relative mt-14">
          {/* Connector line on large screens */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-8 hidden h-1 rounded-full bg-gradient-to-r from-sage via-teal to-coral lg:block"
          />
          <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {dict.journey.steps.map((step, i) => {
              const Icon = STEP_ICONS[i];
              const last = i === dict.journey.steps.length - 1;
              return (
                <li key={i} className="relative flex flex-col items-center text-center">
                  <span
                    className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white shadow-card ${
                      last ? "bg-coral-600 text-white" : "bg-teal text-white"
                    }`}
                  >
                    <Icon className="h-7 w-7" />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-slate">
                    <span aria-hidden="true">0{i + 1}</span>
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 max-w-xs text-slate">{step.body}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

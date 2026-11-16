"use client";

import { useI18n } from "@/lib/i18n";
import SectionHeading from "@/components/SectionHeading";
import { BookIcon, CheckIcon, LabelIcon, RouteIcon, ShieldIcon } from "@/components/icons";

const ICONS = [LabelIcon, BookIcon, ShieldIcon, RouteIcon];

export default function Pillars() {
  const { t, dict } = useI18n();

  return (
    <section id="pillars" aria-labelledby="pillars-title" className="section">
      <div className="container-page">
        <SectionHeading
          id="pillars-title"
          eyebrow={t("pillars.eyebrow")}
          title={t("pillars.title")}
          subtitle={t("pillars.subtitle")}
        />

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {dict.pillars.items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <li key={i} className="card group flex flex-col p-7 transition-shadow hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal text-white">
                    <Icon className="h-7 w-7" />
                  </span>
                  <span className="rounded-full bg-sage px-3 py-1 text-xs font-semibold text-ink" aria-hidden="true">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-ink">{item.title}</h3>
                <p className="mt-3 text-slate">{item.body}</p>
                <ul className="mt-5 space-y-2 border-t border-sage-200 pt-5">
                  {item.points.map((point) => (
                    <li key={point} className="flex gap-2 text-sm font-medium text-ink">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                      {point}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

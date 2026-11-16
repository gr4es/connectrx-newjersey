"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { UsersIcon } from "@/components/icons";

const ACCENTS = ["bg-teal text-white", "bg-sage text-ink", "bg-white text-teal ring-2 ring-sage-200", "bg-coral-600 text-white"];

export default function CoalitionMarquee() {
  const { t, dict } = useI18n();
  const [paused, setPaused] = useState(false);
  const items = dict.coalition.items;

  const Row = ({ hidden = false }: { hidden?: boolean }) => (
    <ul className="flex shrink-0 items-center gap-4 pr-4 motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-3 motion-reduce:pr-0" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <li
          key={`${item}-${i}`}
          className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-5 py-3 text-base font-semibold ${ACCENTS[i % ACCENTS.length]}`}
        >
          <UsersIcon className="h-5 w-5" />
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-labelledby="coalition-title" className="overflow-hidden border-y border-sage-200 bg-sage-50 py-10">
      <div className="container-page mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 id="coalition-title" className="text-xl font-semibold text-teal">
          {t("journey.coalitionTitle")}
        </h2>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
                    className="rounded-full border-2 border-teal px-4 py-1.5 text-sm font-semibold text-teal hover:bg-teal-50 motion-reduce:hidden"
        >
          <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>
          <span className="sr-only">{paused ? t("coalition.play") : t("coalition.pause")}</span>
        </button>
      </div>
      <div
        className="group relative flex [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
        aria-label={t("coalition.label")}
        role="region"
      >
        <div
          className={`flex w-max animate-marquee motion-reduce:w-full motion-reduce:animate-none motion-reduce:px-4 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] ${
            paused ? "[animation-play-state:paused]" : ""
          }`}
        >
          <Row />
          <span className="flex motion-reduce:hidden">
            <Row hidden />
          </span>
        </div>
      </div>
    </section>
  );
}

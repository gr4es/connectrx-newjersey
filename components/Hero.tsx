"use client";

import { useI18n } from "@/lib/i18n";
import RotatingTitle from "@/components/RotatingTitle";
import LabelPreviewCard from "@/components/LabelPreviewCard";
import { ArrowRightIcon } from "@/components/icons";

export default function Hero() {
  const { t, dict } = useI18n();

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* Soft mint-to-warm wash, as in the reference design */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-sage/25 blur-3xl" />
        <div className="absolute -right-40 -top-32 h-[30rem] w-[30rem] rounded-full bg-[#EADFCF]/60 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-canvas" />
      </div>

      <div className="container-page py-16 sm:py-20 lg:py-24">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="eyebrow rounded-full border border-sage-200 bg-white/70 px-3.5 py-1.5 backdrop-blur">
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-coral" aria-hidden="true" />
            {t("hero.eyebrow")}
          </p>

          <RotatingTitle />

          <p className="lede mx-auto mt-6 text-balance">{t("hero.subtitle")}</p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
            <a href="#action" className="btn-primary">
              {t("hero.ctaPetition")}
              <ArrowRightIcon className="h-5 w-5" />
            </a>
            <a href="#action" className="btn-secondary">
              {t("hero.ctaLegislator")}
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-slate sm:text-base">
            {dict.hero.badges.map((badge) => (
              <li key={badge.text}>
                <strong className="font-semibold text-ink">{badge.strong}</strong> {badge.text}
              </li>
            ))}
          </ul>
        </div>

        {/* "Your label, your language" sits at the bottom of the hero */}
        <div className="mx-auto mt-16 max-w-3xl sm:mt-20">
          <LabelPreviewCard />
        </div>
      </div>
    </section>
  );
}

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
        <div className="absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-sage/30 blur-3xl" />
        <div className="absolute -bottom-48 right-0 h-[30rem] w-[30rem] rounded-full bg-[#EADFCF]/60 blur-3xl" />
      </div>

      <div className="container-page grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:py-28">
        <div>
          <p className="eyebrow">
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-coral" aria-hidden="true" />
            {t("hero.eyebrow")}
          </p>

          <RotatingTitle />

          <p className="lede mt-2">{t("hero.subtitle")}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#action" className="btn-primary">
              {t("hero.ctaPetition")}
              <ArrowRightIcon className="h-5 w-5" />
            </a>
            <a href="#action" className="btn-secondary">
              {t("hero.ctaLegislator")}
            </a>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-slate">
            {dict.hero.badges.map((badge) => (
              <li key={badge.text}>
                <strong className="font-semibold text-ink">{badge.strong}</strong> {badge.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <LabelPreviewCard />
        </div>
      </div>
    </section>
  );
}

"use client";

import { useI18n } from "@/lib/i18n";
import { CAMPAIGN } from "@/lib/campaign";
import { MailIcon, PillMark } from "@/components/icons";

export default function Footer() {
  const { t } = useI18n();

  const links = [
    { href: "#preview", key: "preview" },
    { href: "#action", key: "action" },
    { href: "#pillars", key: "pillars" },
    { href: "#laws", key: "laws" },
    { href: "#journey", key: "journey" },
    { href: "#faq", key: "faq" },
  ];

  return (
    <footer className="bg-ink text-sage-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <PillMark className="h-9 w-9" />
            <span className="text-xl font-semibold text-white">
              Connect<span className="text-coral">RX</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm">{t("footer.tagline")}</p>
          <a href="#action" className="btn-primary mt-6">{t("nav.cta")}</a>
        </div>

        <nav aria-label="Footer">
          <ul className="space-y-2">
            {links.map((l) => (
              <li key={l.key}>
                <a href={l.href} className="rounded font-semibold hover:text-white hover:underline">
                  {t(`nav.links.${l.key}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-4">
          <a href={`mailto:${CAMPAIGN.contactEmail}`} className="inline-flex items-center gap-2 font-semibold hover:text-white hover:underline">
            <MailIcon className="h-5 w-5" />
            {t("footer.contact")}
          </a>
          <div>
            <p className="text-sm font-semibold text-sage">{t("footer.follow")}</p>
            <ul className="mt-2 flex gap-3">
              {Object.entries(CAMPAIGN.social).map(([name, href]) => (
                <li key={name}>
                  <a href={href} className="inline-flex min-h-[44px] items-center rounded-full border border-sage/40 px-4 text-sm font-semibold capitalize hover:border-white hover:text-white">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page space-y-2 py-6 text-sm text-sage-100/90">
          <p>{t("footer.legal")}</p>
          <p>{t("footer.translationNote")}</p>
        </div>
      </div>
    </footer>
  );
}

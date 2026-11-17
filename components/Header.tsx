"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { CloseIcon, MenuIcon, PillMark } from "@/components/icons";

const NAV = [
  { href: "#preview", key: "preview" },
  { href: "#action", key: "action" },
  { href: "#pillars", key: "pillars" },
  { href: "#laws", key: "laws" },
  { href: "#journey", key: "journey" },
  { href: "#faq", key: "faq" },
] as const;

export default function Header() {
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors ${
        scrolled ? "border-sage-200 bg-canvas/90 backdrop-blur-md" : "border-transparent bg-canvas"
      }`}
    >
      <div className="container-page flex h-[72px] items-center justify-between gap-4">
        <a href="#main" className="flex min-w-0 items-center gap-2.5 rounded-xl">
          <PillMark className="h-9 w-9 shrink-0" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="whitespace-nowrap text-lg font-semibold tracking-tight text-teal">
              Connect<span className="text-coral-600">RX</span>
            </span>
            <span className="hidden truncate text-xs text-slate sm:block">{t("nav.brandTag")}</span>
          </span>
        </a>

        <nav aria-label="Primary" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-slate transition-colors hover:bg-teal-50 hover:text-teal"
                >
                  {t(`nav.links.${item.key}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <a href="#action" className="btn-primary hidden !min-h-[44px] whitespace-nowrap !px-5 !py-2 !text-sm md:inline-flex">
            {t("nav.cta")}
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-teal hover:bg-teal-50 xl:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-sage-200 bg-canvas xl:hidden">
          <ul className="container-page flex flex-col gap-1 py-4">
            {NAV.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-base font-semibold text-ink hover:bg-teal-50"
                >
                  {t(`nav.links.${item.key}`)}
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a href="#action" onClick={() => setMenuOpen(false)} className="btn-primary w-full">
                {t("nav.cta")}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

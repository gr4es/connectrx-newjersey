import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n";
import { LanguageRotationProvider } from "@/lib/rotation";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_META, isLocale, matchLocale, type Locale } from "@/lib/locales";
import en from "@/locales/en.json";

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: en.meta.title,
  description: en.meta.description,
  openGraph: { title: en.meta.title, description: en.meta.description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#1B5E55",
  width: "device-width",
  initialScale: 1,
};

async function resolveInitialLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  const headerStore = await headers();
  return matchLocale(headerStore.get("accept-language")) ?? DEFAULT_LOCALE;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await resolveInitialLocale();
  return (
    <html lang={LOCALE_META[locale].htmlLang} className={`${inter.variable} scroll-smooth`}>
      <body className="bg-canvas font-sans text-ink antialiased">
        <LocaleProvider initialLocale={locale}>
          <LanguageRotationProvider>{children}</LanguageRotationProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}

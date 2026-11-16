# ConnectRX: Grassroots Advocacy Landing Page

A responsive, accessible, 7-language landing page for the proposed New Jersey **SafeRX** bill, which would require pharmacies to provide prescription labels, auxiliary warning stickers, and pharmacist counseling in a patient's preferred language. The bill is modeled on New York's SafeRx law and California's AB 1073.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run check:locales  # verify all 7 dictionaries share the same keys and placeholders
npm run build && npm start
```

Requires Node 18.18+.

## Project structure

```
app/
  layout.tsx            Server layout: picks the initial locale (cookie → Accept-Language → en)
  page.tsx              Assembles the sections
  globals.css           Tailwind layers, shared component classes, per-script typography
  api/
    pledge/route.ts     POST: validates and records a petition signature, returns the district match
    letters/route.ts    POST: records a dispatched letter, returns recipient emails if configured
    impact/route.ts     GET: running totals (for your own tracking; not shown on the page)
components/
  Header.tsx            Sticky nav, mobile menu, CTA
  LanguageSwitcher.tsx  Accessible listbox; button text cycles "Your language" in all 7 languages
  Hero.tsx              Headline, CTAs, interactive label card
  RotatingTitle.tsx     Hero headline that cycles through all 7 languages (static for reduced motion)
  LabelPreviewCard.tsx  Hero card: sample label with side language tabs and an English toggle
  ActionCenter.tsx      3-step widget: details → district → editable letter → mailto dispatch
  Pillars.tsx           The bill's four core mandates
  StateLaws.tsx         New York and California laws side by side, with official sources
  Workflow.tsx          Pledge → Mobilize → Lobby → Win
  CoalitionMarquee.tsx  Scrolling coalition types (pausable, honors reduced motion)
  RxLabel.tsx           Shared prescription-label mockup
  FAQ.tsx               Accessible accordion
  Footer.tsx, SectionHeading.tsx, SkipLink.tsx, icons.tsx
lib/
  locales.ts            Locale registry and metadata (native names, BCP 47 tags)
  i18n.tsx              LocaleProvider, useI18n(), t("dot.path", {vars})
  campaign.ts           Campaign config (URLs, baseline numbers, demo flag)
  districts.ts          ZIP → district matching
  validation.ts         Shared client/server validation
  useRotation.ts        Timed rotation hook (pauses on hover/focus, hidden tabs, reduced motion)
  rotation.tsx          Shared language clock so the hero title and language button always match
  store.ts              In-memory tally (replace with your CRM/DB)
locales/                en, es, zh, ru, pt, ko, hi (.json)
data/
  nj-zip-districts.ts   ZIP → district crosswalk (EMPTY: populate before launch)
  legislators.ts        Optional recipient emails per district (EMPTY)
scripts/check-locales.mjs
```

## Localization

- `locales/en.json` is the source of truth. Its TypeScript type (`Dictionary`) types every lookup.
- `npm run check:locales` (also run by `npm run build`) fails if any locale is missing a key, has an extra key, has a different array length, or changes a `{placeholder}`.
- The chosen language is saved in a `saferx-locale` cookie, so the server renders the right language and `<html lang>` on the next visit, with no flash or hydration mismatch. `?lang=ko` links also work.
- The hero title and language button cycle through all 7 languages, starting with the saved language. Picking a language (menu or "Read in …" button) pauses both in that language for the rest of the visit; the next page load animates again.
- Every language name in the switcher and preview tabs carries its own `lang` attribute so screen readers pronounce it correctly.
- **Translations were machine-drafted and need review by qualified translators before launch.** This is especially important for the medical label text under `label.*`.

## Before launch checklist

1. **District data:** populate `data/nj-zip-districts.ts` from an authoritative source (NJ OLS apportionment map joined to Census ZCTAs). Until then, supporters confirm their district manually, and the widget links to https://www.njleg.gov/districts.
2. **Recipients:** optionally add verified legislator emails to `data/legislators.ts`. Many NJ offices use contact forms instead. Letters are sent through the supporter's own email app (`mailto:`), so they arrive as genuine constituent mail.
3. **Persistence:** `lib/store.ts` is in-memory. It resets on deploy and isn't shared across serverless instances. Connect your CRM or database in the `/api/pledge` and `/api/letters` routes, and add bot protection and rate limiting.
4. **Contact & social:** update `contactEmail` and `social` in `lib/campaign.ts`.
5. **Legal:** add any required "Paid for by…" disclosure to the footer.

## Accessibility & color

| Pair | Contrast | Use |
|---|---|---|
| White on Teal `#1B5E55` | 7.5:1 | Headers, Action Center, step icons |
| Ink `#0F1F1C` on Sage `#87AFA4` | 7.1:1 | Badges, chips |
| Slate `#4A5D57` on Canvas `#F8FAF9` | 6.7:1 | Body copy |
| White on Coral `#D95338` | 4.0:1 | **Fails AA for small text.** Used only for decoration, accents, and focus rings |
| White on Coral-600 `#C2452B` | 5.0:1 | All coral buttons with text |

Also included: skip link, visible focus rings, 44–48px touch targets, labelled form errors that receive focus, focus moved to each new step heading, ARIA tabs and accordion, keyboard-operable language listbox, reduced-motion support (marquee, transitions), and per-script line-height and word-breaking for Hindi, Chinese, and Korean.

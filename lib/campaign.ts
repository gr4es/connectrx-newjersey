/**
 * Campaign configuration. Everything here is a placeholder for the organizing
 * team to replace: nothing below is real campaign data.
 */
export const CAMPAIGN = {
  /** Official NJ Legislature district resources (verified Nov 2026). */
  officialDistrictLookupUrl: "https://www.njleg.gov/districts",
  officialDistrictMapUrl: "https://www.njleg.gov/district-map",

  /**
   * Starting totals returned by /api/impact (no longer shown on the page). Live increments recorded by
   * /api/pledge and /api/letters are added on top. Replace with real figures
   * from your CRM before launch: do not publish invented numbers.
   */
  baselineImpact: {
    signatures: 1250,
    letters: 480,
  },
  languagesSupported: 7,
  /** Number of coalition partners; keep in sync with real, confirmed partners. */
  coalitionPartners: 12,

  contactEmail: "hello@example.org",
  social: {
    instagram: "#",
    x: "#",
    facebook: "#",
  },
} as const;

/** NJ has 40 legislative districts, each with 1 Senator and 2 Assembly members. */
export const NJ_DISTRICTS = Array.from({ length: 40 }, (_, i) => i + 1);

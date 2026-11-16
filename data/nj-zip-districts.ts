/**
 * ZIP → NJ Legislative District crosswalk.
 *
 * Intentionally EMPTY. Populate it from an authoritative source before launch:
 * e.g. the NJ Office of Legislative Services 2021 apportionment map joined
 * against U.S. Census ZCTA boundaries. Many ZIP codes span more than one
 * district, so each entry is a list.
 *
 * Example shape (not real data):
 *   "07000": [99],
 *   "08000": [98, 97],
 *
 * When a ZIP has no entry, the Action Center asks the supporter to confirm
 * their district using the official NJ Legislature lookup.
 */
export const ZIP_TO_DISTRICTS: Record<string, number[]> = {};

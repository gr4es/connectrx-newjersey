import data from "@/data/nj-districts.json";
import legislatorData from "@/data/nj-legislators.json";

/**
 * NJ ZIP code → towns → legislative district, generated from U.S. Census data by
 * scripts/build-district-data.mjs (see that file for sources). Districts are built
 * from whole towns, except Newark and Jersey City, which span two districts each.
 */
export interface Town {
  id: string;
  name: string;
  county: string;
  districts: number[];
}

const TOWN_DATA = data.towns as Record<string, Omit<Town, "id">>;
const ZIP_DATA = data.zips as Record<string, string[]>;

export const ALL_TOWNS: Town[] = Object.entries(TOWN_DATA).map(([id, t]) => ({ id, ...t }));

export function townsForZip(zip: string): Town[] {
  return (ZIP_DATA[zip] ?? []).filter((id) => TOWN_DATA[id]).map((id) => ({ id, ...TOWN_DATA[id] }));
}

export type DistrictMatch =
  /** Every town in the ZIP is in one district. */
  | { status: "matched"; district: number; towns: Town[] }
  /** The ZIP covers towns in different districts (or a split city): ask which town. */
  | { status: "pickTown"; towns: Town[] }
  /** Unknown ZIP: let the visitor search for their town. */
  | { status: "none"; towns: [] };

export function matchDistrict(zip: string): DistrictMatch {
  const towns = townsForZip(zip);
  if (!towns.length) return { status: "none", towns: [] };
  const districts = new Set(towns.flatMap((t) => t.districts));
  if (districts.size === 1) return { status: "matched", district: [...districts][0], towns };
  return { status: "pickTown", towns };
}

/** Case- and accent-insensitive town search by name, best matches first. */
export function searchTowns(query: string, limit = 6): Town[] {
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const q = norm(query.trim());
  if (q.length < 2) return [];
  const starts: Town[] = [];
  const contains: Town[] = [];
  for (const t of ALL_TOWNS) {
    const n = norm(t.name);
    if (n.startsWith(q)) starts.push(t);
    else if (n.includes(q)) contains.push(t);
  }
  return [...starts, ...contains].slice(0, limit);
}

/**
 * Current State Senator and Assembly members per district, with official
 * @njleg.org emails. Generated from Open States by scripts/build-legislators.mjs.
 */
export interface Legislator {
  name: string;
  email: string;
  /** Used only to pick the right formal title (Senator/Senadora, Assemblyman/Assemblywoman). */
  gender: "m" | "f";
}
export interface DistrictLegislators {
  senator: Legislator;
  assembly: Legislator[];
}

const LEGISLATORS = legislatorData.districts as unknown as Record<string, DistrictLegislators>;
export const LEGISLATORS_UPDATED: string = legislatorData.generated;

export function legislatorsFor(district: number): DistrictLegislators | null {
  return LEGISLATORS[String(district)] ?? null;
}

export function recipientEmails(district: number): string[] {
  const l = legislatorsFor(district);
  return l ? [l.senator.email, ...l.assembly.map((a) => a.email)] : [];
}

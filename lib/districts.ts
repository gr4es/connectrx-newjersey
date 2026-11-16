import { ZIP_TO_DISTRICTS } from "@/data/nj-zip-districts";
import { DISTRICT_RECIPIENTS } from "@/data/legislators";

export type DistrictMatch =
  | { status: "matched"; districts: [number] }
  | { status: "multiple"; districts: number[] }
  | { status: "none"; districts: [] };

export function matchDistrict(zip: string): DistrictMatch {
  const found = ZIP_TO_DISTRICTS[zip] ?? [];
  if (found.length === 1) return { status: "matched", districts: [found[0]] };
  if (found.length > 1) return { status: "multiple", districts: found };
  return { status: "none", districts: [] };
}

export function recipientEmails(district: number): string[] {
  const r = DISTRICT_RECIPIENTS[district];
  return r ? [...r.senator, ...r.assembly] : [];
}

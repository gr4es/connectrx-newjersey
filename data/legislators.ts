/**
 * Optional recipient addresses per district, used to pre-fill the "To:" line of
 * the generated email. Intentionally EMPTY: many NJ legislators accept mail
 * only through district-office contact forms, so confirm each address on
 * https://www.njleg.gov/legislative-roster before adding it.
 *
 * Shape:
 *   12: { senator: ["sen@example.org"], assembly: ["asm1@example.org", "asm2@example.org"] },
 */
export interface DistrictRecipients {
  senator: string[];
  assembly: string[];
}

export const DISTRICT_RECIPIENTS: Partial<Record<number, DistrictRecipients>> = {};

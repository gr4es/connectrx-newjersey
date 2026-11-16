import "server-only";
import { CAMPAIGN } from "@/lib/campaign";

/**
 * In-memory tally: resets on every deploy/cold start and is not shared across
 * serverless instances. Swap for your CRM / database (e.g. Action Network,
 * EveryAction, Postgres) before launch.
 */
// Kept on globalThis so every route module (and dev hot reloads) share one tally.
const g = globalThis as typeof globalThis & { __saferxTally?: { signatures: number; letters: number } };
const tally = (g.__saferxTally ??= { signatures: 0, letters: 0 });

export function recordSignature() {
  tally.signatures += 1;
}

export function recordLetter() {
  tally.letters += 1;
}

export function getImpact() {
  return {
    signatures: CAMPAIGN.baselineImpact.signatures + tally.signatures,
    letters: CAMPAIGN.baselineImpact.letters + tally.letters,
    languages: CAMPAIGN.languagesSupported,
    partners: CAMPAIGN.coalitionPartners,
  };
}

export type Impact = ReturnType<typeof getImpact>;

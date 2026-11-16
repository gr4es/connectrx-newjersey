/** Shared client + server validation. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim()) && value.length <= 254;
}

/** New Jersey ZIP codes fall in 07001–08999. */
export function isNjZip(value: string): boolean {
  if (!/^\d{5}$/.test(value)) return false;
  const n = Number(value);
  return n >= 7001 && n <= 8999;
}

export function isValidName(value: string): boolean {
  const v = value.trim();
  return v.length >= 2 && v.length <= 120;
}

export function isValidDistrict(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 40;
}

import { NextResponse } from "next/server";
import { recordSignature, getImpact } from "@/lib/store";
import { matchDistrict } from "@/lib/districts";
import { isNjZip, isValidEmail, isValidName } from "@/lib/validation";

/**
 * Records a petition signature and returns the district match for the ZIP.
 * TODO before launch: forward { name, email, zip, optIn } to your CRM and add
 * bot protection (e.g. Turnstile/hCaptcha) plus rate limiting.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = String(body.name ?? "");
  const email = String(body.email ?? "");
  const zip = String(body.zip ?? "");

  const errors: string[] = [];
  if (!isValidName(name)) errors.push("name");
  if (!isValidEmail(email)) errors.push("email");
  if (!isNjZip(zip)) errors.push("zip");
  if (errors.length) return NextResponse.json({ error: "validation", fields: errors }, { status: 422 });

  recordSignature();

  return NextResponse.json({ ok: true, match: matchDistrict(zip), impact: getImpact() });
}

import { NextResponse } from "next/server";
import { recordLetter, getImpact } from "@/lib/store";
import { recipientEmails } from "@/lib/districts";
import { isNjZip, isValidDistrict, isValidEmail, isValidName } from "@/lib/validation";

/**
 * Records that a supporter dispatched a letter and returns any configured
 * recipient addresses for their district.
 *
 * Delivery happens client-side via the supporter's own email app (mailto:),
 * which is what most legislative offices treat as a genuine constituent
 * message. To send server-side instead, integrate a transactional email
 * provider here and set the supporter's address as Reply-To.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const district = Number(body.district);
  if (
    !isValidName(String(body.name ?? "")) ||
    !isValidEmail(String(body.email ?? "")) ||
    !isNjZip(String(body.zip ?? "")) ||
    !isValidDistrict(district)
  ) {
    return NextResponse.json({ error: "validation" }, { status: 422 });
  }

  recordLetter();

  return NextResponse.json({ ok: true, recipients: recipientEmails(district), impact: getImpact() });
}

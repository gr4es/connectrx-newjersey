import { NextResponse } from "next/server";
import { getImpact } from "@/lib/store";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getImpact(), {
    headers: { "Cache-Control": "no-store" },
  });
}

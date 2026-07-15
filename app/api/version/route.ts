import { NextResponse } from "next/server";
import { getPublicVersionInfo } from "@/lib/version";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getPublicVersionInfo(), {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

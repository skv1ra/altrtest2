import JSZip from "jszip";
import { NextRequest, NextResponse } from "next/server";
import { assertAuthRateLimit, getRequestIdentity } from "@/lib/auth/rate-limit";
import { buildUserExport, rowsToCsv } from "@/lib/privacy/export";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    await assertAuthRateLimit("data_export", getRequestIdentity(request, user.email ?? user.id));
    const payload = await buildUserExport(user);
    await createSupabaseAdminClient().from("altr_audit_events").insert({
      user_id: user.id,
      actor_type: "user",
      event_type: "privacy.export.created",
      entity_type: "user",
      metadata: { format: request.nextUrl.searchParams.get("format") === "csv" ? "csv_zip" : "json", schema_version: payload.schemaVersion },
    });

    const stamp = new Date().toISOString().slice(0, 10);
    if (request.nextUrl.searchParams.get("format") === "csv") {
      const zip = new JSZip();
      zip.file("manifest.json", JSON.stringify({ schemaVersion: payload.schemaVersion, generatedAt: payload.generatedAt, user: payload.user }, null, 2));
      for (const [name, rows] of Object.entries(payload.data)) zip.file(`${name}.csv`, rowsToCsv(rows));
      for (const [name, rows] of Object.entries(payload.billingMetadata)) zip.file(`${name}.csv`, rowsToCsv(rows));
      const body = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
      return new NextResponse(body, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="altr-export-${stamp}.zip"`,
          "Cache-Control": "private, no-store",
        },
      });
    }

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="altr-export-${stamp}.json"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "EXPORT_FAILED";
    const status = message === "AUTH_REQUIRED" ? 401 : message === "RATE_LIMITED" ? 429 : 500;
    return NextResponse.json({ error: status === 429 ? "Export rate limit reached." : "Unable to create data export." }, { status });
  }
}

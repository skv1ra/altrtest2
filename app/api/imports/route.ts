import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAuthRateLimit, getRequestIdentity } from "@/lib/auth/rate-limit";
import { getUserEntitlement } from "@/lib/billing/entitlements";
import { getPlanLimits } from "@/lib/billing/limits";
import { IMPORT_LIMITS } from "@/lib/imports/limits";
import { requireUser, createSupabaseAdminClient } from "@/lib/supabase/server";

const platformSchema = z.enum(["manual", "telegram", "gmail", "whatsapp", "instagram", "messenger", "slack", "discord"]);
const mimeExtensions: Record<string, string[]> = {
  "application/json": ["json"],
  "text/plain": ["txt"],
  "text/html": ["html", "htm"],
  "text/csv": ["csv"],
  "application/zip": ["zip"],
  "application/mbox": ["mbox"],
  "application/octet-stream": ["mbox"],
};
const createSchema = z.object({
  platform: platformSchema,
  sourceName: z.string().trim().min(1).max(180),
  sourceHash: z.string().regex(/^[a-f0-9]{64}$/),
  bytes: z.number().int().min(1).max(IMPORT_LIMITS.compressedFileBytes),
  mimeType: z.string().trim().max(120),
  extension: z.string().trim().toLowerCase().max(12),
  parserVersion: z.string().trim().min(1).max(40),
  preview: z.array(z.object({ text: z.string().max(IMPORT_LIMITS.previewLength) }).strict()).max(5).default([]),
  rawFileStored: z.literal(false),
}).strict();

function monthStartIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function GET() {
  try {
    const user = await requireUser();
    const entitlement = await getUserEntitlement(user.id);
    const limits = getPlanLimits(entitlement.planId);
    const { data, error } = await createSupabaseAdminClient()
      .from("altr_conversation_imports")
      .select("id,platform,source_name,bytes,status,conversations,messages,preview,parser_version,mime_type,file_extension,raw_file_stored,created_at,completed_at,error,extraction_status,extraction_error,extraction_cursor")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ imports: data ?? [], planId: entitlement.planId, limits });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "IMPORT_LIST_FAILED" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    await assertAuthRateLimit("import_create", getRequestIdentity(request, user.id));
    const input = createSchema.parse(await request.json());
    const entitlement = await getUserEntitlement(user.id);
    const limits = getPlanLimits(entitlement.planId);
    if (input.bytes > limits.maxFileBytes) {
      return NextResponse.json({ error: "FILE_SIZE_LIMIT_REACHED", limits }, { status: 413 });
    }
    const allowed = mimeExtensions[input.mimeType] ?? [];
    if (!allowed.includes(input.extension)) return NextResponse.json({ error: "MIME_EXTENSION_MISMATCH" }, { status: 400 });

    const admin = createSupabaseAdminClient();
    const { data: duplicate } = await admin
      .from("altr_conversation_imports")
      .select("id,status,created_at")
      .eq("user_id", user.id)
      .eq("source_hash", input.sourceHash)
      .in("status", ["processing", "completed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (duplicate) {
      const stale = duplicate.status === "processing" && Date.now() - new Date(duplicate.created_at).valueOf() > 30 * 60 * 1000;
      if (!stale) return NextResponse.json({ error: "DUPLICATE_IMPORT", import: duplicate }, { status: 409 });
      await admin.from("altr_conversation_imports").update({ status: "failed", error: "STALE_PROCESSING_IMPORT" }).eq("id", duplicate.id).eq("user_id", user.id);
    }

    const [{ count: monthlyCount }, { count: processingCount }] = await Promise.all([
      admin.from("altr_conversation_imports").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", monthStartIso()).neq("status", "deleted"),
      admin.from("altr_conversation_imports").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "processing"),
    ]);
    if ((monthlyCount ?? 0) >= limits.importsPerMonth) return NextResponse.json({ error: "IMPORT_MONTHLY_QUOTA_REACHED", limits }, { status: 429 });
    if ((processingCount ?? 0) >= limits.concurrentImports) return NextResponse.json({ error: "IMPORT_CONCURRENCY_LIMIT", limits }, { status: 429 });

    const { data, error } = await admin.from("altr_conversation_imports").insert({
      user_id: user.id,
      platform: input.platform,
      source_name: input.sourceName,
      source_hash: input.sourceHash,
      status: "processing",
      bytes: input.bytes,
      preview: input.preview,
      parser_version: input.parserVersion,
      mime_type: input.mimeType,
      file_extension: input.extension,
      raw_file_stored: false,
      extraction_status: "pending",
    }).select("id,platform,source_name,status,created_at").single();
    if (error) throw error;
    return NextResponse.json({ import: data, planId: entitlement.planId, limits }, { status: 201 });
  } catch (error) {
    const status = error instanceof z.ZodError ? 400 : error instanceof Error && error.message === "RATE_LIMITED" ? 429 : 500;
    return NextResponse.json({
      error: error instanceof z.ZodError ? "INVALID_IMPORT_METADATA" : error instanceof Error ? error.message : "IMPORT_CREATE_FAILED",
    }, { status });
  }
}

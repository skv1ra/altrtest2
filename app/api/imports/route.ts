import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireUser, createSupabaseAdminClient } from "@/lib/supabase/server";
import { requirePlan } from "@/lib/billing/entitlements";

const platforms = new Set(["manual", "telegram", "gmail", "whatsapp", "instagram", "messenger", "slack", "discord"]);

function countMessages(text: string) {
  return Math.max(1, text.split(/\n+/).filter(Boolean).length);
}

export async function GET() {
  try {
    const user = await requireUser();
    const { data, error } = await createSupabaseAdminClient()
      .from("altr_conversation_imports")
      .select("id,platform,source_name,bytes,status,conversations,messages,created_at,error")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ imports: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "IMPORT_LIST_FAILED" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    await requirePlan(user.id, "personal");

    const form = await request.formData();
    const platform = String(form.get("platform") ?? "manual");
    const file = form.get("file");
    if (!platforms.has(platform)) return NextResponse.json({ error: "INVALID_PLATFORM" }, { status: 400 });
    if (!(file instanceof File)) return NextResponse.json({ error: "FILE_REQUIRED" }, { status: 400 });
    if (!/\.(zip|json|txt|html?|csv|mbox)$/i.test(file.name)) return NextResponse.json({ error: "UNSUPPORTED_FILE_TYPE" }, { status: 400 });

    const bytes = Buffer.from(await file.arrayBuffer());
    const sourceHash = createHash("sha256").update(bytes).digest("hex");
    const text = bytes.toString("utf8").slice(0, 250_000);
    const messages = countMessages(text);
    const preview = text
      .split(/\n+/)
      .filter(Boolean)
      .slice(0, 5)
      .map((line, index) => ({ index, text: line.slice(0, 260) }));
    const admin = createSupabaseAdminClient();

    const { data, error } = await admin
      .from("altr_conversation_imports")
      .insert({
        user_id: user.id,
        platform,
        source_name: file.name,
        source_hash: sourceHash,
        status: "completed",
        bytes: file.size,
        conversations: 1,
        messages,
        preview,
        completed_at: new Date().toISOString(),
      })
      .select("id,platform,source_name,bytes,status,conversations,messages,created_at,error")
      .single();
    if (error) throw error;

    const { data: memory } = await admin
      .from("altr_memories")
      .insert({
        user_id: user.id,
        import_id: data.id,
        category: "Communication",
        title: `Imported ${file.name}`,
        description: `Source imported from ${platform}. Altr may use it as a transparent source reference for draft replies after review.`,
        confidence: 0.35,
        source_reference: `${platform}:${file.name}`,
      })
      .select("id")
      .single();

    if (memory?.id) {
      await admin.from("altr_memory_sources").insert({
        user_id: user.id,
        memory_id: memory.id,
        import_id: data.id,
        source_type: "import",
        source_reference: `${platform}:${file.name}`,
      });
    }

    await admin.from("altr_audit_events").insert({
      user_id: user.id,
      actor_type: "user",
      event_type: "conversation_import.completed",
      entity_type: "conversation_import",
      entity_id: data.id,
      metadata: { platform, bytes: file.size },
    });

    return NextResponse.json({ import: data });
  } catch (error) {
    const status = error instanceof Error && error.message === "PLAN_REQUIRED" ? 403 : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : "IMPORT_FAILED" }, { status });
  }
}

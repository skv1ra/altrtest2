import { NextRequest, NextResponse } from "next/server";
import { requireUser, createSupabaseAdminClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}));
    const update: Record<string, unknown> = {};
    if (typeof body.title === "string") update.title = body.title.slice(0, 180);
    if (typeof body.description === "string") update.description = body.description.slice(0, 2000);
    if (typeof body.is_active === "boolean") update.is_active = body.is_active;
    if (!Object.keys(update).length) return NextResponse.json({ error: "NO_VALID_FIELDS" }, { status: 400 });

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.from("altr_memories").update(update).eq("id", params.id).eq("user_id", user.id).select("id,category,title,description,confidence,source_reference,is_active,created_at,updated_at").single();
    if (error) throw error;
    await admin.from("altr_audit_logs").insert({ user_id: user.id, event_type: "memory.updated", metadata: { memoryId: params.id, fields: Object.keys(update) } });
    return NextResponse.json({ memory: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "MEMORY_UPDATE_FAILED" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("altr_memories").delete().eq("id", params.id).eq("user_id", user.id);
    if (error) throw error;
    await admin.from("altr_audit_logs").insert({ user_id: user.id, event_type: "memory.deleted", metadata: { memoryId: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "MEMORY_DELETE_FAILED" }, { status: 500 });
  }
}

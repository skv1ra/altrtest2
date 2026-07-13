import { NextRequest, NextResponse } from "next/server";
import { requireUser, createSupabaseAdminClient } from "@/lib/supabase/server";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("altr_conversation_imports").update({ status: "deleted" }).eq("id", params.id).eq("user_id", user.id);
    if (error) throw error;
    await admin.from("altr_memories").update({ is_active: false }).eq("import_id", params.id).eq("user_id", user.id);
    await admin.from("altr_audit_logs").insert({ user_id: user.id, event_type: "conversation_import.deleted", metadata: { importId: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "IMPORT_DELETE_FAILED" }, { status: 500 });
  }
}

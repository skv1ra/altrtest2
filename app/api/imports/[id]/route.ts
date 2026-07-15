import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, createSupabaseAdminClient } from "@/lib/supabase/server";

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const id = z.string().uuid().parse(params.id);
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("altr_conversation_imports")
      .update({ status: "deleted" })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "IMPORT_NOT_FOUND" }, { status: 404 });

    const { error: sourceError } = await admin
      .from("altr_memory_sources")
      .delete()
      .eq("import_id", id)
      .eq("user_id", user.id);
    if (sourceError) throw sourceError;

    const { error: memoryError } = await admin
      .from("altr_memories")
      .update({ is_active: false, import_id: null })
      .eq("import_id", id)
      .eq("user_id", user.id);
    if (memoryError) throw memoryError;

    const { error: conversationError } = await admin
      .from("altr_conversations")
      .delete()
      .eq("import_id", id)
      .eq("user_id", user.id);
    if (conversationError) throw conversationError;

    return NextResponse.json({
      ok: true,
      policy: "normalized conversations/messages deleted; derived memories disabled and detached",
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof z.ZodError ? "INVALID_IMPORT_ID" : error instanceof Error ? error.message : "IMPORT_DELETE_FAILED",
    }, { status: error instanceof z.ZodError ? 400 : 500 });
  }
}

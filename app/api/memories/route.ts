import { NextResponse } from "next/server";
import { requireUser, createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await requireUser();
    const { data, error } = await createSupabaseAdminClient()
      .from("altr_memories")
      .select("id,category,title,description,confidence,source_reference,is_active,created_at,updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ memories: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "MEMORY_LIST_FAILED" }, { status: 500 });
  }
}

import "server-only";
import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function ensureApplicationState(user: User) {
  const admin = createSupabaseAdminClient();
  await admin.from("altr_user_preferences").upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });
  const { data: twin } = await admin.from("altr_assistant_configs").select("id").eq("user_id", user.id).eq("assistant_type", "digital_twin").maybeSingle();
  if (!twin) {
    await admin.from("altr_assistant_configs").insert({
      user_id: user.id,
      name: String(user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "My Altr"),
      assistant_type: "digital_twin",
      system_instructions: "Draft replies in the authenticated user's style. Never send or execute external actions.",
      tone: "balanced",
      is_active: true,
      config: { mode: "draft_only", version: 1 },
    });
  }
}

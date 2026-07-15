import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, createSupabaseAdminClient } from "@/lib/supabase/server";
import { getProfileForUser } from "@/lib/profileServer";

const updateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(), role: z.string().trim().min(1).max(120).optional(),
  altrName: z.string().trim().min(1).max(120).optional(), bio: z.string().trim().max(2000).optional(),
  tone: z.enum(["balanced","warm","direct","formal"]).optional(),
  preferences: z.object({ learning: z.boolean().optional(), autoDrafts: z.boolean().optional(), weeklyDigest: z.boolean().optional(), privacyMode: z.boolean().optional() }).strict().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "NO_VALID_FIELDS");

export async function GET() { try { const user = await requireUser(); return NextResponse.json({ profile: await getProfileForUser(user) }); } catch { return NextResponse.json({ profile: null }, { status: 401 }); } }

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser(); const input = updateSchema.parse(await request.json()); const admin = createSupabaseAdminClient();
    const profileUpdate: Record<string, unknown> = {};
    if (input.name !== undefined) profileUpdate.name = input.name; if (input.role !== undefined) profileUpdate.role = input.role;
    if (input.altrName !== undefined) profileUpdate.altr_name = input.altrName; if (input.bio !== undefined) profileUpdate.bio = input.bio; if (input.tone !== undefined) profileUpdate.tone = input.tone;
    if (Object.keys(profileUpdate).length) { const { error } = await admin.from("altr_profiles").update(profileUpdate).eq("user_id", user.id); if (error) throw error; }
    if (input.preferences) {
      const existing = await admin.from("altr_user_preferences").select("settings").eq("user_id", user.id).maybeSingle();
      const settings = { ...((existing.data?.settings ?? {}) as object) } as Record<string, unknown>;
      if (input.preferences.autoDrafts !== undefined) settings.autoDrafts = input.preferences.autoDrafts;
      if (input.preferences.weeklyDigest !== undefined) settings.weeklyDigest = input.preferences.weeklyDigest;
      if (input.preferences.privacyMode !== undefined) settings.privacyMode = input.preferences.privacyMode;
      const { error } = await admin.from("altr_user_preferences").upsert({ user_id: user.id, memory_learning_enabled: input.preferences.learning ?? true, settings }, { onConflict: "user_id" }); if (error) throw error;
    }
    await admin.from("altr_audit_events").insert({ user_id: user.id, actor_type: "user", event_type: "profile.updated", entity_type: "profile", metadata: { fields: Object.keys(input) } });
    return NextResponse.json({ profile: await getProfileForUser(user) });
  } catch (error) { return NextResponse.json({ error: error instanceof z.ZodError ? "INVALID_PROFILE_UPDATE" : error instanceof Error ? error.message : "PROFILE_UPDATE_FAILED" }, { status: error instanceof z.ZodError ? 400 : 500 }); }
}

export async function DELETE(request: NextRequest) { try { const user = await requireUser(); const body = await request.json().catch(() => ({})); if (body.confirmText !== "DELETE") return NextResponse.json({ error: "CONFIRMATION_REQUIRED" }, { status: 400 }); const admin = createSupabaseAdminClient(); await admin.from("altr_audit_events").insert({ user_id: user.id, actor_type: "user", event_type: "account.delete_requested", entity_type: "account", metadata: {} }); const { error } = await admin.auth.admin.deleteUser(user.id); if (error) throw error; return NextResponse.json({ ok: true }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "ACCOUNT_DELETE_FAILED" }, { status: 500 }); } }

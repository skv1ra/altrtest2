import { NextRequest, NextResponse } from "next/server";
import { requireUser, createSupabaseAdminClient } from "@/lib/supabase/server";
import { getProfileForUser } from "@/lib/profileServer";

export async function GET() {
  try {
    const user = await requireUser();
    const profile = await getProfileForUser(user);
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ profile: null }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}));
    const admin = createSupabaseAdminClient();
    const update: Record<string, unknown> = {};

    if (typeof body.name === "string") update.name = body.name.slice(0, 120);
    if (typeof body.altrName === "string") update.altr_name = body.altrName.slice(0, 120);
    if (typeof body.role === "string") update.role = body.role.slice(0, 120);
    if (typeof body.bio === "string") update.bio = body.bio.slice(0, 2000);
    if (["balanced", "warm", "direct", "formal"].includes(body.tone)) update.tone = body.tone;

    if (!Object.keys(update).length) {
      return NextResponse.json({ error: "NO_VALID_FIELDS" }, { status: 400 });
    }

    await admin.from("altr_profiles").update(update).eq("user_id", user.id);
    await admin.from("altr_audit_logs").insert({ user_id: user.id, event_type: "profile.updated", metadata: { fields: Object.keys(update) } });
    return NextResponse.json({ profile: await getProfileForUser(user) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "PROFILE_UPDATE_FAILED" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}));
    if (body.confirmText !== "DELETE") {
      return NextResponse.json({ error: "CONFIRMATION_REQUIRED" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    await admin.from("altr_audit_logs").insert({ user_id: user.id, event_type: "account.delete_requested", metadata: {} });
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "ACCOUNT_DELETE_FAILED" }, { status: 500 });
  }
}

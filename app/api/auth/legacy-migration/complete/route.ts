import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const user = await requireUser();
  await createSupabaseAdminClient().from("altr_audit_logs").insert({
    user_id: user.id,
    event_type: "auth.legacy_local_data_review_completed",
    metadata: {},
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set("altr_legacy_review", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

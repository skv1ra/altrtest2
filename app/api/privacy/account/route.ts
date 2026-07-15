import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAuthRateLimit, getRequestIdentity } from "@/lib/auth/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  confirmation: z.literal("DELETE MY ACCOUNT"),
  reason: z.string().trim().max(2000).optional().default(""),
});

async function listUserObjects(admin: ReturnType<typeof createSupabaseAdminClient>, bucket: string, prefix: string, depth = 0): Promise<string[]> {
  if (depth > 8) return [];
  const { data, error } = await admin.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error) throw new Error(`STORAGE_LIST_FAILED:${bucket}`);
  const paths: string[] = [];
  for (const item of data ?? []) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id) paths.push(path);
    else paths.push(...await listUserObjects(admin, bucket, path, depth + 1));
  }
  return paths;
}

async function deletePrivateStorage(admin: ReturnType<typeof createSupabaseAdminClient>, userId: string) {
  const { data: buckets, error } = await admin.storage.listBuckets();
  if (error) throw new Error("STORAGE_BUCKET_LIST_FAILED");
  for (const bucket of buckets ?? []) {
    const paths = await listUserObjects(admin, bucket.id, userId);
    for (let index = 0; index < paths.length; index += 100) {
      const { error: removeError } = await admin.storage.from(bucket.id).remove(paths.slice(index, index + 100));
      if (removeError) throw new Error(`STORAGE_DELETE_FAILED:${bucket.id}`);
    }
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser();
    const input = schema.parse(await request.json());
    await assertAuthRateLimit("account_delete", getRequestIdentity(request, user.email ?? user.id));

    if (!user.email || user.email.toLowerCase() !== input.email || !user.email_confirmed_at) {
      return NextResponse.json({ error: "Fresh verified account confirmation is required." }, { status: 403 });
    }
    const lastSignIn = user.last_sign_in_at ? Date.parse(user.last_sign_in_at) : 0;
    if (!lastSignIn || Date.now() - lastSignIn > 15 * 60_000) {
      return NextResponse.json({ error: "Please sign in again before deleting your account." }, { status: 403 });
    }

    const admin = createSupabaseAdminClient();
    const reference = `DEL-${randomBytes(6).toString("hex").toUpperCase()}`;
    const subjectHash = createHash("sha256").update(`${user.id}:${randomBytes(32).toString("hex")}`).digest("hex");
    const { data: deletionRequest, error: requestError } = await admin.from("altr_deletion_requests").insert({
      user_id: user.id,
      email: user.email.toLowerCase(),
      email_verified: true,
      requested_scope: "all",
      request_type: "full_account",
      reason: input.reason || null,
      status: "processing",
      public_reference: reference,
      source: "authenticated",
      verification_state: "verified",
      subject_hash: subjectHash,
      metadata: { recent_auth_required: true, confirmation_phrase: true },
    }).select("id").single();
    if (requestError || !deletionRequest) throw new Error("DELETION_REQUEST_CREATE_FAILED");

    await admin.from("altr_deletion_request_history").insert({
      request_id: deletionRequest.id,
      actor_type: "user",
      actor_user_id: user.id,
      to_status: "processing",
      note: "Fresh authenticated account deletion confirmed.",
    });

    await deletePrivateStorage(admin, user.id);
    const { error: prepareError } = await admin.rpc("altr_prepare_account_deletion", {
      p_user_id: user.id,
      p_request_id: deletionRequest.id,
      p_subject_hash: subjectHash,
    });
    if (prepareError) throw new Error(`DELETION_PREPARE_FAILED:${prepareError.message}`);

    const { error: authError } = await admin.auth.admin.deleteUser(user.id);
    if (authError) throw new Error(`AUTH_DELETE_FAILED:${authError.message}`);

    const response = NextResponse.json({ ok: true, reference, retained: "Only anonymized records required for reviewed financial, fraud-prevention, privacy-audit, or compliance purposes may remain. No fixed retention period is asserted." });
    response.cookies.getAll().forEach((cookie) => response.cookies.delete(cookie.name));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "ACCOUNT_DELETE_FAILED";
    const status = message === "AUTH_REQUIRED" ? 401 : message === "RATE_LIMITED" ? 429 : message.includes("invalid") ? 400 : 500;
    console.error("Account deletion failed", message);
    return NextResponse.json({ error: status === 429 ? "Too many deletion attempts. Try again later." : "Account deletion could not be completed safely." }, { status });
  }
}

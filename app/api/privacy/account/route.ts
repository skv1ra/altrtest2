import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { assertAuthRateLimit, getRequestIdentity } from "@/lib/auth/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  confirmation: z.literal("DELETE MY ACCOUNT"),
  reason: z.string().trim().max(2000).optional().default(""),
});

async function listUserObjects(admin: SupabaseClient, bucket: string, prefix: string, depth = 0): Promise<string[]> {
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

async function deletePrivateStorage(admin: SupabaseClient, userId: string) {
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

async function ensure(error: { message: string } | null, operation: string) {
  if (error) throw new Error(`${operation}:${error.message}`);
}

async function deleteDatabaseData(admin: SupabaseClient, userId: string, requestId: string, subjectHash: string) {
  await ensure((await admin.from("altr_subscriptions").update({ user_id: null, deleted_subject_hash: subjectHash, lemon_squeezy_customer_id: null, provider_customer_id: null }).eq("user_id", userId)).error, "ANONYMIZE_SUBSCRIPTIONS_FAILED");
  await ensure((await admin.from("altr_invoices").update({ user_id: null, deleted_subject_hash: subjectHash, raw_payload: {} }).eq("user_id", userId)).error, "ANONYMIZE_INVOICES_FAILED");
  await ensure((await admin.from("altr_billing_orders").update({ user_id: null, deleted_subject_hash: subjectHash, provider_customer_id: null, raw_payload: {} }).eq("user_id", userId)).error, "ANONYMIZE_ORDERS_FAILED");
  await ensure((await admin.from("altr_billing_invoices").update({ user_id: null, deleted_subject_hash: subjectHash, raw_payload: {} }).eq("user_id", userId)).error, "ANONYMIZE_BILLING_INVOICES_FAILED");

  const deletionOrder = [
    "altr_draft_feedback",
    "altr_memory_sources",
    "altr_assistant_runs",
    "altr_draft_replies",
    "altr_messages",
    "altr_memories",
    "altr_conversations",
    "altr_assistant_configs",
    "altr_conversation_imports",
    "altr_data_connections",
    "altr_consent_history",
    "altr_consent_events",
    "altr_consents",
    "altr_user_preferences",
    "altr_usage_counters",
    "altr_profiles",
    "altr_audit_logs",
    "altr_audit_events",
  ];
  for (const table of deletionOrder) {
    await ensure((await admin.from(table).delete().eq("user_id", userId)).error, `DELETE_${table.toUpperCase()}_FAILED`);
  }

  await ensure((await admin.from("altr_deletion_requests").delete().eq("user_id", userId).neq("id", requestId)).error, "DELETE_OLD_REQUESTS_FAILED");
  await ensure((await admin.from("altr_deletion_request_history").update({ actor_user_id: null }).eq("request_id", requestId)).error, "ANONYMIZE_HISTORY_FAILED");
  await ensure((await admin.from("altr_deletion_requests").update({
    user_id: null,
    email: null,
    email_verified: false,
    verification_state: "not_required",
    subject_hash: subjectHash,
    status: "completed",
    processed_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    anonymized_at: new Date().toISOString(),
    metadata: { retained: true, retention_reason: "Privacy-request audit and permitted compliance evidence; duration is determined only after legal review." },
  }).eq("id", requestId)).error, "FINALIZE_REQUEST_FAILED");
  await ensure((await admin.from("altr_deletion_request_history").insert({
    request_id: requestId,
    actor_type: "service",
    from_status: "processing",
    to_status: "completed",
    note: "User-generated data deleted; permitted billing/compliance metadata anonymized.",
    metadata: { subject_hash: subjectHash },
  })).error, "FINALIZE_HISTORY_FAILED");
}

export async function DELETE(request: NextRequest) {
  let deletionRequestId: string | null = null;
  const admin = createSupabaseAdminClient();
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
    deletionRequestId = deletionRequest.id;

    await ensure((await admin.from("altr_deletion_request_history").insert({
      request_id: deletionRequest.id,
      actor_type: "user",
      actor_user_id: user.id,
      to_status: "processing",
      note: "Fresh authenticated account deletion confirmed.",
    })).error, "DELETION_HISTORY_CREATE_FAILED");

    await deletePrivateStorage(admin, user.id);
    await deleteDatabaseData(admin, user.id, deletionRequest.id, subjectHash);
    const { error: authError } = await admin.auth.admin.deleteUser(user.id);
    if (authError) throw new Error(`AUTH_DELETE_FAILED:${authError.message}`);

    return NextResponse.json({ ok: true, reference, retained: "Only anonymized records permitted for reviewed financial, fraud-prevention, privacy-audit, or compliance purposes may remain. No fixed retention period is asserted." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ACCOUNT_DELETE_FAILED";
    if (deletionRequestId) {
      await admin.from("altr_deletion_requests").update({ status: "rejected", metadata: { processing_error: message.slice(0, 500) } }).eq("id", deletionRequestId).eq("status", "processing");
      await admin.from("altr_deletion_request_history").insert({ request_id: deletionRequestId, actor_type: "service", from_status: "processing", to_status: "rejected", note: "Deletion stopped because a protected step failed." });
    }
    const status = message === "AUTH_REQUIRED" ? 401 : message === "RATE_LIMITED" ? 429 : message.startsWith("[") ? 400 : 500;
    console.error("Account deletion failed", message);
    return NextResponse.json({ error: status === 429 ? "Too many deletion attempts. Try again later." : "Account deletion could not be completed safely." }, { status });
  }
}

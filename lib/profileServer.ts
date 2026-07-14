import type { User } from "@supabase/supabase-js";
import type { AltrProfile } from "@/lib/auth";
import { getUserEntitlement } from "@/lib/billing/entitlements";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const defaultStats = { conversations: 0, memories: 0, drafts: 0 };
const defaultConnections = { email: false, calendar: false, messages: false, workspace: false };
const defaultPreferences = { learning: true, autoDrafts: false, weeklyDigest: false, privacyMode: true };

export async function ensureProfile(user: User, name?: string | null) {
  const admin = createSupabaseAdminClient();
  const displayName = name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Altr User";
  const email = user.email ?? "";
  const existing = await admin.from("altr_profiles").select("user_id").eq("user_id", user.id).maybeSingle();
  if (existing.data) return;
  const firstName = String(displayName).split(" ")[0] || "My";
  const result = await admin.from("altr_profiles").insert({ user_id: user.id, email, name: displayName, altr_name: firstName + " Altr" });
  if (result.error && !String(result.error.message).includes("duplicate")) throw result.error;
}

export async function getProfileForUser(user: User): Promise<AltrProfile> {
  await ensureProfile(user);
  const admin = createSupabaseAdminClient();
  const [profileResult, entitlement, subscriptionResult, invoicesResult, memoriesResult, draftsResult, importsResult] = await Promise.all([
    admin.from("altr_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    getUserEntitlement(user.id),
    admin.from("altr_subscriptions").select("*").eq("user_id", user.id).eq("provider", "lemon_squeezy").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("altr_billing_invoices").select("*").eq("user_id", user.id).eq("provider", "lemon_squeezy").order("created_at", { ascending: false }).limit(20),
    admin.from("altr_memories").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    admin.from("altr_draft_replies").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    admin.from("altr_conversation_imports").select("conversations").eq("user_id", user.id).eq("status", "completed"),
  ]);

  const profile = profileResult.data;
  const subscription = subscriptionResult.data;
  const invoices = invoicesResult.data ?? [];
  const conversationCount = importsResult.data?.reduce((sum, row) => sum + Number(row.conversations ?? 0), 0) ?? 0;

  return {
    id: user.id,
    name: profile?.name ?? user.email?.split("@")[0] ?? "Altr User",
    email: user.email ?? profile?.email ?? "",
    role: profile?.role ?? "Founder",
    altrName: profile?.altr_name ?? "My Altr",
    bio: profile?.bio ?? "Altr learns from approved conversation imports and creates draft replies only.",
    createdAt: profile?.created_at ?? new Date().toISOString(),
    updatedAt: profile?.updated_at ?? new Date().toISOString(),
    plan: entitlement.planId,
    trainingProgress: Math.min(99, 12 + conversationCount * 2 + (memoriesResult.count ?? 0) * 3),
    tone: profile?.tone ?? "balanced",
    stats: { ...defaultStats, conversations: conversationCount, memories: memoriesResult.count ?? 0, drafts: draftsResult.count ?? 0 },
    connections: defaultConnections,
    preferences: defaultPreferences,
    consents: { policyVersion: "2026-07-13", termsAcceptedAt: "", conversationProcessingAcceptedAt: "", aiMemoryAcceptedAt: "" },
    subscription: subscription ? {
      status: subscription.status,
      plan: entitlement.planId,
      startedAt: subscription.created_at,
      expiresAt: subscription.renews_at ?? subscription.ends_at,
      autoRenew: !subscription.cancelled,
      provider: "lemon_squeezy",
      orderId: subscription.provider_order_id,
      subscriptionId: subscription.provider_subscription_id,
    } : null,
    invoices: invoices.map((invoice) => ({
      id: invoice.id,
      orderId: invoice.provider_order_id ?? invoice.id,
      plan: entitlement.planId,
      amount: invoice.amount ?? 0,
      currency: invoice.currency ?? "USD",
      status: invoice.status,
      createdAt: invoice.created_at,
      paidAt: invoice.paid_at,
      receiptUrl: invoice.receipt_url,
    })),
  };
}

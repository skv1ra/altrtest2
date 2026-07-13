import type { User } from "@supabase/supabase-js";
import type { AltrProfile, PlanId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const defaultStats = { conversations: 0, memories: 0, drafts: 0 };
const defaultConnections = { email: false, calendar: false, messages: false, workspace: false };
const defaultPreferences = { learning: true, autoDrafts: false, weeklyDigest: false, privacyMode: true };

export async function ensureProfile(user: User, name?: string | null) {
  const admin = createSupabaseAdminClient();
  const displayName = name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Altr User";

  await admin.from("altr_profiles").upsert({
    user_id: user.id,
    email: user.email,
    name: displayName,
    altr_name: `${String(displayName).split(" ")[0] || "My"} Altr`,
  }, { onConflict: "user_id", ignoreDuplicates: false });
}

export async function getProfileForUser(user: User): Promise<AltrProfile> {
  await ensureProfile(user);
  const admin = createSupabaseAdminClient();

  const [{ data: profile }, { data: memories }, { data: imports }, { data: drafts }, { data: subscription }, { data: invoices }] = await Promise.all([
    admin.from("altr_profiles").select("*").eq("user_id", user.id).single(),
    admin.from("altr_memories").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    admin.from("altr_conversation_imports").select("conversations", { count: "exact" }).eq("user_id", user.id).eq("status", "completed"),
    admin.from("altr_draft_replies").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    admin.from("altr_subscriptions").select("*").eq("user_id", user.id).eq("status", "active").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("altr_invoices").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
  ]);

  const activePlan = (subscription?.plan as PlanId | undefined) ?? "free";
  const conversationCount = imports?.reduce((sum, row) => sum + Number(row.conversations ?? 0), 0) ?? 0;
  const memoryCount = memories?.length ?? 0;
  const draftCount = drafts?.length ?? 0;
  const trainingProgress = Math.min(99, 12 + conversationCount * 2 + memoryCount * 3);

  return {
    id: user.id,
    name: profile?.name ?? user.email?.split("@")[0] ?? "Altr User",
    email: user.email ?? profile?.email ?? "",
    role: profile?.role ?? "Founder",
    altrName: profile?.altr_name ?? "My Altr",
    bio: profile?.bio ?? "Altr learns from approved conversation imports and creates draft replies only.",
    createdAt: profile?.created_at ?? new Date().toISOString(),
    updatedAt: profile?.updated_at ?? new Date().toISOString(),
    plan: activePlan,
    trainingProgress,
    tone: profile?.tone ?? "balanced",
    stats: { ...defaultStats, conversations: conversationCount, memories: memoryCount, drafts: draftCount },
    connections: defaultConnections,
    preferences: defaultPreferences,
    consents: { policyVersion: "2026-07-13", termsAcceptedAt: "", conversationProcessingAcceptedAt: "", aiMemoryAcceptedAt: "" },
    subscription: subscription ? {
      status: subscription.status,
      plan: subscription.plan,
      startedAt: subscription.created_at,
      expiresAt: subscription.renews_at ?? subscription.ends_at,
      autoRenew: !subscription.ends_at,
      provider: "lemon_squeezy",
      orderId: subscription.lemon_squeezy_order_id,
      subscriptionId: subscription.lemon_squeezy_subscription_id,
    } : null,
    invoices: (invoices ?? []).map((invoice) => ({
      id: invoice.id,
      orderId: invoice.lemon_squeezy_order_id ?? invoice.id,
      plan: activePlan,
      amount: invoice.amount ?? 0,
      currency: invoice.currency ?? "USD",
      status: invoice.status,
      createdAt: invoice.created_at,
      paidAt: invoice.paid_at,
      receiptUrl: invoice.receipt_url,
    })),
  };
}

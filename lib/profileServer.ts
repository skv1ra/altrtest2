import type { User } from "@supabase/supabase-js";
import type { AltrProfile } from "@/lib/auth";
import { ensureApplicationState } from "@/lib/application-state";
import { getUserEntitlement } from "@/lib/billing/entitlements";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type Settings = { autoDrafts?: boolean; weeklyDigest?: boolean; privacyMode?: boolean };

export async function ensureProfile(user: User, name?: string | null) {
  const admin = createSupabaseAdminClient();
  const displayName = name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Altr User";
  const existing = await admin.from("altr_profiles").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!existing.data) {
    const firstName = String(displayName).split(" ")[0] || "My";
    const { error } = await admin.from("altr_profiles").insert({ user_id: user.id, email: user.email ?? "", name: displayName, altr_name: `${firstName} Altr` });
    if (error && !error.message.includes("duplicate")) throw error;
  }
  await ensureApplicationState(user);
}

export async function getProfileForUser(user: User): Promise<AltrProfile> {
  await ensureProfile(user);
  const admin = createSupabaseAdminClient();
  const [profileResult, preferencesResult, connectionResult, entitlement, subscriptionResult, invoicesResult, memoriesResult, draftsResult, conversationsResult] = await Promise.all([
    admin.from("altr_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    admin.from("altr_user_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    admin.from("altr_data_connections").select("provider,status").eq("user_id", user.id),
    getUserEntitlement(user.id),
    admin.from("altr_subscriptions").select("*").eq("user_id", user.id).eq("provider", "lemon_squeezy").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("altr_billing_invoices").select("*").eq("user_id", user.id).eq("provider", "lemon_squeezy").order("created_at", { ascending: false }).limit(20),
    admin.from("altr_memories").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    admin.from("altr_assistant_runs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    admin.from("altr_conversations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);
  const profile = profileResult.data;
  const preferences = preferencesResult.data;
  const settings = (preferences?.settings ?? {}) as Settings;
  const connections = connectionResult.data ?? [];
  const stats = { conversations: conversationsResult.count ?? 0, memories: memoriesResult.count ?? 0, drafts: draftsResult.count ?? 0 };
  const computedProgress = Math.min(99, 10 + stats.conversations * 2 + stats.memories * 3 + stats.drafts);
  const trainingProgress = Math.max(Number(profile?.training_progress ?? 0), computedProgress);
  if (trainingProgress !== profile?.training_progress) await admin.from("altr_profiles").update({ training_progress: trainingProgress }).eq("user_id", user.id);
  const connected = (providers: string[]) => connections.some((item) => providers.includes(item.provider) && item.status === "connected");
  const subscription = subscriptionResult.data;
  const invoices = invoicesResult.data ?? [];
  return {
    id: user.id,
    name: profile?.name ?? user.email?.split("@")[0] ?? "Altr User",
    email: user.email ?? profile?.email ?? "",
    role: profile?.role ?? "Founder",
    altrName: profile?.altr_name ?? "My Altr",
    bio: profile?.bio ?? "Altr learns from approved conversation imports and creates draft replies only.",
    createdAt: profile?.created_at ?? new Date().toISOString(), updatedAt: profile?.updated_at ?? new Date().toISOString(),
    plan: entitlement.planId, trainingProgress, tone: profile?.tone ?? preferences?.default_tone ?? "balanced", stats,
    connections: { email: connected(["email","gmail"]), calendar: connected(["calendar","google_calendar"]), messages: connected(["telegram","whatsapp","messenger","instagram"]), workspace: connected(["workspace","slack"]) },
    preferences: { learning: preferences?.memory_learning_enabled ?? true, autoDrafts: Boolean(settings.autoDrafts), weeklyDigest: Boolean(settings.weeklyDigest), privacyMode: settings.privacyMode !== false },
    consents: { policyVersion: "2026-07-13", termsAcceptedAt: "", conversationProcessingAcceptedAt: "", aiMemoryAcceptedAt: "" },
    subscription: subscription ? { status: subscription.status, plan: entitlement.planId, startedAt: subscription.created_at, expiresAt: subscription.renews_at ?? subscription.ends_at, autoRenew: !subscription.cancelled, provider: "lemon_squeezy", orderId: subscription.provider_order_id, subscriptionId: subscription.provider_subscription_id } : null,
    invoices: invoices.map((invoice) => ({ id: invoice.id, orderId: invoice.provider_order_id ?? invoice.id, plan: entitlement.planId, amount: invoice.amount ?? 0, currency: invoice.currency ?? "USD", status: invoice.status, createdAt: invoice.created_at, paidAt: invoice.paid_at, receiptUrl: invoice.receipt_url })),
  };
}

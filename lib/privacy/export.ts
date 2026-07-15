import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const EXPORT_TABLES = [
  "altr_profiles",
  "altr_user_preferences",
  "altr_consents",
  "altr_consent_history",
  "altr_consent_events",
  "altr_conversation_imports",
  "altr_conversations",
  "altr_messages",
  "altr_memories",
  "altr_memory_sources",
  "altr_assistant_configs",
  "altr_assistant_runs",
  "altr_draft_replies",
  "altr_draft_feedback",
  "altr_deletion_requests",
] as const;

const BILLING_SELECTS = {
  altr_subscriptions: "id,plan,status,provider,renews_at,ends_at,trial_ends_at,cancelled,test_mode,created_at,updated_at",
  altr_invoices: "id,provider,amount,currency,status,receipt_url,created_at,paid_at",
  altr_billing_orders: "id,provider,plan_id,status,amount,currency,test_mode,receipt_url,ordered_at,created_at,updated_at",
  altr_billing_invoices: "id,provider,status,amount,currency,receipt_url,issued_at,paid_at,created_at,updated_at",
} as const;

export type UserExport = {
  schemaVersion: "phase-8-v1";
  generatedAt: string;
  user: { id: string; email: string | null; createdAt: string | null };
  data: Record<string, unknown[]>;
  billingMetadata: Record<string, unknown[]>;
};

export async function buildUserExport(user: { id: string; email?: string | null; created_at?: string }) {
  const admin = createSupabaseAdminClient();
  const data: Record<string, unknown[]> = {};
  for (const table of EXPORT_TABLES) {
    const select = table === "altr_memories" ? "id,user_id,import_id,category,title,description,confidence,source_reference,is_active,created_at,updated_at,metadata,source_type,extraction_model,extraction_version" : "*";
    const result = await admin.from(table).select(select).eq("user_id", user.id).order("created_at", { ascending: true });
    if (result.error) throw new Error(`EXPORT_FAILED:${table}`);
    data[table] = result.data ?? [];
  }

  const billingMetadata: Record<string, unknown[]> = {};
  for (const [table, select] of Object.entries(BILLING_SELECTS)) {
    const result = await admin.from(table).select(select).eq("user_id", user.id).order("created_at", { ascending: true });
    if (result.error) throw new Error(`EXPORT_FAILED:${table}`);
    billingMetadata[table] = result.data ?? [];
  }

  return {
    schemaVersion: "phase-8-v1",
    generatedAt: new Date().toISOString(),
    user: { id: user.id, email: user.email ?? null, createdAt: user.created_at ?? null },
    data,
    billingMetadata,
  } satisfies UserExport;
}

export function rowsToCsv(rows: unknown[]) {
  if (!rows.length) return "";
  const records = rows as Record<string, unknown>[];
  const headers = Array.from(new Set(records.flatMap((row) => Object.keys(row))));
  const escape = (value: unknown) => {
    const text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };
  return [headers.map(escape).join(","), ...records.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
}

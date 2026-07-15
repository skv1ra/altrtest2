// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const read = (path: string) => readFileSync(path, "utf8");

describe("server-authoritative billing boundaries", () => {
  it("makes webhook replay idempotent before any writes", () => {
    const source = read("lib/billing/webhook-handler.ts");
    expect(source).toContain('terminalStates.has(existing.data?.processing_status');
    expect(source).toContain('duplicate: true');
    expect(source.indexOf("terminalStates.has")).toBeLessThan(source.indexOf('processing_status: "processing"'));
  });
  it("rejects invalid signatures before parsing or storage", () => {
    const source = read("lib/billing/webhook-handler.ts");
    expect(source.indexOf("verifyLemonSignature")).toBeLessThan(source.indexOf("parseVerifiedLemonWebhook"));
    expect(source.indexOf("verifyLemonSignature")).toBeLessThan(source.indexOf('from("altr_billing_webhook_events")'));
    expect(source).toContain('status: 401');
  });
  it("quarantines unknown variants and never writes a subscription first", () => {
    const source = read("lib/billing/webhook-handler.ts");
    expect(source).toContain('finish("quarantined", "UNKNOWN_VARIANT")');
    expect(source.indexOf('UNKNOWN_VARIANT')).toBeLessThan(source.indexOf('from("altr_subscriptions")'));
  });
  it("does not activate subscriptions from the payment success URL", () => {
    const page = read("app/payment/success/PaymentConfirmation.tsx");
    expect(page).toContain('fetch("/api/billing/me"');
    expect(page).toContain("This page cannot activate a plan");
    expect(page).not.toMatch(/activatePaidSubscription|subscription.*insert|plan.*update/i);
  });
  it("isolates billing reads by the authenticated user", () => {
    const source = read("app/api/billing/me/route.ts");
    expect(source.match(/\.eq\("user_id", user\.id\)/g)?.length).toBeGreaterThanOrEqual(2);
  });
});

describe("data ownership and quotas", () => {
  it("scopes every memory mutation to the authenticated user", () => {
    const collection = read("app/api/memories/route.ts");
    const item = read("app/api/memories/[id]/route.ts");
    expect(collection).toContain('.eq("user_id", user.id)');
    expect(collection).toContain("user_id: user.id");
    expect(item.match(/\.eq\("user_id", user\.id\)/g)?.length).toBeGreaterThanOrEqual(2);
  });
  it("scopes import reads writes and deletion to the authenticated user", () => {
    for (const path of ["app/api/imports/route.ts", "app/api/imports/[id]/route.ts", "app/api/imports/[id]/chunks/route.ts"]) {
      const source = read(path);
      expect(source).toContain('user.id');
      expect(source).toMatch(/\.eq\("user_id", user\.id\)|user_id: user\.id/);
    }
  });
  it("enforces import monthly concurrency file message and conversation quotas", () => {
    const create = read("app/api/imports/route.ts");
    const chunks = read("app/api/imports/[id]/chunks/route.ts");
    for (const code of ["FILE_SIZE_LIMIT_REACHED", "IMPORT_MONTHLY_QUOTA_REACHED", "IMPORT_CONCURRENCY_LIMIT"]) expect(create).toContain(code);
    for (const code of ["MESSAGE_LIMIT_REACHED", "CONVERSATION_LIMIT_REACHED"]) expect(chunks).toContain(code);
  });
  it("enforces the AI monthly quota before calling OpenAI", () => {
    const source = read("app/api/ai/draft-reply/route.ts");
    expect(source).toContain("AI_DRAFT_QUOTA_REACHED");
    expect(source.indexOf("AI_DRAFT_QUOTA_REACHED")).toBeLessThan(source.indexOf("requireOpenAI()"));
  });
});

describe("legacy migration restrictions", () => {
  it("only scans Altr-prefixed keys and never migrates billing or credentials", () => {
    const source = read("app/legacy-migration/page.tsx");
    expect(source).toContain("LEGACY_PATTERN");
    expect(source).toContain("safeProfile");
    expect(source).not.toMatch(/safeProfile[\s\S]{0,800}(plan|subscription|payment|password)/i);
    expect(source).toContain("Локальні тарифи, платежі та підписки");
  });
});

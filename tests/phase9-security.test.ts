import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("phase 9 security hardening", () => {
  it("sets nonce CSP and production security headers", () => {
    const middleware = read("middleware.ts");
    expect(middleware).toContain("Content-Security-Policy");
    expect(middleware).toContain("frame-ancestors 'none'");
    expect(middleware).toContain("Strict-Transport-Security");
    expect(middleware).toContain("X-Content-Type-Options");
    expect(middleware).toContain("Referrer-Policy");
    expect(middleware).toContain("Permissions-Policy");
    expect(middleware).toContain("'nonce-${nonce}'");
    expect(middleware).toContain("!isProduction ? [\"'unsafe-eval'\"] : []");
  });

  it("uses an atomic persistent limiter", () => {
    const limiter = read("lib/auth/rate-limit.ts");
    const migration = read("supabase/migrations/20260715150000_phase_9_atomic_rate_limiting.sql");
    expect(limiter).toContain('.rpc("altr_consume_rate_limit"');
    expect(migration).toContain("on conflict (action, identifier_hash, window_started_at)");
    expect(migration).toContain("grant execute on function public.altr_consume_rate_limit");
    expect(migration).toContain("to service_role");
  });

  it("rate limits all required sensitive endpoints", () => {
    expect(read("app/api/auth/login/route.ts")).toContain('assertAuthRateLimit("login"');
    expect(read("app/api/auth/register/route.ts")).toContain('assertAuthRateLimit("register"');
    expect(read("app/api/auth/forgot-password/route.ts")).toContain('assertAuthRateLimit("forgot"');
    expect(read("app/api/billing/checkout/route.ts")).toContain('assertAuthRateLimit("billing_checkout"');
    expect(read("app/api/billing/portal/route.ts")).toContain('assertAuthRateLimit("billing_portal"');
    expect(read("app/api/ai/draft-reply/route.ts")).toContain('assertAuthRateLimit("ai_generation"');
    expect(read("app/api/imports/route.ts")).toContain('assertAuthRateLimit("import_create"');
    expect(read("app/api/privacy/deletion-requests/route.ts")).toContain('assertAuthRateLimit("privacy_request"');
  });

  it("redacts sensitive structured log fields and returns request IDs", () => {
    const observability = read("lib/security/observability.ts");
    expect(observability).toContain("[REDACTED]");
    expect(observability).toContain("requestId");
    expect(observability).not.toContain("error.stack");
  });
});

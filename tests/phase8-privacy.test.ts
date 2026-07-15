import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("Phase 8 privacy regressions", () => {
  it("does not keep deletion requests in browser storage", () => {
    const page = read("app/data-deletion/request/page.tsx");
    expect(page).not.toContain("localStorage");
    expect(page).toContain('/api/privacy/deletion-requests');
  });

  it("uses generic public responses and rate limiting", () => {
    const route = read("app/api/privacy/deletion-requests/route.ts");
    expect(route).toContain('assertAuthRateLimit("privacy_request"');
    expect(route).toContain("Якщо адреса пов’язана з акаунтом");
    expect(route).not.toContain("listUsers");
  });

  it("requires fresh auth and server-only Auth user deletion", () => {
    const route = read("app/api/privacy/account/route.ts");
    expect(route).toContain('z.literal("DELETE MY ACCOUNT")');
    expect(route).toContain("15 * 60_000");
    expect(route).toContain("admin.auth.admin.deleteUser");
    expect(route).toContain("deletePrivateStorage");
  });

  it("excludes embeddings and raw billing payloads from export", () => {
    const exporter = read("lib/privacy/export.ts");
    expect(exporter).not.toContain('select("*").eq("user_id", user.id)');
    expect(exporter).toContain("extraction_version");
    expect(exporter).not.toContain("raw_payload,provider_customer_id");
  });

  it("documents optional privacy email configuration", () => {
    const env = read(".env.example");
    expect(env).toContain("RESEND_API_KEY=");
    expect(env).toContain("PRIVACY_EMAIL=");
    expect(env).toContain("SUPPORT_EMAIL=");
    expect(env).toContain("DELETION_REQUEST_EMAIL_FROM=");
  });
});

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("phase 10 legal and consent consistency", () => {
  it("documents the actual production providers and Merchant of Record", () => {
    const config = read("lib/legal/legal-config.ts");
    expect(config).toContain('HOSTING_PROVIDER_NAME: "Vercel"');
    expect(config).toContain('DATABASE_PROVIDER_NAME: "Supabase Database (Postgres)"');
    expect(config).toContain('AUTH_PROVIDER_NAME: "Supabase Auth"');
    expect(config).toContain("OpenAI");
    expect(config).toContain("Merchant of Record");
  });
  it("keeps owner-required legal values unresolved rather than inventing them", () => {
    const config = read("lib/legal/legal-config.ts");
    for (const key of ["LEGAL_ENTITY_NAME", "GOVERNING_LAW", "MINIMUM_AGE", "DATA_RETENTION_PERIOD"]) {
      expect(config).toMatch(new RegExp(`${key}: \\\"\\[NEEDS OWNER INPUT:`));
    }
  });
  it("does not enable analytics or marketing in cookie preferences", () => {
    const store = read("lib/legal/cookie-store.ts"); const banner = read("components/CookieBanner.tsx");
    expect(store).toContain("analytics: false"); expect(store).toContain("marketing: false");
    expect(banner).not.toContain('analytics: choice === "all"'); expect(banner).toContain("Analytics і marketing не підключені");
  });
  it("provides a production verification release gate", () => {
    const packageJson = JSON.parse(read("package.json")); expect(packageJson.scripts["verify:production"]).toBe("node scripts/verify-production.mjs");
    const verifier = read("scripts/verify-production.mjs");
    expect(verifier).toContain("Legal owner-required values remain unresolved"); expect(verifier).toContain("LEMONSQUEEZY_PERSONAL_VARIANT_ID"); expect(verifier).toContain("NEXT_PUBLIC_ENABLE_ANALYTICS");
  });
  it("uses server-backed consent, export and deletion controls", () => {
    const panel = read("components/legal/PrivacySettingsPanel.tsx");
    for (const endpoint of ["/api/consents/grant", "/api/consents/withdraw", "/api/privacy/export", "/delete-data"]) expect(panel).toContain(endpoint);
  });
});

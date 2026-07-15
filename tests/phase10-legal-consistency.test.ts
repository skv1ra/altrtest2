import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("phase 10 legal and consent consistency", () => {
  it("documents the actual production providers and Merchant of Record", () => {
    const config = read("lib/legal/legal-config.ts");
    expect(config).toContain('HOSTING_PROVIDER_NAME: "Vercel"');
    expect(config).toContain('DATABASE_PROVIDER_NAME: "Supabase Postgres"');
    expect(config).toContain('AUTH_PROVIDER_NAME: "Supabase Auth"');
    expect(config).toContain("OpenAI");
    expect(config).toContain("Merchant of Record");
  });

  it("keeps owner-required legal values unresolved rather than inventing them", () => {
    const config = read("lib/legal/legal-config.ts");
    expect(config).toContain("[NEEDS OWNER INPUT: legal entity name]");
    expect(config).toContain("[NEEDS OWNER INPUT: governing law]");
    expect(config).toContain("[NEEDS OWNER INPUT: minimum age]");
    expect(config).toContain("[NEEDS OWNER INPUT: active data retention period]");
  });

  it("does not enable analytics or marketing in cookie preferences", () => {
    const store = read("lib/legal/cookie-store.ts");
    const banner = read("components/CookieBanner.tsx");
    expect(store).toContain("analytics: false");
    expect(store).toContain("marketing: false");
    expect(banner).not.toContain('analytics: choice === "all"');
    expect(banner).toContain("Analytics і marketing не підключені");
  });

  it("provides a production verification release gate", () => {
    const packageJson = JSON.parse(read("package.json"));
    expect(packageJson.scripts["verify:production"]).toBe("node scripts/verify-production.mjs");
    const verifier = read("scripts/verify-production.mjs");
    expect(verifier).toContain("Legal owner-required values remain unresolved");
    expect(verifier).toContain("LEMONSQUEEZY_PERSONAL_VARIANT_ID");
    expect(verifier).toContain("NEXT_PUBLIC_ENABLE_ANALYTICS");
  });

  it("uses server-backed consent, export and deletion controls", () => {
    const panel = read("components/legal/PrivacySettingsPanel.tsx");
    expect(panel).toContain('/api/consents/grant');
    expect(panel).toContain('/api/consents/withdraw');
    expect(panel).toContain('/api/privacy/export');
    expect(panel).toContain('/delete-data');
  });
});
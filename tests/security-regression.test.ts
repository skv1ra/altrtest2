// @vitest-environment node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

function read(path: string) {
  return readFileSync(resolve(repositoryRoot, path), "utf8");
}

describe("security regressions", () => {
  it("keeps LiqPay routes removed", () => {
    expect(existsSync(resolve(repositoryRoot, "app/api/payments/liqpay/create/route.ts"))).toBe(false);
    expect(existsSync(resolve(repositoryRoot, "app/api/payments/liqpay/callback/route.ts"))).toBe(false);
  });

  it("does not activate paid plans from success or return pages", () => {
    const success = read("app/payment/success/page.tsx");
    const returns = read("app/billing/return/page.tsx");

    expect(success).not.toContain("activatePaidSubscription");
    expect(returns).not.toContain("activatePaidSubscription");
    expect(success).toMatch(/webhook/i);
  });

  it("forbids client-side paid activation", () => {
    const auth = read("lib/auth.ts");

    expect(auth).toMatch(/PAID_PLANS_CAN_ONLY_BE_ACTIVATED_BY_VERIFIED_LEMON_SQUEEZY_WEBHOOKS/);
    expect(auth).not.toContain("localStorage.setItem");
    expect(auth).not.toContain("altr_session_v1");
  });

  it("verifies webhook signatures before subscription mutations", () => {
    const route = read("app/api/billing/webhook/lemon-squeezy/route.ts");
    const verifyIndex = route.indexOf("verifyWebhookSignature");
    const subscriptionIndex = route.indexOf("altr_subscriptions");

    expect(verifyIndex).toBeGreaterThanOrEqual(0);
    expect(subscriptionIndex).toBeGreaterThan(verifyIndex);
  });

  it("treats imported content as untrusted and keeps AI output draft-only", () => {
    const route = read("app/api/ai/draft-reply/route.ts");

    expect(route).toMatch(/untrusted data/);
    expect(route).toMatch(/draft replies/i);
    expect(route).not.toContain("sendEmail");
    expect(route).not.toContain("fallback-template");
    expect(route).toMatch(/OPENAI_API_KEY_REQUIRED_FOR_DRAFTS/);
  });

  it("uses server APIs for memory and disables legacy browser import storage", () => {
    const page = read("app/memory/page.tsx");
    const helper = read("lib/conversationImports.ts");

    expect(page).toMatch(/\/api\/memories/);
    expect(page).not.toContain("initialMemoryItems");
    expect(helper).not.toContain("localStorage");
    expect(helper).toMatch(/Legacy browser import storage is disabled/);
  });

  it("pins deterministic Vercel installation and the complete check command", () => {
    const vercel = JSON.parse(read("vercel.json"));
    const packageJson = JSON.parse(read("package.json"));

    expect(vercel.installCommand).toBe("yarn install --frozen-lockfile");
    expect(vercel.buildCommand).toBe("yarn build");
    expect(vercel.installCommand).not.toContain("--ignore-engines");
    expect(packageJson.packageManager).toBe("yarn@1.22.22");
    expect(packageJson.engines.node).toBe("24.x");
    expect(packageJson.scripts.check).toContain("yarn lint");
    expect(packageJson.scripts.check).toContain("yarn typecheck");
    expect(packageJson.scripts.check).toContain("yarn test");
    expect(packageJson.scripts.check).toContain("yarn build");
  });
});

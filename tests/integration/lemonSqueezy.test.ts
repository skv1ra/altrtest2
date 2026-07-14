// @vitest-environment node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { isPaidPlanId } from "@/lib/billing/plans";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const source = readFileSync(resolve(repositoryRoot, "lib/billing/lemonsqueezy.ts"), "utf8");

describe("Lemon Squeezy SDK boundary", () => {
  it("uses the official SDK instead of a hand-written checkout fetch", () => {
    expect(source).toContain('from "@lemonsqueezy/lemonsqueezy.js"');
    expect(source).toContain("createCheckout");
    expect(source).toContain("getSubscription");
    expect(source).not.toContain('fetch("https://api.lemonsqueezy.com');
  });

  it("creates hosted checkout with trusted custom metadata", () => {
    expect(source).toContain("embed: false");
    expect(source).toContain("discount: true");
    expect(source).toContain("user_id: input.userId");
    expect(source).toContain("plan_id: input.planId");
    expect(source).toContain("/payment/success");
  });

  it("keeps checkout plans allowlisted", () => {
    expect(isPaidPlanId("personal")).toBe(true);
    expect(isPaidPlanId("work")).toBe(true);
    expect(isPaidPlanId("free")).toBe(false);
    expect(isPaidPlanId("1001")).toBe(false);
  });
});

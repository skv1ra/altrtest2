import { describe, expect, it } from "vitest";
import { hasPlanAccess } from "@/lib/auth";
import { billingPlans, getBillingPlan } from "@/lib/plans";

describe("billing plans", () => {
  it("keeps the supported plans in rank order", () => {
    expect(billingPlans.map((plan) => plan.id)).toEqual(["free", "personal", "work"]);
  });

  it("falls back to the free plan for an unknown identifier", () => {
    expect(getBillingPlan("unknown" as never).id).toBe("free");
  });

  it("enforces the plan hierarchy", () => {
    expect(hasPlanAccess("work", "personal")).toBe(true);
    expect(hasPlanAccess("personal", "work")).toBe(false);
    expect(hasPlanAccess("free", "free")).toBe(true);
  });
});

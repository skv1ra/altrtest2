import { describe, expect, it } from "vitest";
import { hasPlanAccess } from "@/lib/billing/plans";

describe("hasPlanAccess", () => {
  it("allows the same or a higher plan", () => {
    expect(hasPlanAccess("free", "free")).toBe(true);
    expect(hasPlanAccess("personal", "personal")).toBe(true);
    expect(hasPlanAccess("work", "personal")).toBe(true);
    expect(hasPlanAccess("work", "work")).toBe(true);
  });

  it("rejects lower plans", () => {
    expect(hasPlanAccess("free", "personal")).toBe(false);
    expect(hasPlanAccess("free", "work")).toBe(false);
    expect(hasPlanAccess("personal", "work")).toBe(false);
  });
});

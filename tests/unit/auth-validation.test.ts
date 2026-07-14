import { describe, expect, it } from "vitest";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "@/lib/auth/validation";
import { safeRedirectPath } from "@/lib/supabase/middleware";

describe("auth validation", () => {
  it("requires all registration consents", () => {
    const result = registerSchema.safeParse({
      name: "Max",
      email: "max@example.com",
      password: "password123",
      termsAccepted: true,
      conversationProcessingAccepted: true,
      aiMemoryAccepted: false,
      policyVersion: "2026-07",
      locale: "uk-UA",
    });
    expect(result.success).toBe(false);
  });

  it("normalizes login email", () => {
    expect(loginSchema.parse({ email: " MAX@EXAMPLE.COM ", password: "password123" }).email).toBe("max@example.com");
  });

  it("validates recovery payloads", () => {
    expect(forgotPasswordSchema.safeParse({ email: "user@example.com" }).success).toBe(true);
    expect(resetPasswordSchema.safeParse({ password: "password123", confirmPassword: "different1" }).success).toBe(false);
  });
});

describe("safe auth redirects", () => {
  it("accepts internal paths", () => expect(safeRedirectPath("/dashboard?tab=data")).toBe("/dashboard?tab=data"));
  it("rejects protocol-relative redirects", () => expect(safeRedirectPath("//evil.example")).toBe("/dashboard"));
  it("rejects backslash redirects", () => expect(safeRedirectPath("/\\evil.example")).toBe("/dashboard"));
});

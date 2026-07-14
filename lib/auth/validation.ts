import { z } from "zod";

const email = z.string().trim().toLowerCase().email().max(254);
const password = z.string().min(8).max(128);

export const loginSchema = z.object({ email, password });

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email,
  password,
  termsAccepted: z.literal(true),
  conversationProcessingAccepted: z.literal(true),
  aiMemoryAccepted: z.literal(true),
  policyVersion: z.string().trim().min(1).max(64),
  locale: z.string().trim().min(2).max(20).default("uk-UA"),
});

export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z.object({ password });

export function safeNextPath(value: unknown, fallback = "/dashboard") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const url = new URL(value, "https://altr.local");
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

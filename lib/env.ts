import { z } from "zod";

const serverSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  LEMONSQUEEZY_API_KEY: z.string().min(20),
  LEMONSQUEEZY_STORE_ID: z.string().min(1),
  LEMONSQUEEZY_WEBHOOK_SECRET: z.string().min(20),
  LEMONSQUEEZY_PERSONAL_VARIANT_ID: z.string().min(1),
  LEMONSQUEEZY_WORK_VARIANT_ID: z.string().min(1),
  OPENAI_API_KEY: z.string().min(20).optional(),
  RESEND_API_KEY: z.string().min(20).optional(),
  PRIVACY_EMAIL: z.string().email().optional(),
  SUPPORT_EMAIL: z.string().email().optional(),
  DELETION_REQUEST_EMAIL_FROM: z.string().min(3).optional(),
});

const publicSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
});

export type ServerEnv = z.infer<typeof serverSchema>;

export function getPublicEnv() {
  return publicSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export function getServerEnv() {
  return serverSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    LEMONSQUEEZY_API_KEY: process.env.LEMONSQUEEZY_API_KEY,
    LEMONSQUEEZY_STORE_ID: process.env.LEMONSQUEEZY_STORE_ID,
    LEMONSQUEEZY_WEBHOOK_SECRET: process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
    LEMONSQUEEZY_PERSONAL_VARIANT_ID: process.env.LEMONSQUEEZY_PERSONAL_VARIANT_ID,
    LEMONSQUEEZY_WORK_VARIANT_ID: process.env.LEMONSQUEEZY_WORK_VARIANT_ID,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    PRIVACY_EMAIL: process.env.PRIVACY_EMAIL,
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
    DELETION_REQUEST_EMAIL_FROM: process.env.DELETION_REQUEST_EMAIL_FROM,
  });
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

export function getPlanVariantId(plan: "personal" | "work") {
  const env = getServerEnv();
  return plan === "personal" ? env.LEMONSQUEEZY_PERSONAL_VARIANT_ID : env.LEMONSQUEEZY_WORK_VARIANT_ID;
}

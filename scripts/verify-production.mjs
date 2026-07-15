import fs from "node:fs";
import path from "node:path";

const errors = [];
const env = process.env;
const root = process.cwd();
const required = (name) => { const value = env[name]?.trim(); if (!value) errors.push(`${name} is missing`); return value ?? ""; };
const placeholder = (value) => /NEEDS OWNER INPUT|ВКАЖІТЬ|YOUR_|CHANGE_ME|example\.com/i.test(value);

const appUrl = required("NEXT_PUBLIC_APP_URL");
if (appUrl) {
  try { const url = new URL(appUrl); if (url.protocol !== "https:") errors.push("NEXT_PUBLIC_APP_URL must use https in production"); if (["localhost", "127.0.0.1"].includes(url.hostname)) errors.push("NEXT_PUBLIC_APP_URL must not point to localhost"); }
  catch { errors.push("NEXT_PUBLIC_APP_URL must be a valid absolute URL"); }
}
for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]) required(name);
for (const name of ["LEMONSQUEEZY_API_KEY", "LEMONSQUEEZY_STORE_ID", "LEMONSQUEEZY_WEBHOOK_SECRET"]) required(name);
for (const name of ["OPENAI_API_KEY", "OPENAI_RESPONSE_MODEL", "OPENAI_EMBEDDING_MODEL"]) required(name);
const personalVariant = required("LEMONSQUEEZY_PERSONAL_VARIANT_ID");
const workVariant = required("LEMONSQUEEZY_WORK_VARIANT_ID");
for (const [name, value] of [["LEMONSQUEEZY_PERSONAL_VARIANT_ID", personalVariant], ["LEMONSQUEEZY_WORK_VARIANT_ID", workVariant]]) {
  if (value && !/^\d+$/.test(value)) errors.push(`${name} must be a positive numeric Lemon Squeezy variant ID`);
  if (value === "0") errors.push(`${name} must not be zero`);
}
if (personalVariant && personalVariant === workVariant) errors.push("Personal and Work Lemon Squeezy variant IDs must be different");
if (!env.PRIVACY_EMAIL?.trim() && !env.SUPPORT_EMAIL?.trim()) errors.push("PRIVACY_EMAIL or SUPPORT_EMAIL is required");
if (env.RESEND_API_KEY?.trim() && !env.DELETION_REQUEST_EMAIL_FROM?.trim()) errors.push("DELETION_REQUEST_EMAIL_FROM is required when RESEND_API_KEY is configured");
if (env.OPENAI_EMBEDDING_MODEL && env.OPENAI_EMBEDDING_MODEL !== "text-embedding-3-small") errors.push("OPENAI_EMBEDDING_MODEL requires a documented vector-dimension migration");
for (const name of ["NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "LEMONSQUEEZY_API_KEY", "LEMONSQUEEZY_STORE_ID", "LEMONSQUEEZY_WEBHOOK_SECRET", "LEMONSQUEEZY_PERSONAL_VARIANT_ID", "LEMONSQUEEZY_WORK_VARIANT_ID", "OPENAI_API_KEY", "PRIVACY_EMAIL", "SUPPORT_EMAIL"]) if (env[name] && placeholder(env[name])) errors.push(`${name} still contains a placeholder`);
const legalSource = fs.readFileSync(path.join(root, "lib/legal/legal-config.ts"), "utf8");
if (/\[NEEDS OWNER INPUT/i.test(legalSource)) errors.push("Legal owner-required values remain unresolved in lib/legal/legal-config.ts");
const unsafeFlags = ["NEXT_PUBLIC_ENABLE_ANALYTICS", "NEXT_PUBLIC_ENABLE_MARKETING", "ALLOW_UNSAFE_EVAL", "DISABLE_AUTH", "SKIP_PRODUCTION_VERIFICATION", "ALTR_E2E_MOCKS"];
for (const name of unsafeFlags) if (/^(1|true|yes|on)$/i.test(env[name]?.trim() ?? "")) errors.push(`${name} is an unsafe development-only flag`);
if (errors.length) { console.error("Production verification failed:\n" + errors.map((error) => `- ${error}`).join("\n")); process.exit(1); }
console.log("Production-critical configuration is resolved.");

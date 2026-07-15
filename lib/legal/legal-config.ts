export const LEGAL_CONFIG: Readonly<Record<string, string>> = {
  LEGAL_ENTITY_NAME: "[NEEDS OWNER INPUT: legal entity or individual controller name]",
  TRADING_NAME: "Altr",
  COMPANY_COUNTRY: "[NEEDS OWNER INPUT: country of establishment or residence]",
  REGISTERED_ADDRESS: "[NEEDS OWNER INPUT: registered or service address]",
  COMPANY_REGISTRATION_NUMBER: "[NEEDS OWNER INPUT: registration number, if applicable]",
  PRIVACY_EMAIL: "[NEEDS OWNER INPUT: public privacy contact]",
  SUPPORT_EMAIL: "[NEEDS OWNER INPUT: public support contact]",
  DPO_CONTACT: "[NEEDS OWNER INPUT: DPO details or confirmation that no DPO is appointed]",
  GOVERNING_LAW: "[NEEDS OWNER INPUT: governing law after legal review]",
  DISPUTE_JURISDICTION: "[NEEDS OWNER INPUT: courts or dispute forum after legal review]",
  REFUND_POLICY: "[NEEDS OWNER INPUT: refund and withdrawal rules coordinated with Lemon Squeezy checkout terms]",
  SUBSCRIPTION_RENEWAL_POLICY: "[NEEDS OWNER INPUT: automatic renewal, cancellation and subscription termination rules]",
  PROMOTIONAL_PRICING_POLICY: "[NEEDS OWNER INPUT: trials, discounts and promotional pricing rules, if offered]",
  LIABILITY_CAP: "[NEEDS OWNER INPUT: legally reviewed liability wording and any permitted cap]",
  MINIMUM_AGE: "[NEEDS OWNER INPUT: minimum age and parental-consent approach]",
  INTERNATIONAL_TRANSFER_MECHANISM: "[NEEDS OWNER INPUT: applicable transfer mechanism and provider regions]",
  DATA_RETENTION_PERIOD: "[NEEDS OWNER INPUT: retention schedule by data category]",
  BACKUP_RETENTION_PERIOD: "[NEEDS OWNER INPUT: backup retention and deletion cycle]",
  AVAILABLE_IN_EEA: "[NEEDS OWNER INPUT: whether the service launches in the EEA]",
  AVAILABLE_IN_UK: "[NEEDS OWNER INPUT: whether the service launches in the United Kingdom]",
  AVAILABLE_IN_UKRAINE: "[NEEDS OWNER INPUT: whether the service launches in Ukraine]",
  AVAILABLE_IN_USA: "[NEEDS OWNER INPUT: whether the service launches in the United States]",
  AVAILABLE_IN_CALIFORNIA: "[NEEDS OWNER INPUT: whether the service launches in California]",

  HOSTING_PROVIDER_NAME: "Vercel",
  AUTH_PROVIDER_NAME: "Supabase Auth",
  DATABASE_PROVIDER_NAME: "Supabase Database (Postgres)",
  PAYMENT_PROVIDER_NAME: "Lemon Squeezy",
  PAYMENT_PROVIDER_ROLE: "Merchant of Record",
  AI_PROVIDER_NAME: "OpenAI",
  EMAIL_PROVIDER_NAME: "Resend only when RESEND_API_KEY and outbound email settings are configured",
  ANALYTICS_PROVIDER_NAME: "None configured",
  MARKETING_PROVIDER_NAME: "None configured",
  ERROR_MONITORING_PROVIDER_NAME: "None configured; Sentry is not installed by default",
  RAW_IMPORT_PROCESSING: "Raw import files are parsed locally in the browser by a Web Worker and are not uploaded",
  NORMALIZED_DATA_STORAGE: "User-approved normalized conversations, messages, import metadata, derived memories, assistant runs and related account data are stored in Supabase",
  FILE_STORAGE_PROVIDER_NAME: "Supabase Storage may hold user-scoped application files when a feature creates them; raw conversation import files are not stored",
  DELETION_FLOW: "Authenticated export is generated server-side as JSON or CSV ZIP. Full account deletion removes Supabase Auth and user-scoped application data and may retain only anonymized records permitted after legal review",
  COOKIE_BEHAVIOR: "Necessary Supabase session cookies and the Altr migration-review cookie support authentication and account flow. Cookie preferences and an optional language preference use localStorage. Analytics and marketing storage are disabled",

  AI_TRAINING_ON_USER_DATA: "[NEEDS OWNER INPUT: confirm provider settings and whether user data is ever used to train shared models]",
  AVAILABLE_REGIONS: "[NEEDS OWNER INPUT: launch countries and any regional restrictions]",

  PRIVACY_POLICY_VERSION: "draft-2026-07-15",
  PRIVACY_POLICY_EFFECTIVE_DATE: "Not effective until owner and legal review",
  PRIVACY_POLICY_LAST_UPDATED: "2026-07-15",
  TERMS_VERSION: "draft-2026-07-15",
  TERMS_EFFECTIVE_DATE: "Not effective until owner and legal review",
  TERMS_LAST_UPDATED: "2026-07-15",
  COOKIE_POLICY_VERSION: "draft-2026-07-15",
  COOKIE_POLICY_EFFECTIVE_DATE: "Not effective until owner and legal review",
  COOKIE_POLICY_LAST_UPDATED: "2026-07-15",
  DATA_DELETION_VERSION: "draft-2026-07-15",
  DATA_DELETION_LAST_UPDATED: "2026-07-15",
  COOKIE_CONSENT_VERSION: "2.0",
};

export const REQUIRED_LEGAL_PLACEHOLDERS = Object.entries(LEGAL_CONFIG)
  .filter(([, value]) => value.includes("[NEEDS OWNER INPUT"))
  .map(([key]) => key);

export const hasUnresolvedLegalConfig = REQUIRED_LEGAL_PLACEHOLDERS.length > 0;
export function getMissingLegalConfigKeys() { return [...REQUIRED_LEGAL_PLACEHOLDERS]; }
export function hasMissingLegalConfig() { return hasUnresolvedLegalConfig; }

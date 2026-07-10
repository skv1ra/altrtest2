export const LEGAL_CONFIG = {
  LEGAL_ENTITY_NAME: "[NEEDS OWNER INPUT: legal entity name]",
  TRADING_NAME: "Altr",
  COMPANY_COUNTRY: "[NEEDS OWNER INPUT]",
  REGISTERED_ADDRESS: "[NEEDS OWNER INPUT: registered address]",
  COMPANY_REGISTRATION_NUMBER: "[NEEDS OWNER INPUT: registration number, if applicable]",
  PRIVACY_EMAIL: "[NEEDS OWNER INPUT: privacy email]",
  SUPPORT_EMAIL: "[NEEDS OWNER INPUT: support email]",
  DPO_CONTACT: "[NEEDS OWNER INPUT: DPO or privacy contact, if applicable]",
  GOVERNING_LAW: "[NEEDS OWNER INPUT: governing law]",
  DISPUTE_JURISDICTION: "[NEEDS OWNER INPUT: courts or dispute forum]",
  REFUND_POLICY: "[NEEDS OWNER INPUT: refund policy]",
  SUBSCRIPTION_RENEWAL_POLICY: "[NEEDS OWNER INPUT: automatic renewal and cancellation rules]",
  PROMOTIONAL_PRICING_POLICY: "[NEEDS OWNER INPUT: trial and promotional pricing policy, if applicable]",
  LIABILITY_CAP: "[NEEDS OWNER INPUT: legally reviewed liability cap]",
  MINIMUM_AGE: "[NEEDS OWNER INPUT: minimum age]",

  AI_PROVIDER_NAME: "[NEEDS OWNER INPUT: production AI provider]",
  HOSTING_PROVIDER_NAME: "Vercel (current deployment platform; confirm production setup)",
  DATABASE_PROVIDER_NAME: "Browser localStorage in this prototype; no production database configured",
  AUTH_PROVIDER_NAME: "Browser-local prototype authentication; no hosted authentication provider configured",
  EMAIL_PROVIDER_NAME: "[NEEDS OWNER INPUT: production email provider]",
  PAYMENT_PROVIDER_NAME: "No payment processor is configured in the supplied prototype",
  ANALYTICS_PROVIDER_NAME: "No analytics provider was detected in the supplied project",
  FILE_STORAGE_PROVIDER_NAME: "[NEEDS OWNER INPUT: production file storage provider]",
  ERROR_MONITORING_PROVIDER_NAME: "No error monitoring provider was detected in the supplied project",

  AI_TRAINING_ON_USER_DATA: "[NEEDS OWNER INPUT: confirm whether user content is used to train shared or general models]",
  INTERNATIONAL_TRANSFER_MECHANISM: "[NEEDS OWNER INPUT: hosting regions and transfer safeguards]",
  DATA_RETENTION_PERIOD: "[NEEDS OWNER INPUT: active data retention period]",
  BACKUP_RETENTION_PERIOD: "[NEEDS OWNER INPUT: backup retention period]",

  AVAILABLE_IN_EEA: "[NEEDS OWNER INPUT]",
  AVAILABLE_IN_UK: "[NEEDS OWNER INPUT]",
  AVAILABLE_IN_UKRAINE: "[NEEDS OWNER INPUT]",
  AVAILABLE_IN_USA: "[NEEDS OWNER INPUT]",
  AVAILABLE_IN_CALIFORNIA: "[NEEDS OWNER INPUT]",

  PRIVACY_POLICY_VERSION: "draft-1.0",
  PRIVACY_POLICY_EFFECTIVE_DATE: "Not effective until owner review",
  PRIVACY_POLICY_LAST_UPDATED: "2026-07-10",
  TERMS_VERSION: "draft-1.0",
  TERMS_EFFECTIVE_DATE: "Not effective until owner review",
  TERMS_LAST_UPDATED: "2026-07-10",
  COOKIE_POLICY_VERSION: "draft-1.0",
  COOKIE_POLICY_EFFECTIVE_DATE: "Not effective until owner review",
  COOKIE_POLICY_LAST_UPDATED: "2026-07-10",
  DATA_DELETION_VERSION: "draft-1.0",
  DATA_DELETION_LAST_UPDATED: "2026-07-10",
  COOKIE_CONSENT_VERSION: "1.0",
} as const;

export const REQUIRED_LEGAL_PLACEHOLDERS = Object.entries(LEGAL_CONFIG)
  .filter(([, value]) => typeof value === "string" && value.includes("[NEEDS OWNER INPUT"))
  .map(([key]) => key);

export const hasUnresolvedLegalConfig = REQUIRED_LEGAL_PLACEHOLDERS.length > 0;
export function getMissingLegalConfigKeys() { return [...REQUIRED_LEGAL_PLACEHOLDERS]; }
export function hasMissingLegalConfig() { return hasUnresolvedLegalConfig; }

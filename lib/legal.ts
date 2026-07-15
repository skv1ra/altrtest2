import { LEGAL_CONFIG, hasUnresolvedLegalConfig } from "@/lib/legal/legal-config";

export const LEGAL_VERSION = LEGAL_CONFIG.PRIVACY_POLICY_VERSION;

export const legalConfig = {
  serviceName: LEGAL_CONFIG.TRADING_NAME,
  version: LEGAL_CONFIG.PRIVACY_POLICY_VERSION,
  effectiveDate: LEGAL_CONFIG.PRIVACY_POLICY_EFFECTIVE_DATE,
  controllerName: LEGAL_CONFIG.LEGAL_ENTITY_NAME,
  controllerAddress: LEGAL_CONFIG.REGISTERED_ADDRESS,
  privacyEmail: LEGAL_CONFIG.PRIVACY_EMAIL,
  supportEmail: LEGAL_CONFIG.SUPPORT_EMAIL,
  governingLaw: LEGAL_CONFIG.GOVERNING_LAW,
  courts: LEGAL_CONFIG.DISPUTE_JURISDICTION,
} as const;

export const legalDetailsComplete = !hasUnresolvedLegalConfig;

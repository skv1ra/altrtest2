import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { LEGAL_CONFIG } from "@/lib/legal/legal-config";

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="LEGAL / PRIVACY"
      title="Privacy Policy"
      summary="This draft reflects Altr's current technical architecture. Owner-required legal values remain unresolved until reviewed and completed."
    >
      <LegalSection title="1. Controller and contacts">
        <p>Controller: {LEGAL_CONFIG.LEGAL_ENTITY_NAME}. Registered address: {LEGAL_CONFIG.REGISTERED_ADDRESS}. Privacy contact: {LEGAL_CONFIG.PRIVACY_EMAIL}. These values require owner input before launch.</p>
      </LegalSection>
      <LegalSection title="2. Providers and architecture">
        <ul>
          <li><strong>Vercel:</strong> hosting and serverless execution.</li>
          <li><strong>Supabase:</strong> authentication, database and protected server-side records.</li>
          <li><strong>Lemon Squeezy:</strong> hosted checkout, billing portal and Merchant of Record for provider-processed purchases.</li>
          <li><strong>OpenAI:</strong> configured AI responses and embeddings.</li>
          <li><strong>Resend:</strong> used only when email configuration is enabled.</li>
        </ul>
      </LegalSection>
      <LegalSection title="3. Data processed">
        <p>Altr may process account information, consent records, profile settings, normalized approved conversations and messages, derived memories, AI drafts, usage/security records, subscription metadata, invoices and privacy requests. Full card details are handled by Lemon Squeezy rather than stored by Altr.</p>
      </LegalSection>
      <LegalSection title="4. Conversation imports">
        <p>Raw import files are parsed locally in a browser Web Worker. The raw source file is not uploaded. After explicit user approval, normalized conversations, messages, import metadata and derived reviewable memories may be stored server-side in Supabase.</p>
      </LegalSection>
      <LegalSection title="5. AI processing">
        <p>Approved normalized data and selected memories may be sent to OpenAI for the requested draft or memory-extraction function. AI output remains a draft and requires user review. The product does not claim that a generated message was sent or that an external action was completed.</p>
      </LegalSection>
      <LegalSection title="6. Consent controls">
        <p>Registration records separate acceptance for Terms/Privacy, conversation processing and personal AI memory. Users can withdraw conversation or memory consent in settings. Withdrawal stops future corresponding processing; existing records remain until deleted through the available controls.</p>
      </LegalSection>
      <LegalSection title="7. Export and deletion">
        <p>Authenticated users can export server-held data as JSON or CSV ZIP. A public privacy-request form is also available. Full account deletion requires verified email, recent authentication and explicit confirmation. The workflow removes user records, private storage and the Supabase Auth user, while only minimal anonymized records permitted for reviewed billing, fraud, security, privacy-audit or compliance purposes may remain.</p>
        <p>See <Link href="/data-deletion">Data Deletion</Link> for the implemented flow.</p>
      </LegalSection>
      <LegalSection title="8. Cookies and browser storage">
        <p>Necessary Supabase session cookies support authentication and security. Browser localStorage stores the cookie preference and, only with permission, the selected language. Analytics and marketing storage are not enabled by default. See <Link href="/cookies">Cookie Policy</Link>.</p>
      </LegalSection>
      <LegalSection title="9. Retention and international transfers">
        <p>Active-data retention: {LEGAL_CONFIG.DATA_RETENTION_PERIOD}. Backup retention: {LEGAL_CONFIG.BACKUP_RETENTION_PERIOD}. International transfer mechanism: {LEGAL_CONFIG.INTERNATIONAL_TRANSFER_MECHANISM}. These values are intentionally not inferred from provider regions and require owner/legal review.</p>
      </LegalSection>
      <LegalSection title="10. Rights and requests">
        <p>Subject to applicable law, users may request access, correction, export, restriction, objection or deletion. Requests can be submitted through the <Link href="/data-deletion/request">privacy request form</Link> or the configured privacy contact.</p>
      </LegalSection>
    </LegalPage>
  );
}
import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
export const metadata: Metadata = { title: "Privacy Policy — Altr", description: "How Altr handles conversations, personal AI memory, and personal data." };
export default function PrivacyPage() { return <LegalDocumentPage kind="privacy" />; }

import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
export const metadata: Metadata = { title: "Terms of Use — Altr", description: "Terms governing access to and use of Altr." };
export default function TermsPage() { return <LegalDocumentPage kind="terms" />; }

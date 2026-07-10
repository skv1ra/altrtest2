import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
export const metadata: Metadata = { title: "Cookie Policy — Altr", description: "Cookies and browser storage used by Altr." };
export default function CookiesPage() { return <LegalDocumentPage kind="cookies" />; }

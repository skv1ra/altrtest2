import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
export const metadata: Metadata = { title: "Data Deletion — Altr", description: "How to delete Altr data, AI memory, and an account." };
export default function DataDeletionPage() { return <LegalDocumentPage kind="data-deletion" />; }

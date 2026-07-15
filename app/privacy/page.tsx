import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { LEGAL_CONFIG } from "@/lib/legal/legal-config";

export default function PrivacyPage() {
  return <LegalPage eyebrow="LEGAL / PRIVACY" title="Privacy Policy" summary="Цей draft описує фактичну технічну архітектуру Altr, категорії даних і доступні privacy controls. Юридичні реквізити, строки та міжнародні гарантії мають бути завершені влас
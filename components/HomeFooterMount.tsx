"use client";

import { usePathname } from "next/navigation";
import { HomeFooter } from "@/components/HomeFooter";
import { useLang } from "@/lib/i18n/lang-store";

export function HomeFooterMount() {
  const pathname = usePathname();
  const [lang] = useLang("UA");
  if (pathname !== "/") return null;
  return <HomeFooter lang={lang} />;
}

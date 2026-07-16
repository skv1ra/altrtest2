import type { Metadata } from "next";
import "./globals.css";
import "./accessibility.css";
import "./home-glow.css";
import "./home-footer.css";
import "./home-footer-structured.css";
import { CookieBanner } from "@/components/CookieBanner";
import { GlobalLanguageSwitch } from "@/components/GlobalLanguageSwitch";
import { HomeFooterMount } from "@/components/HomeFooterMount";
import { LocaleHtmlSync } from "@/components/LocaleHtmlSync";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Altr - Become impossible to replace",
  description: "Altr learns how you think, decide and communicate until it becomes your digital self.",
  openGraph: {
    title: "Altr - AI digital self",
    description: "An AI twin that learns your writing, voice, memory, routines and decisions.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-ink">
      <body className="noise antialiased">
        <LocaleHtmlSync />
        <GlobalLanguageSwitch />
        {children}
        <HomeFooterMount />
        <CookieBanner />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import "./accessibility.css";
import { CookieBanner } from "@/components/CookieBanner";
import { LocaleHtmlSync } from "@/components/LocaleHtmlSync";

const geist = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist",
  display: "swap",
});

const editorial = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-editorial",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Altr — Your controlled second presence",
  description: "Altr learns how you communicate, remembers what matters and becomes your controlled second presence online.",
  openGraph: {
    title: "Altr — Second Presence",
    description: "A second digital presence that remembers, prepares and acts within boundaries you define.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk" suppressHydrationWarning className={`${geist.variable} ${editorial.variable} bg-ink`}>
      <body className="noise antialiased">
        <LocaleHtmlSync />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}

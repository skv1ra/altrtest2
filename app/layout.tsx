import type { Metadata } from "next";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: "Altr — Become impossible to replace",
  description: "Altr learns how you think, decide and communicate — until it becomes your digital self.",
  openGraph: {
    title: "Altr — AI digital self",
    description: "An AI twin that learns your writing, voice, memory, routines and decisions.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-ink">
      <body className="noise antialiased">{children}<CookieBanner /></body>
    </html>
  );
}

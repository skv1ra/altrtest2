import { Instagram, Twitter } from "lucide-react";
import Link from "next/link";
import { AiMark } from "@/components/Navigation";
import type { Lang } from "@/lib/i18n/lang-store";

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.8 2H22l-7 8 8.2 12H16.8l-5-7.3L5.4 22H2.2l8.1-9.2L2.4 2h6.6l4.5 6.6L18.8 2Zm-1.1 17.9h1.8L8 4H6.1l11.6 15.9Z" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.2 2h3.1c.3 2.1 1.5 3.4 3.7 3.8v3.1a9.2 9.2 0 0 1-3.7-1.1v7.1a7 7 0 1 1-6.1-6.9v3.2a3.8 3.8 0 1 0 3 3.7V2Z" fill="currentColor" />
    </svg>
  );
}

export function HomeFooter({ lang }: { lang: Lang }) {
  const ua = lang === "UA";
  const groups = [
    {
      title: ua ? "Ресурси" : "Resources",
      links: [
        { label: ua ? "Продукт" : "Product", href: "#product" },
        { label: ua ? "Як це працює" : "How it works", href: "#product" },
        { label: ua ? "Памʼять" : "Memory", href: "/memory" },
        { label: ua ? "Тарифи" : "Pricing", href: "#pricing" },
      ],
    },
    {
      title: ua ? "Підтримка" : "Support",
      links: [
        { label: ua ? "Автономність" : "Autonomy", href: "#autonomy" },
        { label: ua ? "Асистенти" : "Assistants", href: "/assistants" },
        { label: ua ? "Акаунт" : "Account", href: "/dashboard" },
        { label: ua ? "Звʼязатися" : "Contact", href: "mailto:hello@altr.ai" },
      ],
    },
    {
      title: ua ? "Правові документи" : "Legal",
      links: [
        { label: ua ? "Приватність" : "Privacy", href: "/privacy" },
        { label: ua ? "Умови" : "Terms", href: "/terms" },
        { label: "Cookies", href: "/cookies" },
        { label: ua ? "Видалення даних" : "Data deletion", href: "/data-deletion" },
      ],
    },
  ];

  const socials = [
    { label: "Instagram", href: "https://instagram.com/", icon: <Instagram /> },
    { label: "X", href: "https://x.com/", icon: <XIcon /> },
    { label: "Twitter", href: "https://twitter.com/", icon: <Twitter /> },
    { label: "TikTok", href: "https://tiktok.com/", icon: <TikTokIcon /> },
  ];

  return (
    <footer className="home-footer">
      <div className="home-footer-main">
        <div className="home-footer-brand">
          <a href="#top" className="home-footer-logo">Altr <AiMark /></a>
          <span className="home-footer-status"><i />{ua ? "Усі системи працюють" : "All systems operational"}</span>
        </div>

        <nav className="home-footer-columns" aria-label={ua ? "Посилання у футері" : "Footer links"}>
          {groups.map((group) => (
            <div key={group.title} className="home-footer-column">
              <strong>{group.title}</strong>
              <div>
                {group.links.map((item) => (
                  item.href.startsWith("mailto:") || item.href.startsWith("#")
                    ? <a key={item.label} href={item.href}>{item.label}</a>
                    : <Link key={item.label} href={item.href}>{item.label}</Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="home-footer-bottom">
        <p>© 2026 Altr. {ua ? "Усі права захищені." : "All rights reserved."}</p>
        <div className="home-footer-socials">
          {socials.map((social) => (
            <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label} title={social.label}>
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

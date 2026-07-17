"use client";

import {
  Activity,
  Bot,
  BrainCircuit,
  Cable,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { AltrLogo } from "@/components/Navigation";

type Destination = "dashboard" | "memory" | "assistants" | "activity" | "integrations" | "settings";

const destinations: Array<{ id: Destination; href: string; label: string; icon: typeof LayoutDashboard }> = [
  { id: "dashboard", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "memory", href: "/memory", label: "Memory", icon: BrainCircuit },
  { id: "assistants", href: "/assistants", label: "Assistants", icon: Bot },
  { id: "activity", href: "/activity", label: "Activity", icon: Activity },
  { id: "integrations", href: "/integrations", label: "Integrations", icon: Cable },
  { id: "settings", href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({
  active,
  title,
  eyebrow,
  profileName,
  plan,
  onSignOut,
  children,
}: {
  active: Destination;
  title: string;
  eyebrow?: string;
  profileName?: string;
  plan?: string;
  onSignOut?: () => void;
  children: ReactNode;
}) {
  return (
    <main className="app-shell">
      <aside className="app-sidebar">
        <Link href="/" className="app-sidebar-logo"><AltrLogo /></Link>
        <nav className="app-sidebar-nav" aria-label="Product navigation">
          {destinations.map(({ id, href, label, icon: Icon }) => (
            <Link key={id} href={href} className={`app-nav-item ${active === id ? "is-active" : ""}`}>
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="app-sidebar-profile">
          <span className="app-avatar">{profileName?.[0]?.toUpperCase() ?? "A"}</span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-sm font-medium">{profileName ?? "Your Altr"}</strong>
            <small className="block truncate text-[11px] text-black/42">{plan ? `${plan} plan` : "Private workspace"}</small>
          </span>
          {onSignOut && (
            <button type="button" onClick={onSignOut} className="app-icon-button" aria-label="Sign out">
              <LogOut className="h-4 w-4" strokeWidth={1.7} />
            </button>
          )}
        </div>
      </aside>

      <div className="app-content">
        <header className="app-topbar">
          <Link href="/" className="lg:hidden"><AltrLogo compact /></Link>
          <div className="hidden lg:block">
            {eyebrow && <p className="app-eyebrow">{eyebrow}</p>}
            <h1 className="app-page-title">{title}</h1>
          </div>
          <div className="app-status-pill"><span />Private context active</div>
        </header>
        <section className="app-main">
          <div className="mb-8 lg:hidden">
            {eyebrow && <p className="app-eyebrow">{eyebrow}</p>}
            <h1 className="app-page-title mt-2">{title}</h1>
          </div>
          {children}
        </section>
      </div>

      <nav className="app-bottom-nav" aria-label="Mobile product navigation">
        {destinations.slice(0, 5).map(({ id, href, label, icon: Icon }) => (
          <Link key={id} href={href} className={`app-bottom-item ${active === id ? "is-active" : ""}`}>
            <Icon className="h-5 w-5" strokeWidth={1.7} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}

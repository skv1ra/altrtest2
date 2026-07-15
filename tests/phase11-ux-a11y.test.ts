import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("phase 11 UX and accessibility", () => {
  it("provides an accessible mobile menu", () => {
    const source = read("components/Navigation.tsx");
    for (const label of ["product", "memory", "assistants", "pricing", "profile"]) expect(source).toContain(`t.${label}`);
    expect(source).toContain('e.key==="Escape"');
    expect(source).toContain('aria-modal="true"');
    expect(source).toContain("aria-expanded");
  });

  it("centralizes and synchronizes locale", () => {
    expect(read("app/page.tsx")).toContain("homeCopy");
    expect(read("components/Navigation.tsx")).toContain("sharedCopy");
    expect(read("components/LocaleHtmlSync.tsx")).toContain("document.documentElement.lang");
    expect(read("app/layout.tsx")).not.toContain('lang="en"');
  });

  it("does not fake social profiles or analytics", () => {
    const home = read("app/page.tsx");
    expect(home).not.toContain('href="https://x.com"');
    expect(home).not.toContain('href="https://github.com"');
    expect(home).toContain("NEXT_PUBLIC_X_URL");
    expect(home).toContain("NEXT_PUBLIC_GITHUB_URL");
  });

  it("respects reduced motion and exposes visible focus", () => {
    expect(read("components/HeroOrb.tsx")).toContain("useReducedMotion");
    expect(read("components/Reveal.tsx")).toContain("useReducedMotion");
    expect(read("app/accessibility.css")).toContain(":focus-visible");
    expect(read("app/accessibility.css")).toContain("prefers-reduced-motion");
  });
});

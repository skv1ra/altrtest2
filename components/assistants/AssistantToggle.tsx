"use client";

export function AssistantToggle({ active, onChange, label }: { active: boolean; onChange: () => void; label: string }) {
  return <button type="button" role="switch" aria-checked={active} aria-label={label} onClick={onChange} className={`toggle ${active ? "toggle-active" : ""}`}><span /></button>;
}

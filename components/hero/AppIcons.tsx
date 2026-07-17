import type { ReactNode } from "react";

type IconFrameProps = { children: ReactNode; label: string; className?: string };

export function IconFrame({ children, label, className = "" }: IconFrameProps) {
  return (
    <span aria-label={label} className={className} role="img">
      {children}
    </span>
  );
}

export function FinderIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="finder-blue" x1="0" x2="1">
          <stop stopColor="#b9efff" />
          <stop offset="1" stopColor="#168bd4" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#finder-blue)" />
      <path d="M32 0v64" stroke="#075d9b" strokeWidth="2" />
      <path
        d="M18 24c2-4 5-6 9-6m10 0c4 0 7 2 9 6M17 39c9 8 21 8 30 0"
        fill="none"
        stroke="#073d68"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path d="m31 13-5 28" stroke="#fff" strokeLinecap="round" strokeWidth="2" opacity=".92" />
    </svg>
  );
}

export function MessagesIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="msg-green" x1=".5" y1="0" x2=".5" y2="1">
          <stop stopColor="#78f678" />
          <stop offset="1" stopColor="#19ae43" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#msg-green)" />
      <ellipse cx="32" cy="29" rx="21" ry="17" fill="white" />
      <path d="m20 43-5 8 12-5" fill="white" />
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="mail-blue" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#57c5ff" />
          <stop offset="1" stopColor="#1476e4" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#mail-blue)" />
      <rect x="10" y="16" width="44" height="33" rx="5" fill="white" />
      <path d="m13 20 19 15 19-15" fill="none" stroke="#3895eb" strokeWidth="3" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#f8f8f8" />
      <path d="M0 14c0-8 6-14 14-14h36c8 0 14 6 14 14v7H0z" fill="#ef4b50" />
      <text
        x="32"
        y="17"
        textAnchor="middle"
        fontFamily="system-ui"
        fontSize="10"
        fontWeight="700"
        fill="white"
      >
        JUL
      </text>
      <text
        x="32"
        y="48"
        textAnchor="middle"
        fontFamily="system-ui"
        fontSize="25"
        fontWeight="300"
        fill="#202124"
      >
        16
      </text>
    </svg>
  );
}

export function NotesIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#fffdf5" />
      <path d="M0 10c0-6 5-10 10-10h44c5 0 10 4 10 10v10H0z" fill="#ffd94f" />
      <g stroke="#d8d1bc" strokeWidth="1.5">
        <path d="M9 30h46M9 39h46M9 48h38" />
      </g>
    </svg>
  );
}

export function SafariIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <radialGradient id="safari" cx="50%" cy="35%">
          <stop stopColor="#70ddff" />
          <stop offset="1" stopColor="#087bd8" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="#f7f8fb" />
      <circle cx="32" cy="32" r="24" fill="url(#safari)" stroke="#fff" strokeWidth="3" />
      <circle cx="32" cy="32" r="18" fill="none" stroke="#dff8ff" strokeDasharray="2 5" />
      <path d="m36 27-6 14-2-9 8-5z" fill="#fff" />
      <path d="m28 37 7-14 2 9-9 5z" fill="#f05252" />
      <circle cx="32" cy="32" r="2" fill="#fff" />
    </svg>
  );
}

export function PhotosIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#fafafa" />
      <g transform="translate(32 32)">
        <ellipse rx="7" ry="20" transform="rotate(0)" fill="#f35b55" />
        <ellipse rx="7" ry="20" transform="rotate(45)" fill="#ff9d3e" />
        <ellipse rx="7" ry="20" transform="rotate(90)" fill="#f6d64a" />
        <ellipse rx="7" ry="20" transform="rotate(135)" fill="#55c66a" />
        <ellipse rx="7" ry="20" transform="rotate(180)" fill="#32aed0" />
        <ellipse rx="7" ry="20" transform="rotate(225)" fill="#547bea" />
        <ellipse rx="7" ry="20" transform="rotate(270)" fill="#a55de0" />
        <ellipse rx="7" ry="20" transform="rotate(315)" fill="#ed5da8" />
        <circle r="6" fill="white" />
      </g>
    </svg>
  );
}

export function SignalBars() {
  return (
    <svg viewBox="0 0 18 12" aria-hidden="true">
      <rect x="1" y="8" width="2.5" height="3" rx="1" fill="currentColor" />
      <rect x="5" y="6" width="2.5" height="5" rx="1" fill="currentColor" />
      <rect x="9" y="3" width="2.5" height="8" rx="1" fill="currentColor" />
      <rect x="13" width="2.5" height="11" rx="1" fill="currentColor" />
    </svg>
  );
}

export function WifiIcon() {
  return (
    <svg viewBox="0 0 18 14" aria-hidden="true">
      <path
        d="M2 5.2a10.4 10.4 0 0 1 14 0M4.7 8a6.4 6.4 0 0 1 8.6 0M7.4 10.7a2.4 2.4 0 0 1 3.2 0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
      <circle cx="9" cy="12.4" r="1" fill="currentColor" />
    </svg>
  );
}

export function BatteryIcon({ mobile = false }: { mobile?: boolean }) {
  return (
    <svg viewBox="0 0 28 13" aria-hidden="true">
      <rect x="1" y="1" width="23" height="11" rx="3" fill="none" stroke="currentColor" opacity=".75" />
      <rect x="3" y="3" width={mobile ? "17" : "14"} height="7" rx="1.5" fill="currentColor" />
      <path d="M25 4.5h2v4h-2z" fill="currentColor" opacity=".65" />
    </svg>
  );
}

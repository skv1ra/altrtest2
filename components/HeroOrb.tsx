"use client";

const lines = [
  [16, 34, 38, 24],
  [34, 24, 58, 32],
  [58, 32, 80, 21],
  [18, 66, 42, 58],
  [42, 58, 68, 70],
  [68, 70, 86, 56],
  [28, 46, 55, 48],
  [55, 48, 76, 40],
];

export function HeroOrb({ quiet = false }: { quiet?: boolean }) {
  return (
    <div className={`hero-visual relative mx-auto h-[430px] w-full max-w-[500px] overflow-hidden rounded-[2.5rem] border border-white/[0.065] bg-white/[0.018] shadow-[0_36px_120px_rgba(0,0,0,.42)] ${quiet ? "hero-visual-quiet" : ""}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(70,130,255,.13),transparent_52%)]" />
      <div className="absolute inset-x-12 top-1/2 h-px bg-gradient-to-r from-transparent via-blue-200/30 to-transparent" />
      <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-200/15 shadow-[0_0_60px_rgba(89,154,255,.18),inset_0_0_34px_rgba(89,154,255,.07)]" />
      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/80 shadow-[0_0_28px_rgba(147,197,253,.9)]" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id="quiet-line" x1="0" x2="1">
            <stop stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#8bbcff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {lines.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#quiet-line)" strokeWidth="0.18" opacity="0.5" />
        ))}
        {lines.flatMap(([x1, y1, x2, y2], i) => [[x1, y1, i], [x2, y2, i + 20]]).map(([x, y, i]) => (
          <circle key={`${x}-${y}-${i}`} cx={x} cy={y} r={Number(i) % 3 === 0 ? 0.7 : 0.42} fill="#dbeafe" opacity={Number(i) % 2 === 0 ? 0.55 : 0.32} />
        ))}
      </svg>

      <div className="absolute left-[18%] top-[18%] h-20 w-20 rounded-full bg-blue-400/[0.05] blur-3xl" />
      <div className="absolute bottom-[16%] right-[15%] h-24 w-24 rounded-full bg-cyan-300/[0.045] blur-3xl" />
      <div className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,.045),transparent_45%)]" />
    </div>
  );
}

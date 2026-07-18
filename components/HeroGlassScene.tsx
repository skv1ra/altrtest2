"use client";

import { useReducedMotion } from "framer-motion";
import { PointerEvent, useEffect, useRef } from "react";
import styles from "./HeroGlassScene.module.css";

type Point = [number, number];

type FragmentDef = {
  id: string;
  left: number;
  top: number;
  width: number;
  tilt: number;
  duration: number;
  depth: number; // parallax factor; larger = closer to the viewer
  opacity: number;
  points: Point[];
  litEdges: Array<{ edge: [number, number]; strength: number }>;
  facets: Array<[Point, Point]>;
  sheen: { x1: number; y1: number; x2: number; y2: number };
  hideOnMobile?: boolean;
};

/*
 * Fragments of dark damaged glass — material traces of data.
 * Triangles → decisions, quadrilaterals → moments in time,
 * five-sided shards → context. Each polygon is unique and asymmetric.
 */
const FRAGMENTS: FragmentDef[] = [
  {
    id: "fr-a",
    left: 26,
    top: 6,
    width: 46,
    tilt: -9,
    duration: 13,
    depth: 0.16,
    opacity: 0.94,
    points: [[22, 4], [88, 16], [72, 78], [40, 128], [6, 58]],
    litEdges: [
      { edge: [0, 1], strength: 0.9 },
      { edge: [4, 0], strength: 0.55 },
    ],
    facets: [
      [[22, 4], [72, 78]],
      [[72, 78], [6, 58]],
    ],
    sheen: { x1: 10, y1: 10, x2: 70, y2: 100 },
  },
  {
    id: "fr-b",
    left: 0,
    top: 0,
    width: 24,
    tilt: 14,
    duration: 10,
    depth: 0.1,
    opacity: 0.88,
    points: [[50, 0], [96, 110], [4, 88]],
    litEdges: [{ edge: [2, 0], strength: 0.7 }],
    facets: [[[50, 0], [50, 92]]],
    sheen: { x1: 30, y1: 0, x2: 60, y2: 100 },
  },
  {
    id: "fr-c",
    left: 66,
    top: 36,
    width: 30,
    tilt: -18,
    duration: 15,
    depth: 0.24,
    opacity: 0.92,
    points: [[12, 20], [78, 0], [96, 64], [50, 130], [20, 92]],
    litEdges: [
      { edge: [1, 2], strength: 0.8 },
      { edge: [0, 1], strength: 0.45 },
    ],
    facets: [[[78, 0], [20, 92]]],
    sheen: { x1: 20, y1: 0, x2: 80, y2: 110 },
  },
  {
    id: "fr-d",
    left: 6,
    top: 56,
    width: 32,
    tilt: 7,
    duration: 12,
    depth: 0.13,
    opacity: 0.9,
    points: [[16, 6], [90, 22], [56, 126], [4, 66]],
    litEdges: [{ edge: [0, 1], strength: 0.75 }],
    facets: [[[90, 22], [4, 66]]],
    sheen: { x1: 0, y1: 20, x2: 80, y2: 90 },
  },
  {
    id: "fr-e",
    left: 47,
    top: 74,
    width: 18,
    tilt: 24,
    duration: 9,
    depth: 0.28,
    opacity: 0.8,
    points: [[8, 34], [66, 0], [96, 60], [44, 128]],
    litEdges: [{ edge: [0, 1], strength: 0.6 }],
    facets: [],
    sheen: { x1: 10, y1: 10, x2: 80, y2: 100 },
    hideOnMobile: true,
  },
  {
    id: "fr-f",
    left: 80,
    top: 2,
    width: 13,
    tilt: -32,
    duration: 8,
    depth: 0.08,
    opacity: 0.72,
    points: [[30, 0], [94, 26], [70, 96], [34, 130], [4, 50]],
    litEdges: [{ edge: [4, 0], strength: 0.5 }],
    facets: [],
    sheen: { x1: 20, y1: 0, x2: 70, y2: 100 },
    hideOnMobile: true,
  },
];

const MAX_DEPTH = Math.max(...FRAGMENTS.map((f) => f.depth));

/*
 * Material model (all layers share one light source at top-left, ~300°):
 *
 *  1. body     — cold mineral base, #0A0A0A→#1A1A1A range at 60–85% alpha,
 *                brighter toward the light.
 *  2. veil     — atmospheric fade: fragments deeper in the scene pick up a
 *                trace of the milky background, receding with lower contrast.
 *  3. grain    — imperceptible fractal noise (~1.5% alpha), clipped to the
 *                polygon; reads as weathered surface, not texture.
 *  4. facets   — paired dark+light hairlines: a fracture ridge and the light
 *                it catches.
 *  5. streaks  — primary silver reflection stripe (#B8B8B8 ≈50%) with a
 *                fainter parallel echo, angled 45–60°.
 *  6. rim      — gradient edge stroke, bright toward the light source.
 *  7. counter  — faint reversed rim (#A8A8A8, ~25%) on the shadow side,
 *                implying curvature.
 *  8. lit      — strongest highlights on the one or two edges that catch
 *                the key light, with a soft bloom underneath.
 *  9. tint     — hover-only breath of the silver-blue accent (#A8BACE).
 */
function FragmentSvg({ def }: { def: FragmentDef }) {
  const pts = def.points.map((p) => p.join(",")).join(" ");
  // Depth fade: farthest fragments dissolve slightly into the background.
  const veil = Math.max(0, (MAX_DEPTH - def.depth) * 0.28);
  return (
    <svg viewBox="0 0 100 132" className={styles.fragmentSvg} role="presentation" focusable="false">
      <defs>
        <clipPath id={`${def.id}-clip`}>
          <polygon points={pts} />
        </clipPath>
        <linearGradient id={`${def.id}-body`} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="rgba(27, 29, 33, 0.68)" />
          <stop offset="0.5" stopColor="rgba(13, 14, 17, 0.78)" />
          <stop offset="1" stopColor="rgba(8, 9, 11, 0.85)" />
        </linearGradient>
        {/* Primary reflection stripe + parallel echo, following def.sheen angle. */}
        <linearGradient
          id={`${def.id}-sheen`}
          gradientUnits="userSpaceOnUse"
          x1={def.sheen.x1}
          y1={def.sheen.y1}
          x2={def.sheen.x2}
          y2={def.sheen.y2}
        >
          <stop offset="0" stopColor="rgba(196, 199, 204, 0)" />
          <stop offset="0.482" stopColor="rgba(196, 199, 204, 0)" />
          <stop offset="0.492" stopColor="rgba(202, 205, 210, 0.48)" />
          <stop offset="0.504" stopColor="rgba(202, 205, 210, 0.42)" />
          <stop offset="0.514" stopColor="rgba(196, 199, 204, 0)" />
          <stop offset="0.60" stopColor="rgba(184, 184, 184, 0)" />
          <stop offset="0.608" stopColor="rgba(184, 184, 184, 0.14)" />
          <stop offset="0.62" stopColor="rgba(184, 184, 184, 0)" />
          <stop offset="1" stopColor="rgba(168, 186, 206, 0.04)" />
        </linearGradient>
        <linearGradient id={`${def.id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(255, 255, 255, 0.95)" />
          <stop offset="0.5" stopColor="rgba(184, 184, 184, 0.55)" />
          <stop offset="1" stopColor="rgba(184, 184, 184, 0.26)" />
        </linearGradient>
        {/* Reversed rim: light wrapping the shadow side, hints at 3D form. */}
        <linearGradient id={`${def.id}-counter`} x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="rgba(168, 168, 168, 0.3)" />
          <stop offset="0.4" stopColor="rgba(168, 168, 168, 0)" />
          <stop offset="1" stopColor="rgba(168, 168, 168, 0)" />
        </linearGradient>
        <filter id={`${def.id}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
        {/* Static monochrome grain; alpha-scaled so it never reads as texture. */}
        <filter id={`${def.id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.76  0 0 0 0 0.78  0 0 0 0 0.82  0 0 0 0.05 0"
          />
        </filter>
        {def.litEdges.map(({ edge }, index) => {
          const [a, b] = edge;
          const [x1, y1] = def.points[a];
          const [x2, y2] = def.points[b];
          return (
            <linearGradient
              key={index}
              id={`${def.id}-lit-${index}`}
              gradientUnits="userSpaceOnUse"
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
            >
              <stop offset="0" stopColor="rgba(244, 246, 249, 0)" />
              <stop offset="0.5" stopColor="rgba(244, 246, 249, 1)" />
              <stop offset="1" stopColor="rgba(244, 246, 249, 0)" />
            </linearGradient>
          );
        })}
      </defs>

      <polygon points={pts} fill={`url(#${def.id}-body)`} />
      {veil > 0.005 && <polygon points={pts} fill={`rgba(248, 247, 245, ${veil.toFixed(3)})`} />}
      <rect
        className={styles.grain}
        x="0"
        y="0"
        width="100"
        height="132"
        clipPath={`url(#${def.id}-clip)`}
        filter={`url(#${def.id}-grain)`}
      />

      {def.facets.map(([from, to], index) => (
        <g key={index}>
          <line
            x1={from[0]}
            y1={from[1]}
            x2={to[0]}
            y2={to[1]}
            stroke="rgba(42, 42, 42, 0.35)"
            strokeWidth="0.5"
          />
          <line
            x1={from[0] + 0.6}
            y1={from[1] + 0.6}
            x2={to[0] + 0.6}
            y2={to[1] + 0.6}
            stroke="rgba(226, 230, 236, 0.13)"
            strokeWidth="0.45"
          />
        </g>
      ))}

      <polygon points={pts} fill={`url(#${def.id}-sheen)`} />

      <polygon
        points={pts}
        fill="none"
        stroke={`url(#${def.id}-counter)`}
        strokeWidth="0.55"
        strokeLinejoin="miter"
      />
      <polygon
        points={pts}
        fill="none"
        stroke={`url(#${def.id}-rim)`}
        strokeWidth="0.9"
        strokeLinejoin="miter"
        className={styles.rim}
        opacity="0.82"
      />

      {def.litEdges.map(({ edge, strength }, index) => {
        const [a, b] = edge;
        const [x1, y1] = def.points[a];
        const [x2, y2] = def.points[b];
        return (
          <g key={index} className={styles.lit} opacity={strength}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={`url(#${def.id}-lit-${index})`}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.3"
              filter={`url(#${def.id}-soft)`}
            />
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={`url(#${def.id}-lit-${index})`}
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          </g>
        );
      })}

      <polygon points={pts} fill="rgba(168, 186, 206, 0.07)" className={styles.tint} />
    </svg>
  );
}

export function HeroGlassScene() {
  const reducedMotion = Boolean(useReducedMotion());
  const rootRef = useRef<HTMLDivElement>(null);

  // Scroll parallax + velocity spread: fragments drift at depth-dependent
  // speeds; a fast scroll pushes them slightly apart before they settle.
  useEffect(() => {
    if (reducedMotion) return;
    const root = rootRef.current;
    if (!root) return;
    let frame = 0;
    let lastY = window.scrollY;
    let settle: number | undefined;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const velocity = Math.abs(y - lastY);
        lastY = y;
        root.style.setProperty("--sy", String(Math.min(y, 900)));
        if (velocity > 24) {
          root.style.setProperty("--spread", Math.min(1, velocity / 140).toFixed(2));
          window.clearTimeout(settle);
          settle = window.setTimeout(() => root.style.setProperty("--spread", "0"), 160);
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(settle);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  // On hover a fragment eases away from the cursor, as if disturbed.
  const push = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const target = event.currentTarget;
    const bounds = target.getBoundingClientRect();
    const dx = bounds.left + bounds.width / 2 - event.clientX;
    const dy = bounds.top + bounds.height / 2 - event.clientY;
    const length = Math.hypot(dx, dy) || 1;
    target.style.setProperty("--push-x", `${((dx / length) * 18).toFixed(1)}px`);
    target.style.setProperty("--push-y", `${((dy / length) * 18).toFixed(1)}px`);
  };

  const release = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--push-x", "0px");
    event.currentTarget.style.setProperty("--push-y", "0px");
  };

  return (
    <div ref={rootRef} className={styles.scene} aria-hidden="true">
      {FRAGMENTS.map((def) => {
        // Outward unit vector from scene centre, for the scroll-spread motion.
        const cx = def.left + def.width / 2;
        const cy = def.top + (def.width * 1.15) / 2;
        const length = Math.hypot(cx - 50, cy - 50) || 1;
        return (
          <div
            key={def.id}
            className={`${styles.fragment} ${def.hideOnMobile ? styles.desktopOnly : ""}`}
            style={
              {
                left: `${def.left}%`,
                top: `${def.top}%`,
                width: `${def.width}%`,
                opacity: def.opacity,
                "--tilt": `${def.tilt}deg`,
                "--dur": `${def.duration}s`,
                "--fdelay": `${(def.depth * -20).toFixed(1)}s`,
                "--depth": def.depth,
                "--dir-x": ((cx - 50) / length).toFixed(2),
                "--dir-y": ((cy - 50) / length).toFixed(2),
              } as React.CSSProperties
            }
            onPointerEnter={push}
            onPointerLeave={release}
          >
            <div className={styles.spread}>
              <div className={styles.push}>
                <div className={styles.turn}>
                  <div className={styles.turnBoost}>
                    <FragmentSvg def={def} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

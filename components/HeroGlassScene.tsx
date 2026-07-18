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
  depth: number;
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

function FragmentSvg({ def }: { def: FragmentDef }) {
  const pts = def.points.map((p) => p.join(",")).join(" ");
  return (
    <svg viewBox="0 0 100 132" className={styles.fragmentSvg} role="presentation" focusable="false">
      <defs>
        <linearGradient id={`${def.id}-body`} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="rgba(26, 26, 28, 0.68)" />
          <stop offset="0.5" stopColor="rgba(13, 13, 15, 0.78)" />
          <stop offset="1" stopColor="rgba(8, 8, 10, 0.85)" />
        </linearGradient>
        <linearGradient
          id={`${def.id}-sheen`}
          gradientUnits="userSpaceOnUse"
          x1={def.sheen.x1}
          y1={def.sheen.y1}
          x2={def.sheen.x2}
          y2={def.sheen.y2}
        >
          <stop offset="0" stopColor="rgba(248, 247, 245, 0)" />
          <stop offset="0.38" stopColor="rgba(248, 247, 245, 0.02)" />
          <stop offset="0.5" stopColor="rgba(248, 247, 245, 0.14)" />
          <stop offset="0.62" stopColor="rgba(184, 184, 184, 0.03)" />
          <stop offset="1" stopColor="rgba(168, 186, 206, 0.05)" />
        </linearGradient>
        <linearGradient id={`${def.id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(255, 255, 255, 0.95)" />
          <stop offset="0.5" stopColor="rgba(184, 184, 184, 0.55)" />
          <stop offset="1" stopColor="rgba(184, 184, 184, 0.26)" />
        </linearGradient>
        <filter id={`${def.id}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.1" />
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
      <polygon points={pts} fill={`url(#${def.id}-sheen)`} />

      {def.facets.map(([from, to], index) => (
        <line
          key={index}
          x1={from[0]}
          y1={from[1]}
          x2={to[0]}
          y2={to[1]}
          stroke="rgba(216, 220, 226, 0.18)"
          strokeWidth="0.5"
        />
      ))}

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
    </svg>
  );
}

export function HeroGlassScene() {
  const reducedMotion = Boolean(useReducedMotion());
  const rootRef = useRef<HTMLDivElement>(null);

  // Scroll parallax: fragments drift at depth-dependent speeds as the hero scrolls away.
  useEffect(() => {
    if (reducedMotion) return;
    const root = rootRef.current;
    if (!root) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        root.style.setProperty("--sy", String(Math.min(window.scrollY, 900)));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
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
    target.style.setProperty("--push-x", `${((dx / length) * 12).toFixed(1)}px`);
    target.style.setProperty("--push-y", `${((dy / length) * 12).toFixed(1)}px`);
  };

  const release = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--push-x", "0px");
    event.currentTarget.style.setProperty("--push-y", "0px");
  };

  return (
    <div ref={rootRef} className={styles.scene} aria-hidden="true">
      {FRAGMENTS.map((def) => (
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
            } as React.CSSProperties
          }
          onPointerEnter={push}
          onPointerLeave={release}
        >
          <div className={styles.push}>
            <div className={styles.turn}>
              <div className={styles.turnBoost}>
                <FragmentSvg def={def} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

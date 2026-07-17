"use client";

import { useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Hero3DErrorBoundary } from "./hero/Hero3DErrorBoundary";
import styles from "./hero/HeroDevices.module.css";

const Hero3DScene = dynamic(() => import("./hero/Hero3DScene"), {
  ssr: false,
  loading: () => (
    <div
      className="absolute inset-0 z-[7] grid place-items-center bg-[radial-gradient(circle,rgba(84,166,216,.12),transparent_42%)]"
      role="status"
      aria-label="Loading 3D device scene"
    >
      <span className="h-8 w-8 animate-spin rounded-full border border-sky-200/15 border-t-sky-200/70" />
    </div>
  ),
});

const stageDurations = [1450, 1100, 1350, 1450, 2500, 1050, 2600] as const;
const compactStageDurations = [800, 500, 700, 800, 1100, 700, 2800] as const;

export function HeroSequence({ lang }: { lang: "EN" | "UA" }) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (reduced) {
      setStage(4);
      return;
    }

    const compact = window.matchMedia("(max-width: 640px)").matches;
    const durations = compact ? compactStageDurations : stageDurations;
    const timer = window.setTimeout(() => {
      setStage((current) => (current + 1) % durations.length);
    }, durations[stage]);

    return () => window.clearTimeout(timer);
  }, [reduced, stage]);

  return (
    <div className={styles.heroScene} data-hero-stage={stage}>
      <div className={styles.studioFalloff} />
      <div className={styles.studioRim} />
      <div className={styles.studioFloor} />
      <div className={styles.sceneGrain} />
      <Hero3DErrorBoundary>
        <Hero3DScene lang={lang} stage={stage} reducedMotion={Boolean(reduced)} />
      </Hero3DErrorBoundary>
      <div className={styles.floorReflection} />
    </div>
  );
}

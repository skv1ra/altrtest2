"use client";

import { useReducedMotion } from "framer-motion";
import { CSSProperties, PointerEvent, useRef } from "react";
import styles from "./ReferenceHeroScene.module.css";

type HeroShard = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  depth: number;
  blur: number;
  opacity: number;
  polygon: string;
  memo?: boolean;
};

const shards: HeroShard[] = [
  { id: "top-main", x: 41, y: -4, width: 23, height: 31, rotate: 26, depth: 0.25, blur: 1.2, opacity: 0.7, polygon: "8% 2%, 92% 18%, 76% 94%, 25% 72%" },
  { id: "top-soft", x: 63, y: 4, width: 10, height: 16, rotate: 13, depth: 0.05, blur: 4.5, opacity: 0.28, polygon: "20% 0%, 100% 30%, 66% 100%, 0% 62%" },
  { id: "memo", x: 51, y: 22, width: 29, height: 50, rotate: -7, depth: 1.15, blur: 0, opacity: 0.92, polygon: "2% 44%, 78% 0%, 100% 18%, 78% 100%, 15% 78%", memo: true },
  { id: "right-top", x: 82, y: 13, width: 12, height: 25, rotate: 8, depth: 0.7, blur: 0.3, opacity: 0.82, polygon: "22% 0%, 88% 12%, 100% 100%, 8% 68%" },
  { id: "right-mid", x: 79, y: 46, width: 18, height: 27, rotate: -14, depth: 0.65, blur: 0.5, opacity: 0.76, polygon: "0% 8%, 82% 0%, 100% 76%, 30% 100%" },
  { id: "center-small", x: 43, y: 35, width: 9, height: 12, rotate: -21, depth: 0.35, blur: 1.1, opacity: 0.58, polygon: "12% 8%, 100% 0%, 70% 100%, 0% 64%" },
  { id: "center-low", x: 39, y: 61, width: 9, height: 13, rotate: 18, depth: 0.18, blur: 2.2, opacity: 0.38, polygon: "0% 18%, 78% 0%, 100% 82%, 22% 100%" },
  { id: "foreground", x: 20, y: 66, width: 47, height: 38, rotate: 7, depth: 1.38, blur: 0.2, opacity: 0.91, polygon: "0% 44%, 34% 0%, 100% 70%, 83% 100%, 17% 90%" },
  { id: "left-soft", x: -2, y: 69, width: 13, height: 22, rotate: -18, depth: 0.05, blur: 4, opacity: 0.28, polygon: "0% 0%, 100% 26%, 62% 100%, 18% 72%" },
  { id: "bottom-right", x: 75, y: 71, width: 33, height: 40, rotate: -12, depth: 1.5, blur: 3.8, opacity: 0.62, polygon: "18% 0%, 100% 32%, 72% 100%, 0% 74%" },
];

export function ReferenceHeroScene() {
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = Boolean(useReducedMotion());

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !root.current) return;
    const bounds = root.current.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    root.current.style.setProperty("--pointer-x", x.toFixed(3));
    root.current.style.setProperty("--pointer-y", y.toFixed(3));
  };

  const reset = () => {
    root.current?.style.setProperty("--pointer-x", "0");
    root.current?.style.setProperty("--pointer-y", "0");
  };

  return (
    <div ref={root} className={styles.scene} onPointerMove={move} onPointerLeave={reset} aria-hidden="true">
      <div className={styles.haze} />
      <div className={styles.particles} />
      <div className={styles.stage}>
        {shards.map((shard, index) => {
          const style = {
            "--x": `${shard.x}%`,
            "--y": `${shard.y}%`,
            "--w": `${shard.width}%`,
            "--h": `${shard.height}%`,
            "--rotate": `${shard.rotate}deg`,
            "--depth": shard.depth,
            "--blur": `${shard.blur}px`,
            "--opacity": shard.opacity,
            "--delay": `${index * -0.75}s`,
            clipPath: `polygon(${shard.polygon})`,
          } as CSSProperties;

          return (
            <div key={shard.id} className={`${styles.shard} ${shard.memo ? styles.memoShard : ""}`} style={style}>
              <span className={styles.innerGlow} />
              <span className={styles.cracks} />
              <span className={styles.edge} />
              {shard.memo && (
                <span className={styles.memoContent}>
                  <small>MAY 17, 2018</small>
                  <i />
                  <small>VOICE MEMO</small>
                  <strong>I don&apos;t want to<br />wait for anything.</strong>
                  <span className={styles.wave}><b>0:23</b><em /></span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

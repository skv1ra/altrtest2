"use client";

import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { PointerEvent, useEffect, useRef } from "react";
import styles from "./HeroGlassScene.module.css";

/*
 * Photorealistic raster shards. The PNGs in /public/hero-shards are
 * pre-rendered dark-glass textures (fractured silhouettes, facet shading,
 * internal cracks, scratches, grain, chromatic rim light) generated at
 * high resolution — no vector polygons are drawn at runtime.
 *
 * Depth model: `depth` drives scroll parallax speed; `dof` is the
 * depth-of-field blur in px (0 = in focus). One large foreground shard and
 * the far background shards are defocused, the main cluster stays sharp.
 */
type ShardDef = {
  id: string;
  src: string;
  w: number; // intrinsic px
  h: number;
  left: number; // % of scene
  top: number;
  width: number; // % of scene width
  tilt: number;
  duration: number;
  depth: number;
  dof: number;
  opacity: number;
  shadow: boolean;
  hideOnMobile?: boolean;
};

const SHARDS: ShardDef[] = [
  // main dark glass shard, centre-right, in focus, heavily cracked
  { id: "main", src: "/hero-shards/shard-main.png", w: 1100, h: 1400, left: 24, top: 4, width: 58, tilt: -4, duration: 15, depth: 0.16, dof: 0, opacity: 1, shadow: true },
  // sharp companions
  { id: "c", src: "/hero-shards/shard-c.png", w: 700, h: 980, left: 0, top: 42, width: 30, tilt: -14, duration: 12, depth: 0.12, dof: 0, opacity: 0.98, shadow: true },
  { id: "b", src: "/hero-shards/shard-b.png", w: 760, h: 900, left: 70, top: 44, width: 30, tilt: 12, duration: 13, depth: 0.22, dof: 1.2, opacity: 0.96, shadow: true },
  // large defocused foreground shard drifting past the camera
  { id: "d", src: "/hero-shards/shard-d.png", w: 560, h: 640, left: -8, top: -6, width: 38, tilt: 18, duration: 17, depth: 0.3, dof: 7, opacity: 0.88, shadow: false },
  // small soft background shards
  { id: "e", src: "/hero-shards/shard-e.png", w: 520, h: 700, left: 68, top: 0, width: 17, tilt: -22, duration: 10, depth: 0.07, dof: 2.6, opacity: 0.72, shadow: false, hideOnMobile: true },
  { id: "f", src: "/hero-shards/shard-f.png", w: 420, h: 480, left: 42, top: 80, width: 14, tilt: 28, duration: 9, depth: 0.09, dof: 2.2, opacity: 0.68, shadow: false, hideOnMobile: true },
];

export function HeroGlassScene() {
  const reducedMotion = Boolean(useReducedMotion());
  const rootRef = useRef<HTMLDivElement>(null);

  // Scroll parallax + velocity spread: shards drift at depth-dependent
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

  // On hover an in-focus shard eases away from the cursor, as if disturbed.
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
      {/* atmospheric fog + bright glow the shards hang in front of */}
      <div className={styles.fog} />

      {SHARDS.map((def) => {
        const cx = def.left + def.width / 2;
        const cy = def.top + (def.width * (def.h / def.w)) / 2;
        const length = Math.hypot(cx - 50, cy - 50) || 1;
        const focused = def.dof === 0;
        return (
          <div
            key={def.id}
            className={[
              styles.shard,
              focused ? styles.focused : styles.defocused,
              def.shadow ? styles.shadowed : "",
              def.hideOnMobile ? styles.desktopOnly : "",
            ].join(" ")}
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
                "--dof": `${def.dof}px`,
                "--dir-x": ((cx - 50) / length).toFixed(2),
                "--dir-y": ((cy - 50) / length).toFixed(2),
              } as React.CSSProperties
            }
            onPointerEnter={focused ? push : undefined}
            onPointerLeave={focused ? release : undefined}
          >
            <div className={styles.spread}>
              <div className={styles.push}>
                <div className={styles.turn}>
                  <Image
                    src={def.src}
                    alt=""
                    width={def.w}
                    height={def.h}
                    className={styles.shardImg}
                    priority={def.id === "main"}
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

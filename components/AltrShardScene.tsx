"use client";

import { useReducedMotion } from "framer-motion";
import { CSSProperties, PointerEvent, useRef, useState } from "react";

type SceneVariant = "hero" | "compact" | "artifact";

type Shard = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  depth: number;
  polygon: string;
  memory: string;
};

const shards: Shard[] = [
  { x: 4, y: 8, width: 25, height: 45, rotate: -18, depth: 0.3, polygon: "8% 4%, 88% 0%, 66% 94%, 22% 78%", memory: "Marta · proposal approved" },
  { x: 31, y: 2, width: 18, height: 36, rotate: 11, depth: 0.7, polygon: "16% 0%, 94% 21%, 60% 100%, 0% 62%", memory: "Meeting · 16:30" },
  { x: 55, y: 5, width: 34, height: 52, rotate: 17, depth: 0.15, polygon: "20% 0%, 100% 16%, 72% 96%, 4% 72%", memory: "Client: can we move the date?" },
  { x: 78, y: 48, width: 20, height: 38, rotate: -12, depth: 0.8, polygon: "3% 18%, 80% 0%, 100% 76%, 32% 100%", memory: "Decision · protect margin" },
  { x: 8, y: 55, width: 29, height: 39, rotate: 14, depth: 0.55, polygon: "0% 22%, 72% 0%, 100% 72%, 26% 100%", memory: "Voice note · 00:18" },
  { x: 39, y: 48, width: 24, height: 45, rotate: -7, depth: 0.05, polygon: "26% 0%, 100% 32%, 66% 100%, 0% 72%", memory: "ALTR · response pattern" },
  { x: 64, y: 62, width: 14, height: 28, rotate: 24, depth: 1.1, polygon: "12% 0%, 100% 16%, 62% 100%, 0% 58%", memory: "Kyiv · next week" },
  { x: 48, y: 28, width: 13, height: 20, rotate: 31, depth: 1.35, polygon: "0% 18%, 84% 0%, 100% 76%, 22% 100%", memory: "unfinished sentence…" },
];

export function AltrShardScene({
  className = "",
  variant = "hero",
  onAwaken,
}: {
  className?: string;
  variant?: SceneVariant;
  onAwaken?: () => void;
}) {
  const reducedMotion = Boolean(useReducedMotion());
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [awakened, setAwakened] = useState(false);

  const updatePointer = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !rootRef.current) return;
    const bounds = rootRef.current.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    rootRef.current.style.setProperty("--scene-x", x.toFixed(3));
    rootRef.current.style.setProperty("--scene-y", y.toFixed(3));
  };

  const settle = () => {
    rootRef.current?.style.setProperty("--scene-x", "0");
    rootRef.current?.style.setProperty("--scene-y", "0");
    setActive(null);
  };

  const focusShard = (index: number) => {
    setActive(index);
    if (!awakened) {
      setAwakened(true);
      onAwaken?.();
    }
  };

  return (
    <div
      ref={rootRef}
      className={`altr-shard-scene altr-shard-scene-${variant} ${awakened ? "is-awake" : ""} ${className}`}
      onPointerMove={updatePointer}
      onPointerLeave={settle}
      aria-label="Interactive Altr memory artifact"
    >
      <div className="altr-scene-fog" aria-hidden="true" />
      <div className="altr-scene-shadow" aria-hidden="true" />
      <div className="altr-shard-stage">
        {shards.map((shard, index) => {
          const style = {
            "--x": `${shard.x}%`,
            "--y": `${shard.y}%`,
            "--w": `${shard.width}%`,
            "--h": `${shard.height}%`,
            "--r": `${shard.rotate}deg`,
            "--depth": shard.depth,
            "--delay": `${index * -0.7}s`,
            clipPath: `polygon(${shard.polygon})`,
          } as CSSProperties;
          return (
            <button
              key={`${shard.x}-${shard.y}`}
              type="button"
              className={`altr-shard ${active === index ? "is-active" : ""}`}
              style={style}
              onPointerEnter={() => focusShard(index)}
              onFocus={() => focusShard(index)}
              onBlur={() => setActive(null)}
              aria-label={`Memory fragment: ${shard.memory}`}
            >
              <span className="altr-shard-depth" aria-hidden="true" />
              <span className="altr-shard-fracture" aria-hidden="true" />
              <span className="altr-shard-signal" aria-hidden="true" />
              <span className="altr-shard-memory">{shard.memory}</span>
            </button>
          );
        })}
      </div>
      <div className="altr-scene-caption" aria-hidden="true">
        <span />
        memory becomes structure
      </div>
    </div>
  );
}

"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useState, type PointerEvent } from "react";
import { IPhone, MacBook } from "./hero/DeviceShells";
import { MacDesktop } from "./hero/MacDesktop";
import { MessengerScene } from "./hero/MessengerScene";
import styles from "./hero/HeroDevices.module.css";

const stageDurations = [1450, 1100, 1350, 1450, 2500, 1050, 2600] as const;
const compactStageDurations = [800, 500, 700, 800, 1100, 700, 2800] as const;

export function HeroSequence({ lang }: { lang: "EN" | "UA" }) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(0);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const sceneX = useSpring(pointerX, { stiffness: 70, damping: 22, mass: 0.5 });
  const sceneY = useSpring(pointerY, { stiffness: 70, damping: 22, mass: 0.5 });

  useEffect(() => {
    if (reduced) {
      setStage(4);
      return;
    }
    const compact = window.matchMedia("(max-width: 640px)").matches;
    const duration = compact ? compactStageDurations[stage] : stageDurations[stage];
    const timer = window.setTimeout(
      () => setStage((current) => (current + 1) % stageDurations.length),
      duration,
    );
    return () => window.clearTimeout(timer);
  }, [reduced, stage]);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 8);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 5);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };
  const phoneVisible = stage === 6;
  const replied = stage >= 4;
  const typing = stage === 3;
  const showDesktop = stage <= 1;

  return (
    <div className={styles.heroScene} onPointerMove={handlePointerMove} onPointerLeave={resetPointer}>
      <div className={styles.studioFalloff} />
      <div className={styles.studioRim} />
      <div className={styles.studioFloor} />
      <div className={styles.sceneGrain} />

      <AnimatePresence mode="sync" initial={false}>
        {!phoneVisible ? (
          <motion.div
            key="macbook"
            initial={{ opacity: 0, y: 42, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 88, scale: 0.965 }}
            transition={{ duration: 0.76, ease: [0.22, 1, 0.36, 1] }}
            className={styles.macSceneWrap}
            style={{ x: sceneX, y: sceneY }}
          >
            <MacBook lid={stage === 0 ? "opening" : stage === 5 ? "closing" : "open"}>
              <AnimatePresence mode="wait" initial={false}>
                {showDesktop ? (
                  <motion.div
                    key="desktop"
                    className={styles.screenContent}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.018 }}
                    transition={{ duration: 0.42 }}
                  >
                    <MacDesktop />
                  </motion.div>
                ) : (
                  <motion.div
                    key="messenger"
                    className={styles.screenContent}
                    initial={{ opacity: 0, scale: 0.975 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <MessengerScene lang={lang} replied={replied} typing={typing} />
                  </motion.div>
                )}
              </AnimatePresence>
            </MacBook>
          </motion.div>
        ) : (
          <motion.div
            key="iphone"
            initial={{ opacity: 0, y: 126, rotateY: -16, rotateZ: 3.5, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, rotateY: -7, rotateZ: 1.4, scale: 1 }}
            exit={{ opacity: 0, y: 112, rotateY: 4, rotateZ: -2, scale: 0.96 }}
            transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
            className={styles.phoneSceneWrap}
            style={{ x: sceneX, y: sceneY, transformPerspective: 1500 }}
          >
            <IPhone>
              <MessengerScene lang={lang} replied typing={false} compact />
            </IPhone>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={styles.floorReflection}
        animate={{ opacity: phoneVisible ? 0.26 : 0.42, scaleX: phoneVisible ? 0.36 : 1 }}
        transition={{ duration: 0.65 }}
      />
    </div>
  );
}

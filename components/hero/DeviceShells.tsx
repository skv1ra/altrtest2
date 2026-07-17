"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { MacBookKeyboard } from "./MacBookKeyboard";
import styles from "./HeroDevices.module.css";

type MacBookProps = { children: ReactNode; lid: "opening" | "open" | "closing" };

export function MacBook({ children, lid }: MacBookProps) {
  const closing = lid === "closing";
  const opening = lid === "opening";

  return (
    <div className={styles.macRig}>
      <motion.div
        className={styles.macGroundShadow}
        animate={{ opacity: closing ? 0.8 : 0.52, scaleX: closing ? 0.78 : 1 }}
        transition={{ duration: 0.85 }}
      />
      <div className={styles.macStage}>
        <motion.div
          initial={opening ? { rotateX: -86, y: 38 } : false}
          animate={{ rotateX: closing ? -84 : -1.8, y: closing ? 34 : 0 }}
          transition={{
            duration: closing ? 1.05 : 1.35,
            ease: closing ? [0.55, 0.06, 0.68, 0.19] : [0.16, 1, 0.3, 1],
          }}
          className={styles.displayAssembly}
          style={{ transformOrigin: "50% 100%", transformStyle: "preserve-3d" }}
        >
          <div className={styles.displayBack} />
          <div className={styles.displayOuter}>
            <div className={styles.displayChamfer}>
              <div className={styles.displayBezel}>
                <div className={styles.notch}>
                  <i className={styles.cameraLens} />
                  <i className={styles.cameraSensor} />
                </div>
                <motion.div
                  className={styles.screenGlass}
                  animate={{ filter: closing ? "brightness(.07) saturate(.5)" : "brightness(1) saturate(1)" }}
                  transition={{ duration: closing ? 0.34 : 0.5 }}
                >
                  {children}
                </motion.div>
                <motion.div
                  className={styles.sleepLayer}
                  animate={{ opacity: closing ? 0.82 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                <div className={styles.glassReflection} />
                <div className={styles.glassEdgeShade} />
              </div>
            </div>
          </div>
          <div className={styles.lidBottomEdge} />
        </motion.div>

        <div className={styles.hingeAssembly}>
          <i />
          <span />
          <i />
        </div>

        <div className={styles.baseAssembly}>
          <div className={styles.leftPorts}>
            <i />
            <i />
          </div>
          <div className={styles.rightPorts}>
            <i />
            <i />
          </div>
          <div className={styles.deckSurface}>
            <div className={`${styles.speaker} ${styles.speakerLeft}`} />
            <div className={`${styles.speaker} ${styles.speakerRight}`} />
            <MacBookKeyboard />
            <div className={styles.trackpad}>
              <i />
            </div>
            <div className={styles.deckReflection} />
          </div>
          <div className={styles.frontWall}>
            <span />
          </div>
          <div className={styles.baseUnderside} />
        </div>
      </div>
    </div>
  );
}

export function IPhone({ children }: { children: ReactNode }) {
  return (
    <div className={styles.phoneRig}>
      <div className={styles.phoneGroundShadow} />
      <div className={styles.phoneBody}>
        <div className={styles.phoneBackPlate} />
        <div className={styles.phoneRail}>
          <span className={`${styles.antenna} ${styles.antennaOne}`} />
          <span className={`${styles.antenna} ${styles.antennaTwo}`} />
          <span className={styles.muteButton} />
          <span className={styles.volumeUp} />
          <span className={styles.volumeDown} />
          <span className={styles.sideButton} />
          <div className={styles.phoneChamfer}>
            <div className={styles.phoneGlass}>
              <div className={styles.dynamicIsland}>
                <i />
                <span />
              </div>
              <div className={styles.phoneScreen}>{children}</div>
              <div className={styles.phoneGlare} />
              <div className={styles.phoneEdgeShade} />
              <div className={styles.homeIndicator} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

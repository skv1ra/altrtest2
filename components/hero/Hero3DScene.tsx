"use client";

import { ContactShadows, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { MacDesktop } from "./MacDesktop";
import { MessengerScene } from "./MessengerScene";
import type { Lang } from "./scene-data";
import styles from "./Hero3D.module.css";

const MACBOOK_MODEL = "/api/hero-model/macbook";
const IPHONE_MODEL = "/api/hero-model/iphone";
const DRACO_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.7/";

type Hero3DSceneProps = {
  lang: Lang;
  stage: number;
  reducedMotion: boolean;
};

type PreparedModel = {
  object: THREE.Group;
  scale: number;
};

function prepareModel(scene: THREE.Group, targetSize: number): PreparedModel {
  const object = scene.clone(true);

  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = true;
    child.receiveShadow = true;

    if (Array.isArray(child.material)) {
      child.material = child.material.map((material) => material.clone());
    } else if (child.material) {
      child.material = child.material.clone();
    }
  });

  const bounds = new THREE.Box3().setFromObject(object);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z) || 1;

  object.position.sub(center);
  return { object, scale: targetSize / maxDimension };
}

function damp(current: number, target: number, delta: number, speed = 5) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-speed * delta));
}

function MacBookModel({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MACBOOK_MODEL, DRACO_PATH);
  const prepared = useMemo(() => prepareModel(scene, 6.25), [scene]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const visible = active || reducedMotion;
    const pointerX = reducedMotion ? 0 : state.pointer.x;
    const pointerY = reducedMotion ? 0 : state.pointer.y;

    group.current.position.x = damp(group.current.position.x, pointerX * 0.12, delta, 4);
    group.current.position.y = damp(group.current.position.y, visible ? -0.42 + pointerY * 0.05 : -3.2, delta, 4.4);
    group.current.position.z = damp(group.current.position.z, visible ? 0 : -1.1, delta, 4.4);
    group.current.rotation.x = damp(group.current.rotation.x, 0.035 - pointerY * 0.025, delta, 4);
    group.current.rotation.y = damp(group.current.rotation.y, -0.44 + pointerX * 0.055, delta, 4);
    group.current.rotation.z = damp(group.current.rotation.z, -0.012, delta, 4);

    const targetScale = visible ? prepared.scale : prepared.scale * 0.86;
    const nextScale = damp(group.current.scale.x, targetScale, delta, 4.4);
    group.current.scale.setScalar(nextScale);
  });

  return (
    <group
      ref={group}
      position={[0, -0.42, 0]}
      rotation={[0.035, -0.44, -0.012]}
      scale={prepared.scale}
    >
      <primitive object={prepared.object} />
    </group>
  );
}

function IPhoneModel({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(IPHONE_MODEL, DRACO_PATH);
  const prepared = useMemo(() => prepareModel(scene, 3.65), [scene]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const pointerX = reducedMotion ? 0 : state.pointer.x;
    const pointerY = reducedMotion ? 0 : state.pointer.y;

    group.current.position.x = damp(group.current.position.x, active ? 0.36 + pointerX * 0.1 : 0.36, delta, 4.8);
    group.current.position.y = damp(group.current.position.y, active ? 0.02 + pointerY * 0.05 : -3.4, delta, 4.8);
    group.current.position.z = damp(group.current.position.z, active ? 0.35 : -1.2, delta, 4.8);
    group.current.rotation.x = damp(group.current.rotation.x, 0.08 - pointerY * 0.025, delta, 4.2);
    group.current.rotation.y = damp(group.current.rotation.y, -0.42 + pointerX * 0.07, delta, 4.2);
    group.current.rotation.z = damp(group.current.rotation.z, 0.055, delta, 4.2);

    const targetScale = active ? prepared.scale : prepared.scale * 0.82;
    const nextScale = damp(group.current.scale.x, targetScale, delta, 4.8);
    group.current.scale.setScalar(nextScale);
  });

  return (
    <group
      ref={group}
      position={[0.36, -3.4, -1.2]}
      rotation={[0.08, -0.42, 0.055]}
      scale={prepared.scale * 0.82}
    >
      <primitive object={prepared.object} />
    </group>
  );
}

function CameraRig({ phoneVisible, reducedMotion }: { phoneVisible: boolean; reducedMotion: boolean }) {
  const { camera, pointer } = useThree();

  useFrame((_, delta) => {
    const pointerX = reducedMotion ? 0 : pointer.x;
    const pointerY = reducedMotion ? 0 : pointer.y;
    camera.position.x = damp(camera.position.x, phoneVisible ? 0.2 + pointerX * 0.08 : pointerX * 0.12, delta, 3.8);
    camera.position.y = damp(camera.position.y, phoneVisible ? 0.3 + pointerY * 0.04 : 0.48 + pointerY * 0.05, delta, 3.8);
    camera.position.z = damp(camera.position.z, phoneVisible ? 7.1 : 7.7, delta, 3.8);
    camera.lookAt(phoneVisible ? 0.25 : 0, phoneVisible ? 0.08 : -0.12, 0);
  });

  return null;
}

function LoadingObject() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.35;
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <boxGeometry args={[2.8, 1.7, 0.12]} />
      <meshStandardMaterial color="#18242d" metalness={0.62} roughness={0.28} />
    </mesh>
  );
}

function StudioScene({ phoneVisible, reducedMotion }: { phoneVisible: boolean; reducedMotion: boolean }) {
  return (
    <>
      <CameraRig phoneVisible={phoneVisible} reducedMotion={reducedMotion} />
      <fog attach="fog" args={["#030507", 7.8, 13.8]} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[4.5, 6.5, 5.5]} intensity={3.1} color="#d9efff" castShadow />
      <directionalLight position={[-5, 2.5, -3]} intensity={1.45} color="#6da9cf" />
      <spotLight position={[0, 6, -2]} angle={0.55} penumbra={0.85} intensity={2.2} color="#f2f8ff" />
      <pointLight position={[0, 1.2, 3.1]} intensity={1.25} distance={8} color="#65bfff" />

      <Suspense fallback={<LoadingObject />}>
        <MacBookModel active={!phoneVisible} reducedMotion={reducedMotion} />
        <IPhoneModel active={phoneVisible} reducedMotion={reducedMotion} />
        <ContactShadows
          position={[0, -2.08, 0]}
          opacity={0.58}
          scale={9}
          blur={2.8}
          far={5}
          resolution={512}
        />
      </Suspense>
    </>
  );
}

function ScreenOverlay({ lang, stage, phoneVisible }: { lang: Lang; stage: number; phoneVisible: boolean }) {
  const replied = stage >= 4;
  const typing = stage === 3;
  const showDesktop = stage <= 1;

  return (
    <AnimatePresence mode="sync" initial={false}>
      {!phoneVisible ? (
        <motion.div
          key="mac-screen"
          className={styles.macScreenOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: stage === 0 ? 0.16 : 0.96 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.52 }}
        >
          <div className={styles.macScreenInner}>
            {showDesktop ? <MacDesktop /> : <MessengerScene lang={lang} replied={replied} typing={typing} />}
          </div>
          <div className={styles.screenGlass} />
        </motion.div>
      ) : (
        <motion.div
          key="phone-screen"
          className={styles.phoneScreenOverlay}
          initial={{ opacity: 0, y: 46, scale: 0.92 }}
          animate={{ opacity: 0.98, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 38, scale: 0.94 }}
          transition={{ duration: 0.64, ease: [0.22, 1, 0.36, 1] }}
        >
          <MessengerScene lang={lang} replied typing={false} compact />
          <div className={styles.phoneGlass} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Hero3DScene({ lang, stage, reducedMotion }: Hero3DSceneProps) {
  const phoneVisible = !reducedMotion && stage === 6;

  return (
    <div className={styles.sceneRoot} data-real-3d-hero="true">
      <Canvas
        className={styles.canvas}
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.48, 7.7], fov: 34, near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.12;
          gl.setClearColor(0x000000, 0);
        }}
      >
        <StudioScene phoneVisible={phoneVisible} reducedMotion={reducedMotion} />
      </Canvas>

      <ScreenOverlay lang={lang} stage={stage} phoneVisible={phoneVisible} />

      <div className={styles.modelBadge} aria-hidden="true">
        <span /> REAL GLTF · WEBGL
      </div>
    </div>
  );
}

useGLTF.preload(MACBOOK_MODEL, DRACO_PATH);
useGLTF.preload(IPHONE_MODEL, DRACO_PATH);

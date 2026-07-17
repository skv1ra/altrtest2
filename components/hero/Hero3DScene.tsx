'use client';

import { Bounds, Center, ContactShadows, useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { MessengerScene } from './MessengerScene';
import type { Lang } from './scene-data';
import styles from './Hero3D.module.css';

const MACBOOK = '/api/hero-model/macbook';
const IPHONE = '/api/hero-model/iphone';
const DRACO = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

type Props = { lang: Lang; phase: number; reducedMotion: boolean };

type ModelProps = {
  url: string;
  visible: boolean;
  closing?: boolean;
  rotation: [number, number, number];
};

function Model({ url, visible, closing = false, rotation }: ModelProps) {
  const root = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url, DRACO);
  const prepared = useMemo(() => {
    const object = scene.clone(true);
    const lidNodes: THREE.Object3D[] = [];
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
      if (/lid|screen|display/i.test(child.name)) lidNodes.push(child);
    });
    return { object, lidNodes };
  }, [scene]);

  useFrame((state, delta) => {
    if (!root.current) return;
    const opacityTarget = visible ? 1 : 0;
    root.current.scale.x = THREE.MathUtils.damp(root.current.scale.x, opacityTarget, 4, delta);
    root.current.scale.y = THREE.MathUtils.damp(root.current.scale.y, opacityTarget, 4, delta);
    root.current.scale.z = THREE.MathUtils.damp(root.current.scale.z, opacityTarget, 4, delta);
    root.current.position.y = THREE.MathUtils.damp(root.current.position.y, visible ? 0 : -4, 4, delta);
    root.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.45) * 0.035;
    root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, closing ? 0.72 : rotation[0], 3, delta);
    prepared.lidNodes.forEach((node) => {
      node.rotation.x = THREE.MathUtils.damp(node.rotation.x, closing ? -1.18 : 0, 3.2, delta);
    });
  });

  return (
    <group ref={root} rotation={rotation} scale={visible ? 1 : 0.001}>
      <Center top>
        <primitive object={prepared.object} />
      </Center>
    </group>
  );
}

function Stage({ phase }: { phase: number }) {
  const phone = phase === 1;
  const closing = phase === 3;
  return (
    <>
      <ambientLight intensity={1.7} />
      <directionalLight position={[5, 7, 6]} intensity={5} color='#ffffff' castShadow />
      <directionalLight position={[-5, 3, 3]} intensity={2.6} color='#79c9ff' />
      <pointLight position={[0, 1, 5]} intensity={2.4} color='#77d0ff' />
      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.18}>
          <Model url={MACBOOK} visible={!phone} closing={closing} rotation={[0.02, -0.18, 0]} />
          <Model url={IPHONE} visible={phone} rotation={[0.02, -0.12, 0.02]} />
        </Bounds>
        <ContactShadows position={[0, -2.4, 0]} opacity={0.72} scale={12} blur={2.8} far={7} />
      </Suspense>
    </>
  );
}

function ChatOverlay({ lang, phase }: { lang: Lang; phase: number }) {
  const phone = phase === 1;
  const closing = phase === 3;
  if (closing) return null;
  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={phone ? 'phone' : 'mac'}
        className={phone ? styles.phoneScreenOverlay : styles.macScreenOverlay}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -12 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <MessengerScene lang={lang} replied typing={false} compact={phone} />
        <div className={phone ? styles.phoneGlass : styles.screenGlass} />
      </motion.div>
    </AnimatePresence>
  );
}

export default function Hero3DScene({ lang, phase }: Props) {
  return (
    <div className={styles.sceneRoot} data-real-3d-hero='true'>
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 0.5, 8], fov: 34, near: 0.1, far: 100 }} gl={{ antialias: true, alpha: true }}>
        <Stage phase={phase} />
      </Canvas>
      <ChatOverlay lang={lang} phase={phase} />
    </div>
  );
}

useGLTF.preload(MACBOOK, DRACO);
useGLTF.preload(IPHONE, DRACO);

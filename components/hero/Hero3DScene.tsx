'use client';

import { ContactShadows, useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Lang } from './scene-data';
import styles from './Hero3D.module.css';

const MACBOOK_MODEL = '/api/hero-model/macbook';
const IPHONE_MODEL = '/api/hero-model/iphone';
const DRACO_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

type Props = { lang: Lang; stage: number; reducedMotion: boolean };
type DeviceProps = { url: string; active: boolean; size: number; position: [number, number, number]; rotation: [number, number, number]; reducedMotion: boolean };

function Device({ url, active, size, position, rotation, reducedMotion }: DeviceProps) {
  const ref = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url, DRACO_PATH);
  const prepared = useMemo(() => {
    const object = scene.clone(true);
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const dimensions = box.getSize(new THREE.Vector3());
    object.position.sub(center);
    const max = Math.max(dimensions.x, dimensions.y, dimensions.z) || 1;
    return { object, scale: size / max };
  }, [scene, size]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const targetY = active ? position[1] : -5;
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, targetY, 4, delta);
    ref.current.position.x = THREE.MathUtils.damp(ref.current.position.x, position[0], 4, delta);
    ref.current.position.z = THREE.MathUtils.damp(ref.current.position.z, position[2], 4, delta);
    const idle = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.55) * 0.08;
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, rotation[1] + idle, 3, delta);
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, rotation[0], 3, delta);
    ref.current.rotation.z = THREE.MathUtils.damp(ref.current.rotation.z, rotation[2], 3, delta);
  });

  return <group ref={ref} position={position} rotation={rotation} scale={prepared.scale}><primitive object={prepared.object} /></group>;
}

function Scene({ phone, reducedMotion }: { phone: boolean; reducedMotion: boolean }) {
  return <>
    <ambientLight intensity={1.3} />
    <directionalLight position={[5, 7, 6]} intensity={4.5} color='#ffffff' castShadow />
    <directionalLight position={[-5, 3, 2]} intensity={2.2} color='#7fc8ff' />
    <pointLight position={[0, 2, 4]} intensity={2.4} color='#6ecbff' />
    <Suspense fallback={null}>
      <Device url={MACBOOK_MODEL} active={!phone} size={6.2} position={[0, -0.35, 0]} rotation={[0.08, -0.45, 0]} reducedMotion={reducedMotion} />
      <Device url={IPHONE_MODEL} active={phone} size={3.8} position={[0, 0, 0.4]} rotation={[0.05, -0.35, 0.04]} reducedMotion={reducedMotion} />
      <ContactShadows position={[0, -2.2, 0]} opacity={0.7} scale={10} blur={2.6} far={6} />
    </Suspense>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.22, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color='#05080b' roughness={0.95} />
    </mesh>
  </>;
}

export default function Hero3DScene({ stage, reducedMotion }: Props) {
  const phone = !reducedMotion && stage >= 6;
  return <div className={styles.sceneRoot} data-real-3d-hero='true'>
    <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 0.6, 8.2], fov: 35, near: 0.1, far: 50 }} gl={{ antialias: true, alpha: true }} onCreated={({ gl }) => { gl.outputColorSpace = THREE.SRGBColorSpace; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.25; gl.setClearColor(0x000000, 0); }}>
      <Scene phone={phone} reducedMotion={reducedMotion} />
    </Canvas>
    <div className={styles.modelBadge}><span /> REAL GLTF · WEBGL</div>
  </div>;
}

useGLTF.preload(MACBOOK_MODEL, DRACO_PATH);
useGLTF.preload(IPHONE_MODEL, DRACO_PATH);

'use client';

import { useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Hero3DErrorBoundary } from './hero/Hero3DErrorBoundary';
import styles from './hero/HeroDevices.module.css';

const Hero3DScene = dynamic(() => import('./hero/Hero3DScene'), {
  ssr: false,
  loading: () => <div className='absolute inset-0 grid place-items-center'><span className='h-8 w-8 animate-spin rounded-full border border-sky-200/20 border-t-sky-200/80' /></div>,
});

const durations = [5200, 2800, 3200, 1800] as const;

export function HeroSequence({ lang }: { lang: 'EN' | 'UA' }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reduced) {
      setPhase(0);
      return;
    }
    const timer = window.setTimeout(() => setPhase((value) => (value + 1) % durations.length), durations[phase]);
    return () => window.clearTimeout(timer);
  }, [phase, reduced]);

  return (
    <div className={styles.heroScene} data-hero-phase={phase}>
      <div className={styles.studioFalloff} />
      <div className={styles.studioRim} />
      <Hero3DErrorBoundary>
        <Hero3DScene lang={lang} phase={phase} reducedMotion={Boolean(reduced)} />
      </Hero3DErrorBoundary>
    </div>
  );
}

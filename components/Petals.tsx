'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { PETAL_COLORS } from '../lib/config';
import { cssVars } from '../lib/cssVars';

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function Petal({ color, size, style }: { color: string; size: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 20 28" fill={color} style={style} aria-hidden>
      <path d="M10 0C16 7 20 14 10 28C0 14 4 7 10 0Z" />
    </svg>
  );
}

interface FloatingPetalData {
  id: number;
  left: string;
  color: string;
  size: number;
  opacity: number;
  duration: string;
  delay: string;
  sway: string;
}

/** Slow ambient petals behind the content. Generated after mount to avoid hydration mismatch. */
export function FloatingPetals() {
  const [petals, setPetals] = useState<FloatingPetalData[]>([]);

  useEffect(() => {
    setPetals(
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: `${rand(0, 100)}%`,
        color: PETAL_COLORS[i % PETAL_COLORS.length],
        size: rand(10, 20),
        opacity: rand(0.25, 0.55),
        duration: `${rand(12, 22)}s`,
        delay: `-${rand(0, 20)}s`, // negative: screen is already populated on load
        sway: `${rand(3, 6)}s`,
      }))
    );
  }, []);

  return (
    <div aria-hidden className="zy-layer">
      {petals.map((p) => (
        <span
          key={p.id}
          className="zy-petal"
          style={{
            ...cssVars({ '--zy-o': p.opacity }),
            left: p.left,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        >
          <Petal color={p.color} size={p.size} style={{ animationDuration: p.sway }} />
        </span>
      ))}
    </div>
  );
}

interface FallingPetalData {
  id: number;
  left: string;
  color: string;
  size: number;
  duration: string;
  delay: string;
}

/** One-off shower of petals for the "yes" moment. */
export function PetalBurst() {
  // Lazy initializer: values are generated once, not on every re-render.
  const [items] = useState<FallingPetalData[]>(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: `${rand(0, 100)}%`,
      color: PETAL_COLORS[i % PETAL_COLORS.length],
      size: rand(12, 22),
      duration: `${rand(1.6, 3)}s`,
      delay: `${rand(0, 0.6)}s`,
    }))
  );

  return (
    <div aria-hidden className="zy-layer" style={{ zIndex: 50 }}>
      {items.map((p) => (
        <span
          key={p.id}
          className="zy-fall"
          style={{ left: p.left, animationDuration: p.duration, animationDelay: p.delay }}
        >
          <Petal color={p.color} size={p.size} />
        </span>
      ))}
    </div>
  );
}
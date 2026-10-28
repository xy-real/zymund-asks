'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { createPortal } from 'react-dom';

const PAD = 20;
const THROTTLE_MS = 350;

interface Props {
  label: string;
  avoidRef: RefObject<HTMLElement | null>;
  onDodge: () => void;
}

export function DodgeButton({ label, avoidRef, onDodge }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const lastDodge = useRef(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [spacer, setSpacer] = useState<{ w: number; h: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dodge = useCallback(() => {
    const now = Date.now();
    if (now - lastDodge.current < THROTTLE_MS) return;
    lastDodge.current = now;

    const btn = ref.current;
    if (!btn) return;

    const { width, height } = btn.getBoundingClientRect();
    setSpacer((s) => s ?? { w: width, h: height });

    // 1. Calculate maximum possible coordinates so the bottom-right edge stays on screen
    const maxLeft = Math.max(0, window.innerWidth - width - PAD);
    const maxTop = Math.max(0, window.innerHeight - height - PAD);
    
    // 2. Determine minimum coordinates. If the screen is too small, sacrifice the padding.
    const minLeft = Math.min(PAD, maxLeft);
    const minTop = Math.min(PAD, maxTop);

    const avoid = avoidRef.current?.getBoundingClientRect();

    let x = minLeft;
    let y = minTop;
    
    for (let i = 0; i < 15; i++) {
      // 3. Randomize within the safe min/max boundaries
      x = minLeft + Math.random() * (maxLeft - minLeft);
      y = minTop + Math.random() * (maxTop - minTop);
      
      if (!avoid) break;
      const overlaps =
        x < avoid.right + 24 &&
        x + width > avoid.left - 24 &&
        y < avoid.bottom + 24 &&
        y + height > avoid.top - 24;
      if (!overlaps) break;
    }

    setPos({ x, y });
    onDodge();
  }, [avoidRef, onDodge]);

  const flying = pos !== null;
  useEffect(() => {
    if (!flying) return;
    const keepInView = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      
      // Re-apply the same safe boundary logic when the screen resizes/rotates
      const maxLeft = Math.max(0, window.innerWidth - r.width - PAD);
      const minLeft = Math.min(PAD, maxLeft);
      const maxTop = Math.max(0, window.innerHeight - r.height - PAD);
      const minTop = Math.min(PAD, maxTop);

      setPos((p) => {
        if (!p) return p;
        // Clamp the current position tightly within the new boundaries
        const x = Math.max(minLeft, Math.min(p.x, maxLeft));
        const y = Math.max(minTop, Math.min(p.y, maxTop));
        return x === p.x && y === p.y ? p : { x, y };
      });
    };
    
    keepInView();
    window.addEventListener('resize', keepInView);
    return () => window.removeEventListener('resize', keepInView);
  }, [flying, label, pos?.x, pos?.y]);

  const button = (
    <button
      ref={ref}
      id="no-button"
      type="button"
      className={flying ? 'zy-no zy-no--flying' : 'zy-no'}
      style={pos ? { left: pos.x, top: pos.y } : undefined}
      onPointerEnter={dodge}
      onPointerDown={(e) => {
        e.preventDefault();
        dodge();
      }}
      onClick={dodge}
    >
      {label}
    </button>
  );

  if (!pos || !spacer) return button;

  return (
    <>
      <span aria-hidden style={{ display: 'block', width: spacer.w, height: spacer.h }} />
      {mounted && createPortal(button, document.body)}
    </>
  );
}
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';

// ─── Config ──────────────────────────────────────────────────────────────────
const CONFIG = {
  senderName: 'Zymund',
  // Optional. Leave '' to hide the "tell him" button on the success screen.
  // Examples: 'sms:+639XXXXXXXXX?&body=Yes%20💗'  |  'https://m.me/your.username'
  replyUrl: 'https://web.facebook.com/justxynn#',
};

const TAUNTS = [
  'No',
  'Are you sure?',
  'Think again…',
  'That can’t be right',
  'Please reconsider',
  'Last chance…',
  'Okay, one more look?',
  'Pretty please?',
];

const PETAL_COLORS = ['#f4a0b5', '#ff7aa2', '#ffd9e2', '#c75b8a'];

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties;

// ─── Hooks ───────────────────────────────────────────────────────────────────
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// ─── Decorative layers ───────────────────────────────────────────────────────
function Petal({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 20 28" fill={color} aria-hidden>
      <path d="M10 0C16 7 20 14 10 28C0 14 4 7 10 0Z" />
    </svg>
  );
}

function FloatingPetals() {
  const [petals, setPetals] = useState<
    { id: number; left: string; color: string; size: number; o: number; dur: string; delay: string; sway: string }[]
  >([]);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return setPetals([]);
    setPetals(
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: `${rand(0, 100)}%`,
        color: PETAL_COLORS[i % PETAL_COLORS.length],
        size: rand(10, 20),
        o: rand(0.25, 0.55),
        dur: `${rand(12, 22)}s`,
        delay: `-${rand(0, 20)}s`, // negative: the screen is already populated on load
        sway: `${rand(3, 6)}s`,
      }))
    );
  }, [reduced]);

  return (
    <div aria-hidden className="zy-layer">
      {petals.map((p) => (
        <span
          key={p.id}
          className="zy-petal"
          style={{
            ...cssVars({ '--zy-o': p.o }),
            left: p.left,
            animationDuration: p.dur,
            animationDelay: p.delay,
          }}
        >
          <svg style={{ animationDuration: p.sway }} width={p.size} height={p.size * 1.4} viewBox="0 0 20 28" fill={p.color}>
            <path d="M10 0C16 7 20 14 10 28C0 14 4 7 10 0Z" />
          </svg>
        </span>
      ))}
    </div>
  );
}

function PetalBurst() {
  // Lazy initializer: generated once, not on every re-render.
  const [items] = useState(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: `${rand(0, 100)}%`,
      delay: `${rand(0, 0.6)}s`,
      duration: `${rand(1.6, 3)}s`,
      size: rand(12, 22),
      color: PETAL_COLORS[i % PETAL_COLORS.length],
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

function Stage({ children }: { children: ReactNode }) {
  return (
    <main className="zy-stage">
      <FloatingPetals />
      <div className="zy-content">{children}</div>
    </main>
  );
}

function DrawnHeart() {
  return (
    <svg className="zy-heart" viewBox="0 0 100 90" aria-hidden>
      <path
        pathLength={1}
        d="M50 84C14 56 6 38 6 25C6 13 15 5 26 5C35 5 44 10 50 19C56 10 65 5 74 5C85 5 94 13 94 25C94 38 86 56 50 84Z"
      />
    </svg>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ZymundAsks() {
  const [sheSaidYes, setSheSaidYes] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [noCount, setNoCount] = useState(0);
  const [noPosition, setNoPosition] = useState<{ x: number; y: number } | null>(null);
  const [noSize, setNoSize] = useState<{ w: number; h: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  const noRef = useRef<HTMLButtonElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const lastDodge = useRef(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => setMounted(true), []);

  const dodge = useCallback(() => {
    // touch fires pointerenter + pointerdown + click almost together;
    // without this guard a single tap counts as 2–3 "tries".
    const now = Date.now();
    if (now - lastDodge.current < 350) return;
    lastDodge.current = now;

    const btn = noRef.current;
    if (!btn) return;

    const { width, height } = btn.getBoundingClientRect();
    setNoSize((s) => s ?? { w: width, h: height });

    const pad = 20;
    const maxX = window.innerWidth - width - pad;
    const maxY = window.innerHeight - height - pad;
    const yes = yesRef.current?.getBoundingClientRect();

    // Stay on screen and never land on top of the Yes button.
    let x = pad;
    let y = pad;
    for (let i = 0; i < 15; i++) {
      x = pad + Math.random() * Math.max(maxX - pad, 0);
      y = pad + Math.random() * Math.max(maxY - pad, 0);
      if (!yes) break;
      const overlapsYes =
        x < yes.right + 24 && x + width > yes.left - 24 && y < yes.bottom + 24 && y + height > yes.top - 24;
      if (!overlapsYes) break;
    }

    setNoPosition({ x, y });
    setNoCount((c) => c + 1);
  }, []);

  const handleYes = () => {
    setSheSaidYes(true);
    if (!reduced) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 3500);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (sheSaidYes) {
    return (
      <Stage>
        {showBurst && <PetalBurst />}

        <DrawnHeart />

        <h1 className="zy-yes-title zy-late">Yes.</h1>

        <p className="zy-sub zy-late" style={{ animationDelay: '1.7s' }}>
          {CONFIG.senderName} is going to be so happy.
        </p>

        {CONFIG.replyUrl && (
          <a href={CONFIG.replyUrl} className="zy-reply zy-late" style={{ animationDelay: '2s' }}>
            Tell {CONFIG.senderName} 💌
          </a>
        )}
      </Stage>
    );
  }

  // ── Question screen ────────────────────────────────────────────────────────
  const isDodging = noPosition !== null;
  const yesScale = 1 + Math.min(noCount, 8) * 0.05;

  const subline =
    noCount === 0
      ? 'Take your time. (But please say yes.)'
      : noCount < 4
        ? 'The No button seems a little shy…'
        : noCount < 8
          ? `That’s ${noCount} tries. The Yes button is looking pretty good, right?`
          : `No pressure. You can always just tell ${CONFIG.senderName} how you feel.`;

  const noButton = (
    <button
      ref={noRef}
      id="no-button"
      type="button"
      onPointerEnter={dodge}
      onPointerDown={(e) => {
        e.preventDefault();
        dodge();
      }}
      onClick={dodge}
      className="zy-no"
      style={
        isDodging
          ? {
              position: 'fixed',
              left: noPosition.x,
              top: noPosition.y,
              zIndex: 100,
              transition: reduced ? 'none' : 'left 0.25s ease-out, top 0.25s ease-out',
            }
          : undefined
      }
    >
      {TAUNTS[Math.min(noCount, TAUNTS.length - 1)]}
    </button>
  );

  return (
    <Stage>
      <h1 className="zy-title" aria-label="Will you officially be my girlfriend?">
        {['Will you', 'officially be', 'my girlfriend?'].map((line, i) => (
          <span className="zy-line" key={line}>
            <span style={cssVars({ '--i': i })}>{line}</span>
          </span>
        ))}
      </h1>

      <p aria-live="polite" className="zy-sub zy-in">
        {subline}
      </p>

      <div className="zy-actions zy-in">
        <button
          ref={yesRef}
          id="yes-button"
          type="button"
          onClick={handleYes}
          className="zy-yes"
          style={{ transform: reduced ? undefined : `scale(${yesScale})` }}
        >
          Yes 💗
        </button>

        {/*
          Once it starts dodging, the No button renders through a portal.
          An ancestor with backdrop-filter/transform turns `position: fixed`
          into "fixed relative to that ancestor", which breaks the dodge.
          The spacer keeps the layout from shifting.
        */}
        {isDodging && noSize ? (
          <>
            <div aria-hidden style={{ width: noSize.w, height: noSize.h }} />
            {mounted && createPortal(noButton, document.body)}
          </>
        ) : (
          noButton
        )}
      </div>
    </Stage>
  );
}
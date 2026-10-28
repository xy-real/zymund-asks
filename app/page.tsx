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

// ─── Styles (self-contained, so nothing depends on globals.css) ──────────────
const STYLES = `
:root {
  --zy-wine: #4a0f2c;
  --zy-blush: #ffe3ea;
  --zy-dim: #d9aebd;
  --zy-yes: #ffd9e2;
  --zy-rose: #f0507f;
}

.zy-stage {
  position: relative;
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: max(2rem, env(safe-area-inset-top)) max(1.5rem, env(safe-area-inset-right))
    max(2rem, env(safe-area-inset-bottom)) max(1.5rem, env(safe-area-inset-left));
  text-align: center;
  -webkit-tap-highlight-color: transparent;
  color: var(--zy-blush);
  background: radial-gradient(ellipse 70% 55% at 50% 38%, #4a0f2c 0%, #1a0817 62%, #12050f 100%);
}

.zy-content {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  max-width: 44rem;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
}

/* Headline: the one big moment. Lines rise out of a mask, once, on load. */
.zy-title {
  margin: 0;
  font-family: var(--font-playfair), Georgia, serif;
  font-style: italic;
  font-weight: 600;
  font-size: clamp(2rem, 10.5vw, 5.5rem);
  line-height: 1.02;
  letter-spacing: -0.02em;
}
.zy-line { display: block; overflow: hidden; padding: 0 0.1em 0.12em; }
.zy-line > span {
  display: block;
  animation: zy-rise-in 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) both;
  animation-delay: calc(var(--i) * 0.14s + 0.1s);
}
@keyframes zy-rise-in { from { transform: translateY(110%); } to { transform: none; } }

.zy-sub {
  margin: 0;
  max-width: 28rem;
  min-height: 2.8em;
  font-family: var(--font-cormorant), Georgia, serif;
  font-weight: 500;
  font-size: 1.375rem;
  line-height: 1.4;
  color: var(--zy-dim);
}

.zy-in   { animation: zy-fade 0.8s ease 0.9s both; }
.zy-late { animation: zy-fade 0.8s ease 1.4s both; }
@keyframes zy-fade { from { opacity: 0; } to { opacity: 1; } }

.zy-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
}

.zy-yes, .zy-reply {
  display: inline-block;
  border: 0;
  border-radius: 999px;
  padding: 1rem 2.25rem;
  background: var(--zy-yes);
  color: var(--zy-wine);
  font-family: var(--font-playfair), Georgia, serif;
  font-size: 1.25rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  min-height: 3.25rem;
  touch-action: manipulation;
  box-shadow: 0 10px 30px -10px rgba(240, 80, 127, 0.6);
  transition: transform 0.3s ease-out, box-shadow 0.2s ease;
}
@media (hover: hover) {
  .zy-yes:hover, .zy-reply:hover {
    box-shadow: 0 0 0 6px rgba(255, 217, 226, 0.15), 0 14px 36px -10px rgba(240, 80, 127, 0.8);
  }
}

.zy-no {
  border: 1px solid rgba(255, 227, 234, 0.3);
  border-radius: 999px;
  padding: 0.85rem 1.5rem;
  background: transparent;
  color: var(--zy-dim);
  font-family: var(--font-cormorant), Georgia, serif;
  font-size: 1.125rem;
  font-weight: 500;
  white-space: nowrap;
  min-height: 3rem;
  touch-action: manipulation;
  cursor: pointer;
}

.zy-yes:focus-visible, .zy-no:focus-visible, .zy-reply:focus-visible {
  outline: 2px solid var(--zy-blush);
  outline-offset: 4px;
}

/* Petals: drawn shapes, slow and quiet */
.zy-layer { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.zy-petal {
  position: absolute;
  bottom: -3rem;
  opacity: 0;
  animation: zy-float linear infinite;
}
.zy-petal svg { display: block; animation: zy-sway ease-in-out infinite alternate; }
@keyframes zy-float {
  0%   { transform: translateY(0); opacity: 0; }
  10%  { opacity: var(--zy-o); }
  90%  { opacity: var(--zy-o); }
  100% { transform: translateY(-115vh); opacity: 0; }
}
@keyframes zy-sway {
  from { transform: translateX(-14px) rotate(-25deg); }
  to   { transform: translateX(14px) rotate(25deg); }
}

.zy-fall { position: absolute; top: -2rem; animation: zy-drop ease-in forwards; }
@keyframes zy-drop { to { transform: translateY(115vh) rotate(540deg); } }

/* Success: the heart draws itself, then fills */
.zy-heart { width: 9rem; height: auto; overflow: visible; }
.zy-heart path {
  fill: var(--zy-rose);
  fill-opacity: 0;
  stroke: var(--zy-yes);
  stroke-width: 2.5;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: zy-draw 1.3s ease-out 0.2s forwards, zy-fillin 0.7s ease 1.2s forwards;
}
@keyframes zy-draw   { to { stroke-dashoffset: 0; } }
@keyframes zy-fillin { to { fill-opacity: 1; } }

.zy-yes-title {
  margin: 0;
  font-family: var(--font-playfair), Georgia, serif;
  font-style: italic;
  font-weight: 600;
  font-size: clamp(4rem, 20vw, 8.5rem);
  line-height: 1;
  letter-spacing: -0.02em;
}

/* Phones (portrait) */
@media (max-width: 480px) {
  .zy-content { gap: 2rem; }
  .zy-actions { gap: 1rem; }
  .zy-sub { font-size: 1.25rem; }
  .zy-yes, .zy-reply { padding: 1rem 2rem; }
  .zy-heart { width: 7.5rem; }
}

/* Short screens (phones in landscape): shrink type by height so nothing gets cut off */
@media (max-height: 520px) {
  .zy-stage { padding-top: max(1rem, env(safe-area-inset-top)); padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
  .zy-content { gap: 1rem; max-width: 36rem; }
  .zy-title { font-size: clamp(1.75rem, 12vh, 3.25rem); }
  .zy-yes-title { font-size: clamp(2.5rem, 16vh, 4.5rem); }
  .zy-heart { width: 4.5rem; }
  .zy-sub { font-size: 1.125rem; }
}

@media (prefers-reduced-motion: reduce) {
  .zy-line > span, .zy-in, .zy-late, .zy-petal, .zy-petal svg, .zy-fall { animation: none; opacity: 1; }
  .zy-heart path { animation: none; stroke-dashoffset: 0; fill-opacity: 1; }
}
`;

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
      <style>{STYLES}</style>
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
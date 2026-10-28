'use client';

import { useCallback, useRef, useState } from 'react';
import { CONFIG, TAUNTS } from '../lib/config';
import { cssVars } from '../lib/cssVars';
import { DodgeButton } from './DodgeButton';
import { Stage } from './Stage';

const HEADLINE = ['Will you', 'officially be', 'my girlfriend?'];

function getSubline(noCount: number) {
  if (noCount === 0) return 'Take your time. (But please say yes.)';
  if (noCount < 4) return 'The No button seems a little shy…';
  if (noCount < 8) return `That’s ${noCount} tries. The Yes button is looking pretty good, right?`;
  return `No pressure. You can always just tell ${CONFIG.senderName} how you feel.`;
}

export function QuestionScreen({ onYes }: { onYes: () => void }) {
  const [noCount, setNoCount] = useState(0);
  const yesRef = useRef<HTMLButtonElement>(null);
  const handleDodge = useCallback(() => setNoCount((c) => c + 1), []);

  return (
    <Stage>
      <h1 className="zy-title" aria-label="Will you officially be my girlfriend?">
        {HEADLINE.map((line, i) => (
          <span className="zy-line" key={line}>
            <span style={cssVars({ '--i': i })}>{line}</span>
          </span>
        ))}
      </h1>

      <p aria-live="polite" className="zy-sub zy-in">
        {getSubline(noCount)}
      </p>

      <div className="zy-actions zy-in">
        <button
          ref={yesRef}
          id="yes-button"
          type="button"
          className="zy-yes"
          style={cssVars({ '--zy-scale': 1 + Math.min(noCount, 8) * 0.05 })}
          onClick={onYes}
        >
          Yes 💗
        </button>

        <DodgeButton
          label={TAUNTS[Math.min(noCount, TAUNTS.length - 1)]}
          avoidRef={yesRef}
          onDodge={handleDodge}
        />
      </div>
    </Stage>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { CONFIG } from '../lib/config';
import { DrawnHeart } from './DrawnHeart';
import { PetalBurst } from './Petals';
import { Stage } from './Stage';

export function SuccessScreen() {
  const [showBurst, setShowBurst] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowBurst(false), 3500);
    return () => clearTimeout(t);
  }, []);

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
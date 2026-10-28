import type { ReactNode } from 'react';
import { FloatingPetals } from './Petals';

/** Full-screen backdrop + centered column shared by both screens. */
export function Stage({ children }: { children: ReactNode }) {
  return (
    <main className="zy-stage">
      <FloatingPetals />
      <div className="zy-content">{children}</div>
    </main>
  );
}
import type { CSSProperties } from 'react';

/** Lets us pass CSS custom properties through the `style` prop with proper typing. */
export const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties;
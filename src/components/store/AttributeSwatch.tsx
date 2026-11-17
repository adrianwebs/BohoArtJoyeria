import React from 'react';

/** Rainbow-style gradient used for the "multicolor" option. */
export const MULTICOLOR_BACKGROUND =
  'conic-gradient(from 0deg, #ef4444, #f59e0b, #facc15, #22c55e, #06b6d4, #3b82f6, #a855f7, #ec4899, #ef4444)';

interface AttributeSwatchProps {
  hex?: string | null;
  isMulticolor?: boolean;
  size?: number;
  className?: string;
}

/** Round colour chip: hex colour, or a conic gradient when the value is "multicolor". */
export function AttributeSwatch({ hex, isMulticolor, size = 24, className = '' }: AttributeSwatchProps) {
  const background = isMulticolor ? MULTICOLOR_BACKGROUND : hex || '#e5e0d8';
  return (
    <span
      aria-hidden="true"
      className={`inline-block rounded-full border border-black/10 shrink-0 ${className}`}
      style={{ width: size, height: size, background }}
    />
  );
}

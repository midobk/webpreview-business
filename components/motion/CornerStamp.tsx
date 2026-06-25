'use client';

import { motion, useReducedMotion } from 'motion/react';
import { stampDrift } from '@/lib/motion/variants';

type CornerStampProps = {
  text: string;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Absolutely-positioned, rotated, low-opacity text mark used as a
 * print-shop "PROOF / DRAFT" stamp. Pairs with the new warm-paper
 * visual identity on the request-preview form section.
 *
 * Respect prefers-reduced-motion — the stamp appears in place
 * rather than drifting from offset.
 */
export default function CornerStamp({
  text,
  className = '',
  style,
}: CornerStampProps) {
  const reduce = useReducedMotion();

  return (
    <motion.span
      aria-hidden="true"
      className={`stamp-corner ${className}`}
      style={style}
      variants={stampDrift}
      initial={reduce ? 'visible' : 'hidden'}
      animate="visible"
    >
      {text}
    </motion.span>
  );
}

"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

type ScrollParallaxProps = {
  children: ReactNode;
  /** Maximum y-offset in pixels at the section's edge. Default 24. */
  amount?: number;
  /** Class for the wrapper. */
  className?: string;
};

/**
 * Wraps a section in a parallax layer. As the section scrolls past the
 * viewport, children drift up by `amount` px (negative y). Disabled for
 * users who prefer reduced motion. The drift is computed via
 * useSpring so the motion feels weighty, not snappy.
 */
export default function ScrollParallax({
  children,
  amount = 24,
  className,
}: ScrollParallaxProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // 0 at section start (just entering bottom of viewport),
  // 1 at section end (just leaving top of viewport).
  // We want children to move UP as scrollYProgress goes 0 -> 1.
  // So we transform progress [0,1] to y [amount, 0].
  const y = useTransform(scrollYProgress, [0, 1], [amount, -amount]);
  const ys = useSpring(y, { stiffness: 120, damping: 24, mass: 0.6 });

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y: ys } as unknown as React.CSSProperties}>
        {children}
      </motion.div>
    </div>
  );
}

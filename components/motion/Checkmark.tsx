"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

type CheckmarkProps = {
  /** Tailwind classes for the svg element. */
  className?: string;
  /** Path data to draw. Defaults to a 12px check. */
  path?: string;
  /** Trigger reveal on view (default: false — draws immediately). */
  drawOnView?: boolean;
  /** Delay (seconds) before the draw starts. */
  delay?: number;
};

/**
 * A checkmark that draws its stroke on mount (or on view). Uses Motion's
 * pathLength animation — same idea as a stroke-dasharray draw, but
 * declarative and GPU-friendly.
 */
export default function Checkmark({
  className,
  path = "M4 12l5 5L20 6",
  drawOnView = false,
  delay = 0,
}: CheckmarkProps) {
  const ref = useRef<SVGSVGElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();

  const animated = drawOnView ? inView : true;
  const targetLength = reduce ? 1 : animated ? 1 : 0;

  return (
    <motion.svg
      ref={ref}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <motion.path
        d={path}
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: targetLength }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      />
    </motion.svg>
  );
}

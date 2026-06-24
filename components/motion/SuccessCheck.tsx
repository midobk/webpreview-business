"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * A check that draws itself on `trigger`. Designed for the form submit
 * success state — when the parent flips `trigger` to true, the check
 * stroke draws in over ~0.5s.
 */
export default function SuccessCheck({
  trigger,
  className,
}: {
  trigger: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Outer circle that fades in */}
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={
          trigger
            ? { pathLength: 1, opacity: 1 }
            : { pathLength: 0, opacity: 0 }
        }
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Check stroke that draws in after the circle */}
      <motion.path
        d="M8 12.5l3 3 5-6"
        initial={{ pathLength: 0 }}
        animate={trigger ? { pathLength: reduce ? 1 : 1 } : { pathLength: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
          delay: trigger ? 0.25 : 0,
        }}
      />
    </motion.svg>
  );
}

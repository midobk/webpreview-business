"use client";

import { motion, useInView, type Variants } from "motion/react";
import { useRef, type ReactNode } from "react";

import { fadeUp } from "@/lib/motion/variants";

type RevealProps = {
  children: ReactNode;
  /** Override the default fadeUp variant. */
  variants?: Variants;
  /** Tailwind / className passthrough. */
  className?: string;
  /** Delay (seconds) before the reveal plays. */
  delay?: number;
  /** How much of the element must be in view to trigger. 0-1. */
  amount?: number;
};

/**
 * Drop-in replacement for the hand-rolled `.reveal` IntersectionObserver
 * pattern. Triggers once when the element enters the viewport.
 */
export default function Reveal({
  children,
  variants = fadeUp,
  className,
  delay,
  amount = 0.05,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      transition={delay !== undefined ? { delay } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}
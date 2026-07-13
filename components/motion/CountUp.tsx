"use client";

import { animate, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

type CountUpProps = {
  /** The target string to count to. Either a number ("90", "100") or a literal
   *  non-numeric string ("PIPEDA", "0 contracts" — these snap in, no count). */
  to: string;
  /** Total animation duration in seconds. */
  duration?: number;
  /** Tailwind / className passthrough. */
  className?: string;
  /** Optional prefix/suffix or surrounding content (e.g. unit, "$"). */
  prefix?: ReactNode;
  suffix?: ReactNode;
};

/**
 * Count up from 0 to the numeric portion of `to` when scrolled into view.
 * Strings without digits snap in immediately (preserves their meaning —
 * animating "PIPEDA" letter-by-letter would be weird).
 *
 * Uses Motion's imperative `animate()` over a MotionValue<number> for
 * spring-aware easing without the cost of a useSpring.
 */
export default function CountUp({
  to,
  duration = 1.2,
  className,
  prefix,
  suffix,
}: CountUpProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  // Extract numeric portion. Examples:
  //   "90s"   -> 90,  suffix "s"
  //   "100%"  -> 100, suffix "%"
  //   "PIPEDA"-> null (snap)
  //   "0"     -> 0
  const match = /(\d+(?:\.\d+)?)/.exec(to);
  const target = match ? parseFloat(match[1]) : null;
  const [, suffixFromString] = match ? to.split(match[1]) : [null, ""];

  const mv = useMotionValue(0);
  // Keep the meaningful value visible before IntersectionObserver settles.
  // The animation resets to zero when the stat actually enters the viewport.
  const [display, setDisplay] = useState<string>(
    target !== null ? (match?.[1] ?? String(target)) : to
  );

  useEffect(() => {
    // Non-numeric and reduced-motion values already render their final
    // value from state initialization, so they need no effect update.
    if (!inView || target === null || reduce) return;
    mv.set(0);
    const isFloat = to.includes(".");
    const controls = animate(mv, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplay(isFloat ? latest.toFixed(1) : Math.round(latest).toString());
      },
    });
    return () => controls.stop();
  }, [inView, target, to, duration, reduce, mv]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix ?? (suffixFromString || "")}
    </span>
  );
}

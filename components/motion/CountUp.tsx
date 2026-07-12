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
  const [display, setDisplay] = useState<string>(
    target !== null ? (target % 1 === 0 ? "0" : "0.0") : to
  );

  useEffect(() => {
    if (!inView) return;
    if (target === null) {
      setDisplay(to);
      return;
    }
    if (reduce) {
      // Only the numeric part — the render already appends
      // suffixFromString, so setting the full string here would
      // double the suffix ("60min" + "min").
      setDisplay(String(target));
      return;
    }
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

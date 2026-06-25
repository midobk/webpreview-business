"use client";

import React, {
  useCallback,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

import { springMagnetic } from "@/lib/motion/easings";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  /** Render as <a> or <button> (default: a). */
  as?: "a" | "button";
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  /** Drift ceiling in px. Default 10 (matches the "aggressive" pick). */
  strength?: number;
  /** Disable the effect entirely (useful for SSR-snapshot consistency tests). */
  disabled_effect?: boolean;
};

/**
 * Cursor-tracking CTA. The element drifts up to `strength` px toward the
 * cursor while hovered, then springs back on leave. Touch devices (coarse
 * pointer) get a no-op since the effect would feel broken without hover.
 */
export default function MagneticButton({
  children,
  className,
  as = "a",
  href,
  type,
  onClick,
  disabled,
  strength = 10,
  disabled_effect = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, springMagnetic);
  const sy = useSpring(y, springMagnetic);
  const reduce = useReducedMotion();

  const handleMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (disabled_effect || reduce) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Distance from element center, normalized to [-1, 1].
      const relX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const relY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      // Clamp to keep the drift tasteful even at edges.
      const cx = Math.max(-1, Math.min(1, relX));
      const cy = Math.max(-1, Math.min(1, relY));
      x.set(cx * strength);
      y.set(cy * strength);
    },
    [disabled_effect, reduce, strength, x, y]
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  // We compose motion over the chosen tag. Motion values are accepted at
  // runtime via style.x / style.y; the public MotionStyle type widens via
  // MakeMotion but TypeScript's narrow inference rejects MotionValue here,
  // so we cast through `unknown`.
  const baseStyle: CSSProperties = {
    display: "inline-flex",
    willChange: "transform",
  };
  const motionStyle = { x: sx, y: sy, ...baseStyle } as unknown as CSSProperties;

  if (as === "button") {
    return (
      <motion.button
        ref={ref as React.RefObject<HTMLButtonElement>}
        type={type ?? "button"}
        disabled={disabled}
        onClick={onClick}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        style={motionStyle}
        className={className}
        whileTap={disabled || reduce ? undefined : { scale: 0.97 }}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.a
      ref={ref as React.RefObject<HTMLAnchorElement>}
      href={href}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={motionStyle}
      className={className}
      whileTap={reduce ? undefined : { scale: 0.97 }}
    >
      {children}
    </motion.a>
  );
}

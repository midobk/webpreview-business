"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import React, { useCallback, type MouseEvent, type ReactNode } from "react";

import { mockBrowserEntrance } from "@/lib/motion/variants";
import { springTilt } from "@/lib/motion/easings";

type TiltMockBrowserProps = {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees on either axis. Default 6. */
  maxTilt?: number;
};

/**
 * Wraps the hero mock-browser card with a CSS-3D tilt that follows the
 * cursor, plus a lazy floating animation (replaces the old `.animate-float`
 * CSS class). On touch / reduced-motion devices, only the floating remains.
 */
export default function TiltMockBrowser({
  children,
  className,
  maxTilt = 6,
}: TiltMockBrowserProps) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5); // 0..1 across width
  const py = useMotionValue(0.5);

  const rotY = useTransform(px, (v) => (v - 0.5) * 2 * maxTilt);
  const rotX = useTransform(py, (v) => -(v - 0.5) * 2 * maxTilt);
  const sRotY = useSpring(rotY, springTilt);
  const sRotX = useSpring(rotX, springTilt);
  const sLift = useSpring(0, springTilt);

  const handleMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (reduce) return;
      const rect = e.currentTarget.getBoundingClientRect();
      px.set((e.clientX - rect.left) / rect.width);
      py.set((e.clientY - rect.top) / rect.height);
      sLift.set(-6);
    },
    [px, py, sLift, reduce]
  );

  const handleLeave = useCallback(() => {
    px.set(0.5);
    py.set(0.5);
    sLift.set(0);
  }, [px, py, sLift]);

  return (
    <motion.div
      variants={mockBrowserEntrance}
      initial="hidden"
      animate="visible"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={
        {
          y: sLift,
          rotateX: sRotX,
          rotateY: sRotY,
          transformPerspective: 1200,
          transformStyle: "preserve-3d",
        } as unknown as React.CSSProperties
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}
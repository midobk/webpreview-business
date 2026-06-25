"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import React, {
  useCallback,
  type MouseEvent,
} from "react";

import { springGentle } from "@/lib/motion/easings";

type BlobConfig = {
  className: string;
  /** Per-blob sensitivity: how far (px) it can drift in either axis. */
  range: number;
};

type MouseBlobsProps = {
  blobs: BlobConfig[];
};

/**
 * Blurred blobs that drift toward the cursor with a gentle spring. Each blob
 * has its own sensitivity, so they form parallax layers instead of moving
 * in lockstep. Disabled for users who prefer reduced motion.
 */
export default function MouseBlobs({ blobs }: MouseBlobsProps) {
  const reduce = useReducedMotion();
  const nx = useMotionValue(0);
  const ny = useMotionValue(0);

  const handleMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (reduce) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      nx.set(cx / Math.max(1, rect.width / 2));
      ny.set(cy / Math.max(1, rect.height / 2));
    },
    [nx, ny, reduce]
  );

  const handleLeave = useCallback(() => {
    nx.set(0);
    ny.set(0);
  }, [nx, ny]);

  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {blobs.map((b, i) => (
        <Blob key={i} className={b.className} range={b.range} nx={nx} ny={ny} />
      ))}
    </div>
  );
}

function Blob({
  className,
  range,
  nx,
  ny,
}: {
  className: string;
  range: number;
  nx: ReturnType<typeof useMotionValue<number>>;
  ny: ReturnType<typeof useMotionValue<number>>;
}) {
  const tx = useTransform(nx, (v) => v * range);
  const ty = useTransform(ny, (v) => v * range);
  const sx = useSpring(tx, springGentle);
  const sy = useSpring(ty, springGentle);

  // Motion values in style.x/style.y are accepted at runtime; the public
  // MotionStyle type widens via MakeMotion but TypeScript's narrow inference
  // rejects MotionValue here. Cast through `unknown` to satisfy the checker
  // without runtime cost.
  const style = { x: sx, y: sy } as unknown as React.CSSProperties;

  return <motion.div className={className} style={style} />;
}
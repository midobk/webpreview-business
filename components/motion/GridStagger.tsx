"use client";

import { AnimatePresence } from "motion/react";
import type { ReactNode } from "react";

type GridStaggerProps = {
  /** Stable identity for the current filter result; passed as `key` to the wrapper. */
  scopeKey: string;
  children: ReactNode;
  className?: string;
};

/**
 * Wraps a filterable card grid in AnimatePresence so direct children
 * (which must be `motion.*` elements with their own `key`) animate when the
 * filter changes. The wrapper re-mounts when `scopeKey` changes so the
 * inner AnimatePresence sees a fresh set of children.
 */
export default function GridStagger({
  scopeKey,
  children,
  className,
}: GridStaggerProps) {
  return (
    <div key={scopeKey} className={className}>
      <AnimatePresence mode="popLayout" initial={false}>
        {children}
      </AnimatePresence>
    </div>
  );
}
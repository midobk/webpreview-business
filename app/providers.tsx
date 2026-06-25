"use client";

import { MotionConfig } from "motion/react";

/**
 * Client-side provider tree for the root layout.
 *
 * Wraps `children` in a `MotionConfig` whose `reducedMotion="user"` makes
 * every motion.* descendant across every route honor the OS-level
 * `prefers-reduced-motion` setting.
 *
 * Lives in its own client boundary because `motion/react` requires it —
 * the root layout is a Server Component (it exports `metadata`) and
 * cannot directly import a context-providing client component.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

import type { Variants } from "motion/react";

/* ------------------------------------------------------------------ */
/*  Easings                                                            */
/* ------------------------------------------------------------------ */

/** Matches the existing `cubic-bezier(0.16, 1, 0.3, 1)` used across the site. */
export const outQuint = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ */
/*  Reusable variants                                                  */
/* ------------------------------------------------------------------ */

/** Default reveal: fades up 20px with the brand's out-quint easing. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: outQuint },
  },
};

/** Tighter reveal for hero elements (faster, shorter distance). */
export const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: outQuint },
  },
};

/** Stagger container — pairs with `fadeUp` children. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

/** Hero stagger — slightly more aggressive for the above-the-fold cascade. */
export const heroStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

/** Card hover lift — springs instead of a hard transition. */
export const cardHover = {
  rest: { y: 0, boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" },
  hover: {
    y: -4,
    boxShadow:
      "0 18px 40px -16px rgba(15, 23, 42, 0.18), 0 8px 18px -10px rgba(79, 70, 229, 0.18)",
    transition: { type: "spring" as const, stiffness: 300, damping: 22 },
  },
};

/** Card entrance for the showcase grid (used inside AnimatePresence). */
export const gridCard: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: outQuint },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.97,
    transition: { duration: 0.25, ease: "easeIn" as const },
  },
};

/** Tilt variant for the hero mock browser (paired with onMouseMove math). */
export const mockBrowserEntrance: Variants = {
  hidden: { opacity: 0, y: 32, rotateX: 8 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.9, ease: outQuint, delay: 0.2 },
  },
};

/**
 * Print-shop "stamp" drift — used by CornerStamp. Starts slightly
 * offset to the right and more steeply rotated, settles to the final
 * -8° rotation. Pairs with the warm-paper visual identity.
 */
export const stampDrift: Variants = {
  hidden: { opacity: 0, x: 10, rotate: -14 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: -8,
    transition: { duration: 1.2, ease: outQuint },
  },
};

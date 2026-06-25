import type { Transition } from "motion/react";

/**
 * Spring configs reused across the motion pass.
 * Higher stiffness + lower damping = snappier. Lower stiffness = lazier.
 */
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 24,
  mass: 0.8,
};

/** For magnetic CTAs: smooth follow that doesn't lag the cursor. */
export const springMagnetic: Transition = {
  type: "spring",
  stiffness: 150,
  damping: 15,
  mass: 0.4,
};

/** For the hero mock browser tilt — a touch lazier so the tilt feels weighty. */
export const springTilt: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 22,
  mass: 0.6,
};

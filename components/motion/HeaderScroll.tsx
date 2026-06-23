"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState, type ReactNode } from "react";

import { outQuint } from "@/lib/motion/variants";

type HeaderScrollProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Sticky header that hides when scrolling down and reappears on scroll up.
 * Only triggers after a >100px scroll position to avoid jitter on small pages.
 */
export default function HeaderScroll({ children, className }: HeaderScrollProps) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const delta = latest - lastY.current;
    lastY.current = latest;
    // Hide only after the user has scrolled past 100px AND is scrolling down.
    if (latest > 100 && delta > 0) {
      setHidden(true);
    } else if (delta < -2) {
      // Reveal on any meaningful scroll-up.
      setHidden(false);
    }
  });

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: hidden ? "-100%" : 0 }}
      transition={{ duration: 0.28, ease: outQuint }}
      className={className}
    >
      {children}
    </motion.header>
  );
}

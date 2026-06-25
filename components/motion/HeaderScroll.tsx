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
 * Adds `is-scrolled` once past the hero so a backdrop can keep the nav legible
 * over light sections (styled via .site-header.is-scrolled in globals.css).
 */
export default function HeaderScroll({ children, className }: HeaderScrollProps) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const delta = latest - lastY.current;
    lastY.current = latest;
    // Past the hero: switch on the solid backdrop so the nav stays legible.
    setScrolled(latest > 40);
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
      className={`${className ?? ""}${scrolled ? " is-scrolled" : ""}`}
    >
      {children}
    </motion.header>
  );
}

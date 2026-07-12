'use client';

import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

/* ------------------------------------------------------------------ */
/*  Three steps with a scroll-linked progress spine. The lume line    */
/*  grows as you read; each step lights up as the spine passes it.    */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    t: 'T+0:00',
    title: 'Tell us about your business',
    body: 'A 60-second form — your name, what you do, where you work. No brief, no discovery call, no "brand questionnaire". We read your public listings and reviews for the rest.',
  },
  {
    t: 'T+1:30',
    title: 'Your preview is already live',
    body: 'A complete one-page site — real copy in your voice, your colours, mobile-first — waiting at a private link. Most previews arrive before the confirmation email does.',
  },
  {
    t: 'whenever',
    title: 'Keep it, change it, or walk away',
    body: 'Love it? We put it on your domain. Want tweaks? Reply with changes and we iterate. Not for you? Close the tab. No invoice, no follow-up spam.',
  },
];

export default function Process() {
  const ref = useRef<HTMLOListElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.72', 'end 0.55'],
  });
  const spine = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  return (
    <ol ref={ref} className="relative space-y-14 sm:space-y-20 list-none">
      {/* Static track + animated spine */}
      <div className="absolute left-[13px] top-2 bottom-2 w-px bg-[var(--v2-line)]" aria-hidden="true" />
      <motion.div
        className="absolute left-[12.5px] top-2 bottom-2 w-[2px] origin-top bg-[var(--v2-lume)]"
        style={{ scaleY: spine }}
        aria-hidden="true"
      />

      {STEPS.map((step, i) => (
        <motion.li
          key={step.title}
          className="relative pl-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
        >
          <span
            className="absolute left-0 top-0.5 flex h-[27px] w-[27px] items-center justify-center rounded-full border border-[var(--v2-line-strong)] bg-[var(--v2-ink)] font-mono text-[11px] text-[var(--v2-lume)]"
            aria-hidden="true"
          >
            {i + 1}
          </span>
          <div className="v2-mono text-[10px] text-[var(--v2-cream-faint)]">{step.t}</div>
          <h3 className="v2-serif mt-2 text-2xl sm:text-[2rem] font-medium leading-tight">
            {step.title}
          </h3>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--v2-cream-dim)]">
            {step.body}
          </p>
        </motion.li>
      ))}
    </ol>
  );
}

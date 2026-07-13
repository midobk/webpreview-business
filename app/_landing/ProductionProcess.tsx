'use client';

import { motion, useScroll, useSpring } from 'motion/react';
import { useRef } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    t: '60 seconds',
    title: 'Tell us about your business',
    body: 'Share the essentials: your business name, website if you have one, what you do, where you work and anything we should understand about the direction.',
  },
  {
    t: '0–15 minutes',
    title: 'We research the business behind the page',
    body: 'We review your public listings, services, service area, reviews and existing presence to identify the strongest message, customer language and conversion goal.',
  },
  {
    t: '15–50 minutes',
    title: 'The website direction takes shape',
    body: 'We plan the page, prepare the copy, establish the visual direction and build the responsive one-page concept around the action you want customers to take.',
  },
  {
    t: '50–60 minutes',
    title: 'Production review and delivery',
    body: 'We check the mobile layout, links, contact paths, local-search structure and overall presentation before packaging the first draft for your inbox.',
  },
];

export default function ProductionProcess() {
  const rootRef = useRef<HTMLOListElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start 0.75', 'end 0.55'],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.25 });

  return (
    <ol ref={rootRef} className="relative space-y-14 sm:space-y-20 list-none">
      <div
        className="absolute left-[13px] top-2 bottom-2 w-px bg-[var(--v2-line)]"
        aria-hidden="true"
      />
      <motion.div
        className="absolute left-[12.5px] top-2 bottom-2 w-[2px] origin-top bg-[var(--v2-lume)]"
        style={{ scaleY }}
        aria-hidden="true"
      />

      {STEPS.map((step, index) => (
        <motion.li
          key={step.title}
          className="relative pl-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.65, ease, delay: index * 0.05 }}
        >
          <span
            className="absolute left-0 top-0.5 flex h-[27px] w-[27px] items-center justify-center rounded-full border border-[var(--v2-line-strong)] bg-[var(--v2-ink)] font-mono text-[11px] text-[var(--v2-lume)]"
            aria-hidden="true"
          >
            {index + 1}
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

      <li className="pl-14 text-xs leading-relaxed text-[var(--v2-cream-faint)]">
        Most eligible requests are delivered within the hour during service hours. Complete
        submission details and current request volume can affect timing.
      </li>
    </ol>
  );
}

"use client";

import { motion } from "motion/react";

import { heroStagger, fadeUp, fadeUpSmall } from "@/lib/motion/variants";

/**
 * Client-side hero for the showcase page. Lives separately because the
 * parent `app/showcase/page.tsx` is a Server Component that loads data
 * async — motion components need a client boundary.
 *
 * Night-studio identity: blueprint grid + glow behind a left-aligned
 * Fraunces headline with mono `fig.` annotation, continuing the landing
 * page's figure numbering.
 */
export default function ShowcaseHero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-14 sm:pt-24 sm:pb-16">
      <div className="v2-blueprint absolute inset-0" aria-hidden="true" />
      <div className="v2-glow absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <motion.div variants={heroStagger} initial="hidden" animate="visible">
          <motion.div
            variants={fadeUpSmall}
            className="v2-mono flex items-center gap-3 text-[10px] text-[var(--v2-cream-faint)]"
          >
            <span className="text-[var(--v2-lume)]">fig. 09</span>
            <span className="h-px w-10 bg-[var(--v2-line-strong)]" aria-hidden="true" />
            <span>the receipts</span>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="v2-serif mt-5 max-w-3xl text-[clamp(2.4rem,6vw,4.5rem)] font-medium leading-[1.02]"
          >
            Drafts we&apos;re allowed to show.
            <span className="block italic font-light text-[var(--v2-cream-dim)]">
              Yours stays private until you say otherwise.
            </span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--v2-cream-dim)] sm:text-base"
          >
            Every concept below was drafted for a real local business, then
            anonymized — names, locations and contact details removed. These
            are design demos, not live sites.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

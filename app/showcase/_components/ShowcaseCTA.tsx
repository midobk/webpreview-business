"use client";

import MagneticButton from "@/components/motion/MagneticButton";
import Reveal from "@/components/motion/Reveal";

/**
 * Bottom CTA on the showcase page — night-studio identity matching the
 * landing page's closing section: glow pool, mono kicker, Fraunces
 * headline, lume magnetic button.
 */
export default function ShowcaseCTA() {
  return (
    <section className="relative overflow-hidden border-t border-[var(--v2-line)] py-20 sm:py-28">
      <div className="v2-glow absolute inset-0 rotate-180" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <div className="v2-mono mb-5 text-[10px] text-[var(--v2-cream-faint)]">
            your turn
          </div>
          <h2 className="v2-serif mb-4 text-3xl font-medium md:text-5xl">
            Want one with{" "}
            <em className="font-light">your name on it?</em>
          </h2>
          <p className="mb-9 text-lg leading-relaxed text-[var(--v2-cream-dim)]">
            Tell us about your business — one free personalized first draft,
            most eligible within the hour during service hours.
          </p>
          <MagneticButton href="/#preview" className="v2-btn v2-btn-primary !px-8 !py-4 text-lg">
            Request my free draft →
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}

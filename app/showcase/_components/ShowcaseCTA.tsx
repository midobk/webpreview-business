"use client";

import MagneticButton from "@/components/motion/MagneticButton";
import Reveal from "@/components/motion/Reveal";

/**
 * Bottom dark CTA on the showcase page. Uses Reveal for the entrance and
 * MagneticButton for the primary CTA so the page feels consistent with the
 * homepage's motion language.
 *
 * Warm-print visual identity: bg-ink (spruce-near-black), Fraunces
 * display h2, single oxblood action accent on the CTA.
 */
export default function ShowcaseCTA() {
  return (
    <section className="py-20 bg-ink text-white relative overflow-hidden">
      {/* Subtle warm noise overlay — quieter than the request-form section */}
      <div
        aria-hidden="true"
        className="absolute inset-0 noise-overlay pointer-events-none opacity-40"
      />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Reveal>
          <h2
            className="text-3xl md:text-5xl font-medium mb-4"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontVariationSettings: '"opsz" 96',
            }}
          >
            Want a website like this for your business?
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Tell us about your business and we&rsquo;ll generate an unofficial preview concept for
            you to review.
          </p>
          <MagneticButton
            href="/#preview"
            className="bg-action text-white px-8 py-4 rounded-full font-medium text-lg shadow-lg shadow-action/30 hover:bg-action-deep transition-colors"
          >
            Request My Preview →
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}

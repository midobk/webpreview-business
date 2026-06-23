"use client";

import MagneticButton from "@/components/motion/MagneticButton";
import Reveal from "@/components/motion/Reveal";

/**
 * Bottom dark CTA on the showcase page. Uses Reveal for the entrance and
 * MagneticButton for the primary CTA so the page feels consistent with the
 * homepage's motion language.
 */
export default function ShowcaseCTA() {
  return (
    <section className="py-20 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Reveal>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Want a website like this for your business?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Tell us about your business and we'll generate an unofficial preview concept for
            you to review.
          </p>
          <MagneticButton
            href="/#request-preview"
            className="inline-block bg-indigo-500 text-white px-8 py-4 rounded-lg font-medium text-lg"
          >
            Request My Preview
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}

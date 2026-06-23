"use client";

import { motion } from "motion/react";

import { heroStagger, fadeUp, fadeUpSmall } from "@/lib/motion/variants";

/**
 * Client-side hero for the showcase page. Lives separately because the
 * parent `app/showcase/page.tsx` is a Server Component that loads data
 * async — motion components need a client boundary.
 */
export default function ShowcaseHero() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={heroStagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={fadeUpSmall}
            className="inline-block mb-4 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
          >
            Anonymized demo concepts
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            Showcase of website concepts
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Every preview below is a concept designed for a real local business. Names,
            locations, and contact details have been removed. These are design demos only —
            not live sites.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

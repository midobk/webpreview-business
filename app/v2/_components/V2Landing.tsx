'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useSpring } from 'motion/react';
import MagneticButton from '@/components/motion/MagneticButton';
import CountUp from '@/components/motion/CountUp';
import LiveBuild from './LiveBuild';
import BeforeAfter from './BeforeAfter';
import Process from './Process';
import LeadForm from './LeadForm';

/* ------------------------------------------------------------------ */
/*  Shared motion + section furniture                                 */
/* ------------------------------------------------------------------ */

const ease = [0.16, 1, 0.3, 1] as const;

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease, delay }}
    >
      {children}
    </motion.div>
  );
}

function Kicker({ fig, children }: { fig: string; children: React.ReactNode }) {
  return (
    <div className="v2-mono flex items-center gap-3 text-[10px] text-[var(--v2-cream-faint)]">
      <span className="text-[var(--v2-lume)]">fig. {fig}</span>
      <span className="h-px w-10 bg-[var(--v2-line-strong)]" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section data                                                      */
/* ------------------------------------------------------------------ */

const TRADES = [
  'Plumbers', 'Salons', 'Cafés', 'Landscapers', 'Electricians', 'Cleaners',
  'Auto shops', 'Barbers', 'Roofers', 'Bakeries', 'Movers', 'Photographers',
  'Contractors', 'Groomers', 'Caterers', 'HVAC techs',
];

const STATS: { value: string; prefix?: string; label: string }[] = [
  { value: '60min', label: 'or less — first draft in your inbox' },
  // CountUp keeps only the digits + trailing text, so "$" must ride
  // through its prefix prop rather than the value string.
  { value: '0', prefix: '$', label: 'until you decide to keep it' },
  { value: '1 human', label: 'reviews every draft before it ships' },
  { value: '100%', label: 'yours on final delivery' },
];

const PRICING = [
  {
    name: 'Preview',
    price: 'Free',
    cadence: 'no card required',
    blurb: 'A personalized first draft — see the direction before you commit.',
    features: ['Complete one-page first draft', 'Mobile + desktop design', 'Personalized copy & palette', 'Human-reviewed before it’s sent', 'Keep iterating or walk away'],
    cta: 'Get my draft',
    featured: false,
  },
  {
    name: 'Managed',
    price: '$299',
    cadence: 'setup + $49/mo',
    blurb: 'Most popular. Finished by hand, live on your domain, fully managed.',
    features: ['Your draft, refined to production-ready', 'Custom domain + SSL', 'Hosting + maintenance included', 'Unlimited small edits', 'Cancel anytime'],
    cta: 'Start managed',
    featured: true,
  },
  {
    name: 'Standard',
    price: '$500',
    cadence: 'paid once',
    blurb: 'Finalized site, handed off. Host it yourself.',
    features: ['Finalized one-page website', 'Contact form + mobile responsive', 'Deployment help included', '30 days of edits'],
    cta: 'Buy standard',
    featured: false,
  },
  {
    name: 'Full Handoff',
    price: '$799',
    cadence: 'paid once, source included',
    blurb: 'Source files + handoff. Zero recurring anything.',
    features: ['Full source files', 'Domain + hosting guidance', '30 days of bug-fix edits', 'For developers & agencies'],
    cta: 'Buy handoff',
    featured: false,
  },
];

const TESTIMONIALS = [
  {
    quote:
      "I run a two-truck cleaning company in Etobicoke. Seaway Sites had a preview waiting in my inbox before I'd finished my Tim Hortons. The booking form alone would have cost me $3,000 from an agency.",
    name: 'Maria D.',
    role: 'Sparkle & Shine Cleaning · Toronto, ON',
  },
  {
    quote:
      "I'm a solo hairstylist in Kits. I don't have time to learn Squarespace for the third time. Seaway Sites gave me something I was actually proud to text my clients — and the price was less than a single colour service.",
    name: 'Jenna T.',
    role: 'Jenna T. Hair Studio · Vancouver, BC',
  },
  {
    quote:
      "My shop's old site still had my ex-wife's cell number on it. Seaway Sites built a new one in my coffee break, and I got three bookings the first week. The fact that it's hosted in Canada mattered to me.",
    name: 'Dave R.',
    role: 'North Hill Auto · Calgary, AB',
  },
];

const FAQS = [
  {
    q: 'How fast will I see my first draft?',
    a: "Within the hour, usually. The build agent assembles the draft in minutes, then a person reviews it before it's sent — we'd rather be a little slower than send you something broken.",
  },
  {
    q: 'Is the preview my finished website?',
    a: "No — and we're up-front about that. It's a working first draft: real copy, real design, personalized to your business. If you decide to keep it, we refine it together — your photos, final wording, booking links, the details — until it's production-ready on your domain.",
  },
  {
    q: 'Is this just AI-generated?',
    a: "The first draft is machine-assembled — that's how it can be fast and free — but nothing ships without a person reviewing, editing and finishing it. You'll never be handed raw robot output, and the final site is finished by hand.",
  },
  {
    q: "Do I own the website when it's done?",
    a: 'On the Managed plan, we host and maintain it for you (you can cancel any time). On the one-time plans, source files are yours — host them anywhere, edit them yourself, no lock-in.',
  },
  {
    q: 'Can I edit the preview after I see it?',
    a: 'Yes. Reply to your preview email with what you want changed — colours, copy, layout. We iterate until you love it, included in the final package.',
  },
  {
    q: 'Is my business data stored in Canada?',
    a: "Yes. Our infrastructure runs in Montréal and Toronto. We're PIPEDA-aligned and never sell or share your business data with third parties.",
  },
  {
    q: "What if I don't like the preview?",
    a: "Walk away. No invoice, no follow-up spam. We'll ask one quick 'what was wrong?' so we can do better next time, but you don't owe us anything.",
  },
  {
    q: 'Do you handle the domain and email?',
    a: "We register and configure your domain as part of the final package, and can set up a business email (hello@yourbusiness.ca) on request. Existing domain? We'll point it for you.",
  },
];

const COPY_LINES = [
  'Family-run since 2009. Licensed & insured in Ontario.',
  'Same-week appointments — evenings too.',
  'Rated 4.9 stars by the neighbours you plow out.',
  'Free estimates. Honest timelines. No surprises.',
];

/* ------------------------------------------------------------------ */
/*  Small interactive bits                                            */
/* ------------------------------------------------------------------ */

function Typewriter({ lines }: { lines: string[] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  // Pause while off-screen: no timers burning in the background, and no
  // work happening under a scrolling thumb.
  const inView = useInView(ref, { amount: 0.4 });
  const [lineIdx, setLineIdx] = useState(0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    const line = lines[lineIdx];
    if (chars < line.length) {
      const t = setTimeout(() => setChars((c) => c + 1), 34);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setChars(0);
      setLineIdx((i) => (i + 1) % lines.length);
    }, 2400);
    return () => clearTimeout(t);
  }, [chars, lineIdx, lines, reduce, inView]);

  // Grid-stacked invisible ghosts of every line reserve the tallest
  // wrapped height up front, so the box never resizes while typing —
  // that resize was shifting the whole page on narrow screens.
  return (
    <span ref={ref} className="grid font-mono text-sm text-[var(--v2-cream)]">
      {lines.map((l) => (
        <span key={l} className="invisible [grid-area:1/1]" aria-hidden="true">
          {l}
          <span className="inline-block w-[0.55em]" />
        </span>
      ))}
      <span className="[grid-area:1/1]">
        {reduce ? (
          lines[0]
        ) : (
          <>
            {lines[lineIdx].slice(0, chars)}
            <span className="v2-caret" aria-hidden="true" />
          </>
        )}
      </span>
    </span>
  );
}

function useHeaderScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return scrolled;
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function V2Landing() {
  const scrolled = useHeaderScrolled();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  return (
    <div className="v2-root relative min-h-screen overflow-x-clip">
      {/* Reading progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[70] h-[2px] origin-left bg-[var(--v2-lume)]"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />

      <div className="v2-grain" aria-hidden="true" />

      {/* ---------- Header ---------- */}
      <header className={`v2-header fixed top-0 inset-x-0 z-50 ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-8 py-4">
          <a href="#top" className="flex items-baseline gap-2">
            <span className="v2-serif text-xl font-semibold tracking-tight">Seaway Sites</span>
            <span className="v2-mono text-[9px] text-[var(--v2-lume)]">the drafting table</span>
          </a>
          <nav className="hidden md:flex items-center gap-7 text-sm text-[var(--v2-cream-dim)]" aria-label="Page sections">
            <a href="#proof" className="hover:text-[var(--v2-cream)] transition-colors">Proof</a>
            <a href="#process" className="hover:text-[var(--v2-cream)] transition-colors">Process</a>
            <a href="#pricing" className="hover:text-[var(--v2-cream)] transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-[var(--v2-cream)] transition-colors">FAQ</a>
            <a href="/showcase" className="hover:text-[var(--v2-cream)] transition-colors">Showcase</a>
          </nav>
          <a href="#preview" className="v2-btn v2-btn-primary !px-4 !py-2 text-sm">
            Free preview
          </a>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section id="top" className="relative pt-32 sm:pt-40 pb-20 sm:pb-28">
        <div className="v2-blueprint absolute inset-0" aria-hidden="true" />
        <div className="v2-glow absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}
              className="v2-mono flex items-center gap-3 text-[10px] text-[var(--v2-cream-faint)]"
            >
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[var(--v2-lume)]" aria-hidden="true" />
              websites for canadian small business · drafted by machine · finished by hand
            </motion.div>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }}
              className="v2-serif v2-display mt-6 max-w-4xl"
            >
              Your website
              <br />
              already exists.
              <span className="block italic font-light text-[var(--v2-cream-dim)]">
                We just haven&apos;t shown it to you yet.
              </span>
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } }}
              className="mt-7 max-w-xl text-base sm:text-lg leading-relaxed text-[var(--v2-cream-dim)]"
            >
              Tell us about your business. Within the hour, a complete first
              draft of your website is in your inbox — built from your real
              listings and reviews, checked by a human before it&apos;s sent,
              free. If you love the direction, we finish it together.
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <MagneticButton href="#preview" className="v2-btn v2-btn-primary">
                Build mine free
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </MagneticButton>
              <a href="#proof" className="v2-btn v2-btn-ghost">Watch it happen ↓</a>
            </motion.div>
          </motion.div>

          {/* Live build demo */}
          <motion.div
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.45 }}
            className="mt-16 sm:mt-20 mx-auto max-w-3xl"
          >
            <div className="v2-mono mb-3 text-[10px] text-[var(--v2-cream-faint)]">
              fig. 01 — a first draft, assembling itself (sped up)
            </div>
            <LiveBuild />
          </motion.div>
        </div>
      </section>

      {/* ---------- Trades marquee ---------- */}
      <section className="v2-marquee overflow-hidden border-y border-[var(--v2-line)] py-5" aria-label="Industries we build for">
        <div className="v2-marquee-track">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              className="flex shrink-0 items-center"
              aria-hidden={copy === 1}
            >
              {TRADES.map((t) => (
                <span key={`${copy}-${t}`} className="v2-mono flex items-center text-[11px] text-[var(--v2-cream-faint)]">
                  <span className="px-6">{t}</span>
                  <span className="text-[var(--v2-lume)]">✳</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Proof: before / after ---------- */}
      <section id="proof" className="scroll-mt-24 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <Kicker fig="02">the argument</Kicker>
            <h2 className="v2-serif v2-h2 mt-5 max-w-3xl">
              Most small-business websites were built once —{' '}
              <em className="font-light">and abandoned twice.</em>
            </h2>
            <p className="mt-5 max-w-xl text-[15px] sm:text-base leading-relaxed text-[var(--v2-cream-dim)]">
              Drag the handle. The left side is the site your customers find
              today. The right side is the first draft we&apos;d send you within
              the hour — before the human polish that makes it production-ready.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-12">
            <BeforeAfter />
          </Reveal>
        </div>
      </section>

      {/* ---------- Process ---------- */}
      <section id="process" className="scroll-mt-24 border-t border-[var(--v2-line)] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 grid gap-14 lg:grid-cols-[1fr_1.2fr]">
          <div className="lg:sticky lg:top-32 self-start">
            <Reveal>
              <Kicker fig="03">the process</Kicker>
              <h2 className="v2-serif v2-h2 mt-5">
                In minutes.
                <br />
                <em className="font-light">Not months.</em>
              </h2>
              <p className="mt-5 max-w-md text-[15px] sm:text-base leading-relaxed text-[var(--v2-cream-dim)]">
                Our build agent drafts your site in minutes and a human
                checks it — first draft in your inbox within the hour. The
                work that makes it production-ready is human, and it starts
                only after you say yes.
              </p>
            </Reveal>
          </div>
          <Process />
        </div>
      </section>

      {/* ---------- Bento features ---------- */}
      <section className="border-t border-[var(--v2-line)] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <Kicker fig="04">the details</Kicker>
            <h2 className="v2-serif v2-h2 mt-5 max-w-2xl">
              Small site. <em className="font-light">Zero corners cut.</em>
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {/* Copy voice */}
            <Reveal className="lg:col-span-3">
              <div className="v2-bento-cell v2-card h-full p-7">
                <div className="v2-mono text-[9px] text-[var(--v2-cream-faint)]">04·a</div>
                <h3 className="v2-serif mt-3 text-xl font-medium">Copy that sounds like you</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--v2-cream-dim)]">
                  Drafted from your listings, reviews and description, then
                  edited by a person — not a template with your name pasted
                  in, and never raw robot output.
                </p>
                <div className="mt-6 rounded-xl border border-[var(--v2-line)] bg-[rgba(239,234,224,0.03)] p-4">
                  <Typewriter lines={COPY_LINES} />
                </div>
              </div>
            </Reveal>

            {/* Mobile first */}
            <Reveal delay={0.05} className="lg:col-span-3">
              <div className="v2-bento-cell v2-card h-full p-7 overflow-hidden">
                <div className="v2-mono text-[9px] text-[var(--v2-cream-faint)]">04·b</div>
                <h3 className="v2-serif mt-3 text-xl font-medium">Mobile-first, always</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--v2-cream-dim)]">
                  Your customers book from a phone in a parking lot, not a
                  desktop in an office. We design for that first.
                </p>
                <div className="relative mt-4 flex justify-center">
                  <div className="v2-phone w-28 rounded-[18px] border border-[var(--v2-line-strong)] bg-[var(--v2-ink-2)] p-1.5 shadow-2xl">
                    <div className="rounded-[13px] bg-[#f7f5ef] p-2">
                      <div className="h-1.5 w-10 rounded bg-[#12271c]" />
                      <div className="mt-2 h-2 w-16 rounded bg-[#181613]/80" />
                      <div className="mt-1 h-1.5 w-12 rounded bg-[#181613]/30" />
                      <div className="mt-2 h-4 w-14 rounded-full bg-[#2c7a53]" />
                      <div className="mt-2 grid grid-cols-2 gap-1">
                        <div className="h-6 rounded bg-white border border-[#181613]/10" />
                        <div className="h-6 rounded bg-white border border-[#181613]/10" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Local SEO */}
            <Reveal delay={0.1} className="lg:col-span-2">
              <div className="v2-bento-cell v2-card h-full p-7">
                <div className="v2-mono text-[9px] text-[var(--v2-cream-faint)]">04·c</div>
                <div className="relative mt-4 flex h-16 items-center justify-center">
                  <span className="v2-ping absolute h-10 w-10 rounded-full border border-[var(--v2-lume)]" aria-hidden="true" />
                  <span className="v2-ping v2-ping-late absolute h-10 w-10 rounded-full border border-[var(--v2-lume)]" aria-hidden="true" />
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--v2-lume)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="relative w-7 h-7" aria-hidden="true">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3 className="v2-serif mt-4 text-lg font-medium">Found on Google Maps</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--v2-cream-dim)]">
                  Local SEO structure baked in — your town, your trade, your
                  hours, machine-readable.
                </p>
              </div>
            </Reveal>

            {/* Canada / PIPEDA */}
            <Reveal delay={0.15} className="lg:col-span-2">
              <div className="v2-bento-cell v2-card h-full p-7">
                <div className="v2-mono text-[9px] text-[var(--v2-cream-faint)]">04·d</div>
                <div className="mt-4 flex h-16 items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--v2-lume)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8" aria-hidden="true">
                    <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z" />
                    <path d="M9 11.5l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="v2-serif mt-4 text-lg font-medium">Hosted in Canada</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--v2-cream-dim)]">
                  Montréal and Toronto infrastructure. PIPEDA-aligned. Your
                  data never gets sold — full stop.
                </p>
              </div>
            </Reveal>

            {/* No lock-in */}
            <Reveal delay={0.2} className="lg:col-span-2">
              <div className="v2-bento-cell v2-card h-full p-7">
                <div className="v2-mono text-[9px] text-[var(--v2-cream-faint)]">04·e</div>
                <div className="mt-4 flex h-16 items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--v2-lume)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8" aria-hidden="true">
                    <circle cx="8" cy="14" r="4" />
                    <path d="M10.8 11.2L20 2m-4 2l2 2m-5 1l2 2" />
                  </svg>
                </div>
                <h3 className="v2-serif mt-4 text-lg font-medium">Keys included</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--v2-cream-dim)]">
                  Own the files on one-time plans, cancel monthly anytime. If
                  you ever want to leave, we help you pack.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Stats band ---------- */}
      <section className="border-t border-[var(--v2-line)]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 lg:grid-cols-4 px-5 sm:px-8">
          {STATS.map((s2, i) => (
            <div
              key={s2.label}
              className={`py-10 sm:py-14 px-4 ${i > 0 ? 'lg:border-l lg:border-[var(--v2-line)]' : ''} ${i % 2 === 1 ? 'border-l border-[var(--v2-line)] lg:border-l' : ''}`}
            >
              <CountUp
                to={s2.value}
                prefix={s2.prefix}
                className="v2-serif block text-3xl sm:text-5xl font-medium text-[var(--v2-lume)] tabular-nums"
              />
              <div className="mt-2 text-xs sm:text-sm text-[var(--v2-cream-dim)]">{s2.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Pricing ---------- */}
      <section id="pricing" className="scroll-mt-24 border-t border-[var(--v2-line)] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <Kicker fig="05">the money part</Kicker>
            <h2 className="v2-serif v2-h2 mt-5 max-w-2xl">
              Priced like a trade, <em className="font-light">not an agency.</em>
            </h2>
            <p className="mt-5 max-w-xl text-[15px] sm:text-base leading-relaxed text-[var(--v2-cream-dim)]">
              Every plan starts with the same free preview. Pick how you want
              to keep it — or don&apos;t keep it at all.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4 items-stretch">
            {PRICING.map((tier, i) => (
              <Reveal key={tier.name} delay={i * 0.06} className="h-full">
                <div className={`v2-card relative flex h-full flex-col p-7 ${tier.featured ? 'v2-card-featured' : ''}`}>
                  {tier.featured && (
                    <span className="v2-mono absolute -top-3 left-6 rounded-full bg-[var(--v2-lume)] px-3 py-1 text-[9px] font-bold text-[#0c0f08]">
                      most popular
                    </span>
                  )}
                  <div className="v2-mono text-[10px] text-[var(--v2-cream-faint)]">{tier.name}</div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="v2-serif text-4xl font-medium">{tier.price}</span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--v2-cream-faint)]">{tier.cadence}</div>
                  <p className="mt-4 text-sm leading-relaxed text-[var(--v2-cream-dim)]">{tier.blurb}</p>
                  <ul className="mt-5 space-y-2.5 text-sm text-[var(--v2-cream-dim)]">
                    {tier.features.map((f) => (
                      <li key={f} className="flex gap-2.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--v2-lume)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#preview"
                    className={`v2-btn mt-7 justify-center text-sm ${tier.featured ? 'v2-btn-primary' : 'v2-btn-ghost'}`}
                  >
                    {tier.cta}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-[var(--v2-cream-faint)]">
            All prices CAD. 30-day money-back on paid plans.
          </p>
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className="border-t border-[var(--v2-line)] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <Kicker fig="06">word of mouth</Kicker>
            <h2 className="v2-serif v2-h2 mt-5 max-w-2xl">
              From people who <em className="font-light">fix pipes, not pixels.</em>
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08} className="h-full">
                <figure className="v2-card flex h-full flex-col p-7">
                  <div className="text-[var(--v2-lume)]" aria-hidden="true">★★★★★</div>
                  <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-[var(--v2-cream-dim)]">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-6">
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="v2-mono mt-1 text-[9px] text-[var(--v2-cream-faint)]">{t.role}</div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="scroll-mt-24 border-t border-[var(--v2-line)] py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Reveal>
            <Kicker fig="07">fine print, large type</Kicker>
            <h2 className="v2-serif v2-h2 mt-5">Fair questions.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="v2-faq mt-10 border-t border-[var(--v2-line)]">
              {FAQS.map((f) => (
                <details key={f.q} className="group">
                  <summary className="flex items-center justify-between gap-6 py-6">
                    <span className="v2-serif text-lg sm:text-xl font-medium">{f.q}</span>
                    <span className="v2-faq-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--v2-line-strong)] text-[var(--v2-lume)]" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="w-4 h-4">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>
                  <p className="pb-7 pr-14 text-[15px] leading-relaxed text-[var(--v2-cream-dim)]">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Final CTA + form ---------- */}
      <section id="preview" className="scroll-mt-24 relative border-t border-[var(--v2-line)] py-24 sm:py-32 overflow-hidden">
        <div className="v2-glow absolute inset-0 rotate-180" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <Kicker fig="08">your turn</Kicker>
            <h2 className="v2-serif mt-5 text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] font-medium">
              See yours.
              <span className="block italic font-light text-[var(--v2-cream-dim)]">
                Before you pay a dollar.
              </span>
            </h2>
            <ul className="mt-8 space-y-3 text-[15px] text-[var(--v2-cream-dim)]">
              {[
                'First draft in your inbox — within the hour',
                'No credit card, no sales call',
                'One follow-up email, then silence',
              ].map((line) => (
                <li key={line} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--v2-lume)]" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.12}>
            <LeadForm />
          </Reveal>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-[var(--v2-line)] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:px-8 sm:flex-row">
          <div className="flex items-baseline gap-2">
            <span className="v2-serif text-lg font-semibold">Seaway Sites</span>
            <span className="v2-mono text-[9px] text-[var(--v2-cream-faint)]">
              this page is our own preview
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-[var(--v2-cream-dim)]" aria-label="Footer">
            <a href="/" className="hover:text-[var(--v2-cream)] transition-colors">Classic site</a>
            <a href="/showcase" className="hover:text-[var(--v2-cream)] transition-colors">Showcase</a>
            <a href="/privacy" className="hover:text-[var(--v2-cream)] transition-colors">Privacy</a>
          </nav>
          <div className="v2-mono text-[9px] text-[var(--v2-cream-faint)]">
            © {new Date().getFullYear()} · made in canada
          </div>
        </div>
      </footer>
    </div>
  );
}

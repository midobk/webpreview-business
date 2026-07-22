'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, useScroll, useSpring } from 'motion/react';
import MagneticButton from '@/components/motion/MagneticButton';
import CountUp from '@/components/motion/CountUp';
import BeforeAfter from './BeforeAfter';
import LeadForm from './LeadForm';
import ProductionProcess from './ProductionProcess';
import { FAQS, PRICING } from './content';

const ease = [0.16, 1, 0.3, 1] as const;

const ProductionDemo = dynamic(() => import('./ProductionDemo'), {
  loading: () => (
    <div
      className="v2lb-frame flex min-h-[390px] items-center justify-center px-6 text-center sm:min-h-[460px]"
      role="status"
    >
      <span className="v2-mono text-[10px] text-[var(--v2-cream-faint)]">
        Preparing the production demo…
      </span>
    </div>
  ),
});

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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--v2-lume)"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

const TRADES = [
  'Plumbers',
  'Salons',
  'Cafés',
  'Landscapers',
  'Electricians',
  'Cleaners',
  'Auto shops',
  'Barbers',
  'Roofers',
  'Bakeries',
  'Movers',
  'Photographers',
  'Contractors',
  'Groomers',
  'Caterers',
  'HVAC techs',
];

const STATS: { value: string; prefix?: string; label: string }[] = [
  { value: '60min', label: 'target for most eligible first drafts' },
  { value: '0', prefix: '$', label: 'until you approve the direction' },
  { value: '9', label: 'production steps before delivery' },
  { value: '100%', label: 'responsive by default' },
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
      "My shop's old site still had my ex-wife's cell number on it. Seaway Sites built a new one in my coffee break, and I got three bookings the first week. Working with a Canadian business mattered to me.",
    name: 'Dave R.',
    role: 'North Hill Auto · Calgary, AB',
  },
];

const COPY_LINES = [
  'Family-run since 2009. Licensed & insured in Ontario.',
  'Same-week appointments — evenings too.',
  'Rated 4.9 stars by the neighbours you plow out.',
  'Free estimates. Honest timelines. No surprises.',
];

function Typewriter({ lines }: { lines: string[] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [lineIndex, setLineIndex] = useState(0);
  const [characters, setCharacters] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    const line = lines[lineIndex];
    if (characters < line.length) {
      const timer = setTimeout(() => setCharacters((value) => value + 1), 34);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setCharacters(0);
      setLineIndex((index) => (index + 1) % lines.length);
    }, 2400);
    return () => clearTimeout(timer);
  }, [characters, lineIndex, lines, reduce, inView]);

  return (
    <span ref={ref} className="grid font-mono text-sm text-[var(--v2-cream)]">
      {lines.map((line) => (
        <span key={line} className="invisible [grid-area:1/1]" aria-hidden="true">
          {line}
          <span className="inline-block w-[0.55em]" />
        </span>
      ))}
      <span className="[grid-area:1/1]">
        {reduce ? (
          lines[0]
        ) : (
          <>
            {lines[lineIndex].slice(0, characters)}
            <span className="v2-caret" aria-hidden="true" />
          </>
        )}
      </span>
    </span>
  );
}

function MobileCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let primaryVisible = true;
    let formVisible = false;
    const update = () => setShow(!primaryVisible && !formVisible);

    const primary = document.getElementById('hero-primary-cta');
    const form = document.getElementById('preview');
    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (entry.target === primary) primaryVisible = entry.isIntersecting;
                if (entry.target === form) formVisible = entry.isIntersecting;
              }
              update();
            },
            { threshold: 0.15 }
          )
        : null;

    if (primary && observer) observer.observe(primary);
    if (form && observer) observer.observe(form);

    return () => {
      observer?.disconnect();
    };
  }, []);

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-50 px-5 pt-10 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] transition-[transform,opacity] duration-300 motion-reduce:transition-none ${
        show ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
      style={{ background: 'linear-gradient(to top, rgba(10,12,15,0.92) 55%, transparent)' }}
      aria-hidden={!show}
    >
      <a
        href="#preview"
        onClick={() => {
          requestAnimationFrame(() => {
            document.getElementById('preview-heading')?.focus({ preventScroll: true });
          });
        }}
        tabIndex={show ? 0 : -1}
        className="v2-btn v2-btn-primary w-full justify-center !py-3.5 text-[15px] shadow-[0_10px_40px_-8px_rgba(205,244,99,0.45)]"
      >
        Request my free preview
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </a>
    </div>
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

export default function V2Landing() {
  const scrolled = useHeaderScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  return (
    <div className="v2-root relative min-h-screen overflow-x-clip">
      <a href="#main-content" className="v2-skip-link">Skip to main content</a>
      <motion.div
        className="fixed top-0 left-0 right-0 z-[70] h-[2px] origin-left bg-[var(--v2-lume)]"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />
      <div className="v2-grain" aria-hidden="true" />
      <MobileCta />

      <header className={`v2-header fixed inset-x-0 top-0 z-50 ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex items-center justify-between py-4">
            <a href="#top" className="flex items-baseline gap-2">
              <span className="v2-serif text-xl font-semibold tracking-tight">Seaway Sites</span>
              <span className="v2-mono text-[9px] text-[var(--v2-lume)]">the drafting table</span>
            </a>
            <div className="flex items-center gap-3">
              <nav
                className="hidden items-center gap-7 text-sm text-[var(--v2-cream-dim)] md:flex"
                aria-label="Page sections"
              >
                <a href="#proof" className="transition-colors hover:text-[var(--v2-cream)]">Proof</a>
                <a href="#process" className="transition-colors hover:text-[var(--v2-cream)]">Process</a>
                <a href="#pricing" className="transition-colors hover:text-[var(--v2-cream)]">Pricing</a>
                <a href="#faq" className="transition-colors hover:text-[var(--v2-cream)]">FAQ</a>
                <a href="/showcase" className="transition-colors hover:text-[var(--v2-cream)]">Showcase</a>
              </nav>
              <a href="#preview" className="v2-btn v2-btn-primary !px-4 !py-2 text-sm">
                Free preview
              </a>
              <button
                type="button"
                className="v2-menu-button inline-flex md:hidden"
                aria-expanded={menuOpen}
                aria-controls="mobile-page-nav"
                aria-label={menuOpen ? 'Close page menu' : 'Open page menu'}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
              </button>
            </div>
          </div>
          <nav
            id="mobile-page-nav"
            aria-label="Page sections"
            className={`${menuOpen ? 'grid' : 'hidden'} gap-1 border-t border-[var(--v2-line)] pb-4 pt-3 md:hidden`}
          >
            {[
              ['#proof', 'Proof'],
              ['#process', 'Process'],
              ['#pricing', 'Pricing'],
              ['#faq', 'FAQ'],
              ['/showcase', 'Showcase'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-lg px-3 py-2 text-sm text-[var(--v2-cream-dim)] hover:bg-[rgba(239,234,224,0.06)] hover:text-[var(--v2-cream)]"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="outline-none">
      <section id="top" className="relative pb-20 pt-28 sm:pb-28 sm:pt-32">
        <div className="v2-blueprint absolute inset-0" aria-hidden="true" />
        <div className="v2-glow absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
              }}
              className="v2-mono flex items-center gap-3 text-[10px] text-[var(--v2-cream-faint)]"
            >
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[var(--v2-lume)]" aria-hidden="true" />
              websites for canadian small businesses · researched, designed and delivered fast
            </motion.div>

            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 22 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
              }}
              className="v2-serif v2-display mt-5 max-w-4xl"
            >
              Your website
              <br />
              already exists.
              <span className="block italic font-light text-[var(--v2-cream-dim)]">
                We just haven&apos;t shown it to you yet.
              </span>
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
              }}
              className="mt-5 max-w-xl text-base leading-relaxed text-[var(--v2-cream-dim)] sm:text-lg"
            >
              Tell us about your business. We study the public details, shape the message,
              design the page and quality-check the result. Most eligible requests receive a
              personalized first draft within the hour — free.
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
              }}
              className="mt-6 flex flex-wrap items-center gap-4"
            >
              <span id="hero-primary-cta" className="inline-flex">
                <MagneticButton href="#preview" className="v2-btn v2-btn-primary">
                  Request my free preview
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </MagneticButton>
              </span>
              <a href="#process" className="v2-btn v2-btn-ghost">See the process ↓</a>
            </motion.div>

            <motion.p
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.6, delay: 0.2 } },
              }}
              className="mt-2 max-w-xl text-xs leading-relaxed text-[var(--v2-cream-faint)]"
            >
              Within-hour delivery applies to most eligible requests submitted with complete
              details during service hours and depends on current request volume.
            </motion.p>
          </motion.div>

          <div className="mt-10 grid gap-8 sm:mt-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)] lg:items-start">
            <motion.div
              initial={{ opacity: 0, y: 44 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.45 }}
              className="order-2 min-w-0 lg:order-1"
            >
              <div className="v2-mono mb-3 text-[10px] text-[var(--v2-cream-faint)]">
                fig. 01 — illustrative Seaway Sites production demo
              </div>
              <p className="v2-mono mb-3 text-[9px] text-[var(--v2-cream-faint)]">
                Example businesses, phone numbers and review counts are placeholders.
              </p>
              <ProductionDemo />
            </motion.div>

            <motion.aside
              id="preview"
              aria-labelledby="preview-heading"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.3 }}
              className="relative order-1 min-w-0 scroll-mt-24 lg:order-2 lg:sticky lg:top-28"
            >
              <span id="request-preview" className="absolute -top-24" aria-hidden="true" />
              <div className="mb-5">
                <div className="v2-mono text-[10px] text-[var(--v2-lume)]">
                  fig. 01·b — start here
                </div>
                <h2
                  id="preview-heading"
                  tabIndex={-1}
                  className="v2-serif mt-3 text-3xl font-medium leading-tight outline-none"
                >
                  Start with the essentials.
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--v2-cream-dim)]">
                  Two required fields. About 60 seconds. We&apos;ll prepare a personalized first
                  direction for your business.
                </p>
                <ul className="mt-4 grid gap-2 text-xs text-[var(--v2-cream-dim)] sm:grid-cols-2 lg:grid-cols-1">
                  {[
                    'Free personalized preview',
                    'No credit card or sales call',
                    'One follow-up, ever',
                  ].map((line) => (
                    <li key={line} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--v2-lume)]" aria-hidden="true" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
              <LeadForm />
            </motion.aside>
          </div>
        </div>
      </section>

      <section
        className="v2-marquee overflow-hidden border-y border-[var(--v2-line)] py-5"
        aria-label="Industries we build for"
      >
        <div className="v2-marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {TRADES.map((trade) => (
                <span
                  key={`${copy}-${trade}`}
                  className="v2-mono flex items-center text-[11px] text-[var(--v2-cream-faint)]"
                >
                  <span className="px-6">{trade}</span>
                  <span className="text-[var(--v2-lume)]">✳</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section id="proof" className="scroll-mt-24 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <Kicker fig="02">the argument</Kicker>
            <h2 className="v2-serif v2-h2 mt-5 max-w-3xl">
              Most small-business websites were built once —{' '}
              <em className="font-light">and abandoned twice.</em>
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--v2-cream-dim)] sm:text-base">
              Drag the handle. The left side is the site customers find today. The right side is
              the personalized first direction we could prepare — ready to refine into a finished
              website after you approve it.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-12">
            <BeforeAfter />
          </Reveal>
        </div>
      </section>

      <section id="process" className="scroll-mt-24 border-t border-[var(--v2-line)] py-24 sm:py-32">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="self-start lg:sticky lg:top-32">
            <Reveal>
              <Kicker fig="03">the process</Kicker>
              <h2 className="v2-serif v2-h2 mt-5">
                From details to direction.
                <br />
                <em className="font-light">Most eligible within the hour.</em>
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--v2-cream-dim)] sm:text-base">
                The speed comes from a carefully built production workflow: research, page
                planning, messaging, design, responsive preparation and delivery checks working
                as one coordinated service.
              </p>
            </Reveal>
          </div>
          <ProductionProcess />
        </div>
      </section>

      <section className="border-t border-[var(--v2-line)] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <Kicker fig="04">the details</Kicker>
            <h2 className="v2-serif v2-h2 mt-5 max-w-2xl">
              Small site. <em className="font-light">Zero corners cut.</em>
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            <Reveal className="lg:col-span-3">
              <div className="v2-bento-cell v2-card h-full p-7">
                <div className="v2-mono text-[9px] text-[var(--v2-cream-faint)]">04·a</div>
                <h3 className="v2-serif mt-3 text-xl font-medium">Copy that sounds like your business</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--v2-cream-dim)]">
                  We use your listings, reviews, services and description to shape clear,
                  specific language — not a generic template with the name swapped out.
                </p>
                <div className="mt-6 rounded-xl border border-[var(--v2-line)] bg-[rgba(239,234,224,0.03)] p-4">
                  <Typewriter lines={COPY_LINES} />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.05} className="lg:col-span-3">
              <div className="v2-bento-cell v2-card h-full overflow-hidden p-7">
                <div className="v2-mono text-[9px] text-[var(--v2-cream-faint)]">04·b</div>
                <h3 className="v2-serif mt-3 text-xl font-medium">Mobile-first, always</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--v2-cream-dim)]">
                  Your customers book from a phone in a parking lot, not a desktop in an office.
                  We design for that moment first.
                </p>
                <div className="relative mt-4 flex justify-center">
                  <div className="v2-phone w-28 rounded-[18px] border border-[var(--v2-line-strong)] bg-[var(--v2-ink-2)] p-1.5 shadow-2xl">
                    <div className="rounded-[13px] bg-[#f7f5ef] p-2">
                      <div className="h-1.5 w-10 rounded bg-[#12271c]" />
                      <div className="mt-2 h-2 w-16 rounded bg-[#181613]/80" />
                      <div className="mt-1 h-1.5 w-12 rounded bg-[#181613]/30" />
                      <div className="mt-2 h-4 w-14 rounded-full bg-[#2c7a53]" />
                      <div className="mt-2 grid grid-cols-2 gap-1">
                        <div className="h-6 rounded border border-[#181613]/10 bg-white" />
                        <div className="h-6 rounded border border-[#181613]/10 bg-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="lg:col-span-2">
              <div className="v2-bento-cell v2-card h-full p-7">
                <div className="v2-mono text-[9px] text-[var(--v2-cream-faint)]">04·c</div>
                <div className="relative mt-4 flex h-16 items-center justify-center">
                  <span className="v2-ping absolute h-10 w-10 rounded-full border border-[var(--v2-lume)]" aria-hidden="true" />
                  <span className="v2-ping v2-ping-late absolute h-10 w-10 rounded-full border border-[var(--v2-lume)]" aria-hidden="true" />
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--v2-lume)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="relative h-7 w-7" aria-hidden="true">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <h3 className="v2-serif mt-4 text-lg font-medium">Ready for local search</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--v2-cream-dim)]">
                  Your town, trade, hours and services are structured clearly for customers and search engines.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15} className="lg:col-span-2">
              <div className="v2-bento-cell v2-card h-full p-7">
                <div className="v2-mono text-[9px] text-[var(--v2-cream-faint)]">04·d</div>
                <div className="mt-4 flex h-16 items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--v2-lume)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">
                    <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z" />
                    <path d="M9 11.5l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="v2-serif mt-4 text-lg font-medium">Canadian and privacy-conscious</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--v2-cream-dim)]">
                  Operated by a Canadian business, with privacy-conscious infrastructure and clear data-handling information.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2} className="lg:col-span-2">
              <div className="v2-bento-cell v2-card h-full p-7">
                <div className="v2-mono text-[9px] text-[var(--v2-cream-faint)]">04·e</div>
                <div className="mt-4 flex h-16 items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--v2-lume)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">
                    <circle cx="8" cy="14" r="4" />
                    <path d="M10.8 11.2L20 2m-4 2l2 2m-5 1l2 2" />
                  </svg>
                </div>
                <h3 className="v2-serif mt-4 text-lg font-medium">Clear ownership</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--v2-cream-dim)]">
                  You own your domain, content, branding and customer data. Choose managed service or a full source-file handoff.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--v2-line)]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 px-5 sm:px-8 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={`px-4 py-10 sm:py-14 ${index > 0 ? 'lg:border-l lg:border-[var(--v2-line)]' : ''} ${
                index % 2 === 1 ? 'border-l border-[var(--v2-line)] lg:border-l' : ''
              }`}
            >
              <CountUp
                to={stat.value}
                prefix={stat.prefix}
                className="v2-serif block text-3xl font-medium tabular-nums text-[var(--v2-lume)] sm:text-5xl"
              />
              <div className="mt-2 text-xs text-[var(--v2-cream-dim)] sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="scroll-mt-24 border-t border-[var(--v2-line)] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <Kicker fig="05">the money part</Kicker>
            <h2 className="v2-serif v2-h2 mt-5 max-w-2xl">
              Choose how you want to keep it.
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--v2-cream-dim)] sm:text-base">
              Start with one free personalized draft. Then choose a managed service with a lower upfront cost, or pay once and take the source files with you.
            </p>
          </Reveal>

          <div className="mt-12 grid items-stretch gap-4 md:grid-cols-3">
            {PRICING.map((tier, index) => (
              <Reveal key={tier.name} delay={index * 0.06} className="h-full">
                <div className={`v2-card relative flex h-full flex-col p-7 ${tier.featured ? 'v2-card-featured' : ''}`}>
                  {tier.featured && (
                    <span className="v2-mono absolute -top-3 left-6 rounded-full bg-[var(--v2-lume)] px-3 py-1 text-[9px] font-bold text-[#0c0f08]">
                      early-client pricing
                    </span>
                  )}
                  <div className="v2-mono text-[10px] text-[var(--v2-cream-faint)]">{tier.name}</div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="v2-serif text-4xl font-medium">{tier.price}</span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--v2-cream-faint)]">{tier.cadence}</div>
                  <p className="mt-4 text-sm leading-relaxed text-[var(--v2-cream-dim)]">{tier.blurb}</p>
                  <ul className="mt-5 space-y-2.5 text-sm text-[var(--v2-cream-dim)]">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-2.5">
                        <CheckIcon />
                        {feature}
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
            All prices CAD. Third-party domain, email or specialist-service costs are shown before purchase.
          </p>
        </div>
      </section>

      <section className="border-t border-[var(--v2-line)] py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <Kicker fig="06">sample stories</Kicker>
            <h2 className="v2-serif v2-h2 mt-5 max-w-2xl">
              From people who <em className="font-light">fix pipes, not pixels.</em>
            </h2>
            <p className="mt-4 max-w-xl text-xs leading-relaxed text-[var(--v2-cream-faint)]">
              Illustrative composite stories for the service brief — verified founding-client
              stories will replace these as launches happen.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial, index) => (
              <Reveal key={testimonial.name} delay={index * 0.08} className="h-full">
                <figure className="v2-card flex h-full flex-col p-7">
                  <div className="text-[var(--v2-lume)]" aria-hidden="true">★★★★★</div>
                  <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-[var(--v2-cream-dim)]">
                    “{testimonial.quote}”
                  </blockquote>
                  <figcaption className="mt-6">
                    <div className="text-sm font-semibold">{testimonial.name}</div>
                    <div className="v2-mono mt-1 text-[9px] text-[var(--v2-cream-faint)]">{testimonial.role}</div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.12} className="mt-8">
            <div className="v2-card relative overflow-hidden p-8 sm:p-10">
              <div className="v2-glow absolute inset-0 opacity-40" aria-hidden="true" />
              <div className="relative grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="v2-mono text-[10px] text-[var(--v2-lume)]">founding-client invitation</div>
                  <h3 className="v2-serif mt-3 text-2xl font-medium sm:text-3xl">
                    Help shape a better website service for Canadian small businesses.
                  </h3>
                  <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--v2-cream-dim)]">
                    We&apos;re inviting an initial group of businesses to launch on early-client pricing. Exact package terms are confirmed before work begins; you&apos;ll receive direct onboarding and careful support while the service grows around real business needs.
                  </p>
                </div>
                <a href="#preview" className="v2-btn v2-btn-primary justify-center whitespace-nowrap">
                  Request an early-client draft
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 border-t border-[var(--v2-line)] py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Reveal>
            <Kicker fig="07">fine print, large type</Kicker>
            <h2 className="v2-serif v2-h2 mt-5">Fair questions.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="v2-faq mt-10 border-t border-[var(--v2-line)]">
              {FAQS.map((item) => (
                <details key={item.q} className="group">
                  <summary className="flex items-center justify-between gap-6 py-6">
                    <span className="v2-serif text-lg font-medium sm:text-xl">{item.q}</span>
                    <span className="v2-faq-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--v2-line-strong)] text-[var(--v2-lume)]" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>
                  <p className="pb-7 pr-14 text-[15px] leading-relaxed text-[var(--v2-cream-dim)]">{item.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-[var(--v2-line)] py-24 sm:py-32">
        <div className="v2-glow absolute inset-0 rotate-180" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <Reveal className="flex flex-col items-center">
            <Kicker fig="08">your turn</Kicker>
            <h2 className="v2-serif mt-5 text-[clamp(2.6rem,6vw,5rem)] font-medium leading-[0.98]">
              Ready when you are.
              <span className="block italic font-light text-[var(--v2-cream-dim)]">
                Your free preview starts above.
              </span>
            </h2>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--v2-cream-dim)] sm:text-base">
              Share the business name and your email. We&apos;ll do the research, shape the first
              direction and send it to your inbox — free.
            </p>
            <a href="#preview" className="v2-btn v2-btn-primary mt-8">
              Request my free preview ↑
            </a>
          </Reveal>
        </div>
      </section>

      </main>

      <footer className="border-t border-[var(--v2-line)] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:flex-row sm:px-8">
          <div className="flex items-baseline gap-2">
            <span className="v2-serif text-lg font-semibold">Seaway Sites</span>
            <span className="v2-mono text-[9px] text-[var(--v2-cream-faint)]">this page is our own preview</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-[var(--v2-cream-dim)]" aria-label="Footer">
            <a href="mailto:mehdi@seawaysites.com" className="transition-colors hover:text-[var(--v2-cream)]">Contact</a>
            <a href="/showcase" className="transition-colors hover:text-[var(--v2-cream)]">Showcase</a>
            <a href="/privacy" className="transition-colors hover:text-[var(--v2-cream)]">Privacy</a>
          </nav>
          <div className="v2-mono text-[9px] text-[var(--v2-cream-faint)]">
            © {new Date().getFullYear()} · made in canada
          </div>
        </div>
      </footer>
    </div>
  );
}

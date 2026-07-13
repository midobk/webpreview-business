'use client';

import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Condensed production demo: the left panel narrates the Seaway     */
/*  Sites production sequence step by step while the right panel      */
/*  assembles the draft in sync — wireframe, then copy, then the      */
/*  visual direction flooding in. The stopwatch counts up to a        */
/*  different finish time per business.                               */
/* ------------------------------------------------------------------ */

type Business = {
  name: string;
  place: string;
  slug: string;
  headline: string;
  sub: string;
  cta: string;
  review: string;
  phone: string;
  accent: string;
  header: string;
  services: [string, string][];
  /** Minutes shown on the stopwatch when this draft wraps. */
  finishAt: number;
};

const BUSINESSES: Business[] = [
  {
    name: 'Maple & Main Plumbing',
    place: 'Kitchener, ON',
    slug: 'maple-main-plumbing',
    headline: 'Fixed right, the first visit.',
    sub: 'Licensed plumbers for Kitchener–Waterloo homes. Same-day emergency service and up-front pricing.',
    cta: 'Book a visit',
    review: '4.9 ★ · 87 Google reviews',
    phone: '(519) 555-0114',
    accent: '#1d5fbf',
    header: '#0e2038',
    services: [
      ['Emergency repair', '24/7 burst-pipe response'],
      ['Water heaters', 'Install, service, replace'],
      ['Reno rough-ins', 'Kitchens and bathrooms'],
    ],
    finishAt: 47,
  },
  {
    name: 'Salon Véra',
    place: 'Halifax, NS',
    slug: 'salon-vera',
    headline: 'Hair that feels like you.',
    sub: 'A calm, one-chair studio in the North End. Cuts, colour and bridal — by appointment.',
    cta: 'Book a chair',
    review: '4.8 ★ · 132 Google reviews',
    phone: '(902) 555-0173',
    accent: '#b5536b',
    header: '#2b1a20',
    services: [
      ['Cut and style', 'Consultation included'],
      ['Colour + balayage', 'Low-ammonia options'],
      ['Bridal', 'Trials and day-of styling'],
    ],
    finishAt: 52,
  },
  {
    name: 'North Fork Café',
    place: 'Squamish, BC',
    slug: 'north-fork-cafe',
    headline: 'Small-batch coffee. Big mornings.',
    sub: 'Roasted in-house, baked before sunrise. Trailhead fuel since 2019.',
    cta: 'See the menu',
    review: '5.0 ★ · 64 Google reviews',
    phone: '(604) 555-0138',
    accent: '#8a5a2b',
    header: '#241a10',
    services: [
      ['Espresso bar', 'Single-origin rotation'],
      ['Fresh bakes', 'Daily before 7am'],
      ['Catering', 'Boxes for crews'],
    ],
    finishAt: 41,
  },
];

const WORK_STEPS = [
  'request received and details checked',
  'public listings and service area reviewed',
  'customer language identified from reviews',
  'primary conversion goal selected',
  'page architecture and section order planned',
  'website copy and visual direction prepared',
  'mobile and desktop layouts checked',
  'contact paths and local-search structure verified',
  'production review complete — draft ready',
];

const STEP_MS = 820;
const DONE_MS = 3000;
const LAST_STEP = WORK_STEPS.length - 1;

/* Right-panel build phases, keyed to the sequence steps:
   wireframe once the page architecture is planned, real copy once the
   copy is prepared, palette once the visual/layout pass lands. */
const WIRE_AT = 3;
const CONTENT_AT = 5;
const PAINT_AT = 6;

/** Stopwatch: counts up smoothly and lands exactly on the business's
 *  finish minute as the sequence completes; holds there while done. */
function useStopwatch(step: number, business: Business, running: boolean) {
  const totalSeconds = business.finishAt * 60;
  const [seconds, setSeconds] = useState(step === LAST_STEP ? totalSeconds : 0);

  useEffect(() => {
    if (step === LAST_STEP) {
      setSeconds(totalSeconds);
      return;
    }
    if (step === 0) setSeconds(0);
    if (!running) return;
    const activeMs = LAST_STEP * STEP_MS;
    const perTick = (totalSeconds / activeMs) * 100;
    const timer = setInterval(() => {
      setSeconds((value) => Math.min(totalSeconds, value + perTick));
    }, 100);
    return () => clearInterval(timer);
  }, [step, totalSeconds, running]);

  const whole = Math.floor(seconds);
  const mm = String(Math.floor(whole / 60)).padStart(2, '0');
  const ss = String(whole % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function ProductionDemo() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(rootRef, { amount: 0.25 });
  const reduceMotion = useReducedMotion();
  const [businessIndex, setBusinessIndex] = useState(0);
  const [step, setStep] = useState(reduceMotion ? LAST_STEP : 0);
  const business = BUSINESSES[businessIndex];

  useEffect(() => {
    if (!inView) return;

    if (reduceMotion) {
      // Land on the finished draft first, then rotate businesses slowly.
      if (step !== LAST_STEP) {
        setStep(LAST_STEP);
        return;
      }
      const rotate = setTimeout(
        () => setBusinessIndex((index) => (index + 1) % BUSINESSES.length),
        6500
      );
      return () => clearTimeout(rotate);
    }

    const atEnd = step === LAST_STEP;
    const timer = setTimeout(() => {
      if (atEnd) {
        setBusinessIndex((index) => (index + 1) % BUSINESSES.length);
        setStep(0);
      } else {
        setStep((current) => current + 1);
      }
    }, atEnd ? DONE_MS : STEP_MS);

    return () => clearTimeout(timer);
  }, [inView, reduceMotion, step, businessIndex]);

  const clock = useStopwatch(step, business, inView && !reduceMotion);

  const visibleSteps = useMemo(() => {
    const start = Math.max(0, step - 3);
    return WORK_STEPS.slice(start, step + 1).map((label, offset) => ({
      label,
      index: start + offset,
    }));
  }, [step]);

  return (
    <div ref={rootRef} className="relative">
      <div className="overflow-hidden rounded-2xl border border-[var(--v2-line-strong)] bg-[var(--v2-ink-2)] shadow-[0_40px_120px_-45px_rgba(0,0,0,0.95)]">
        <div className="flex items-center gap-3 border-b border-[var(--v2-line)] px-4 py-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#3a3f4a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3a3f4a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#3a3f4a]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mx-auto max-w-[310px] truncate rounded-md border border-[var(--v2-line)] bg-[rgba(239,234,224,0.05)] px-3 py-1 text-center font-mono text-[10px] text-[var(--v2-cream-dim)] sm:text-[11px]">
              seawaysites.com/preview/{business.slug}
            </div>
          </div>
          <div
            className="v2-mono shrink-0 text-[10px] tabular-nums text-[var(--v2-lume)]"
            aria-label={`Condensed production timeline: ${clock}`}
          >
            {clock}
          </div>
        </div>

        <div className="grid aspect-[4/3] grid-cols-[0.9fr_1.1fr] sm:aspect-[16/10] sm:grid-cols-[0.72fr_1.28fr]">
          {/* Left — production sequence (decorative loop; not aria-live so
              it never queues screen-reader announcements) */}
          <div className="flex min-w-0 flex-col border-r border-[var(--v2-line)] bg-[rgba(10,12,15,0.7)] p-3 sm:p-5">
            <div className="v2-mono text-[8px] uppercase tracking-[0.16em] text-[var(--v2-cream-faint)] sm:text-[9px]">
              production sequence
            </div>
            <div className="mt-2 truncate text-[10px] font-medium text-[var(--v2-cream)] sm:text-xs">
              {business.name}
            </div>
            <div className="v2-mono mt-0.5 text-[8px] text-[var(--v2-cream-faint)] sm:text-[9px]">
              {business.place}
            </div>

            <div className="mt-4 flex-1 space-y-2 overflow-hidden">
              <AnimatePresence initial={false} mode="popLayout">
                {visibleSteps.map((item) => (
                  <motion.div
                    key={`${business.slug}-${item.index}`}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-start gap-2"
                  >
                    <span
                      className={`mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full ${
                        item.index < step
                          ? 'bg-[var(--v2-cream-faint)]'
                          : 'bg-[var(--v2-lume)] shadow-[0_0_12px_rgba(205,244,99,0.6)]'
                      }`}
                    />
                    <span
                      className={`font-mono text-[7.5px] leading-snug sm:text-[9px] ${
                        item.index === step
                          ? 'text-[var(--v2-cream)]'
                          : 'text-[var(--v2-cream-faint)]'
                      }`}
                    >
                      {item.index < step ? '✓ ' : '› '}
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-1.5 text-center font-mono text-[7px] text-[var(--v2-cream-faint)] sm:text-[8px]">
              {['research', 'copy', 'responsive', 'quality'].map((label, index) => (
                <div
                  key={label}
                  className={`rounded border px-1 py-1 ${
                    step >= index * 2
                      ? 'border-[rgba(205,244,99,0.28)] bg-[rgba(205,244,99,0.06)] text-[var(--v2-lume)]'
                      : 'border-[var(--v2-line)]'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Right — the draft assembling in sync with the sequence:
              research overlay → wireframe → copy → visual direction. */}
          <div
            className="v2lb-site relative min-w-0"
            data-wire={step >= WIRE_AT ? '' : undefined}
            data-content={step >= CONTENT_AT ? '' : undefined}
            data-paint={step >= PAINT_AT ? '' : undefined}
            style={{ '--acc': business.accent, '--accd': business.header } as React.CSSProperties}
          >
            {/* Research overlay while the sequence is still reading */}
            <AnimatePresence>
              {step < WIRE_AT && (
                <motion.div
                  key={`${business.slug}-scan`}
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 px-4 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="v2-mono text-[8px] text-[var(--v2-cream-faint)] sm:text-[10px]">
                    new request
                  </div>
                  <div className="font-mono text-[10px] text-[var(--v2-cream)] sm:text-sm">
                    {business.name} — {business.place}
                    <span className="v2-caret" aria-hidden="true" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Wireframe skeleton layer */}
            <div className="v2lb-skel flex flex-col gap-[4%]" aria-hidden="true">
              <div className="v2lb-box h-[9%]" style={{ transitionDelay: '0ms' }} />
              <div className="v2lb-box h-[16%] w-[64%]" style={{ transitionDelay: '110ms' }} />
              <div className="v2lb-box h-[8%] w-[42%]" style={{ transitionDelay: '220ms' }} />
              <div className="flex flex-1 gap-[4%]">
                <div className="v2lb-box flex-1" style={{ transitionDelay: '330ms' }} />
                <div className="v2lb-box flex-1" style={{ transitionDelay: '400ms' }} />
                <div className="v2lb-box flex-1" style={{ transitionDelay: '470ms' }} />
              </div>
              <div className="v2lb-box h-[9%]" style={{ transitionDelay: '560ms' }} />
            </div>

            {/* Real draft layer — neutral until the visual direction lands */}
            <div className="v2lb-real text-left" aria-hidden={step < CONTENT_AT}>
              <div
                className="v2lb-pop flex items-center justify-between px-[5%] py-[3%]"
                style={{ background: 'var(--site-head-bg)', color: 'var(--site-head-fg)' }}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-sm sm:h-3.5 sm:w-3.5"
                    style={{ background: 'var(--site-acc)' }}
                  />
                  <span className="truncate text-[8px] font-semibold tracking-wide sm:text-xs">
                    {business.name}
                  </span>
                </div>
                <span
                  className="hidden rounded-full px-2.5 py-1 text-[8px] font-semibold sm:inline-flex sm:text-[9px]"
                  style={{ background: 'var(--site-cta-bg)', color: 'var(--site-cta-fg)' }}
                >
                  {business.cta}
                </span>
              </div>

              <div className="v2lb-pop px-[5%] pt-[4%]">
                <div className="v2-serif text-[clamp(0.8rem,2.6vw,1.65rem)] font-semibold leading-tight">
                  {business.headline}
                </div>
                <p
                  className="mt-1.5 max-w-[88%] text-[7.5px] leading-snug sm:text-[10px]"
                  style={{ color: 'var(--site-fg-dim)' }}
                >
                  {business.sub}
                </p>
                <div className="mt-2.5 flex items-center gap-2 sm:gap-3">
                  <span
                    className="inline-flex rounded-full px-2.5 py-1 text-[7.5px] font-semibold sm:px-3 sm:py-1.5 sm:text-[9px]"
                    style={{ background: 'var(--site-cta-bg)', color: 'var(--site-cta-fg)' }}
                  >
                    {business.cta}
                  </span>
                  <span className="truncate text-[6.5px] sm:text-[8.5px]" style={{ color: 'var(--site-fg-dim)' }}>
                    {business.review}
                  </span>
                </div>
              </div>

              <div className="v2lb-pop grid flex-1 grid-cols-3 content-start items-start gap-[3%] px-[5%] pt-[4%]">
                {business.services.map(([title, line]) => (
                  <div
                    key={title}
                    className="flex min-h-0 flex-col gap-1 rounded-md border p-1.5 sm:rounded-lg sm:p-2.5"
                    style={{ background: 'var(--site-card)', borderColor: 'var(--site-card-line)' }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2"
                      style={{ background: 'var(--site-acc)' }}
                    />
                    <span className="text-[6.5px] font-semibold leading-tight sm:text-[9px]">{title}</span>
                    <span className="text-[5.5px] leading-tight sm:text-[7.5px]" style={{ color: 'var(--site-fg-dim)' }}>
                      {line}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="v2lb-pop mt-auto flex items-center justify-between px-[5%] py-[2.5%] text-[6.5px] sm:text-[8px]"
                style={{ background: 'var(--site-head-bg)', color: 'var(--site-head-fg)' }}
              >
                <span className="truncate">
                  {business.name} · {business.place}
                </span>
                <span className="opacity-80">{business.phone}</span>
              </div>
            </div>

            {/* Visual-direction sweep when the palette lands */}
            <div className="v2lb-sweep" aria-hidden="true" />

            {/* Ready stamp */}
            <AnimatePresence>
              {step === LAST_STEP && (
                <motion.div
                  key={`${business.slug}-stamp`}
                  className="absolute bottom-12 right-3 z-20 sm:bottom-14 sm:right-4"
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.5, rotate: 4 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: -6 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                >
                  <span className="v2-mono inline-block rounded border-2 border-[var(--v2-lume)] bg-[rgba(10,12,15,0.55)] px-2 py-0.5 text-[8px] text-[var(--v2-lume)] backdrop-blur-sm sm:px-2.5 sm:py-1 sm:text-[9px]">
                    draft 01 · ready
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 px-1">
        <div className="truncate font-mono text-[10px] text-[var(--v2-cream-dim)]" aria-hidden="true">
          » {WORK_STEPS[step]}
        </div>
        <div className="v2-mono hidden shrink-0 text-[9px] text-[var(--v2-cream-faint)] sm:block">
          condensed view · typical eligible request
        </div>
      </div>
    </div>
  );
}

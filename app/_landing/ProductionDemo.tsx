'use client';

import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

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

const STEP_MS = 780;
const DONE_MS = 2600;

function clockFor(step: number) {
  const progress = step / (WORK_STEPS.length - 1);
  const minutes = Math.round(progress * 59);
  return `${String(minutes).padStart(2, '0')}:00`;
}

export default function ProductionDemo() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(rootRef, { amount: 0.25 });
  const reduceMotion = useReducedMotion();
  const [businessIndex, setBusinessIndex] = useState(0);
  const [step, setStep] = useState(reduceMotion ? WORK_STEPS.length - 1 : 0);
  const business = BUSINESSES[businessIndex];

  useEffect(() => {
    if (!inView) return;

    if (reduceMotion) {
      setStep(WORK_STEPS.length - 1);
      const rotate = setTimeout(
        () => setBusinessIndex((index) => (index + 1) % BUSINESSES.length),
        6500
      );
      return () => clearTimeout(rotate);
    }

    const atEnd = step === WORK_STEPS.length - 1;
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
            aria-label={`Condensed production timeline: ${clockFor(step)}`}
          >
            {clockFor(step)}
          </div>
        </div>

        <div className="grid aspect-[4/3] grid-cols-[0.9fr_1.1fr] sm:aspect-[16/10] sm:grid-cols-[0.72fr_1.28fr]">
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

            <div className="mt-4 flex-1 space-y-2 overflow-hidden" aria-live="polite">
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

          <div className="flex min-w-0 flex-col bg-[#f7f5ef] text-[#181613]">
            <div
              className="flex items-center justify-between px-[5%] py-[3%] text-[#f2efe7]"
              style={{ background: business.header }}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-sm sm:h-3.5 sm:w-3.5"
                  style={{ background: business.accent }}
                />
                <span className="truncate text-[8px] font-semibold tracking-wide sm:text-xs">
                  {business.name}
                </span>
              </div>
              <span
                className="hidden rounded-full px-2.5 py-1 text-[8px] font-semibold text-white sm:inline-flex sm:text-[9px]"
                style={{ background: business.accent }}
              >
                {business.cta}
              </span>
            </div>

            <motion.div
              key={`${business.slug}-hero`}
              initial={{ opacity: 0.45, y: 6 }}
              animate={{ opacity: step >= 3 ? 1 : 0.55, y: 0 }}
              className="px-[5%] pt-[5%]"
            >
              <div className="v2-serif text-[clamp(0.8rem,2.6vw,1.65rem)] font-semibold leading-tight">
                {business.headline}
              </div>
              <p className="mt-1.5 max-w-[88%] text-[7.5px] leading-snug text-[#181613]/60 sm:text-[10px]">
                {business.sub}
              </p>
              <div className="mt-2.5 flex items-center gap-2 sm:gap-3">
                <span
                  className="inline-flex rounded-full px-2.5 py-1 text-[7.5px] font-semibold text-white sm:px-3 sm:py-1.5 sm:text-[9px]"
                  style={{ background: business.accent }}
                >
                  {business.cta}
                </span>
                <span className="truncate text-[6.5px] text-[#181613]/55 sm:text-[8.5px]">
                  {business.review}
                </span>
              </div>
            </motion.div>

            <div className="grid flex-1 grid-cols-3 content-start gap-[3%] px-[5%] pt-[5%]">
              {business.services.map(([title, line], index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: step >= 4 + index ? 1 : 0.3, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex min-h-0 flex-col gap-1 rounded-md border border-[#181613]/10 bg-white p-1.5 sm:rounded-lg sm:p-2.5"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2"
                    style={{ background: business.accent }}
                  />
                  <span className="text-[6.5px] font-semibold leading-tight sm:text-[9px]">
                    {title}
                  </span>
                  <span className="text-[5.5px] leading-tight text-[#181613]/55 sm:text-[7.5px]">
                    {line}
                  </span>
                </motion.div>
              ))}
            </div>

            <div
              className="mt-auto flex items-center justify-between px-[5%] py-[2.5%] text-[6.5px] text-[#f2efe7] sm:text-[8px]"
              style={{ background: business.header }}
            >
              <span className="truncate">{business.name} · {business.place}</span>
              <span className="opacity-80">{business.phone}</span>
            </div>
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

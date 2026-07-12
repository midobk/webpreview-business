'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';

/* ------------------------------------------------------------------ */
/*  The hero demo: a browser frame in which a small-business website  */
/*  assembles itself — scan → wireframe → copy → paint — then cycles  */
/*  to the next business to show that every preview is personalized.  */
/* ------------------------------------------------------------------ */

type Brand = {
  id: string;
  name: string;
  place: string;
  slug: string;
  headline: string;
  sub: string;
  cta: string;
  review: string;
  services: { title: string; line: string }[];
  phone: string;
  acc: string;
  accd: string;
  scanLine: string;
  finishAt: number; // seconds shown on the stopwatch when done
};

const BRANDS: Brand[] = [
  {
    id: 'plumber',
    name: 'Maple & Main Plumbing',
    place: 'Kitchener, ON',
    slug: 'maple-main-plumbing',
    headline: 'Fixed right, the first visit.',
    sub: 'Licensed plumbers for Kitchener–Waterloo homes. Same-day emergency service, up-front pricing.',
    cta: 'Book a visit',
    review: '4.9 ★ · 87 Google reviews',
    services: [
      { title: 'Emergency repair', line: '24/7 burst-pipe response' },
      { title: 'Water heaters', line: 'Install, service, replace' },
      { title: 'Reno rough-ins', line: 'Kitchens & bathrooms' },
    ],
    phone: '(519) 555-0114',
    acc: '#1d5fbf',
    accd: '#0e2038',
    scanLine: 'reading Google listing · 87 reviews found',
    finishAt: 47,
  },
  {
    id: 'salon',
    name: 'Salon Véra',
    place: 'Halifax, NS',
    slug: 'salon-vera',
    headline: 'Hair that feels like you.',
    sub: 'A calm, one-chair studio in the North End. Cuts, colour and bridal — by appointment.',
    cta: 'Book a chair',
    review: '4.8 ★ · 132 Google reviews',
    services: [
      { title: 'Cut & style', line: 'Consult included' },
      { title: 'Colour + balayage', line: 'Ammonia-free options' },
      { title: 'Bridal', line: 'Trials & day-of' },
    ],
    phone: '(902) 555-0173',
    acc: '#b5536b',
    accd: '#2b1a20',
    scanLine: 'reading Instagram + reviews · palette drafted',
    finishAt: 52,
  },
  {
    id: 'cafe',
    name: 'North Fork Café',
    place: 'Squamish, BC',
    slug: 'north-fork-cafe',
    headline: 'Small-batch coffee. Big mornings.',
    sub: 'Roasted in-house, baked before sunrise. Trailhead fuel since 2019.',
    cta: 'See the menu',
    review: '5.0 ★ · 64 Google reviews',
    services: [
      { title: 'Espresso bar', line: 'Single-origin rotation' },
      { title: 'Fresh bakes', line: 'Daily before 7am' },
      { title: 'Catering', line: 'Boxes for crews' },
    ],
    phone: '(604) 555-0138',
    acc: '#8a5a2b',
    accd: '#241a10',
    scanLine: 'reading Yelp + menu photos · tone: warm, outdoorsy',
    finishAt: 41,
  },
];

type Phase = 'scan' | 'wire' | 'content' | 'paint' | 'done';

const PHASE_MS: Record<Phase, number> = {
  scan: 1700,
  wire: 1500,
  content: 1800,
  paint: 1400,
  done: 3400,
};

const NEXT: Record<Phase, Phase> = {
  scan: 'wire',
  wire: 'content',
  content: 'paint',
  paint: 'done',
  done: 'scan',
};

const CONSOLE_LINE: Record<Phase, (b: Brand) => string> = {
  scan: (b) => `» ${b.scanLine}`,
  wire: () => '» drafting layout — one page, five sections',
  content: () => '» writing copy in your voice',
  paint: () => '» applying palette + type',
  done: (b) => `✓ preview ready — 0:${b.finishAt} · sent to your inbox`,
};

/** Stopwatch: compresses the fictional ~50s build into the ~6.4s of
 *  animation, then freezes at the brand's finish time. */
function useStopwatch(phase: Phase, brand: Brand, running: boolean) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    if (phase === 'done') {
      setSec(brand.finishAt);
      return;
    }
    if (phase === 'scan') setSec(0);
    if (!running) return;
    const activeMs = PHASE_MS.scan + PHASE_MS.wire + PHASE_MS.content + PHASE_MS.paint;
    const rate = (brand.finishAt / activeMs) * 1000; // sec per real second
    const t = setInterval(() => {
      setSec((s) => Math.min(brand.finishAt, s + rate / 10));
    }, 100);
    return () => clearInterval(t);
  }, [phase, brand, running]);
  return `0:${String(Math.floor(sec)).padStart(2, '0')}`;
}

export default function LiveBuild() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(rootRef, { amount: 0.25 });

  const [brandIdx, setBrandIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>(reduce ? 'done' : 'scan');
  const brand = BRANDS[brandIdx];

  // Phase machine — paused off-screen so the loop doesn't burn CPU.
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      // Reduced motion: hold the finished site, rotate businesses slowly.
      const t = setTimeout(() => setBrandIdx((i) => (i + 1) % BRANDS.length), 6000);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      if (phase === 'done') setBrandIdx((i) => (i + 1) % BRANDS.length);
      setPhase(NEXT[phase]);
    }, PHASE_MS[phase]);
    return () => clearTimeout(t);
  }, [phase, inView, reduce, brandIdx]);

  const clock = useStopwatch(phase, brand, inView && !reduce);

  const s = useMemo(() => {
    const order: Phase[] = ['scan', 'wire', 'content', 'paint', 'done'];
    return order.indexOf(phase);
  }, [phase]);

  return (
    <div ref={rootRef} className="relative">
      <div className="v2lb-frame overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--v2-line)]">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3a3f4a]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#3a3f4a]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#3a3f4a]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="mx-auto max-w-[280px] truncate rounded-md bg-[rgba(239,234,224,0.06)] border border-[var(--v2-line)] px-3 py-1 text-[11px] text-[var(--v2-cream-dim)] font-mono text-center">
              sitesprint.ca/preview/{brand.slug}
            </div>
          </div>
          <div
            className="v2-mono text-[10px] tabular-nums text-[var(--v2-lume)]"
            aria-label={`Build timer: ${clock}`}
          >
            {clock}
          </div>
        </div>

        {/* Viewport */}
        <div className="v2lb-view aspect-[4/3] sm:aspect-[16/11]">
          <div
            className="v2lb-site absolute inset-0"
            data-wire={s >= 1 ? '' : undefined}
            data-content={s >= 2 ? '' : undefined}
            data-paint={s >= 3 ? '' : undefined}
            style={{ '--acc': brand.acc, '--accd': brand.accd } as React.CSSProperties}
          >
            {/* Scan overlay */}
            <AnimatePresence>
              {phase === 'scan' && (
                <motion.div
                  key="scan"
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="v2-mono text-[10px] text-[var(--v2-cream-faint)]">
                    new request
                  </div>
                  <div className="font-mono text-sm text-[var(--v2-cream)]">
                    {brand.name} — {brand.place}
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
              <div className="flex-1 flex gap-[4%]">
                <div className="v2lb-box flex-1" style={{ transitionDelay: '330ms' }} />
                <div className="v2lb-box flex-1" style={{ transitionDelay: '400ms' }} />
                <div className="v2lb-box flex-1" style={{ transitionDelay: '470ms' }} />
              </div>
              <div className="v2lb-box h-[9%]" style={{ transitionDelay: '560ms' }} />
            </div>

            {/* Real site layer */}
            <div className="v2lb-real text-left" aria-hidden={s < 2}>
              <div
                className="v2lb-pop flex items-center justify-between px-[5%] py-[2.5%]"
                style={{ background: 'var(--site-head-bg)', color: 'var(--site-head-fg)' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-sm shrink-0"
                    style={{ background: 'var(--site-acc)' }}
                  />
                  <span className="text-[11px] sm:text-xs font-semibold tracking-wide truncate">
                    {brand.name}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-[10px] opacity-80">
                  <span>Services</span>
                  <span>Reviews</span>
                  <span>Contact</span>
                </div>
              </div>

              <div className="v2lb-pop px-[5%] pt-[4%]">
                <div className="v2-serif text-[clamp(1rem,3.2vw,1.6rem)] leading-tight font-semibold">
                  {brand.headline}
                </div>
                <p className="mt-1.5 text-[10px] sm:text-[11.5px] leading-snug max-w-[75%]" style={{ color: 'var(--site-fg-dim)' }}>
                  {brand.sub}
                </p>
                <div className="mt-2.5 flex items-center gap-3">
                  <span
                    className="inline-flex rounded-full px-3 py-1.5 text-[10px] font-semibold"
                    style={{ background: 'var(--site-cta-bg)', color: 'var(--site-cta-fg)' }}
                  >
                    {brand.cta}
                  </span>
                  <span className="text-[9.5px]" style={{ color: 'var(--site-fg-dim)' }}>
                    {brand.review}
                  </span>
                </div>
              </div>

              <div className="v2lb-pop flex-1 grid grid-cols-3 gap-[3%] px-[5%] pt-[4%] items-start content-start">
                {brand.services.map((sv) => (
                  <div
                    key={sv.title}
                    className="rounded-lg border p-2.5 flex flex-col gap-1 min-h-0"
                    style={{ background: 'var(--site-card)', borderColor: 'var(--site-card-line)' }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--site-acc)' }} />
                    <span className="text-[9.5px] sm:text-[10.5px] font-semibold leading-tight">
                      {sv.title}
                    </span>
                    <span className="text-[8.5px] leading-tight" style={{ color: 'var(--site-fg-dim)' }}>
                      {sv.line}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className="v2lb-pop mt-[4%] px-[5%] py-[2.5%] flex items-center justify-between text-[9px]"
                style={{ background: 'var(--site-head-bg)', color: 'var(--site-head-fg)' }}
              >
                <span className="truncate">
                  {brand.name} · {brand.place}
                </span>
                <span className="opacity-80">{brand.phone}</span>
              </div>
            </div>

            {/* Paint sweep */}
            <div className="v2lb-sweep" aria-hidden="true" />

            {/* Ready stamp */}
            <AnimatePresence>
              {phase === 'done' && (
                <motion.div
                  key="stamp"
                  className="absolute bottom-14 right-4 z-20"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.5, rotate: 4 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: -6 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                >
                  <span className="v2-mono inline-block rounded border-2 border-[var(--v2-lume)] px-2.5 py-1 text-[9px] text-[var(--v2-lume)] bg-[rgba(10,12,15,0.55)] backdrop-blur-sm">
                    preview ready
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Console strip */}
      <div className="mt-3 flex items-center justify-between gap-4 px-1">
        <div className="font-mono text-[11px] text-[var(--v2-cream-dim)] truncate" aria-live="polite">
          {CONSOLE_LINE[phase](brand)}
        </div>
        <div className="v2-mono hidden sm:block shrink-0 text-[9px] text-[var(--v2-cream-faint)]">
          time compressed ×8
        </div>
      </div>
    </div>
  );
}

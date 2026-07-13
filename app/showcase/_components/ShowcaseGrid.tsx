'use client';

import { useMemo, useState } from 'react';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from 'motion/react';

import { gridCard } from '@/lib/motion/variants';

type Item = {
  id: string;
  anonymizedTitle: string;
  tagline: string;
  industry: string;
  prototypeUrl: string | null;
  screenshotUrl: string | null;
  prototypeScore: number | null;
  createdAt: string;
};

const INDUSTRY_LABELS: Record<string, string> = {
  cleaning: 'Cleaning',
  salon: 'Salon',
  auto_repair: 'Auto Repair',
  restaurant: 'Restaurant',
  contractor: 'Contractor',
  barber: 'Barber',
  landscaper: 'Landscaping',
  tutor: 'Tutor',
  retail: 'Retail',
  saas: 'SaaS',
  real_estate: 'Real Estate',
  dental_clinic: 'Dental Clinic',
  fitness_gym: 'Fitness Gym',
  law_firm: 'Law Firm',
  home_services: 'Home Services',
  ecommerce_product: 'E-commerce',
  online_course: 'Online Course',
  default: 'Other',
};

export default function ShowcaseGrid({ items }: { items: Item[] }) {
  const [selected, setSelected] = useState<string>('all');

  // Build the list of industries actually present in the data
  const industries = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.industry));
    return Array.from(set).sort((a, b) =>
      (INDUSTRY_LABELS[a] || a).localeCompare(INDUSTRY_LABELS[b] || b)
    );
  }, [items]);

  const filtered = useMemo(
    () => (selected === 'all' ? items : items.filter((i) => i.industry === selected)),
    [items, selected]
  );

  return (
    <div>
      {/* Filter chips */}
      {industries.length > 1 && (
        <div className="mb-10 flex flex-wrap items-center gap-2">
          <span className="v2-mono mr-2 text-[10px] text-[var(--v2-cream-faint)]">filter</span>
          <LayoutGroup id="showcase-filter">
            <FilterChip
              active={selected === 'all'}
              onClick={() => setSelected('all')}
            >
              All ({items.length})
            </FilterChip>
            {industries.map((ind) => {
              const count = items.filter((i) => i.industry === ind).length;
              return (
                <FilterChip
                  key={ind}
                  active={selected === ind}
                  onClick={() => setSelected(ind)}
                >
                  {INDUSTRY_LABELS[ind] || ind} ({count})
                </FilterChip>
              );
            })}
          </LayoutGroup>
        </div>
      )}

      {/* Grid (re-mounts on filter change so AnimatePresence can run enter/exit) */}
      <AnimatePresence mode="wait" initial={false}>
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="py-16 text-center text-[var(--v2-cream-faint)]"
          >
            No prototypes match this filter yet.
          </motion.div>
        ) : (
          <motion.div
            key={selected}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={gridCard}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <ShowcaseCard key={item.id} item={item} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShowcaseCard({ item }: { item: Item }) {
  // Resolve screenshot path to a public URL.
  // - If the URL is already a public path (/prototype-screenshots/...) or http(s),
  //   use it directly.
  // - Otherwise, proxy through /api/showcase-image (for data/... paths).
  const screenshotSrc = item.screenshotUrl
    ? item.screenshotUrl.startsWith('/') && !item.screenshotUrl.startsWith('/data/')
      ? item.screenshotUrl
      : item.screenshotUrl.startsWith('http')
      ? item.screenshotUrl
      : `/api/showcase-image?path=${encodeURIComponent(item.screenshotUrl)}`
    : null;

  const reduce = useReducedMotion();

  return (
    <motion.article
      layout
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={gridCard}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="v2-card group overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-[var(--v2-line)] bg-[var(--v2-ink-2)]">
        {screenshotSrc ? (
          <motion.img
            src={screenshotSrc}
            alt={`${item.anonymizedTitle} — screenshot preview`}
            className="h-full w-full object-cover object-top"
            whileHover={reduce ? undefined : { scale: 1.04 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        ) : (
          <div className="v2-mono flex h-full w-full items-center justify-center text-[10px] text-[var(--v2-cream-faint)]">
            screenshot pending
          </div>
        )}
        {/* Draft stamp — same language as the LiveBuild "draft 01 · ready" */}
        <div className="absolute left-3 top-3 -rotate-3">
          <span className="v2-mono inline-block rounded border-2 border-[var(--v2-lume)] bg-[rgba(10,12,15,0.55)] px-2 py-0.5 text-[9px] text-[var(--v2-lume)] backdrop-blur-sm">
            demo draft
          </span>
        </div>
        {item.prototypeScore !== null && (
          <div className="v2-mono absolute right-3 top-3 rounded-full border border-[var(--v2-line-strong)] bg-[rgba(10,12,15,0.7)] px-2.5 py-1 text-[9px] text-[var(--v2-cream)] backdrop-blur-sm">
            ★ {item.prototypeScore}
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <span className="v2-mono inline-block rounded-full border border-[var(--v2-line-strong)] bg-[rgba(10,12,15,0.75)] px-2.5 py-1 text-[9px] text-[var(--v2-cream)] backdrop-blur-sm">
            {INDUSTRY_LABELS[item.industry] || item.industry.replace('_', ' ')}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="v2-serif mb-2 text-lg font-medium">{item.anonymizedTitle}</h3>
        <p className="mb-5 text-sm leading-relaxed text-[var(--v2-cream-dim)]">{item.tagline}</p>
        {item.prototypeUrl && (
          <a
            href={`/preview/${encodeURIComponent(item.prototypeUrl.split('/').slice(-2, -1)[0] || '')}`}
            className="v2-mono text-[10px] text-[var(--v2-lume)] transition-colors hover:text-[#dcff79]"
          >
            view concept →
          </a>
        )}
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/*  FilterChip — shared-layout pill that morphs between active chips.  */
/* ------------------------------------------------------------------ */
function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="relative rounded-full border border-[var(--v2-line)] px-3.5 py-1.5 text-sm"
    >
      {active && (
        <motion.span
          layoutId="showcase-pill"
          className="absolute inset-0 rounded-full bg-[var(--v2-lume)]"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}
      <span
        className={`relative z-10 transition-colors ${
          active ? 'font-semibold text-[#0c0f08]' : 'text-[var(--v2-cream-dim)]'
        }`}
      >
        {children}
      </span>
    </button>
  );
}

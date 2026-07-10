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

// Warmer industry chips — pulled toward the warm-print palette.
const INDUSTRY_COLORS: Record<string, string> = {
  cleaning: 'bg-[#E6F1ED] text-paint',
  salon: 'bg-[#FBE7DC] text-[#9B3D1A]',
  auto_repair: 'bg-[#F4E4C9] text-[#7A4A0F]',
  restaurant: 'bg-[#F7DCC8] text-[#9B3D1A]',
  contractor: 'bg-[#DDE8D6] text-paint',
  barber: 'bg-[#E4E0F0] text-[#3B2E66]',
  landscaper: 'bg-[#E1EED7] text-[#2F5A1F]',
  tutor: 'bg-[#EFE4F4] text-[#5B2A66]',
  retail: 'bg-[#F8E1E1] text-[#7A2A2A]',
  // New playground prototypes — warm-print palette, distinct from neighbors.
  saas: 'bg-[#E0E4F0] text-[#2C3E70]',
  real_estate: 'bg-[#F4E5D4] text-[#7A4F2C]',
  dental_clinic: 'bg-[#D9EEEA] text-[#1F5C55]',
  fitness_gym: 'bg-[#E5EDD8] text-[#3D5A1F]',
  law_firm: 'bg-[#DCE3EE] text-[#1A2A50]',
  home_services: 'bg-[#E0E8F5] text-[#0E3A7A]',
  ecommerce_product: 'bg-[#F8E0DC] text-[#9B3A2A]',
  online_course: 'bg-[#ECE0F2] text-[#5A2A7A]',
  default: 'bg-mist text-steel',
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
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-steel mr-1">Filter:</span>
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
            className="text-center py-16 text-slate-500"
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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

  const industryColor =
    INDUSTRY_COLORS[item.industry] || INDUSTRY_COLORS.default;
  const reduce = useReducedMotion();

  return (
    <motion.article
      layout
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={gridCard}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group bg-paper rounded-2xl border border-paint/10 overflow-hidden shadow-sm"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-mist to-mist/70 relative overflow-hidden">
        {screenshotSrc ? (
          <motion.img
            src={screenshotSrc}
            alt={`${item.anonymizedTitle} — screenshot preview`}
            className="w-full h-full object-cover object-top"
            whileHover={reduce ? undefined : { scale: 1.05 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-steel/60">
            <span className="text-5xl">🖼️</span>
          </div>
        )}
        {item.prototypeScore !== null && (
          <div className="absolute top-3 right-3 bg-paper/95 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold text-ink">
            ★ {item.prototypeScore}
          </div>
        )}
        <div className="absolute top-3 left-3 bg-ink/85 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold text-paper uppercase tracking-wide">
          Demo
        </div>
        {/* Industry badge on the card */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${industryColor}`}
          >
            {INDUSTRY_LABELS[item.industry] || item.industry.replace('_', ' ')}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-medium text-ink mb-2">{item.anonymizedTitle}</h3>
        <p className="text-sm text-steel mb-4 leading-relaxed">{item.tagline}</p>
        <div className="flex items-center justify-end text-xs text-steel/70">
          {item.prototypeUrl && (
            <a
              href={`/preview/${encodeURIComponent(item.prototypeUrl.split('/').slice(-2, -1)[0] || '')}`}
              className="text-paint font-medium hover:text-signal transition-colors"
            >
              View concept →
            </a>
          )}
        </div>
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
      className="relative px-3 py-1.5 rounded-full text-sm font-medium border border-transparent"
    >
      {active && (
        <motion.span
          layoutId="showcase-pill"
          className="absolute inset-0 rounded-full bg-ink border border-ink"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}
      <span
        className={`relative z-10 transition-colors ${
          active ? 'text-paper' : 'text-steel'
        }`}
      >
        {children}
      </span>
    </button>
  );
}
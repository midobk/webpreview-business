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
  default: 'Other',
};

const INDUSTRY_COLORS: Record<string, string> = {
  cleaning: 'bg-cyan-100 text-cyan-800',
  salon: 'bg-pink-100 text-pink-800',
  auto_repair: 'bg-amber-100 text-amber-800',
  restaurant: 'bg-orange-100 text-orange-800',
  contractor: 'bg-emerald-100 text-emerald-800',
  barber: 'bg-indigo-100 text-indigo-800',
  landscaper: 'bg-lime-100 text-lime-800',
  tutor: 'bg-violet-100 text-violet-800',
  retail: 'bg-rose-100 text-rose-800',
  default: 'bg-slate-100 text-slate-800',
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
          <span className="text-sm font-medium text-slate-500 mr-1">Filter:</span>
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
      variants={gridCard}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
        {screenshotSrc ? (
          <motion.img
            src={screenshotSrc}
            alt={`${item.anonymizedTitle} — screenshot preview`}
            className="w-full h-full object-cover object-top"
            whileHover={reduce ? undefined : { scale: 1.05 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <span className="text-5xl">🖼️</span>
          </div>
        )}
        {item.prototypeScore !== null && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700">
            ★ {item.prototypeScore}
          </div>
        )}
        <div className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold text-white uppercase tracking-wide">
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
        <h3 className="text-lg font-bold text-slate-900 mb-2">{item.anonymizedTitle}</h3>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{item.tagline}</p>
        <div className="flex items-center justify-end text-xs text-slate-500">
          {item.prototypeUrl && (
            <a
              href={`/preview/${encodeURIComponent(item.prototypeUrl.split('/').slice(-2, -1)[0] || '')}`}
              className="text-indigo-600 font-medium hover:text-indigo-700"
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
          className="absolute inset-0 rounded-full bg-indigo-600 border border-indigo-600"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}
      <span
        className={`relative z-10 transition-colors ${
          active ? 'text-white' : 'text-slate-700'
        }`}
      >
        {children}
      </span>
    </button>
  );
}
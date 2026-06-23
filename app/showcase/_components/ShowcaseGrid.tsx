'use client';

import { useMemo, useState } from 'react';

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
          <button
            type="button"
            onClick={() => setSelected('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              selected === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
            }`}
            aria-pressed={selected === 'all'}
          >
            All ({items.length})
          </button>
          {industries.map((ind) => {
            const count = items.filter((i) => i.industry === ind).length;
            return (
              <button
                key={ind}
                type="button"
                onClick={() => setSelected(ind)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selected === ind
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
                aria-pressed={selected === ind}
              >
                {INDUSTRY_LABELS[ind] || ind} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          No prototypes match this filter yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item) => (
            <ShowcaseCard key={item.id} item={item} />
          ))}
        </div>
      )}
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

  return (
    <article className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
        {screenshotSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={screenshotSrc}
            alt={`${item.anonymizedTitle} — screenshot preview`}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
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
    </article>
  );
}

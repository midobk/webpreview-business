import type { ReactNode } from 'react';

/**
 * StatCard — KPI tile for the dashboard top strip.
 */

type Accent = 'indigo' | 'violet' | 'pink' | 'green' | 'amber' | 'cyan';

const ACCENT_COLORS: Record<Accent, { bg: string; ring: string; bar: string; icon: string }> = {
  indigo: { bg: 'rgba(99,102,241,0.10)', ring: 'rgba(99,102,241,0.25)', bar: '#6366F1', icon: '#6366F1' },
  violet: { bg: 'rgba(139,92,246,0.10)', ring: 'rgba(139,92,246,0.25)', bar: '#8B5CF6', icon: '#8B5CF6' },
  pink:   { bg: 'rgba(236,72,153,0.10)',  ring: 'rgba(236,72,153,0.25)',  bar: '#EC4899', icon: '#EC4899' },
  green:  { bg: 'rgba(16,185,129,0.12)',  ring: 'rgba(16,185,129,0.30)',  bar: '#10B981', icon: '#10B981' },
  amber:  { bg: 'rgba(245,158,11,0.14)',  ring: 'rgba(245,158,11,0.30)',  bar: '#F59E0B', icon: '#F59E0B' },
  cyan:   { bg: 'rgba(6,182,212,0.12)',   ring: 'rgba(6,182,212,0.28)',   bar: '#06B6D4', icon: '#06B6D4' },
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = 'indigo',
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon: ReactNode;
  accent?: Accent;
}) {
  const c = ACCENT_COLORS[accent];
  return (
    <div
      className="adm-lift relative overflow-hidden rounded-xl"
      style={{
        background: 'var(--adm-bg-surface)',
        border: '1px solid var(--adm-border)',
        boxShadow: 'var(--adm-shadow-sm)',
      }}
    >
      <span
        aria-hidden
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, ${c.bar}, transparent)` }}
      />
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: 'var(--adm-text-muted)', letterSpacing: '0.04em' }}
          >
            {label}
          </p>
          <p
            className="mt-2 text-2xl font-semibold tabular-nums"
            style={{ color: 'var(--adm-text-primary)' }}
          >
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs" style={{ color: 'var(--adm-text-secondary)' }}>
              {hint}
            </p>
          )}
        </div>
        <div
          className="shrink-0 grid place-items-center rounded-lg"
          style={{
            width: 36,
            height: 36,
            background: c.bg,
            color: c.icon,
            boxShadow: `inset 0 0 0 1px ${c.ring}`,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
/**
 * StatusBadge — premium pill that maps internal status slugs to a color + label.
 */

import type { CSSProperties } from 'react';

type Tone = 'neutral' | 'blue' | 'purple' | 'indigo' | 'yellow' | 'cyan' | 'green' | 'red' | 'gray' | 'amber' | 'slate';

type StatusEntry = {
  label: string;
  tone: Tone;
};

const STATUS_MAP: Record<string, StatusEntry> = {
  discovered: { label: 'Discovered', tone: 'blue' },
  new: { label: 'New', tone: 'blue' },
  ready_for_prototype: { label: 'Ready for prototype', tone: 'purple' },
  prototype_generated: { label: 'Prototype ready', tone: 'indigo' },
  contacted: { label: 'Contacted', tone: 'amber' },
  replied: { label: 'Replied', tone: 'cyan' },
  email_drafted: { label: 'Email drafted', tone: 'amber' },
  won: { label: 'Won', tone: 'green' },
  lost: { label: 'Lost', tone: 'red' },
  do_not_contact: { label: 'Do not contact', tone: 'slate' },
  pending_review: { label: 'Pending review', tone: 'yellow' },
  flag_for_review: { label: 'Flag for review', tone: 'yellow' },
  ignore: { label: 'Ignored', tone: 'gray' },
};

const TONE_STYLES: Record<Tone, { bg: string; fg: string; ring: string; dot: string }> = {
  neutral: { bg: 'var(--adm-bg-subtle)', fg: 'var(--adm-text-secondary)', ring: 'var(--adm-border)', dot: 'var(--adm-text-muted)' },
  blue: { bg: 'rgba(59,130,246,0.12)', fg: '#3B82F6', ring: 'rgba(59,130,246,0.25)', dot: '#3B82F6' },
  purple: { bg: 'rgba(139,92,246,0.12)', fg: '#8B5CF6', ring: 'rgba(139,92,246,0.28)', dot: '#8B5CF6' },
  indigo: { bg: 'rgba(99,102,241,0.12)', fg: '#6366F1', ring: 'rgba(99,102,241,0.28)', dot: '#6366F1' },
  yellow: { bg: 'rgba(245,158,11,0.14)', fg: '#B45309', ring: 'rgba(245,158,11,0.30)', dot: '#F59E0B' },
  amber: { bg: 'rgba(245,158,11,0.14)', fg: '#B45309', ring: 'rgba(245,158,11,0.30)', dot: '#F59E0B' },
  cyan: { bg: 'rgba(6,182,212,0.12)', fg: '#0891B2', ring: 'rgba(6,182,212,0.28)', dot: '#06B6D4' },
  green: { bg: 'var(--adm-success-soft)', fg: 'var(--adm-success)', ring: 'rgba(16,185,129,0.30)', dot: 'var(--adm-success)' },
  red: { bg: 'var(--adm-danger-soft)', fg: 'var(--adm-danger)', ring: 'rgba(239,68,68,0.30)', dot: 'var(--adm-danger)' },
  gray: { bg: 'var(--adm-bg-subtle)', fg: 'var(--adm-text-secondary)', ring: 'var(--adm-border)', dot: 'var(--adm-text-muted)' },
  slate: { bg: 'var(--adm-bg-active)', fg: 'var(--adm-text-secondary)', ring: 'var(--adm-border-strong)', dot: 'var(--adm-text-secondary)' },
};

const DARK_OVERRIDES: Partial<Record<Tone, { fg?: string }>> = {
  yellow: { fg: '#FBBF24' },
  amber: { fg: '#FBBF24' },
  cyan: { fg: '#22D3EE' },
};

export function StatusBadge({
  status,
  withDot = true,
  size = 'md',
}: {
  status?: string;
  withDot?: boolean;
  size?: 'sm' | 'md';
}) {
  const key = (status || 'unknown').toLowerCase();
  const entry = STATUS_MAP[key] ?? { label: status || 'Unknown', tone: 'neutral' as Tone };
  const tone = TONE_STYLES[entry.tone];
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const fg = isDark && DARK_OVERRIDES[entry.tone]?.fg ? DARK_OVERRIDES[entry.tone]!.fg : tone.fg;

  const style: CSSProperties = {
    background: tone.bg,
    color: fg,
    boxShadow: `inset 0 0 0 1px ${tone.ring}`,
  };

  const padding = size === 'sm' ? '2px 8px' : '3px 10px';
  const fontSize = size === 'sm' ? 11 : 12;

  return (
    <span
      className="inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap"
      style={{ ...style, padding, fontSize, lineHeight: 1.4 }}
    >
      {withDot && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: tone.dot }}
          aria-hidden
        />
      )}
      {entry.label}
    </span>
  );
}

export const ALL_STATUSES = Object.keys(STATUS_MAP);
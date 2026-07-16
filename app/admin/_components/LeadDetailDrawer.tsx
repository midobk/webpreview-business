'use client';

import { useEffect, useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { IconClose, IconExternal } from './icons';
import type { Lead } from './types';

export function LeadDetailDrawer({
  lead,
  onClose,
  onUpdateStatus,
  onSaveNote,
  updating,
}: {
  lead: Lead;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onSaveNote: (id: string, note: string) => Promise<void> | void;
  updating: boolean;
}) {
  const [note, setNote] = useState(lead.notes || '');

  useEffect(() => {
    setNote(lead.notes || '');
  }, [lead.id, lead.notes]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const status = (lead.status || 'unknown').toLowerCase();
  const score = lead.lead_score ?? 0;

  return (
    <div
      className="adm-backdrop-in fixed inset-0 z-40"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      style={{ background: 'rgba(8, 12, 24, 0.45)', backdropFilter: 'blur(4px)' }}
    >
      <aside
        className="adm-drawer-in absolute top-0 right-0 h-full w-full sm:w-[480px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--adm-bg-surface)',
          borderLeft: '1px solid var(--adm-border)',
          boxShadow: 'var(--adm-shadow-lg)',
        }}
      >
        <header
          className="flex items-start justify-between gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid var(--adm-border)' }}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={status} size="sm" />
              <span
                className="text-[11px] font-medium tabular-nums"
                style={{ color: 'var(--adm-text-muted)' }}
              >
                Score {score}/100
              </span>
            </div>
            <h2
              className="text-lg font-semibold truncate"
              style={{ color: 'var(--adm-text-primary)' }}
              title={lead.business_name || lead.businessName || 'Unknown'}
            >
              {lead.business_name || lead.businessName || 'Unknown'}
            </h2>
            <p className="text-xs" style={{ color: 'var(--adm-text-secondary)' }}>
              {lead.city || '—'}, {lead.province || '—'}
              {lead.industry && (
                <>
                  {' · '}
                  <span className="capitalize">{lead.industry.replace(/_/g, ' ')}</span>
                </>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close detail panel"
            className="grid place-items-center rounded-md p-1.5 transition-colors"
            style={{ color: 'var(--adm-text-muted)' }}
          >
            <IconClose size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          <section className="space-y-2.5 text-sm">
            <Row label="Email">
              <span className="truncate block" title={lead.email || ''}>
                {lead.email || '—'}
              </span>
            </Row>
            <Row label="Phone">{lead.phone || '—'}</Row>
            <Row label="Website">
              {lead.website_url ? (
                <a
                  href={lead.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                  style={{ color: 'var(--adm-accent)' }}
                >
                  <span className="truncate max-w-[280px] block">{lead.website_url}</span>
                  <IconExternal size={12} />
                </a>
              ) : (
                <span style={{ color: 'var(--adm-text-muted)' }}>—</span>
              )}
            </Row>
            <Row label="Website status">
              {lead.website_status ? (
                <StatusBadge status={lead.website_status} size="sm" />
              ) : (
                <span style={{ color: 'var(--adm-text-muted)' }}>—</span>
              )}
            </Row>
            <Row label="Contact safety">{lead.contact_safety_status || '—'}</Row>
          </section>

          {lead.services && lead.services.length > 0 && (
            <Section title="Services">
              <div className="flex flex-wrap gap-1.5">
                {lead.services.map((s, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{
                      background: 'var(--adm-bg-subtle)',
                      color: 'var(--adm-text-secondary)',
                      border: '1px solid var(--adm-border)',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {lead.description && (
            <Section title="Description">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--adm-text-secondary)' }}>
                {lead.description}
              </p>
            </Section>
          )}

          {lead.score_reasoning && (
            <Section title="Score reasoning">
              <p
                className="text-xs leading-relaxed p-3 rounded-lg"
                style={{
                  background: 'var(--adm-bg-subtle)',
                  color: 'var(--adm-text-secondary)',
                  border: '1px solid var(--adm-border-subtle)',
                }}
              >
                {lead.score_reasoning}
              </p>
            </Section>
          )}

          <Section title="Update status">
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                tone="success"
                onClick={() => onUpdateStatus(lead.id, 'won')}
                disabled={updating}
              >
                ✓ Won
              </ActionButton>
              <ActionButton
                tone="danger"
                onClick={() => onUpdateStatus(lead.id, 'lost')}
                disabled={updating}
              >
                ✗ Lost
              </ActionButton>
              <ActionButton
                tone="amber"
                onClick={() => onUpdateStatus(lead.id, 'contacted')}
                disabled={updating}
              >
                Mark contacted
              </ActionButton>
              <ActionButton
                tone="danger"
                onClick={() => onUpdateStatus(lead.id, 'revision_requested')}
                disabled={updating}
              >
                Mark hot / revision
              </ActionButton>
              <ActionButton
                tone="neutral"
                onClick={() => onUpdateStatus(lead.id, 'do_not_contact')}
                disabled={updating}
              >
                Do not contact
              </ActionButton>
            </div>
          </Section>

          <Section
            title="Notes"
            action={
              <button
                onClick={() => onSaveNote(lead.id, note)}
                disabled={updating || !note.trim() || note === (lead.notes || '')}
                className="text-xs font-semibold px-2.5 py-1 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed adm-brand-gradient text-white"
              >
                Save
              </button>
            }
          >
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add context, call notes, follow-up plan…"
              rows={4}
              className="w-full text-sm rounded-lg p-3 outline-none resize-y"
              style={{
                background: 'var(--adm-bg-app)',
                border: '1px solid var(--adm-border)',
                color: 'var(--adm-text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--adm-accent)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--adm-accent-soft)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--adm-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </Section>

          {lead.source_urls && lead.source_urls.length > 0 && (
            <Section title="Sources">
              <ul className="space-y-1.5">
                {lead.source_urls.map((url, i) => (
                  <li key={i}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs flex items-center gap-1.5 hover:underline truncate"
                      style={{ color: 'var(--adm-accent)' }}
                      title={url}
                    >
                      <IconExternal size={11} />
                      <span className="truncate">{url}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </aside>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="text-[11px] font-semibold uppercase tracking-wider w-24 shrink-0 pt-0.5"
        style={{ color: 'var(--adm-text-muted)' }}
      >
        {label}
      </span>
      <span className="flex-1 text-sm" style={{ color: 'var(--adm-text-primary)' }}>
        {children}
      </span>
    </div>
  );
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h3
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--adm-text-muted)' }}
        >
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone: 'success' | 'danger' | 'amber' | 'neutral';
}) {
  const colors = {
    success: { bg: 'var(--adm-success-soft)', fg: 'var(--adm-success)', ring: 'rgba(16,185,129,0.30)' },
    danger: { bg: 'var(--adm-danger-soft)', fg: 'var(--adm-danger)', ring: 'rgba(239,68,68,0.30)' },
    amber: { bg: 'rgba(245,158,11,0.12)', fg: '#B45309', ring: 'rgba(245,158,11,0.30)' },
    neutral: { bg: 'var(--adm-bg-subtle)', fg: 'var(--adm-text-secondary)', ring: 'var(--adm-border)' },
  }[tone];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-xs font-semibold py-2 px-3 rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: colors.bg,
        color: colors.fg,
        boxShadow: `inset 0 0 0 1px ${colors.ring}`,
      }}
    >
      {children}
    </button>
  );
}

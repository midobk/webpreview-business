'use client';

import type { Prototype, Lead } from './types';
import { IconExternal, IconCheck, IconSparkle } from './icons';

export function PrototypeCard({
  proto,
  lead,
  onToggleShowcase,
  updating,
}: {
  proto: Prototype;
  lead?: Lead;
  onToggleShowcase: (id: string, approved: boolean) => void;
  updating: boolean;
}) {
  const slug = lead?.slug || '';
  const status = (proto.generation_status || '').toLowerCase();
  const statusTone =
    status === 'complete' || status === 'completed' || status === 'generated'
      ? { bg: 'var(--adm-success-soft)', fg: 'var(--adm-success)' }
      : { bg: 'var(--adm-warning-soft)', fg: 'var(--adm-warning)' };
  const model = (proto.generation_model || '').split('/').pop() || 'AI';

  return (
    <div
      className="adm-lift rounded-xl overflow-hidden flex flex-col"
      style={{
        background: 'var(--adm-bg-surface)',
        border: '1px solid var(--adm-border)',
        boxShadow: 'var(--adm-shadow-sm)',
      }}
    >
      <div
        className="relative aspect-[16/10] flex items-center justify-center overflow-hidden"
        style={{ background: 'var(--adm-bg-subtle)' }}
      >
        {proto.screenshot_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={proto.screenshot_url}
            alt={proto.title || 'Prototype preview'}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div
            className="flex flex-col items-center gap-1.5"
            style={{ color: 'var(--adm-text-muted)' }}
          >
            <IconSparkle size={20} />
            <span className="text-xs">No screenshot yet</span>
          </div>
        )}

        {proto.watermark_enabled && (
          <span
            className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(59,130,246,0.85)', color: 'white' }}
          >
            Watermarked
          </span>
        )}

        {proto.showcase_approved && (
          <span
            className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: 'var(--adm-success)', color: 'white' }}
          >
            <IconCheck size={10} /> Showcase
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p
          className="text-sm font-semibold truncate"
          style={{ color: 'var(--adm-text-primary)' }}
          title={proto.title || 'Untitled'}
        >
          {proto.title || 'Untitled'}
        </p>
        <p
          className="text-xs truncate"
          style={{ color: 'var(--adm-text-secondary)' }}
          title={lead?.business_name || lead?.businessName || 'Unknown'}
        >
          {lead?.business_name || lead?.businessName || 'Unknown'}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{ background: statusTone.bg, color: statusTone.fg }}
          >
            {proto.generation_status || 'pending'}
          </span>
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{ background: 'var(--adm-accent-soft)', color: 'var(--adm-accent)' }}
          >
            {model}
          </span>
          {proto.demo_locked && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ background: 'var(--adm-warning-soft)', color: 'var(--adm-warning)' }}
            >
              Demo locked
            </span>
          )}
        </div>

        {proto.design_summary && (
          <p className="text-xs mt-3 line-clamp-2" style={{ color: 'var(--adm-text-secondary)' }}>
            {proto.design_summary}
          </p>
        )}

        <div
          className="mt-auto pt-3 flex gap-2"
          style={{ borderTop: '1px solid var(--adm-border)' }}
        >
          {slug ? (
            <a
              href={`/preview/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-xs font-semibold text-center py-2 rounded-md transition-colors adm-brand-gradient text-white"
              style={{ boxShadow: 'var(--adm-shadow-sm)' }}
            >
              <span className="inline-flex items-center gap-1.5">
                Open preview <IconExternal size={11} />
              </span>
            </a>
          ) : (
            <span
              className="flex-1 text-xs font-medium text-center py-2 rounded-md"
              style={{ color: 'var(--adm-text-muted)' }}
            >
              No slug
            </span>
          )}
          {proto.showcase_approved ? (
            <button
              onClick={() => onToggleShowcase(proto.id, false)}
              disabled={updating}
              className="text-xs font-semibold px-3 py-2 rounded-md transition-all"
              style={{
                background: 'var(--adm-success-soft)',
                color: 'var(--adm-success)',
                boxShadow: 'inset 0 0 0 1px rgba(16,185,129,0.30)',
              }}
            >
              ✓ On
            </button>
          ) : (
            <button
              onClick={() => onToggleShowcase(proto.id, true)}
              disabled={updating}
              className="text-xs font-semibold px-3 py-2 rounded-md transition-all"
              style={{
                background: 'var(--adm-bg-subtle)',
                color: 'var(--adm-text-secondary)',
                boxShadow: 'inset 0 0 0 1px var(--adm-border)',
              }}
            >
              Showcase
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
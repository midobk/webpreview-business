'use client';

import { useEffect } from 'react';
import { IconCheck, IconClose } from './icons';

export type Toast = {
  id: number;
  message: string;
  tone?: 'default' | 'success' | 'error';
  undo?: () => void;
};

export function ToastStack({ toast, onDismiss }: { toast: Toast | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isSuccess = toast.tone === 'success';
  const isError = toast.tone === 'error';
  const accent = isError ? 'var(--adm-danger)' : isSuccess ? 'var(--adm-success)' : 'var(--adm-accent)';

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-50 max-w-sm"
      style={{ animation: 'admFadeUp 220ms cubic-bezier(0.16,1,0.3,1)' }}
    >
      <div
        className="flex items-center gap-3 rounded-xl pl-3 pr-2 py-2.5"
        style={{
          background: 'var(--adm-bg-elevated)',
          border: '1px solid var(--adm-border-strong)',
          boxShadow: 'var(--adm-shadow-lg)',
        }}
      >
        <span
          className="grid place-items-center rounded-md"
          style={{
            width: 24,
            height: 24,
            background: isError
              ? 'var(--adm-danger-soft)'
              : isSuccess
              ? 'var(--adm-success-soft)'
              : 'var(--adm-accent-soft)',
            color: accent,
          }}
        >
          <IconCheck size={14} />
        </span>
        <span className="text-sm font-medium" style={{ color: 'var(--adm-text-primary)' }}>
          {toast.message}
        </span>
        {toast.undo && (
          <button
            onClick={() => {
              toast.undo?.();
              onDismiss();
            }}
            className="text-xs font-semibold px-2 py-1 rounded-md transition-colors"
            style={{ color: 'var(--adm-accent)' }}
          >
            Undo
          </button>
        )}
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="grid place-items-center rounded-md p-1 transition-colors"
          style={{ color: 'var(--adm-text-muted)' }}
        >
          <IconClose size={14} />
        </button>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';

type Mode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'admin-theme';

function getInitial(): Mode {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(STORAGE_KEY) as Mode | null;
  return stored || 'system';
}

function applyMode(mode: Mode) {
  const root = document.documentElement;
  const isDark =
    mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', isDark);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMode(getInitial());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyMode('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  const cycle = () => {
    const next: Mode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setMode(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyMode(next);
  };

  const Icon = !mounted
    ? SunIcon
    : mode === 'light'
    ? SunIcon
    : mode === 'dark'
    ? MoonIcon
    : SystemIcon;

  const label = mode === 'light' ? 'Light' : mode === 'dark' ? 'Dark' : 'System';

  return (
    <button
      type="button"
      onClick={cycle}
      title={`Theme: ${label} (click to cycle)`}
      aria-label={`Theme mode: ${label}. Click to change.`}
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        width: 34,
        height: 34,
        borderRadius: 8,
        background: 'var(--adm-bg-subtle)',
        color: 'var(--adm-text-secondary)',
        border: '1px solid var(--adm-border)',
        transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'pointer',
      }}
    >
      <Icon />
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="12" rx="2" ry="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}
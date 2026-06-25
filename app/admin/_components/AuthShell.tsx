import type { ReactNode } from 'react';
import { ThemeScript } from './ThemeScript';
import { ThemeToggle } from './ThemeToggle';
import { IconLogo, IconSparkle, IconShield, IconBolt } from './icons';

/**
 * AuthShell — premium login / setup frame.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <>
      <ThemeScript />
      <div
        className="admin-shell min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden"
        style={{ background: 'var(--adm-bg-app)', color: 'var(--adm-text-primary)' }}
      >
        <div aria-hidden className="absolute inset-0 adm-bg-dots" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(at 18% 12%, rgba(99,102,241,0.18) 0px, transparent 50%),' +
              'radial-gradient(at 82% 88%, rgba(236,72,153,0.16) 0px, transparent 55%),' +
              'radial-gradient(at 50% 50%, rgba(139,92,246,0.10) 0px, transparent 60%)',
          }}
        />

        <div className="absolute top-5 right-5 z-20">
          <ThemeToggle />
        </div>

        <div className="absolute top-5 left-5 z-20 flex items-center gap-2.5">
          <div
            className="rounded-lg adm-brand-gradient grid place-items-center"
            style={{ width: 32, height: 32 }}
          >
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold" style={{ color: 'var(--adm-text-primary)' }}>
              SiteSprint
            </p>
            <p className="text-[11px]" style={{ color: 'var(--adm-text-muted)' }}>
              Admin Console
            </p>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-7 adm-stagger">
            <div
              className="mx-auto grid place-items-center rounded-2xl mb-5 adm-brand-gradient"
              style={{ width: 64, height: 64, boxShadow: 'var(--adm-shadow-glow)' }}
            >
              <IconLogo size={28} />
            </div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: 'var(--adm-accent)' }}
            >
              {eyebrow}
            </p>
            <h1 className="mt-2 text-[28px] font-bold leading-tight adm-brand-text-gradient">
              {title}
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'var(--adm-text-secondary)' }}>
              {subtitle}
            </p>
          </div>

          <div className="adm-glass rounded-2xl p-7 adm-stagger">{children}</div>

          {footer && (
            <div className="mt-6 text-center text-xs" style={{ color: 'var(--adm-text-muted)' }}>
              {footer}
            </div>
          )}
        </div>

        <div className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 items-center gap-2 z-10">
          {[
            { icon: <IconShield size={12} />, label: 'Restricted' },
            { icon: <IconBolt size={12} />, label: 'Single-tenant' },
            { icon: <IconSparkle size={12} />, label: 'Founder-only' },
          ].map((pill) => (
            <span
              key={pill.label}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
              style={{
                background: 'var(--adm-bg-surface)',
                border: '1px solid var(--adm-border)',
                color: 'var(--adm-text-secondary)',
              }}
            >
              <span style={{ color: 'var(--adm-accent)' }}>{pill.icon}</span>
              {pill.label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
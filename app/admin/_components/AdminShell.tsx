'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  IconLeads,
  IconPrototypes,
  IconShowcase,
  IconSettings,
  IconLogout,
} from './icons';
import { ThemeToggle } from './ThemeToggle';

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: string | number;
  soon?: boolean;
};

const NAV: NavItem[] = [
  { href: '/admin/dashboard', label: 'Leads', icon: <IconLeads size={16} /> },
  { href: '/admin/prototypes', label: 'Prototypes', icon: <IconPrototypes size={16} /> },
  { href: '/showcase', label: 'Showcase', icon: <IconShowcase size={16} /> },
  { href: '/admin/dashboard#settings', label: 'Settings', icon: <IconSettings size={16} />, soon: true },
];

export function AdminShell({
  children,
  title,
  breadcrumb,
  actions,
  userLabel = 'Operator',
}: {
  children: ReactNode;
  title?: ReactNode;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  userLabel?: string;
}) {
  const pathname = usePathname();

  return (
    <div
      className="admin-shell min-h-screen adm-bg-dots"
      style={{ background: 'var(--adm-bg-app)', color: 'var(--adm-text-primary)' }}
    >
      <div className="flex min-h-screen">
        <Sidebar pathname={pathname} userLabel={userLabel} />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar title={title} breadcrumb={breadcrumb} actions={actions} />
          <main className="flex-1 px-6 py-6 lg:px-8">
            <div className="mx-auto max-w-[1400px] adm-stagger">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ pathname, userLabel }: { pathname: string; userLabel: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
    } catch (err) {
      console.error('Logout failed:', err);
    }
    router.push('/admin');
    router.refresh();
  };

  return (
    <aside
      className="hidden md:flex w-[240px] shrink-0 flex-col"
      style={{
        background: 'var(--adm-bg-sidebar)',
        borderRight: '1px solid var(--adm-border)',
      }}
    >
      <div className="px-5 py-5 flex items-center gap-2.5">
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

      <div className="px-5 pb-3">
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md"
          style={{ background: 'var(--adm-bg-subtle)' }}
        >
          <span
            className="adm-pulse-dot inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--adm-success)' }}
            aria-hidden
          />
          <span className="text-[11px] font-medium" style={{ color: 'var(--adm-text-secondary)' }}>
            Pipeline live
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5" aria-label="Admin navigation">
        <p
          className="px-2.5 pt-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--adm-text-muted)' }}
        >
          Workspace
        </p>
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href === '/admin/dashboard' && pathname.startsWith('/admin/dashboard'));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors"
              style={{
                background: active ? 'var(--adm-accent-soft)' : 'transparent',
                color: active ? 'var(--adm-accent)' : 'var(--adm-text-secondary)',
              }}
              aria-current={active ? 'page' : undefined}
            >
              <span
                style={{
                  color: active ? 'var(--adm-accent)' : 'var(--adm-text-muted)',
                  display: 'inline-flex',
                }}
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.soon && (
                <span
                  className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                  style={{
                    background: 'var(--adm-bg-subtle)',
                    color: 'var(--adm-text-muted)',
                  }}
                >
                  Soon
                </span>
              )}
              {item.badge !== undefined && (
                <span
                  className="text-[11px] font-semibold tabular-nums px-1.5 rounded"
                  style={{
                    background: 'var(--adm-bg-subtle)',
                    color: 'var(--adm-text-secondary)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div
        className="m-3 p-3 rounded-xl flex items-center gap-3"
        style={{
          background: 'var(--adm-bg-subtle)',
          border: '1px solid var(--adm-border)',
        }}
      >
        <div
          className="grid place-items-center rounded-full font-semibold text-xs"
          style={{
            width: 32,
            height: 32,
            background: 'linear-gradient(135deg,#6366F1,#EC4899)',
            color: 'white',
          }}
          aria-hidden
        >
          {userLabel.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--adm-text-primary)' }}>
            {userLabel}
          </p>
          <p className="text-[11px]" style={{ color: 'var(--adm-text-muted)' }}>
            Founder access
          </p>
        </div>
        <button
          type="button"
          title="Logout"
          aria-label="Logout"
          onClick={handleLogout}
          className="grid place-items-center rounded-md p-1.5 transition-colors"
          style={{ color: 'var(--adm-text-muted)' }}
        >
          <IconLogout size={14} />
        </button>
      </div>
    </aside>
  );
}

function TopBar({
  title,
  breadcrumb,
  actions,
}: {
  title?: ReactNode;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 px-6 lg:px-8"
      style={{
        background: 'color-mix(in oklab, var(--adm-bg-surface) 88%, transparent)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--adm-border)',
      }}
    >
      <div className="min-w-0 flex items-center gap-2">
        {breadcrumb && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--adm-text-muted)' }}>
            {breadcrumb}
          </div>
        )}
        {title && (
          <h1 className="truncate text-lg font-semibold" style={{ color: 'var(--adm-text-primary)' }}>
            {title}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  );
}
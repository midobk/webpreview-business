'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from './_components/AuthShell';
import { IconCheck } from './_components/icons';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/check-setup')
      .then((response) => response.json())
      .then((data) => {
        if (!data.isPasswordSet) {
          setNeedsSetup(true);
          router.push('/admin/setup');
        }
      })
      .catch((err) => {
        console.error('Error checking setup:', err);
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        router.push('/admin/dashboard');
        router.refresh();
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (response.status === 500 && /not configured/i.test(data.error || '')) {
        setNeedsSetup(true);
        setError('Admin password isn’t configured yet. Set one up to continue.');
        return;
      }
      setError(data.error || 'Invalid password');
    } catch (err) {
      setError('Network error — check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Admin Console"
      title="Sign in"
      subtitle="Restricted area — founder access only."
      footer={
        <>
          Protected by hashed password + secure cookie session.{' '}
          <Link href="/" style={{ color: 'var(--adm-accent)' }} className="hover:underline">
            ← Back to site
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--adm-text-secondary)' }}
          >
            Admin password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full text-sm rounded-lg px-3.5 py-3 pr-16 outline-none transition-all"
              style={{
                background: 'var(--adm-bg-app)',
                border: '1px solid var(--adm-border-strong)',
                color: 'var(--adm-text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--adm-accent)';
                e.currentTarget.style.boxShadow = '0 0 0 4px var(--adm-accent-soft)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--adm-border-strong)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-xs font-medium transition-colors"
              style={{ color: 'var(--adm-text-muted)' }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && (
          <div
            className="rounded-lg p-3.5 text-sm"
            style={{
              background: needsSetup ? 'rgba(245,158,11,0.10)' : 'var(--adm-danger-soft)',
              border: `1px solid ${needsSetup ? 'rgba(245,158,11,0.30)' : 'rgba(239,68,68,0.30)'}`,
              color: needsSetup ? '#B45309' : 'var(--adm-danger)',
            }}
          >
            <div className="flex items-start gap-2">
              <span style={{ marginTop: 1 }}>
                <IconCheck size={14} />
              </span>
              <div className="flex-1">
                {error}
                {needsSetup && (
                  <div className="mt-2">
                    <Link
                      href="/admin/setup"
                      className="font-semibold underline"
                      style={{ color: '#B45309' }}
                    >
                      Set up admin password →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed adm-brand-gradient"
          style={{ boxShadow: 'var(--adm-shadow-glow)' }}
        >
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}
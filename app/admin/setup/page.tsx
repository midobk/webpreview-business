'use client';

import { useState } from 'react';
import { AuthShell } from '../_components/AuthShell';
import { IconCheck, IconEye, IconEyeOff, IconShield } from '../_components/icons';

export default function AdminSetup() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hash, setHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(s, 4);
  })();
  const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#CBD5E1', '#F87171', '#FBBF24', '#34D399', '#10B981'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    setHash('');

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message || 'Password saved.');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to set up admin password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyHash = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <AuthShell
      eyebrow="First-time setup"
      title={hash ? 'Password generated' : 'Create admin password'}
      subtitle={
        hash
          ? 'Copy this hash and add it to your Vercel environment variables.'
          : 'Pick a strong password. It is sent over HTTPS and stored only as a bcrypt hash.'
      }
      footer={
        <>
          <IconShield size={11} /> Hashed with bcrypt (cost 12). Stored only as a hash in your env.
        </>
      }
    >
      {hash ? (
        <div className="space-y-5">
          <div
            className="rounded-xl p-4"
            style={{
              background: 'var(--adm-success-soft)',
              border: '1px solid rgba(16,185,129,0.30)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="grid place-items-center rounded-full"
                style={{
                  width: 22,
                  height: 22,
                  background: 'var(--adm-success)',
                  color: 'white',
                }}
              >
                <IconCheck size={12} />
              </span>
              <p className="text-sm font-semibold" style={{ color: 'var(--adm-success)' }}>
                Password hashed successfully
              </p>
            </div>
            <p className="text-xs mb-2.5" style={{ color: 'var(--adm-text-secondary)' }}>
              Copy this hash and set it as <code style={{ fontFamily: 'var(--font-mono)' }}>PASSWORD_HASH</code> in Vercel:
            </p>
            <div className="relative">
              <textarea
                readOnly
                value={hash}
                onClick={(e) => e.currentTarget.select()}
                rows={4}
                className="w-full text-[11px] rounded-lg p-3 outline-none resize-none"
                style={{
                  fontFamily: 'var(--font-mono)',
                  background: 'var(--adm-bg-app)',
                  border: '1px solid var(--adm-border)',
                  color: 'var(--adm-text-primary)',
                  wordBreak: 'break-all',
                }}
              />
            </div>
            <button
              onClick={copyHash}
              className="mt-2.5 w-full rounded-lg py-2.5 text-sm font-semibold text-white adm-brand-gradient"
              style={{ boxShadow: 'var(--adm-shadow-glow)' }}
            >
              {copied ? '✓ Copied to clipboard' : 'Copy hash'}
            </button>
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              background: 'var(--adm-bg-subtle)',
              border: '1px solid var(--adm-border)',
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--adm-text-secondary)' }}
            >
              Next steps
            </p>
            <ol
              className="text-sm space-y-1.5 list-decimal pl-4"
              style={{ color: 'var(--adm-text-primary)' }}
            >
              <li>Open your Vercel project settings</li>
              <li>
                Go to <strong>Environment Variables</strong>
              </li>
              <li>
                Add <code style={{ fontFamily: 'var(--font-mono)' }}>PASSWORD_HASH</code>
              </li>
              <li>Paste the hash as the value</li>
              <li>Redeploy the project</li>
              <li>
                Visit <code style={{ fontFamily: 'var(--font-mono)' }}>/admin</code> to log in
              </li>
            </ol>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--adm-text-secondary)' }}
            >
              New admin password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full text-sm rounded-lg px-3.5 py-3 pr-11 outline-none transition-all"
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
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute top-1/2 right-2 -translate-y-1/2 grid place-items-center rounded-md transition-colors"
                style={{
                  width: 32,
                  height: 32,
                  color: 'var(--adm-text-secondary)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--adm-text-primary)'; e.currentTarget.style.background = 'var(--adm-bg-active)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--adm-text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
              >
                {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
            {password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-colors"
                      style={{
                        background: i < strength ? strengthColors[strength] : 'var(--adm-bg-active)',
                      }}
                    />
                  ))}
                </div>
                <span
                  className="text-[11px] font-medium w-12 text-right"
                  style={{ color: 'var(--adm-text-secondary)' }}
                >
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: 'var(--adm-text-secondary)' }}
            >
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter to confirm"
                className="w-full text-sm rounded-lg px-3.5 py-3 pr-11 outline-none transition-all"
                style={{
                  background: 'var(--adm-bg-app)',
                  border: `1px solid ${
                    confirmPassword && confirmPassword === password
                      ? 'rgba(16,185,129,0.5)'
                      : 'var(--adm-border-strong)'
                  }`,
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
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                aria-pressed={showConfirmPassword}
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute top-1/2 right-2 -translate-y-1/2 grid place-items-center rounded-md transition-colors"
                style={{
                  width: 32,
                  height: 32,
                  color: 'var(--adm-text-secondary)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--adm-text-primary)'; e.currentTarget.style.background = 'var(--adm-bg-active)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--adm-text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
              >
                {showConfirmPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>
            {confirmPassword && confirmPassword === password && (
              <p className="mt-2 text-xs flex items-center gap-1.5" style={{ color: 'var(--adm-success)' }}>
                <IconCheck size={12} /> Passwords match
              </p>
            )}
            {confirmPassword && confirmPassword !== password && (
              <p className="mt-2 text-xs" style={{ color: 'var(--adm-danger)' }}>
                Passwords don’t match yet
              </p>
            )}
          </div>

          {error && (
            <div
              className="rounded-lg p-3.5 text-sm"
              style={{
                background: 'var(--adm-danger-soft)',
                border: '1px solid rgba(239,68,68,0.30)',
                color: 'var(--adm-danger)',
              }}
            >
              {error}
            </div>
          )}

          {successMessage && (
            <div
              className="rounded-lg p-3.5 text-sm"
              style={{
                background: 'var(--adm-success-soft)',
                border: '1px solid rgba(16,185,129,0.30)',
                color: 'var(--adm-success)',
              }}
            >
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed adm-brand-gradient"
            style={{ boxShadow: 'var(--adm-shadow-glow)' }}
          >
            {isLoading ? 'Setting up…' : 'Set admin password'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

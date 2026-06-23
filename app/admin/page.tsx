'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Check if already authenticated
  useEffect(() => {
    // Check if password is set
    fetch('/api/admin/check-setup')
      .then(response => response.json())
      .then(data => {
        if (!data.isPasswordSet) {
          setNeedsSetup(true);
          router.push('/admin/setup');
        }
      })
      .catch(err => {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Redirect to dashboard on successful login
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin area
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Restricted — admin access only.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="appearance-none rounded-md relative block w-full px-3 py-3 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter admin password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 text-sm"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <div className={`rounded-md p-4 ${needsSetup ? 'bg-amber-50 border border-amber-200' : 'bg-red-50'}`}>
              <div className={`text-sm ${needsSetup ? 'text-amber-800' : 'text-red-700'}`}>
                {error}
              </div>
              {needsSetup && (
                <Link
                  href="/admin/setup"
                  className="mt-2 inline-block text-sm font-semibold text-amber-900 underline hover:text-amber-700"
                >
                  Set up admin password →
                </Link>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>Signing in…</span>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
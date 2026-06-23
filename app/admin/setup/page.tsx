'use client';

import { useState } from 'react';

export default function AdminSetup() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [hash, setHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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
  const strengthColors = ['bg-slate-200', 'bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-600'];

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
    setHash('');

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        setHash(data.hash);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to set up admin password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyHash = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Restricted — admin access only.
          </p>
        </div>
        
        {hash ? (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">
                ✅ Password hashed successfully!
              </h3>
              <p className="text-sm text-green-700 mb-3">
                Copy this hash and set it as a Vercel environment variable:
              </p>
              <div className="relative">
                <textarea
                  readOnly
                  value={hash}
                  onClick={(e) => e.currentTarget.select()}
                  className="w-full text-xs font-mono bg-white border border-green-300 rounded p-2 text-gray-800 break-all"
                  rows={4}
                />
                <button
                  onClick={copyHash}
                  className="mt-2 w-full bg-green-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-green-700"
                >
                  {copied ? '✓ Copied!' : 'Copy Hash'}
                </button>
              </div>
            </div>
            <div className="rounded-md bg-blue-50 p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Next steps:
              </h3>
              <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                <li>Go to your Vercel project settings</li>
                <li>Navigate to Environment Variables</li>
                <li>Add a variable named <code className="bg-blue-100 px-1 rounded">PASSWORD_HASH</code></li>
                <li>Paste the hash as the value</li>
                <li>Redeploy the project</li>
                <li>Then visit <code className="bg-blue-100 px-1 rounded">/admin</code> to login</li>
              </ol>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New admin password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-t-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="At least 8 characters"
                />
                {password && (
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded ${i < strength ? strengthColors[strength] : 'bg-slate-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 w-12 text-right">{strengthLabels[strength]}</span>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm password"
                />
                {confirmPassword && confirmPassword === password && (
                  <p className="mt-1 text-xs text-emerald-600">✓ Passwords match</p>
                )}
                {confirmPassword && confirmPassword !== password && (
                  <p className="mt-1 text-xs text-red-600">Passwords don’t match yet</p>
                )}
              </div>
            </div>
            
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Setting up…' : 'Set admin password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
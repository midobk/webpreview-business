'use client';

import { FormEvent, useState } from 'react';

export function RevisionRequest({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [request, setRequest] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState('saving');
    setMessage('');
    try {
      const response = await fetch('/api/revision-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, email, request }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Please try again.');
      setState('success');
      setMessage('Thanks — your request is in our priority review queue.');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setState('idle'); setMessage(''); }}
        className="fixed bottom-5 right-5 z-20 rounded-full px-4 py-3 text-sm font-semibold shadow-xl transition-transform hover:-translate-y-0.5"
        style={{ background: '#111827', color: '#fff' }}
      >
        Request changes
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 grid place-items-center p-4"
          style={{ background: 'rgba(15, 23, 42, 0.48)', backdropFilter: 'blur(6px)' }}
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="revision-request-title"
        >
          <div
            className="w-full max-w-lg rounded-2xl p-6 shadow-2xl"
            style={{ background: '#fff', color: '#111827' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: '#6366f1' }}>
                  Keep the momentum
                </p>
                <h2 id="revision-request-title" className="mt-2 text-2xl font-semibold tracking-tight">
                  What would you like changed?
                </h2>
                <p className="mt-2 text-sm leading-6" style={{ color: '#64748b' }}>
                  Tell us what feels off. A change request keeps your draft in our priority queue so we can review it with you.
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-2xl leading-none" style={{ color: '#94a3b8' }}>
                ×
              </button>
            </div>

            {state === 'success' ? (
              <div className="mt-6 rounded-xl p-4 text-sm" style={{ background: '#ecfdf5', color: '#047857' }}>
                {message}
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-4">
                <label className="block text-sm font-medium">
                  Email used for the draft
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-1.5 w-full rounded-lg border px-3 py-2.5 outline-none"
                    style={{ borderColor: '#cbd5e1' }}
                  />
                </label>
                <label className="block text-sm font-medium">
                  Change request
                  <textarea
                    required
                    minLength={10}
                    maxLength={4000}
                    rows={5}
                    value={request}
                    onChange={(event) => setRequest(event.target.value)}
                    placeholder="For example: make the hero feel warmer, bring the booking CTA higher, and use a more editorial tone."
                    className="mt-1.5 w-full resize-y rounded-lg border px-3 py-2.5 outline-none"
                    style={{ borderColor: '#cbd5e1' }}
                  />
                </label>
                {message && <p className="text-sm" style={{ color: '#b91c1c' }}>{message}</p>}
                <button
                  type="submit"
                  disabled={state === 'saving'}
                  className="w-full rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-60"
                  style={{ background: '#111827', color: '#fff' }}
                >
                  {state === 'saving' ? 'Saving request…' : 'Send change request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import { useState } from 'react';
import SuccessCheck from '@/components/motion/SuccessCheck';

/* ------------------------------------------------------------------ */
/*  Lead capture — same /api/leads contract as the classic homepage   */
/*  (businessName + email required; website + message optional).      */
/* ------------------------------------------------------------------ */

type FormState = {
  businessName: string;
  email: string;
  website: string;
  message: string;
};

const initialForm: FormState = { businessName: '', email: '', website: '', message: '' };

export default function LeadForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; website?: boolean }>({});

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const urlValid = form.website === '' || /^https?:\/\/.+\..+/.test(form.website);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, website: true });
    if (!form.businessName.trim() || !emailValid || !urlValid) {
      setError('Please fix the highlighted fields and try again.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName.trim(),
          email: form.email.trim(),
          website: form.website.trim(),
          message: form.message.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Network error — please try again in a moment.');
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <div className="v2-card p-8 sm:p-10 text-center" role="status">
        <SuccessCheck trigger className="mx-auto w-14 h-14 text-[var(--v2-lume)]" />
        <h3 className="v2-serif mt-5 text-2xl font-medium">Your preview is in the queue.</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--v2-cream-dim)]">
          Watch your inbox — the link usually lands in a couple of minutes. No
          reply needed if you hate it. We only follow up once.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="v2-card p-6 sm:p-8 space-y-4" noValidate>
      <div>
        <label htmlFor="v2-businessName" className="v2-mono block text-[10px] text-[var(--v2-cream-faint)] mb-2">
          business name *
        </label>
        <input
          id="v2-businessName"
          name="businessName"
          type="text"
          required
          autoComplete="organization"
          placeholder="Maple & Main Plumbing"
          className="v2-input"
          value={form.businessName}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="v2-email" className="v2-mono block text-[10px] text-[var(--v2-cream-faint)] mb-2">
          email *
        </label>
        <input
          id="v2-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@yourbusiness.ca"
          className="v2-input"
          aria-invalid={touched.email && !emailValid ? 'true' : undefined}
          value={form.email}
          onChange={handleChange}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        />
        {touched.email && !emailValid && form.email !== '' && (
          <p className="mt-1.5 text-xs text-[#e0604a]">That email doesn&apos;t look right.</p>
        )}
      </div>

      <div>
        <label htmlFor="v2-website" className="v2-mono block text-[10px] text-[var(--v2-cream-faint)] mb-2">
          current website — if any
        </label>
        <input
          id="v2-website"
          name="website"
          type="url"
          autoComplete="url"
          placeholder="https:// (leave blank if you don't have one)"
          className="v2-input"
          aria-invalid={touched.website && !urlValid ? 'true' : undefined}
          value={form.website}
          onChange={handleChange}
          onBlur={() => setTouched((t) => ({ ...t, website: true }))}
        />
        {touched.website && !urlValid && (
          <p className="mt-1.5 text-xs text-[#e0604a]">
            URLs start with http:// or https:// — or leave it blank.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="v2-message" className="v2-mono block text-[10px] text-[var(--v2-cream-faint)] mb-2">
          anything we should know?
        </label>
        <textarea
          id="v2-message"
          name="message"
          rows={3}
          placeholder="What you do, where you work, the vibe you want…"
          className="v2-input resize-none"
          value={form.message}
          onChange={handleChange}
        />
      </div>

      {error && (
        <p className="text-sm text-[#e0604a]" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="v2-btn v2-btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy ? 'Sending…' : 'Build my free preview'}
        {!busy && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        )}
      </button>

      <p className="text-center text-[11px] text-[var(--v2-cream-faint)]">
        No credit card. No sales call. One follow-up, ever.
      </p>
    </form>
  );
}

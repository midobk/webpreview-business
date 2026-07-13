'use client';

import { useState } from 'react';
import SuccessCheck from '@/components/motion/SuccessCheck';

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
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState<{
    businessName?: boolean;
    email?: boolean;
    website?: boolean;
  }>({});

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const urlValid = form.website === '' || /^https?:\/\/.+\..+/.test(form.website);
  const businessNameValid = form.businessName.trim().length > 0;
  const businessNameErrorId = 'v2-businessName-error';
  const emailErrorId = 'v2-email-error';
  const websiteErrorId = 'v2-website-error';

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ businessName: true, email: true, website: true });

    if (!businessNameValid || !emailValid || !urlValid) {
      setError('Please fix the highlighted fields and try again.');
      return;
    }

    setBusy(true);
    setError('');
    const formElement = event.currentTarget as HTMLFormElement;
    const honeypot = (formElement.elements.namedItem('company') as HTMLInputElement)?.value || '';

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName.trim(),
          email: form.email.trim(),
          website: form.website.trim(),
          message: form.message.trim(),
          company: honeypot,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSubmittedEmail(form.email.trim());
      setSubmitted(true);
    } catch {
      setError('Network error — please try again in a moment.');
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <div className="v2-card p-8 text-center sm:p-10" role="status" aria-live="polite">
        <SuccessCheck trigger className="mx-auto h-14 w-14 text-[var(--v2-lume)]" />
        <h3 className="v2-serif mt-5 text-2xl font-medium">Request received.</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--v2-cream-dim)]">
          We&apos;ll review the details and send the draft to{' '}
          <span className="font-semibold text-[var(--v2-cream)]">{submittedEmail}</span>.
          Most eligible requests are delivered within the hour during service hours after
          the submission details and production checks are complete. We only follow up once.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="v2-card space-y-4 p-6 sm:p-8" noValidate aria-busy={busy}>
      <input
        name="company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      />
      <div>
        <label htmlFor="v2-businessName" className="v2-mono mb-2 block text-[10px] text-[var(--v2-cream-faint)]">
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
          aria-invalid={touched.businessName && !businessNameValid ? 'true' : undefined}
          aria-describedby={touched.businessName && !businessNameValid ? businessNameErrorId : undefined}
          value={form.businessName}
          onChange={handleChange}
          onBlur={() => setTouched((current) => ({ ...current, businessName: true }))}
        />
        {touched.businessName && !businessNameValid && (
          <p id={businessNameErrorId} className="mt-1.5 text-xs text-[#e0604a]">Tell us your business name.</p>
        )}
      </div>

      <div>
        <label htmlFor="v2-email" className="v2-mono mb-2 block text-[10px] text-[var(--v2-cream-faint)]">
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
          aria-describedby={touched.email && !emailValid ? emailErrorId : undefined}
          value={form.email}
          onChange={handleChange}
          onBlur={() => setTouched((current) => ({ ...current, email: true }))}
        />
        {touched.email && !emailValid && (
          <p id={emailErrorId} className="mt-1.5 text-xs text-[#e0604a]">Enter a valid email address.</p>
        )}
      </div>

      <div>
        <label htmlFor="v2-website" className="v2-mono mb-2 block text-[10px] text-[var(--v2-cream-faint)]">
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
          aria-describedby={touched.website && !urlValid ? websiteErrorId : undefined}
          value={form.website}
          onChange={handleChange}
          onBlur={() => setTouched((current) => ({ ...current, website: true }))}
        />
        {touched.website && !urlValid && (
          <p id={websiteErrorId} className="mt-1.5 text-xs text-[#e0604a]">
            URLs start with http:// or https:// — or leave it blank.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="v2-message" className="v2-mono mb-2 block text-[10px] text-[var(--v2-cream-faint)]">
          anything we should know?
        </label>
        <textarea
          id="v2-message"
          name="message"
          rows={3}
          placeholder="What you do, where you work, the direction you want…"
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
        className="v2-btn v2-btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Sending…' : 'Request my free draft'}
        {!busy && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        )}
      </button>

      <p className="text-center text-[11px] text-[var(--v2-cream-faint)]">
        One personalized initial draft. No credit card. No sales call. One follow-up, ever.
      </p>
    </form>
  );
}

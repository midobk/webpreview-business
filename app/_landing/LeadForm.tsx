'use client';

import { useEffect, useRef, useState } from 'react';
import SuccessCheck from '@/components/motion/SuccessCheck';
import { captureAttribution, getAttribution, newEventId, trackLead } from '@/lib/attribution';

type FormState = {
  businessName: string;
  email: string;
  website: string;
  message: string;
};

const initialForm: FormState = { businessName: '', email: '', website: '', message: '' };

export default function LeadForm() {
  const successRef = useRef<HTMLDivElement | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [touched, setTouched] = useState<{
    businessName?: boolean;
    email?: boolean;
    website?: boolean;
  }>({});

  // Ad-click params (utm_*, fbclid) are captured on mount so paid leads stay
  // attributable even if the visitor browses around before submitting.
  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => {
    if (!submitted) return;
    const frame = requestAnimationFrame(() => successRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [submitted]);

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
      if (!urlValid) setDetailsOpen(true);
      setError('Please fix the highlighted fields and try again.');
      return;
    }

    setBusy(true);
    setError('');
    const formElement = event.currentTarget as HTMLFormElement;
    // Honeypot field name is intentionally non-semantic so browser autofill
    // and password-manager extensions (1Password, Bitwarden, Chrome, Safari)
    // don't populate it with a stored value. A real user never sees or fills
    // this input; only a bot does.
    const honeypot =
      (formElement.elements.namedItem('honey_field_v2') as HTMLInputElement)?.value || '';
    // Shared browser/server event id so Meta deduplicates the pixel and
    // Conversions API copies of the same Lead event. Guarded fallback inside
    // newEventId — never let id generation block the submit.
    const eventId = newEventId();

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName.trim(),
          email: form.email.trim(),
          website: form.website.trim(),
          message: form.message.trim(),
          honey_field_v2: honeypot,
          attribution: { ...getAttribution(), event_id: eventId },
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      trackLead(eventId);
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
      <div
        ref={successRef}
        tabIndex={-1}
        className="v2-card p-7 outline-none sm:p-8"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-4">
          <SuccessCheck trigger className="h-12 w-12 shrink-0 text-[var(--v2-lume)]" />
          <div>
            <div className="v2-mono text-[9px] text-[var(--v2-lume)]">
              preview request received
            </div>
            <h3 className="v2-serif mt-1 text-2xl font-medium">You&apos;re all set.</h3>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-[var(--v2-cream-dim)]">
          Your request is in. We&apos;ll send the first direction to{' '}
          <span className="font-semibold text-[var(--v2-cream)]">{submittedEmail}</span>.
        </p>

        <ol className="mt-6 grid gap-2" aria-label="What happens next">
          {[
            ['01', 'Review your details'],
            ['02', 'Prepare your preview'],
            ['03', 'Send it to your inbox'],
          ].map(([step, label]) => (
            <li
              key={step}
              className="flex items-center gap-3 rounded-xl border border-[var(--v2-line)] bg-[rgba(239,234,224,0.025)] px-3 py-2.5 text-sm text-[var(--v2-cream-dim)]"
            >
              <span className="v2-mono text-[9px] text-[var(--v2-lume)]">{step}</span>
              {label}
            </li>
          ))}
        </ol>

        <p className="mt-5 text-xs leading-relaxed text-[var(--v2-cream-faint)]">
          Most eligible requests are delivered within the hour during service hours after
          submission details and production checks are complete. We only follow up once.
        </p>

        <a
          href="/showcase"
          className="mt-5 inline-flex text-sm font-semibold text-[var(--v2-lume)] underline decoration-[var(--v2-line-strong)] underline-offset-4 hover:decoration-[var(--v2-lume)]"
        >
          See example previews
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="v2-card space-y-4 p-6 sm:p-8" noValidate aria-busy={busy}>
      <input
        name="honey_field_v2"
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
          <p id={businessNameErrorId} className="mt-1.5 text-xs text-[var(--v2-error)]">Tell us your business name.</p>
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
          <p id={emailErrorId} className="mt-1.5 text-xs text-[var(--v2-error)]">Enter a valid email address.</p>
        )}
      </div>

      <details
        open={detailsOpen}
        onToggle={(event) => setDetailsOpen(event.currentTarget.open)}
        className="v2-form-details"
      >
        <summary>
          <span>Add a website or notes</span>
          <span className="v2-form-details-icon" aria-hidden="true">+</span>
        </summary>
        <div className="space-y-4 border-t border-[var(--v2-line)] px-4 pb-4 pt-4">
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
              <p id={websiteErrorId} className="mt-1.5 text-xs text-[var(--v2-error)]">
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
        </div>
      </details>

      {error && (
        <p className="text-sm text-[var(--v2-error)]" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="v2-btn v2-btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Sending…' : 'Request my free preview'}
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

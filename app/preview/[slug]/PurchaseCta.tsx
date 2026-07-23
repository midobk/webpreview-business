'use client';

import { useState } from 'react';

type PurchaseCtaProps = {
  slug: string;
  token?: string;
  managedUrl?: string;
  ownUrl?: string;
  contactEmail?: string;
};

/**
 * "Get this website" plan chooser shown on private draft previews next to
 * the change-request button. Plans check out through Stripe Payment Links;
 * the prototype slug rides along as client_reference_id so the webhook can
 * match the payment back to the lead. Renders nothing until at least one
 * payment link is configured.
 *
 * The "Manage subscription" tertiary action lets an existing customer open
 * their Stripe Customer Portal (cancel / update card / view invoices)
 * straight from the preview page. The portal route is token-gated, so a
 * non-customer will get a friendly 404 (the button stays visible; we don't
 * want to leak "do you have a subscription" hints to anonymous visitors).
 */
export function PurchaseCta({ slug, token, managedUrl, ownUrl, contactEmail }: PurchaseCtaProps) {
  const [open, setOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  if (!managedUrl && !ownUrl) return null;

  const checkoutUrl = (base: string) => {
    // Stripe client_reference_id allows only [a-zA-Z0-9_-]; the slug charset
    // additionally allows '&', so sanitize before appending.
    const reference = slug.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 200);
    return `${base}${base.includes('?') ? '&' : '?'}client_reference_id=${encodeURIComponent(reference)}`;
  };

  async function openPortal() {
    if (!token) {
      setPortalError('Open this page using the link in your email to manage your subscription.');
      return;
    }
    setPortalLoading(true);
    setPortalError(null);
    try {
      const response = await fetch('/api/stripe/portal/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, token }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!response.ok || !data.url) {
        setPortalError(data.error || 'Failed to open Stripe customer portal.');
        return;
      }
      window.location.href = data.url;
    } catch (error) {
      setPortalError(
        error instanceof Error ? error.message : 'Failed to open Stripe customer portal.'
      );
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full px-4 py-3 text-sm font-semibold shadow-xl transition-transform hover:-translate-y-0.5"
        style={{ background: '#9E3B26', color: '#fff' }}
      >
        Get this website
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 grid place-items-center overflow-y-auto p-4"
          style={{ background: 'rgba(15, 23, 42, 0.48)', backdropFilter: 'blur(6px)' }}
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="purchase-cta-title"
        >
          <div
            className="w-full max-w-2xl rounded-2xl p-6 shadow-2xl"
            style={{ background: '#fff', color: '#111827' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: '#9E3B26' }}>
                  You&apos;ve seen the draft
                </p>
                <h2 id="purchase-cta-title" className="mt-2 text-2xl font-semibold tracking-tight">
                  Make this your website
                </h2>
                <p className="mt-2 text-sm leading-6" style={{ color: '#64748b' }}>
                  Pick how you&apos;d like to own it. Checkout is handled securely by Stripe, and you&apos;ll
                  get a receipt plus next steps by email right after.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-2xl leading-none"
                style={{ color: '#94a3b8' }}
              >
                ×
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {managedUrl && (
                <div className="flex flex-col rounded-xl border p-5" style={{ borderColor: '#9E3B26' }}>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#9E3B26' }}>
                    Most popular
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">Managed Website</h3>
                  <p className="mt-1 text-sm font-medium">
                    $399 setup today <span style={{ color: '#64748b' }}>+ $69/mo</span>
                  </p>
                  <ul className="mt-3 flex-1 space-y-1.5 text-sm leading-6" style={{ color: '#475569' }}>
                    <li>We finish, launch, host and maintain it</li>
                    <li>Custom domain connection + SSL</li>
                    <li>Two content updates per month</li>
                    <li>Cancel anytime — self-serve, no phone call</li>
                  </ul>
                  <a
                    href={checkoutUrl(managedUrl)}
                    className="mt-4 rounded-lg px-4 py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ background: '#9E3B26', color: '#fff' }}
                  >
                    Continue to secure checkout
                  </a>
                </div>
              )}

              {ownUrl && (
                <div className="flex flex-col rounded-xl border p-5" style={{ borderColor: '#cbd5e1' }}>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: '#64748b' }}>
                    One-time
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">Own Your Website</h3>
                  <p className="mt-1 text-sm font-medium">
                    $449 deposit today <span style={{ color: '#64748b' }}>· $899 total</span>
                  </p>
                  <ul className="mt-3 flex-1 space-y-1.5 text-sm leading-6" style={{ color: '#475569' }}>
                    <li>Balance due only when you approve the finished site</li>
                    <li>Full source files — host it anywhere</li>
                    <li>Domain and hosting guidance</li>
                    <li>30 days of bug-fix support</li>
                  </ul>
                  <a
                    href={checkoutUrl(ownUrl)}
                    className="mt-4 rounded-lg border px-4 py-3 text-center text-sm font-semibold transition-colors hover:bg-slate-50"
                    style={{ borderColor: '#111827', color: '#111827' }}
                  >
                    Continue to secure checkout
                  </a>
                </div>
              )}
            </div>

            <div className="mt-5 border-t pt-4" style={{ borderColor: '#e2e8f0' }}>
              <button
                type="button"
                onClick={openPortal}
                disabled={portalLoading}
                className="text-xs font-semibold underline underline-offset-2 disabled:opacity-50"
                style={{ color: '#9E3B26' }}
              >
                {portalLoading ? 'Opening…' : 'Already a customer? Manage subscription'}
              </button>
              {portalError && (
                <p className="mt-2 text-xs leading-5" style={{ color: '#b91c1c' }}>
                  {portalError}
                </p>
              )}
            </div>

            <p className="mt-5 text-center text-xs leading-5" style={{ color: '#94a3b8' }}>
              Payments processed by Stripe — we never see your card details.
              {contactEmail ? (
                <>
                  {' '}
                  Prefer to talk it through first?{' '}
                  <a href={`mailto:${contactEmail}`} className="underline" style={{ color: '#64748b' }}>
                    {contactEmail}
                  </a>
                </>
              ) : null}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

import Stripe from 'stripe';

/**
 * Stripe SDK construction for the Customer Portal routes
 * (/api/stripe/portal/admin and /api/stripe/portal/customer).
 *
 * Uses the Restricted API Key (STRIPE_RESTRICTED_KEY, scope =
 * billing_portal.sessions.create + customers.read + subscriptions.read) when
 * present, falling back to the full STRIPE_SECRET_KEY with a production-only
 * console warning. Minimum-privilege per Stripe best practice. Returns null
 * when neither key is configured.
 *
 * apiVersion is omitted to use the SDK's default (the API version shipped with
 * the installed stripe-node major). Pinning a custom version here would force
 * the routes to track every API bump; the SDK default is the right level of
 * forward-compat for an MVP route.
 */
export function rakStripe(): Stripe | null {
  const key = process.env.STRIPE_RESTRICTED_KEY || process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!process.env.STRIPE_RESTRICTED_KEY && process.env.NODE_ENV === 'production') {
    console.warn(
      '[stripe/portal] STRIPE_RESTRICTED_KEY unset in production; falling back to STRIPE_SECRET_KEY. Provision a RAK with billing_portal.sessions.create + customers.read + subscriptions.read.'
    );
  }
  return new Stripe(key);
}

/**
 * Customer Portal return URL. Both portal routes send the user back to the
 * thank-you page after they finish in the Stripe portal.
 */
export function portalReturnUrl(): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://seawaysites.com').replace(/\/$/, '');
  return `${base}/thank-you`;
}
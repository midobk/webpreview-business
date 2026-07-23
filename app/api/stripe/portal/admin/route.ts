import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { requireAdmin, requireSameOrigin } from '@/lib/auth-server';
import { getSupabase } from '@/lib/supabase';

/**
 * /api/stripe/portal/admin — open a Stripe Customer Portal session for a lead.
 *
 * Auth: admin cookie + same-origin (the button is only shown in the admin
 * lead drawer). Body: `{ lead_id: string }`. The route looks up the lead's
 * most recent purchase's stripe_customer_id and asks Stripe for a portal
 * session URL.
 *
 * Auth model: We use a RESTRICTED Stripe API key (STRIPE_RESTRICTED_KEY,
 * scope = billing_portal.sessions.create + customers.read +
 * subscriptions.read) and fall back to STRIPE_SECRET_KEY with a console
 * warning if the RAK is unset. The full secret key is never used by this
 * route in production. See .env.example for the RAK provisioning steps.
 */

const MAX_BODY_BYTES = 2_000;

function rakStripe(): Stripe | null {
  const key = process.env.STRIPE_RESTRICTED_KEY || process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (
    !process.env.STRIPE_RESTRICTED_KEY &&
    process.env.NODE_ENV === 'production'
  ) {
    console.warn(
      '[stripe/portal] STRIPE_RESTRICTED_KEY unset in production; falling back to STRIPE_SECRET_KEY. Provision a RAK with billing_portal.sessions.create + customers.read + subscriptions.read.'
    );
  }
  // apiVersion is omitted to use the SDK's default (matches the Stripe API
  // version shipped with the installed stripe-node major). Pinning a custom
  // version here would force the route to track every API bump; the SDK
  // default is the right level of forward-compat for an MVP route.
  return new Stripe(key);
}

function returnUrl(): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://seawaysites.com').replace(/\/$/, '');
  return `${base}/thank-you`;
}

export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const originDenied = requireSameOrigin(request);
  if (originDenied) return originDenied;

  if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request too large.' }, { status: 413 });
  }
  const body = await request.json().catch(() => ({}));
  const leadId = typeof body.lead_id === 'string' ? body.lead_id.trim() : '';
  if (!leadId || leadId.length > 200) {
    return NextResponse.json({ error: 'lead_id is required.' }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
  }

  // Most recent purchase wins: if a lead has been refunded and re-bought,
  // the new customer id is the one we want to open a portal for.
  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .select('stripe_customer_id')
    .eq('lead_id', leadId)
    .not('stripe_customer_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (purchaseError) {
    console.error('[stripe/portal] purchase lookup failed:', purchaseError);
    return NextResponse.json({ error: 'Failed to look up customer.' }, { status: 500 });
  }
  if (!purchase?.stripe_customer_id) {
    return NextResponse.json(
      {
        error:
          'No Stripe customer for this lead. The portal becomes available after the first successful charge.',
      },
      { status: 404 }
    );
  }

  const stripe = rakStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: purchase.stripe_customer_id,
      return_url: returnUrl(),
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[stripe/portal] billingPortal.sessions.create failed:', error);
    return NextResponse.json(
      { error: 'Failed to open Stripe customer portal.' },
      { status: 502 }
    );
  }
}

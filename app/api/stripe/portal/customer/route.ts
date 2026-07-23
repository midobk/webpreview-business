import { NextResponse } from 'next/server';
import { isValidDraftPreviewToken } from '@/lib/draft-preview-token';
import { getSupabase } from '@/lib/supabase';
import { findLeadForPurchase } from '@/lib/lead-lookup';
import { rakStripe, portalReturnUrl } from '@/lib/stripe-server';

/**
 * /api/stripe/portal/customer — open a Stripe Customer Portal session for a
 * preview-page visitor who holds a valid draft preview token.
 *
 * Auth: the visitor must supply `{ slug, token }` where the token is the
 * HMAC-signed draft preview token (same secret the preview page uses to
 * gate access). Possession of the token proves the visitor was sent the
 * private preview link — they can also have a Stripe subscription for the
 * same business.
 *
 * The route is deliberately NOT gated by lead email: a business partner may
 * be the paying customer and have a different email than the outreach
 * contact. Token possession is the right level of trust here.
 *
 * Stripe: same RAK + same SDK as the admin route. No local-fallback (this
 * route always requires Supabase; production has it configured).
 *
 * Info-leak note: the no-lead and no-purchase cases return the SAME generic
 * 404 body. A signed-token holder who hasn't bought must not be able to probe
 * whether a subscription exists for the slug, so we don't distinguish "no
 * draft" from "no subscription".
 */

const MAX_BODY_BYTES = 2_000;

// Generic, indistinguishable body for the no-lead and no-purchase cases —
// see the info-leak note above.
const UNAVAILABLE =
  'Manage subscription is unavailable for this link.';

export async function POST(request: Request) {
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request too large.' }, { status: 413 });
  }
  const body = await request.json().catch(() => ({}));
  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  const token = typeof body.token === 'string' ? body.token : '';
  if (!slug || slug.length > 200 || !token) {
    return NextResponse.json({ error: 'Invalid or expired preview link.' }, { status: 403 });
  }
  // isValidDraftPreviewToken is constant-time and rejects expired tokens.
  if (!isValidDraftPreviewToken(slug, token)) {
    return NextResponse.json({ error: 'Invalid or expired preview link.' }, { status: 403 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
  }

  // findLeadForPurchase handles the variant-base slug normalization
  // (<base>-vN -> <base>) and the legacy suffix-tolerant prefix match.
  // Email is not used to gate this route — the signed token is enough.
  const lead = await findLeadForPurchase(supabase, slug, null).catch((error) => {
    console.error('[stripe/portal/customer] lead lookup failed:', error);
    return null;
  });
  if (!lead) {
    return NextResponse.json({ error: UNAVAILABLE }, { status: 404 });
  }

  const { data: purchase, error: purchaseError } = await supabase
    .from('purchases')
    .select('stripe_customer_id')
    .eq('lead_id', lead.id)
    .not('stripe_customer_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (purchaseError) {
    console.error('[stripe/portal/customer] purchase lookup failed:', purchaseError);
    return NextResponse.json({ error: 'Failed to look up customer.' }, { status: 500 });
  }
  if (!purchase?.stripe_customer_id) {
    return NextResponse.json({ error: UNAVAILABLE }, { status: 404 });
  }

  const stripe = rakStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 503 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: purchase.stripe_customer_id,
      return_url: portalReturnUrl(),
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[stripe/portal/customer] billingPortal.sessions.create failed:', error);
    return NextResponse.json(
      { error: 'Failed to open Stripe customer portal.' },
      { status: 502 }
    );
  }
}

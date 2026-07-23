import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { findLeadForPurchase } from '@/lib/lead-lookup';
import { decodeSlugReference } from '@/lib/stripe-reference';

/**
 * Stripe webhook for the preview-page purchase flow.
 *
 * Payment Links carry the prototype slug as `client_reference_id`, so a
 * completed checkout can be matched back to the lead whose draft was bought.
 * Handles the async ACSS pre-authorized-debit lifecycle as well as cards:
 * `checkout.session.completed` may arrive with payment_status 'unpaid', and
 * the money is only confirmed by `checkout.session.async_payment_succeeded`.
 *
 * Also handles the subscription lifecycle for the Managed plan:
 *   - customer.subscription.{updated,deleted}
 *   - invoice.{paid,payment_failed}
 * These are matched to a lead by looking up the existing purchase row's
 * stripe_subscription_id. The status mapping is intentionally conservative
 * (single dunning failures do not flip lead status; only the
 * subscription.updated event with status=past_due/unpaid does).
 */

const CHECKOUT_EVENTS = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
]);

const SUBSCRIPTION_EVENTS = new Set([
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
]);

const HANDLED_EVENTS = new Set([...CHECKOUT_EVENTS, ...SUBSCRIPTION_EVENTS]);

type CheckoutSession = {
  id?: string;
  client_reference_id?: string | null;
  customer?: string | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
  amount_total?: number | null;
  currency?: string | null;
  mode?: string | null;
  payment_status?: string | null;
  subscription?: string | null;
  payment_link?: string | null;
};

type SubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused';

type Subscription = {
  id?: string;
  status?: SubscriptionStatus | null;
  customer?: string | null;
  cancel_at_period_end?: boolean | null;
  current_period_end?: number | null;
};

type Invoice = {
  id?: string;
  subscription?: string | null;
  customer?: string | null;
  amount_paid?: number | null;
  amount_due?: number | null;
  currency?: string | null;
  status?: string | null;
  number?: string | null;
  attempt_count?: number | null;
};

type StripeEvent = {
  id?: string;
  type?: string;
  data?: { object?: CheckoutSession | Subscription | Invoice };
};

function verifyStripeSignature(payload: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  let timestamp = '';
  const signatures: string[] = [];
  for (const part of header.split(',')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key === 't') timestamp = value;
    if (key === 'v1' && value) signatures.push(value);
  }
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!timestamp || signatures.length === 0 || !Number.isFinite(age) || age > 300) return false;

  const expected = Buffer.from(
    createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex'),
    'utf8'
  );
  return signatures.some((signature) => {
    const candidate = Buffer.from(signature, 'utf8');
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  });
}

function formatAmount(amount: number | null | undefined, currency: string | null | undefined): string {
  if (typeof amount !== 'number') return 'unknown amount';
  return `${(amount / 100).toFixed(2)} ${(currency || 'cad').toUpperCase()}`;
}

/**
 * Route a webhook event to the right handler. Checkout events write a
 * purchase row + append a purchase note. Subscription events match an
 * existing purchase by stripe_subscription_id, then append a note and
 * (sometimes) flip the lead status.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('Stripe webhook received but STRIPE_WEBHOOK_SECRET is not set.');
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 });
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 1_000_000) {
    return NextResponse.json({ error: 'Payload too large.' }, { status: 413 });
  }

  const payload = await request.text();
  if (!verifyStripeSignature(payload, request.headers.get('stripe-signature'), secret)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  if (!event.type || !HANDLED_EVENTS.has(event.type)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    const supabase = getSupabase();
    if (!supabase) {
      // Subscription events have no local-fallback (the dev-only JSON
      // file is meant for the checkout flow). Production deployments must
      // have Supabase configured; 503 keeps Stripe retrying.
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Purchase storage not configured.' }, { status: 503 });
      }
      if (SUBSCRIPTION_EVENTS.has(event.type)) {
        console.warn(
          `[stripe-webhook] no Supabase configured in dev; dropping ${event.type} (no local fallback for subscription events).`
        );
        return NextResponse.json({ received: true, stored: 'dev-skipped' });
      }
      return handleCheckoutLocalFallback(event);
    }

    if (CHECKOUT_EVENTS.has(event.type)) {
      await handleCheckoutEvent(event, supabase);
    } else if (SUBSCRIPTION_EVENTS.has(event.type)) {
      await handleSubscriptionEvent(event, supabase);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook processing failed:', error);
    // Non-2xx makes Stripe retry with backoff; the upsert keys make replays safe.
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}

async function handleCheckoutEvent(
  event: StripeEvent,
  supabase: NonNullable<ReturnType<typeof getSupabase>>
): Promise<void> {
  const session = event.data?.object as CheckoutSession | undefined;
  if (!session?.id) throw new Error('Missing checkout session.');

  // Decode the reversible `b64_`-prefixed reference (see lib/stripe-reference)
  // so we look up the original slug. Legacy raw/sanitized references pass
  // through unchanged.
  const slug = decodeSlugReference(session.client_reference_id?.trim() || '') || null;
  const email = session.customer_details?.email?.trim().toLowerCase() || null;
  const paymentStatus =
    event.type === 'checkout.session.async_payment_failed'
      ? 'failed'
      : session.payment_status || 'pending';
  const paid = paymentStatus === 'paid' || paymentStatus === 'no_payment_required';
  // Managed Website checks out as a subscription; the Own Your Website
  // deposit is a one-time payment. Payment Links set `mode` accordingly.
  const plan = session.mode === 'subscription' ? 'managed' : session.mode === 'payment' ? 'own' : 'unknown';

  const record = {
    id: session.id,
    slug,
    plan,
    email,
    customer_name: session.customer_details?.name || null,
    amount_total: session.amount_total ?? null,
    currency: session.currency || null,
    mode: session.mode || null,
    payment_status: paymentStatus,
    stripe_subscription_id: session.subscription || null,
    stripe_payment_link_id: session.payment_link || null,
    // Customer id is needed by the Customer Portal route. Populated on
    // every checkout event so a self-cancel mid-period still finds the
    // customer.
    stripe_customer_id: session.customer || null,
  };

  let leadId: string | null = null;
  if (slug) {
    const lead = await findLeadForPurchase(supabase, slug, email).catch((error) => {
      // A lead-lookup failure must not lose the purchase record.
      console.error('Purchase lead lookup failed:', error);
      return null;
    });
    leadId = lead?.id ?? null;
  }

  const upsert = await supabase.from('purchases').upsert({ ...record, lead_id: leadId }, { onConflict: 'id' });
  if (upsert.error) throw upsert.error;

  if (leadId) {
    const amount = formatAmount(record.amount_total, record.currency);
    // Marker includes the payment status so the confirmation event after an
    // async debit appends a second, distinct note instead of being dropped
    // by the RPC's idempotency check.
    const marker = `[purchase:${session.id}:${paymentStatus}]`;
    const entry = `[${new Date().toISOString()}] Customer purchased the ${
      plan === 'managed' ? 'Managed Website' : plan === 'own' ? 'Own Your Website (deposit)' : 'unknown'
    } plan via Stripe checkout — ${amount}, payment ${paymentStatus}. ${marker}`;
    const { error: noteError } = await supabase.rpc('append_purchase_note', {
      p_lead_id: leadId,
      p_marker: marker,
      p_entry: entry,
      p_new_status: paid ? 'purchased' : null,
    });
    if (noteError) throw noteError;
  }
}

/**
 * Handle subscription-level events. Look up the matching purchase row by
 * its stripe_subscription_id (populated on the initial checkout event),
 * then append a note and optionally flip the lead status.
 */
async function handleSubscriptionEvent(
  event: StripeEvent,
  supabase: NonNullable<ReturnType<typeof getSupabase>>
): Promise<void> {
  const obj = event.data?.object as Subscription | Invoice | undefined;
  if (!obj) throw new Error('Missing event object.');

  // Stripe delivers a single subscription id on both subscription.* and
  // invoice.* events. For subscription events the id is the subscription's
  // own id; for invoices, it is obj.subscription.
  const subscriptionId =
    'subscription' in obj && obj.subscription ? obj.subscription : 'id' in obj ? obj.id : null;
  if (!subscriptionId) {
    console.warn(`[stripe-webhook] ${event.type} without subscription id; dropping.`);
    return;
  }

  const { data: purchase, error: lookupError } = await supabase
    .from('purchases')
    .select('id, lead_id, slug, email, plan')
    .eq('stripe_subscription_id', subscriptionId)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (!purchase?.lead_id) {
    // Subscription events arriving before (or without) the original
    // checkout event are dropped. The next event for the same subscription
    // will also drop, by design — there is no way to recover the lead
    // without a checkout-time link.
    console.warn(
      `[stripe-webhook] no lead for subscription ${subscriptionId}; dropping ${event.type}.`
    );
    return;
  }
  const leadId = purchase.lead_id as string;

  let newStatus: 'cancelled' | 'payment_failed' | 'purchased' | null = null;
  let note: string | null = null;
  const now = new Date().toISOString();

  switch (event.type) {
    case 'customer.subscription.deleted': {
      newStatus = 'cancelled';
      note = `[${now}] Stripe subscription ${subscriptionId} was deleted (full cancellation). Lead marked cancelled.`;
      break;
    }
    case 'customer.subscription.updated': {
      const sub = obj as Subscription;
      const status = sub.status;
      if (status === 'canceled') {
        newStatus = 'cancelled';
        note = `[${now}] Stripe subscription ${subscriptionId} set to cancel (status=canceled).`;
      } else if (status === 'unpaid' || status === 'past_due') {
        newStatus = 'payment_failed';
        note = `[${now}] Stripe subscription ${subscriptionId} is ${status} (payment failed / in dunning).`;
      } else if (status === 'active') {
        // Recovery from past_due/unpaid: only flip back to 'purchased' if
        // the lead is currently in 'payment_failed'. Manual admin overrides
        // (any other status) are preserved. The marker still drops the note
        // on re-fire so this is idempotent.
        const { data: lead } = await supabase
          .from('leads')
          .select('status')
          .eq('id', leadId)
          .maybeSingle();
        if (lead?.status === 'payment_failed') {
          newStatus = 'purchased';
          note = `[${now}] Stripe subscription ${subscriptionId} is active again (recovered from dunning).`;
        } else {
          note = `[${now}] Stripe subscription ${subscriptionId} is active.`;
        }
      }
      break;
    }
    case 'invoice.paid': {
      const inv = obj as Invoice;
      const amount = formatAmount(inv.amount_paid, inv.currency);
      note = `[${now}] Recurring billing cycle paid for subscription ${subscriptionId} — ${amount} (invoice ${inv.number ?? inv.id ?? '?'}).`;
      // No status change.
      break;
    }
    case 'invoice.payment_failed': {
      const inv = obj as Invoice;
      const amount = formatAmount(inv.amount_due, inv.currency);
      note = `[${now}] Recurring billing payment FAILED for subscription ${subscriptionId} — ${amount} (invoice ${inv.number ?? inv.id ?? '?'}, attempt ${inv.attempt_count ?? '?'}). Stripe dunning will retry.`;
      // No status change — a single failure does not cancel; a future
      // subscription.updated event with status=past_due/unpaid will set
      // 'payment_failed' if the dunning exhausts.
      break;
    }
    default:
      return; // Unreachable; HANDLED_EVENTS guard above.
  }

  if (!note) return;
  // Dedup key per Stripe *event*, not per (type, status). Stripe redelivers
  // the same event with the same `event.id`, so including it makes true
  // retries no-ops while letting each distinct recurring invoice / dunning
  // cycle record its own note. The previous (type, status) marker silently
  // dropped every recurring `invoice.paid`/`invoice.payment_failed` after the
  // first, and any same-status `subscription.updated` after one dunning round.
  // Fall back to (type, status) only if a malformed event somehow lacks an id.
  const eventKey = event.id ?? `${event.type}${newStatus ? ':' + newStatus : ''}`;
  const marker = `[sub:${subscriptionId}:${eventKey}]`;
  const { error: rpcError } = await supabase.rpc('update_lead_from_subscription_event', {
    p_lead_id: leadId,
    p_new_status: newStatus,
    p_marker: marker,
    p_entry: note,
  });
  if (rpcError) throw rpcError;
}

async function handleCheckoutLocalFallback(event: StripeEvent): Promise<NextResponse> {
  // Dev-only path: no Supabase configured. Append to a local JSON file so
  // a developer can inspect what the webhook received without setting up
  // Supabase. Mirrors the behaviour that shipped in the first version of
  // this route.
  const session = event.data?.object as CheckoutSession | undefined;
  if (!session?.id) throw new Error('Missing checkout session.');
  const fs = await import('fs/promises');
  const path = await import('path');
  const purchasesPath = path.join(process.cwd(), 'data', 'purchases.json');
  const existing = JSON.parse(await fs.readFile(purchasesPath, 'utf8').catch(() => '[]')) as Array<
    Record<string, unknown>
  >;
  const index = existing.findIndex((row) => row.id === session.id);
  const entry = {
    ...session,
    type: event.type,
    updated_at: new Date().toISOString(),
  };
  if (index === -1) existing.push({ ...entry, created_at: entry.updated_at });
  else existing[index] = { ...existing[index], ...entry };
  await fs.writeFile(purchasesPath, JSON.stringify(existing, null, 2));
  return NextResponse.json({ received: true, stored: 'local' });
}

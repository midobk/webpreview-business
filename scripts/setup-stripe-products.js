#!/usr/bin/env node
/**
 * scripts/setup-stripe-products.js — create the Stripe products, prices,
 * Payment Links, and webhook endpoint that power the Seaway Sites
 * self-serve purchase flow.
 *
 * Idempotent: re-running the script finds the existing products by name and
 * only creates what's missing, so the script is safe to re-run after schema
 * changes or to recover from a partial setup. It does NOT touch live-mode
 * data — it operates entirely on the test account identified by the
 * STRIPE_SECRET_KEY in .env.local.
 *
 * Usage:
 *   scripts/run-with-env.sh node scripts/setup-stripe-products.js
 *
 * After running, copy the printed Payment Link URLs into:
 *   STRIPE_PAYMENT_LINK_MANAGED  (Managed Website)
 *   STRIPE_PAYMENT_LINK_OWN      (Own Your Website deposit)
 * in .env.local, then restart `npm run dev`.
 *
 * Requires:
 *   STRIPE_SECRET_KEY    in the environment
 *   NEXT_PUBLIC_SITE_URL in the environment (defaults to https://seawaysites.com)
 */

const https = require('https');
const { URLSearchParams } = require('url');

const STRIPE_API_BASE = 'api.stripe.com';
const STRIPE_API_VERSION = '2024-06-20';

const SECRET = process.env.STRIPE_SECRET_KEY;
if (!SECRET) {
  console.error('[stripe-setup] FATAL: STRIPE_SECRET_KEY is not set. Run via scripts/run-with-env.sh or set the env var.');
  process.exit(2);
}
if (!SECRET.startsWith('sk_test_') && !SECRET.startsWith('rk_test_')) {
  console.error('[stripe-setup] FATAL: STRIPE_SECRET_KEY does not look like a test key. Aborting to avoid mutating the live account.');
  process.exit(2);
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://seawaysites.com').replace(/\/$/, '');

const HANDLED_EVENTS = [
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
];

/**
 * @param {string} method
 * @param {string} path
 * @param {Record<string, string | number | boolean | undefined>} [params]
 */
function stripeRequest(method, path, params) {
  const body = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      body.append(k, String(v));
    }
  }
  const bodyStr = body.toString();

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: STRIPE_API_BASE,
        port: 443,
        path,
        method,
        headers: {
          Authorization: `Bearer ${SECRET}`,
          'Stripe-Version': STRIPE_API_VERSION,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(bodyStr),
        },
      },
      (res) => {
        let chunks = '';
        res.on('data', (c) => (chunks += c));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(chunks);
          } catch (err) {
            reject(new Error(`Non-JSON response from Stripe (HTTP ${res.statusCode}): ${chunks.slice(0, 200)}`));
            return;
          }
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`Stripe API ${method} ${path} → HTTP ${res.statusCode}: ${parsed?.error?.message || chunks.slice(0, 200)}`));
          }
        });
      }
    );
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

/**
 * List all products (paginated) and find one by exact name match.
 * @param {string} name
 */
async function findProductByName(name) {
  let starting_after;
  // Safety cap: 10 pages × 100 = 1000 products. The Seaway account currently
  // has zero; the cap is just defensive.
  for (let i = 0; i < 10; i++) {
    const params = { limit: 100 };
    if (starting_after) params.starting_after = starting_after;
    const qs = new URLSearchParams(params).toString();
    const res = await stripeRequest('GET', `/v1/products?${qs}`);
    const match = (res.data || []).find((p) => p.name === name && p.active);
    if (match) return match;
    if (!res.has_more) return null;
    starting_after = res.data[res.data.length - 1].id;
  }
  return null;
}

async function createProduct(name, description) {
  return stripeRequest('POST', '/v1/products', { name, description });
}

async function createPrice(productId, unitAmount, currency, recurring) {
  return stripeRequest('POST', '/v1/prices', {
    product: productId,
    unit_amount: unitAmount,
    currency,
    ...(recurring ? { 'recurring[interval]': recurring.interval } : {}),
  });
}

/**
 * Find an existing active price for a product with the given amount and
 * currency. Stripe Prices are immutable, so reusing the existing record
 * keeps the product's price history clean and lets the Payment Link
 * lookup below match against the same price id across re-runs.
 * @param {string} productId
 * @param {number} unitAmount in the currency's smallest unit (e.g. cents)
 * @param {string} currency
 * @param {{ interval: string } | null} recurring
 */
async function findPriceForProduct(productId, unitAmount, currency, recurring) {
  let starting_after;
  for (let i = 0; i < 10; i++) {
    const params = { product: productId, limit: 100, active: 'true' };
    if (starting_after) params.starting_after = starting_after;
    const qs = new URLSearchParams(params).toString();
    const res = await stripeRequest('GET', `/v1/prices?${qs}`);
    for (const price of res.data || []) {
      if (price.unit_amount !== unitAmount) continue;
      if (price.currency !== currency) continue;
      const priceInterval = price.recurring?.interval || null;
      const wantInterval = recurring?.interval || null;
      if (priceInterval !== wantInterval) continue;
      return price;
    }
    if (!res.has_more) return null;
    starting_after = res.data[res.data.length - 1].id;
  }
  return null;
}

/**
 * Find a Payment Link whose first line item points at the given price.
 * The link is matched by URL slug (auto-generated by Stripe) and we read
 * its line items; if any matches the requested price, we return the link.
 *
 * Stripe returns `line_items: {}` from the list endpoint unless the caller
 * explicitly expands it as `expand[]=data.line_items` (the bare `line_items`
 * expand is rejected). We send the expand so we can match on price id.
 * @param {string} priceId
 */
async function findPaymentLinkForPrice(priceId) {
  let starting_after;
  for (let i = 0; i < 10; i++) {
    const body = new URLSearchParams();
    body.append('limit', '100');
    body.append('active', 'true');
    body.append('expand[]', 'data.line_items');
    if (starting_after) body.append('starting_after', starting_after);
    const res = await new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: STRIPE_API_BASE,
          port: 443,
          path: `/v1/payment_links?${body.toString()}`,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${SECRET}`,
            'Stripe-Version': STRIPE_API_VERSION,
          },
        },
        (r) => {
          let chunks = '';
          r.on('data', (c) => (chunks += c));
          r.on('end', () => {
            try {
              resolve(JSON.parse(chunks));
            } catch (e) {
              reject(new Error(`Non-JSON from Stripe (HTTP ${r.statusCode}): ${chunks.slice(0, 200)}`));
            }
          });
        }
      );
      req.on('error', reject);
      req.end();
    });
    for (const link of res.data || []) {
      const items = link.line_items?.data || [];
      if (items.some((item) => item.price?.id === priceId)) return link;
    }
    if (!res.has_more) return null;
    starting_after = res.data[res.data.length - 1].id;
  }
  return null;
}

async function createPaymentLink(lineItems, afterCompletion) {
  const params = {
    'line_items[0][price]': lineItems[0],
    'line_items[0][quantity]': 1,
  };
  if (lineItems[1]) {
    params['line_items[1][price]'] = lineItems[1];
    params['line_items[1][quantity]'] = 1;
  }
  if (afterCompletion) {
    params['after_completion[type]'] = afterCompletion.type;
    if (afterCompletion.type === 'redirect') {
      params['after_completion[redirect][url]'] = afterCompletion.url;
    }
  }
  // No trial — user selected "No trial" for the Managed plan.
  return stripeRequest('POST', '/v1/payment_links', params);
}

async function findWebhookEndpoint(url) {
  let starting_after;
  for (let i = 0; i < 10; i++) {
    const params = { limit: 100 };
    if (starting_after) params.starting_after = starting_after;
    const qs = new URLSearchParams(params).toString();
    const res = await stripeRequest('GET', `/v1/webhook_endpoints?${qs}`);
    const match = (res.data || []).find((wh) => wh.url === url);
    if (match) return match;
    if (!res.has_more) return null;
    starting_after = res.data[res.data.length - 1].id;
  }
  return null;
}

async function createWebhookEndpoint(url) {
  const params = {
    url,
    enabled_events: HANDLED_EVENTS,
    description: 'Seaway Sites — /api/stripe/webhook',
  };
  // `enabled_events` must be sent as repeated form fields, not a single
  // comma-joined value. URLSearchParams handles arrays via append.
  const body = new URLSearchParams();
  body.append('url', url);
  body.append('description', params.description);
  for (const ev of HANDLED_EVENTS) body.append('enabled_events[]', ev);
  const bodyStr = body.toString();
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: STRIPE_API_BASE,
        port: 443,
        path: '/v1/webhook_endpoints',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SECRET}`,
          'Stripe-Version': STRIPE_API_VERSION,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(bodyStr),
        },
      },
      (res) => {
        let chunks = '';
        res.on('data', (c) => (chunks += c));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(chunks);
          } catch (err) {
            reject(new Error(`Non-JSON response from Stripe (HTTP ${res.statusCode}): ${chunks.slice(0, 200)}`));
            return;
          }
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(parsed);
          else reject(new Error(`Stripe POST /v1/webhook_endpoints → HTTP ${res.statusCode}: ${parsed?.error?.message || chunks.slice(0, 200)}`));
        });
      }
    );
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

async function ensureCustomerPortalConfig() {
  // The Customer Portal is configured via the Dashboard; the API surface
  // is read-mostly (Configurations resource). We just confirm one exists
  // and that the default return_url points at /thank-you — if it doesn't
  // we surface a clear message for the user to set it manually.
  const configs = await stripeRequest('GET', '/v1/billing_portal/configurations?limit=10');
  const list = configs.data || [];
  if (list.length === 0) {
    console.log('[stripe-setup]   no Customer Portal configuration found.');
    console.log('[stripe-setup]   → open https://dashboard.stripe.com/settings/billing/portal to create one.');
    console.log('[stripe-setup]   → set the default return URL to ' + SITE_URL + '/thank-you');
    return;
  }
  const cfg = list[0];
  const businessProfile = cfg.business_profile || {};
  const returnUrl = businessProfile.default_return_url;
  const expected = `${SITE_URL}/thank-you`;
  if (returnUrl && returnUrl !== expected) {
    console.log(`[stripe-setup]   Customer Portal default_return_url is ${returnUrl}`);
    console.log(`[stripe-setup]   (expected ${expected} — change in dashboard if you want the unified flow)`);
  } else if (!returnUrl) {
    console.log('[stripe-setup]   Customer Portal has no default_return_url set.');
    console.log(`[stripe-setup]   → set it to ${expected} in the dashboard.`);
  } else {
    console.log(`[stripe-setup]   Customer Portal default_return_url = ${returnUrl} ✓`);
  }
}

(async () => {
  console.log(`[stripe-setup] using site URL: ${SITE_URL}`);
  console.log('[stripe-setup] managed plan: $399 setup + $69/mo, no trial');
  console.log('[stripe-setup] own plan:     $449 one-time deposit\n');

  // ---- Managed Website product + prices ----
  const managedProductName = 'Managed Website';
  let managedProduct = await findProductByName(managedProductName);
  if (!managedProduct) {
    managedProduct = await createProduct(
      managedProductName,
      'Seaway Sites Managed plan — we finish, launch, host and maintain the site. $399 one-time setup plus $69/month recurring.'
    );
    console.log(`[stripe-setup] created product: ${managedProduct.id}  "${managedProduct.name}"`);
  } else {
    console.log(`[stripe-setup] reusing product: ${managedProduct.id}  "${managedProduct.name}"`);
  }

  let managedSetupPrice = await findPriceForProduct(managedProduct.id, 39900, 'cad', null);
  if (!managedSetupPrice) {
    managedSetupPrice = await createPrice(managedProduct.id, 39900, 'cad', null);
    console.log(`[stripe-setup]   created setup price:   ${managedSetupPrice.id}  $399.00 CAD one-time`);
  } else {
    console.log(`[stripe-setup]   reusing setup price:   ${managedSetupPrice.id}  $399.00 CAD one-time`);
  }

  let managedMonthlyPrice = await findPriceForProduct(managedProduct.id, 6900, 'cad', { interval: 'month' });
  if (!managedMonthlyPrice) {
    managedMonthlyPrice = await createPrice(managedProduct.id, 6900, 'cad', { interval: 'month' });
    console.log(`[stripe-setup]   created monthly price: ${managedMonthlyPrice.id}  $69.00 CAD / month`);
  } else {
    console.log(`[stripe-setup]   reusing monthly price: ${managedMonthlyPrice.id}  $69.00 CAD / month`);
  }

  // ---- Own Your Website product + price ----
  const ownProductName = 'Own Your Website — deposit';
  let ownProduct = await findProductByName(ownProductName);
  if (!ownProduct) {
    ownProduct = await createProduct(
      ownProductName,
      'Seaway Sites Own plan — full source files, $449 deposit; balance invoiced manually on approval of the finished site.'
    );
    console.log(`[stripe-setup] created product: ${ownProduct.id}  "${ownProduct.name}"`);
  } else {
    console.log(`[stripe-setup] reusing product: ${ownProduct.id}  "${ownProduct.name}"`);
  }

  let ownDepositPrice = await findPriceForProduct(ownProduct.id, 44900, 'cad', null);
  if (!ownDepositPrice) {
    ownDepositPrice = await createPrice(ownProduct.id, 44900, 'cad', null);
    console.log(`[stripe-setup]   created deposit price: ${ownDepositPrice.id}  $449.00 CAD one-time`);
  } else {
    console.log(`[stripe-setup]   reusing deposit price: ${ownDepositPrice.id}  $449.00 CAD one-time`);
  }

  // ---- Payment Links ----
  const managedLink = await findPaymentLinkForPrice(managedSetupPrice.id);
  let managedLinkUrl;
  if (managedLink) {
    managedLinkUrl = managedLink.url;
    console.log(`[stripe-setup] reusing managed Payment Link: ${managedLink.id}  ${managedLinkUrl}`);
  } else {
    const created = await createPaymentLink(
      [managedSetupPrice.id, managedMonthlyPrice.id],
      { type: 'redirect', url: `${SITE_URL}/thank-you?plan=managed` }
    );
    managedLinkUrl = created.url;
    console.log(`[stripe-setup] created managed Payment Link: ${created.id}  ${managedLinkUrl}`);
  }

  const ownLink = await findPaymentLinkForPrice(ownDepositPrice.id);
  let ownLinkUrl;
  if (ownLink) {
    ownLinkUrl = ownLink.url;
    console.log(`[stripe-setup] reusing own Payment Link:     ${ownLink.id}  ${ownLinkUrl}`);
  } else {
    const created = await createPaymentLink(
      [ownDepositPrice.id],
      { type: 'redirect', url: `${SITE_URL}/thank-you?plan=own` }
    );
    ownLinkUrl = created.url;
    console.log(`[stripe-setup] created own Payment Link:     ${created.id}  ${ownLinkUrl}`);
  }

  // ---- Webhook endpoint ----
  const webhookUrl = `${SITE_URL}/api/stripe/webhook`;
  let endpoint = await findWebhookEndpoint(webhookUrl);
  if (endpoint) {
    console.log(`[stripe-setup] reusing webhook endpoint: ${endpoint.id}  ${endpoint.url}`);
    const missing = HANDLED_EVENTS.filter((e) => !endpoint.enabled_events?.includes(e));
    if (missing.length > 0) {
      console.log(`[stripe-setup]   endpoint is missing ${missing.length} event(s): ${missing.join(', ')}`);
      console.log('[stripe-setup]   update it at https://dashboard.stripe.com/webhooks');
    } else {
      console.log(`[stripe-setup]   all ${HANDLED_EVENTS.length} events enabled ✓`);
    }
  } else {
    endpoint = await createWebhookEndpoint(webhookUrl);
    console.log(`[stripe-setup] created webhook endpoint: ${endpoint.id}  ${endpoint.url}`);
    console.log(`[stripe-setup]   enabled events: ${HANDLED_EVENTS.join(', ')}`);
    console.log('[stripe-setup]   ↓ copy the signing secret to STRIPE_WEBHOOK_SECRET in .env.local:');
    console.log(`[stripe-setup]   whsec_…  (reveal it once at https://dashboard.stripe.com/webhooks/${endpoint.id})`);
  }

  // ---- Customer Portal ----
  console.log('\n[stripe-setup] checking Customer Portal configuration:');
  await ensureCustomerPortalConfig();

  // ---- Final report ----
  console.log('\n[stripe-setup] done. paste these into .env.local:\n');
  console.log(`STRIPE_PAYMENT_LINK_MANAGED=${managedLinkUrl}`);
  console.log(`STRIPE_PAYMENT_LINK_OWN=${ownLinkUrl}`);
  // Never echo the signing secret to the terminal (shell history / CI logs).
  // Point at the dashboard reveal for both the newly-created and reused cases.
  console.log(
    `STRIPE_WEBHOOK_SECRET=<reveal at https://dashboard.stripe.com/webhooks/${endpoint.id}>`
  );
})().catch((err) => {
  console.error('\n[stripe-setup] FAILED:', err.message);
  process.exit(1);
});

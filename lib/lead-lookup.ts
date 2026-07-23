import type { SupabaseClient } from '@supabase/supabase-js';

export type PurchaseLeadRow = {
  id: string;
  slug?: string | null;
  email?: string | null;
  notes?: string | null;
};

// Same lead-slug convention as /api/revision-requests: preview URLs may
// carry a `-vN` variant suffix, and lead records are stored as
// `<base-slug>-<uuid8>`. The exact match covers the common case; the
// prefix match handles legacy duplicates where the variant suffix was
// preserved on the lead row, gated by a strict regex that only accepts
// the documented <base>-<8 hex> suffix so a different business sharing
// the same base prefix is not picked up.
const VARIANT_SLUG_PATTERN = /^(.+)-v\d+$/;

function resolveVariantBase(slug: string): string {
  const match = VARIANT_SLUG_PATTERN.exec(slug);
  return match ? match[1] : slug;
}

function slugMatchesLead(slug: string, leadSlug: string | null | undefined): boolean {
  if (!leadSlug) return false;
  const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}(-[a-f0-9]{8})?$`, 'i').test(leadSlug);
}

/**
 * Look up the lead record that owns a draft preview. Used by both the
 * Stripe webhook (to attach a purchase to the right lead) and the
 * customer portal route (to find the lead that owns a subscription).
 *
 * The checkout email is not guaranteed to match the lead's outreach
 * email (a business partner may pay, or the lead's email may have
 * changed), so we only use the email to disambiguate when multiple
 * candidates match — never to reject.
 */
export async function findLeadForPurchase(
  supabase: SupabaseClient,
  slug: string,
  email: string | null
): Promise<PurchaseLeadRow | null> {
  const baseSlug = resolveVariantBase(slug);
  const candidates = Array.from(new Set([slug, baseSlug]));

  const exactResult = await supabase
    .from('leads')
    .select('id,slug,email')
    .in('slug', candidates);
  if (exactResult.error) throw exactResult.error;
  let matches: PurchaseLeadRow[] = exactResult.data || [];

  if (matches.length === 0) {
    const prefixResult = await supabase
      .from('leads')
      .select('id,slug,email')
      .like('slug', `${baseSlug}%`);
    if (prefixResult.error) throw prefixResult.error;
    matches = (prefixResult.data || []).filter((row) => slugMatchesLead(baseSlug, row.slug));
  }

  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];
  const normalized = email?.trim().toLowerCase();
  return matches.find((row) => row.email?.trim().toLowerCase() === normalized) ?? null;
}

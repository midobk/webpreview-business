'use client';

/* Client-side first-touch attribution for paid acquisition. Captured once per
   browser session from the landing URL, submitted with the lead so Supabase —
   not Ads Manager — is the source of truth for per-channel CPL/CAC. */

const ATTRIBUTION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
] as const;

const STORAGE_KEY = 'ss_attribution';
const MAX_VALUE_LENGTH = 500;

export type Attribution = Partial<Record<(typeof ATTRIBUTION_KEYS)[number], string>>;

/** Store UTM/click-id params from the current URL. First-touch: an existing
    capture is never overwritten, so a visitor who browses around before
    submitting keeps the params they arrived with. Best-effort — private
    browsing modes that block storage simply leave attribution empty. */
export function captureAttribution() {
  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const found: Attribution = {};
    for (const key of ATTRIBUTION_KEYS) {
      const value = params.get(key);
      if (value) found[key] = value.slice(0, MAX_VALUE_LENGTH);
    }
    if (Object.keys(found).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    }
  } catch {
    /* storage unavailable — attribution is optional */
  }
}

export function getAttribution(): Attribution {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}

/** Browser-side Meta Pixel Lead event. The eventID must match the event_id
    sent to the Conversions API so Meta deduplicates the pair. No-op when the
    pixel is not loaded (NEXT_PUBLIC_META_PIXEL_ID unset or script blocked). */
export function trackLead(eventId: string) {
  try {
    window.fbq?.('track', 'Lead', {}, { eventID: eventId });
  } catch {
    /* ad blockers may stub fbq in surprising ways — never break the form */
  }
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

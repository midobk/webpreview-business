import { createHash } from 'crypto';

const GRAPH_VERSION = 'v21.0';
const REQUEST_TIMEOUT_MS = 4_000;

type LeadEventInput = {
  email: string;
  eventId: string;
  ip?: string;
  userAgent?: string | null;
  fbclid?: string | null;
  sourceUrl?: string;
};

/** Server-side Meta Conversions API Lead event, mirroring the browser pixel
    event for iOS/ad-blocker resilience. Meta deduplicates the pair by
    event_id. No-op unless META_CAPI_ACCESS_TOKEN and a pixel id are
    configured. Never throws: ad measurement must not break lead intake. */
export async function sendMetaLeadEvent(input: LeadEventInput) {
  const pixelId = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  const eventTime = Math.floor(Date.now() / 1000);
  const userData: Record<string, unknown> = {
    em: [createHash('sha256').update(input.email.trim().toLowerCase()).digest('hex')],
  };
  if (input.ip) userData.client_ip_address = input.ip;
  if (input.userAgent) userData.client_user_agent = input.userAgent;
  // fbc format required by Meta: fb.1.<creation time ms>.<fbclid>
  if (input.fbclid) userData.fbc = `fb.1.${Date.now()}.${input.fbclid}`;

  const payload = {
    data: [
      {
        event_name: 'Lead',
        event_time: eventTime,
        event_id: input.eventId,
        action_source: 'website',
        event_source_url: input.sourceUrl,
        user_data: userData,
      },
    ],
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
    );
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('Meta CAPI Lead event rejected:', response.status, detail.slice(0, 500));
    }
  } catch (error) {
    console.error('Meta CAPI Lead event failed:', error);
  }
}

// Best-effort, in-process rate guard for low-volume public auth/setup endpoints.
//
// Known limitation: this Map lives in module scope, so on serverless runtimes
// (Vercel/Netlify) each cold start gets a fresh empty map and the limit is
// effectively per-invocation, not per-client. A durable fix needs an external
// store (Upstash Redis, Supabase RPC, etc.). Until then this guard remains a
// cheap first line that helps on long-lived `next start` instances and bounds
// memory so a flood of distinct spoofed X-Forwarded-For values cannot grow
// the map without limit.
const MAX_BUCKETS = 10_000;
const buckets = new Map<string, number[]>();

function pruneIfNeeded(): void {
  if (buckets.size < MAX_BUCKETS) return;
  // Drop the oldest-inserted entries. Map iterates in insertion order, so the
  // first N entries are the stalest buckets that haven't been touched recently.
  const toDelete = buckets.size - Math.floor(MAX_BUCKETS / 2);
  let i = 0;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    if (++i >= toDelete) break;
  }
}

export function rateLimited(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (buckets.get(key) || []).filter((timestamp) => now - timestamp < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return true;
  }
  if (recent.length === 0) pruneIfNeeded();
  recent.push(now);
  buckets.set(key, recent);
  return false;
}

export function requestIp(request: Request): string {
  // NOTE: x-forwarded-for is client-influenceable on deployments that do not
  // overwrite it, so this is an approximate key, not a strong identity. We
  // sanitize to a small charset and cap length so a malicious header value
  // cannot bloat the bucket key or inject control characters.
  const raw = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const sanitized = raw.replace(/[^A-Za-z0-9.:\-_]/g, '').slice(0, 64);
  return sanitized || 'unknown';
}

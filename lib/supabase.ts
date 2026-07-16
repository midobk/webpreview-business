/**
 * lib/supabase.ts — Server-side Supabase client for Seaway Sites.
 *
 * Phase 2 of the dashboard fix: replaces the build-bundle hack with a real
 * database. All API routes use this client (server-side only) to read/write
 * leads, prototypes, outreach, etc.
 *
 * Required env vars:
 *   - NEXT_PUBLIC_SUPABASE_URL  (or SUPABASE_URL)
 *   - SUPABASE_SERVICE_ROLE_KEY  (server-only, bypasses RLS)
 *
 * In Phase 1 (hacky build-bundle), this module is imported but the data-source
 * wrapper falls back to the embedded bundle if these env vars aren't set. Once
 * the user creates a Supabase project and sets the env vars, this becomes the
 * primary data path automatically.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // Phase 1 mode: Supabase not configured. data-source.ts will fall back
    // to the embedded build bundle.
    return null;
  }

  _client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return _client;
}

export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}
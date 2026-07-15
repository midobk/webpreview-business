-- Supabase schema for Seaway Sites
-- Run this in the Supabase SQL editor or via supabase-cli
--
-- This replaces the JSON-file data layer. Phase 2 of the dashboard fix.

-- Enable Row Level Security on all tables
-- (we'll add policies per-table; default is deny-all)

-- ============ leads ============
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT,
  city TEXT,
  province TEXT,
  country TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  email_source_url TEXT,
  website_url TEXT,
  website_status TEXT,
  google_maps_url TEXT,
  social_urls JSONB DEFAULT '[]'::jsonb,
  source_urls JSONB DEFAULT '[]'::jsonb,
  place_id TEXT,
  types JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  services JSONB DEFAULT '[]'::jsonb,
  lead_score INTEGER DEFAULT 0,
  score_reasoning TEXT,
  complexity_level TEXT,
  contact_safety_status TEXT,
  contact_safety_reasoning TEXT,
  status TEXT DEFAULT 'discovered',
  notes TEXT,
  review_count INTEGER,
  rating NUMERIC,
  enriched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry);
CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city);

-- ============ prototypes ============
CREATE TABLE IF NOT EXISTS prototypes (
  id TEXT PRIMARY KEY,
  lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE,
  industry TEXT,
  variant INTEGER DEFAULT 1,
  variant_name TEXT,
  prototype_url TEXT,
  screenshot_url TEXT,
  title TEXT,
  design_summary TEXT,
  prototype_score INTEGER,
  generation_model TEXT,
  generation_prompt TEXT,
  generation_status TEXT DEFAULT 'pending',
  watermark_enabled BOOLEAN DEFAULT TRUE,
  demo_locked BOOLEAN DEFAULT TRUE,
  showcase_eligible BOOLEAN DEFAULT FALSE,
  showcase_approved BOOLEAN DEFAULT FALSE,
  showcase_score INTEGER,
  showcase_issues JSONB DEFAULT '[]'::jsonb,
  anonymized BOOLEAN DEFAULT FALSE,
  showcase_anonymized_html_path TEXT,
  showcase_scored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prototypes_lead ON prototypes(lead_id);
CREATE INDEX IF NOT EXISTS idx_prototypes_status ON prototypes(generation_status);
CREATE INDEX IF NOT EXISTS idx_prototypes_showcase ON prototypes(showcase_eligible, showcase_approved);
-- A lead can have at most one prototype per variant number; otherwise a
-- slug like <slug>-v1 resolves to multiple rows and the first-match wins,
-- silently serving the wrong prototype to a customer.
CREATE UNIQUE INDEX IF NOT EXISTS uq_prototypes_lead_variant ON prototypes(lead_id, variant);

-- ============ revision_requests ============
-- Customer feedback captured from a prototype preview. RLS stays deny-by-default;
-- the server-side service-role route is the only writer/reader.
CREATE TABLE IF NOT EXISTS revision_requests (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  request TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revision_requests_lead ON revision_requests(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revision_requests_status ON revision_requests(status, created_at DESC);

-- ============ outreach_logs ============
-- Each row is one outreach attempt (email or SMS), tracked through the lifecycle
CREATE TABLE IF NOT EXISTS outreach_logs (
  id TEXT PRIMARY KEY,
  lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE,
  lead_slug TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  status TEXT NOT NULL CHECK (status IN ('drafted', 'sent', 'replied', 'bounced', 'opted_out', 'won')),
  subject TEXT,
  message TEXT,
  angle TEXT,
  to_email TEXT,
  to_phone TEXT,
  from_address TEXT,
  from_number TEXT,
  char_count INTEGER,
  provider TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  outcome TEXT
);

CREATE INDEX IF NOT EXISTS idx_outreach_lead ON outreach_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_outreach_status ON outreach_logs(status);
CREATE INDEX IF NOT EXISTS idx_outreach_channel ON outreach_logs(channel);

-- ============ conversion_stats (materialized view approach) ============
-- Refreshed periodically by scripts/update-conversion-stats.py
CREATE TABLE IF NOT EXISTS conversion_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  total_leads INTEGER,
  total_prototypes INTEGER,
  total_emails_drafted INTEGER,
  total_emails_sent INTEGER,
  total_replies INTEGER,
  total_conversions INTEGER,
  by_industry JSONB,
  by_email_angle JSONB,
  by_lead_score_bucket JSONB,
  by_source JSONB,
  CONSTRAINT single_row CHECK (id = 1)
);

-- ============ agentmail_inboxes ============
CREATE TABLE IF NOT EXISTS agentmail_inboxes (
  inbox_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  domain TEXT NOT NULL,
  purpose TEXT,
  status TEXT,
  api_key_set BOOLEAN DEFAULT FALSE,
  drafts_go_here TEXT,
  sends_queued INTEGER DEFAULT 0,
  sends_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ Row Level Security ============
-- Phase 2 admin-only access via service role key (server-side).
-- Browser-side uses anon key with RLS but we don't expose data to browsers
-- except via /api/admin/* routes (which require admin cookie).

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE prototypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_requests ENABLE ROW LEVEL SECURITY;

-- ============ append_lead_note RPC ============
-- Atomic append of a revision-request note to leads.notes.
--
-- /api/revision-requests used to read leads.notes, append the new entry in
-- JS, then write the whole string back — a read-modify-write race where two
-- concurrent revision requests clobber each other and the losing entry is
-- dropped from leads.notes. This function appends inside a single UPDATE
-- (serialized by the row lock), so concurrent appends both survive. It is
-- also idempotent: a retry carrying the same marker does not double-append.
--
-- SECURITY INVOKER runs with the caller's role; the route calls this with
-- the service role, which bypasses RLS — the same privilege it already uses
-- for the direct update, so no escalation.
--
-- This was previously only in supabase/migrations/20260714120000_add_append_lead_note.sql.
-- Users who run this schema file in a fresh Supabase project's SQL editor
-- would have revision_requests accepted but every submission would 500 with
-- "function append_lead_note does not exist". Inline the definition here so
-- a single schema run is sufficient.
create or replace function public.append_lead_note(
  p_lead_id text,
  p_marker text,
  p_entry text
) returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.leads
    set notes = case
                  when notes is null or btrim(notes) = '' then p_entry
                  else btrim(notes) || E'\n\n' || p_entry
                end,
        status = 'revision_requested',
        updated_at = now()
  where id = p_lead_id
    and (notes is null or position(p_marker in notes) = 0);
end;
$$;
ALTER TABLE outreach_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE agentmail_inboxes ENABLE ROW LEVEL SECURITY;

-- Policies: deny all by default. Server-side uses service role key
-- which bypasses RLS, so API routes work as before.
-- We don't add policies for anon/authenticated roles since there's no
-- public read path.

-- ============ Helper trigger: auto-update updated_at ============
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER trg_prototypes_updated BEFORE UPDATE ON prototypes
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TRIGGER trg_inboxes_updated BEFORE UPDATE ON agentmail_inboxes
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

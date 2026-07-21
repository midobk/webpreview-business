-- Paid-acquisition attribution for inbound form leads (Meta ads flight 1).
-- All columns nullable: discovery-pipeline leads and organic form leads leave
-- them empty. Supabase is the source of truth for per-channel CPL/CAC, so ad
-- attribution must live on the lead row itself, not in Ads Manager.
alter table public.leads
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists fbclid text;

comment on column public.leads.utm_source is 'First-touch utm_source captured on the landing page at form submit (e.g. facebook).';
comment on column public.leads.fbclid is 'Meta click id captured from the landing URL; used for Conversions API matching.';

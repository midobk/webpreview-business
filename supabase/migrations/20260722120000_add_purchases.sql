-- Purchases recorded from Stripe Checkout webhooks. One row per checkout
-- session; the row id IS the Stripe session id so webhook retries and the
-- paid-after-async-debit second event upsert instead of duplicating.
create table if not exists public.purchases (
  id text primary key,
  slug text,
  lead_id text references public.leads(id) on delete set null,
  plan text not null default 'unknown' check (plan in ('managed', 'own', 'unknown')),
  email text,
  customer_name text,
  amount_total integer,
  currency text,
  mode text,
  payment_status text not null default 'pending',
  stripe_subscription_id text,
  stripe_payment_link_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_purchases_lead on public.purchases(lead_id, created_at desc);
create index if not exists idx_purchases_slug on public.purchases(slug, created_at desc);
alter table public.purchases enable row level security;

create or replace trigger trg_purchases_updated
  before update on public.purchases
  for each row execute function public.touch_updated_at();

-- Atomic, idempotent append of a purchase note to leads.notes, mirroring
-- public.append_lead_note. A separate function because append_lead_note
-- hard-codes status = 'revision_requested'; here the status is only touched
-- once the payment is actually confirmed (p_new_status non-null), so an
-- async pre-authorized-debit that is still pending leaves the lead status
-- alone.
create or replace function public.append_purchase_note(
  p_lead_id text,
  p_marker text,
  p_entry text,
  p_new_status text default null
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
        status = coalesce(p_new_status, status),
        updated_at = now()
  where id = p_lead_id
    and (notes is null or position(p_marker in notes) = 0);
end;
$$;

revoke all on function public.append_purchase_note(text, text, text, text) from public;
grant execute on function public.append_purchase_note(text, text, text, text) to service_role;

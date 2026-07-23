-- Customer Portal lookup. The portal route at /api/stripe/portal/* opens a
-- billing_portal session by Stripe customer id, not by email — so we need to
-- store the customer id alongside the subscription id when the first
-- checkout completes. Nullable so existing rows survive the column add; the
-- admin UI gates the portal button on this field being set.
alter table public.purchases
  add column if not exists stripe_customer_id text;

create index if not exists idx_purchases_customer
  on public.purchases(stripe_customer_id)
  where stripe_customer_id is not null;

-- Atomic, idempotent status change for a lead driven by a Stripe
-- subscription lifecycle event. Mirrors the shape of append_purchase_note /
-- append_lead_note: caller passes a stable marker so retries are no-ops, and
-- the status is only written when p_new_status is non-null (e.g. an
-- invoice.paid event passes null and only appends a note).
--
-- SECURITY INVOKER runs with the caller's role; the webhook calls this with
-- the service role, which bypasses RLS — the same privilege it already uses
-- for the direct update, so no escalation.
create or replace function public.update_lead_from_subscription_event(
  p_lead_id text,
  p_new_status text,
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
        status = coalesce(p_new_status, status),
        updated_at = now()
  where id = p_lead_id
    and (notes is null or position(p_marker in notes) = 0);
end;
$$;

-- Explicit grants, matching the pattern in
-- supabase/migrations/20260710234500_harden_public_helper_functions.sql.
-- The function is SECURITY INVOKER, so anon/authenticated callers would
-- otherwise be silently denied when the implicit PUBLIC grant is revoked
-- elsewhere. Service role bypasses RLS and is the only expected caller.
revoke all on function public.update_lead_from_subscription_event(text, text, text, text) from public;
grant execute on function public.update_lead_from_subscription_event(text, text, text, text) to service_role;

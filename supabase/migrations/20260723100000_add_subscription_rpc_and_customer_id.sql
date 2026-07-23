-- Atomic, idempotent status change for a lead driven by a Stripe
-- subscription lifecycle event. Mirrors the shape of append_purchase_note /
-- append_lead_note: caller passes a stable marker so retries are no-ops, and
-- the status is only written when p_new_status is non-null (e.g. an
-- invoice.paid event passes null and only appends a note).
--
-- p_only_if_status (optional) guards the *status* assignment — when supplied,
-- the status is only changed if the lead's current status already equals it.
-- This keeps manual admin overrides (e.g. a lead chased offline and marked
-- 'done') from being clobbered by a stale read in the webhook, and makes the
-- past_due/unpaid → payment_failed and payment_failed → purchased (recovery)
-- transitions atomic and race-free. The note is always appended (subject to
-- the marker idempotency check) regardless of the guard, so every event is
-- still auditable.
--
-- stripe_customer_id (used by /api/stripe/portal/* for Customer Portal
-- lookups) is created in 20260722120000_add_purchases.sql.
--
-- SECURITY INVOKER runs with the caller's role; the webhook calls this with
-- the service role, which bypasses RLS — the same privilege it already uses
-- for the direct update, so no escalation.
create or replace function public.update_lead_from_subscription_event(
  p_lead_id text,
  p_new_status text,
  p_marker text,
  p_entry text,
  p_only_if_status text default null
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
        status = case
                   when p_only_if_status is null or status = p_only_if_status
                     then coalesce(p_new_status, status)
                   else status
                 end,
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
revoke all on function public.update_lead_from_subscription_event(text, text, text, text, text) from public;
grant execute on function public.update_lead_from_subscription_event(text, text, text, text, text) to service_role;

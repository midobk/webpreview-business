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
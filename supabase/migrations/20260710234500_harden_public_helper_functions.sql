-- Prevent public API roles from invoking the internal SECURITY DEFINER
-- event-trigger function, and pin the trigger helper's search path.

alter function public.touch_updated_at() set search_path = pg_catalog, public;

revoke all on function public.rls_auto_enable() from public;
revoke all on function public.rls_auto_enable() from anon;
revoke all on function public.rls_auto_enable() from authenticated;
grant execute on function public.rls_auto_enable() to service_role;

comment on function public.rls_auto_enable() is
  'Internal event-trigger helper. Not callable by public API roles.';

comment on function public.touch_updated_at() is
  'Internal trigger helper with a fixed search_path.';

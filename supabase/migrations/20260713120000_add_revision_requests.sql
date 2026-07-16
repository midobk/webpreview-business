create table if not exists public.revision_requests (
  id text primary key,
  lead_id text not null references public.leads(id) on delete cascade,
  request text not null,
  status text not null default 'new' check (status in ('new', 'addressed', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_revision_requests_lead on public.revision_requests(lead_id, created_at desc);
create index if not exists idx_revision_requests_status on public.revision_requests(status, created_at desc);
alter table public.revision_requests enable row level security;

-- Keep updated_at in sync with status changes, mirroring the triggers on
-- leads/prototypes. Without this, updated_at stays at created_at and admin
-- "last updated" ordering masks when a request was actioned.
create or replace trigger trg_revision_requests_updated
  before update on public.revision_requests
  for each row execute function public.touch_updated_at();

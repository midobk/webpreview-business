create table if not exists public.revision_requests (
  id text primary key,
  lead_id text not null references public.leads(id) on delete cascade,
  request text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_revision_requests_lead on public.revision_requests(lead_id, created_at desc);
create index if not exists idx_revision_requests_status on public.revision_requests(status, created_at desc);
alter table public.revision_requests enable row level security;

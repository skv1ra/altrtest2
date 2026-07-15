create extension if not exists vector with schema extensions;

alter table public.altr_memories
  alter column embedding type extensions.vector(1536) using embedding::extensions.vector(1536);

alter table public.altr_conversation_imports
  add column if not exists extraction_status text not null default 'pending',
  add column if not exists extraction_error text,
  add column if not exists extraction_attempts integer not null default 0,
  add column if not exists extraction_cursor integer not null default 0,
  add column if not exists extraction_started_at timestamptz,
  add column if not exists extraction_completed_at timestamptz;

alter table public.altr_conversation_imports drop constraint if exists altr_conversation_imports_extraction_status_check;
alter table public.altr_conversation_imports add constraint altr_conversation_imports_extraction_status_check
  check (extraction_status in ('pending','processing','completed','failed','skipped'));

alter table public.altr_assistant_runs
  add column if not exists used_memory_ids uuid[] not null default '{}',
  add column if not exists used_message_ids uuid[] not null default '{}',
  add column if not exists used_conversation_ids uuid[] not null default '{}',
  add column if not exists request_metadata jsonb not null default '{}'::jsonb;

create table if not exists public.altr_draft_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  assistant_run_id uuid not null references public.altr_assistant_runs(id) on delete cascade,
  action text,
  edited_text text,
  comment text,
  rating smallint,
  created_at timestamptz not null default now()
);

alter table public.altr_draft_feedback
  add column if not exists outcome text,
  add column if not exists original_draft text,
  add column if not exists final_draft text,
  add column if not exists feedback text,
  add column if not exists edit_distance integer,
  add column if not exists consent_to_personalization boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

update public.altr_draft_feedback f
set outcome = coalesce(f.outcome, case when f.rating is not null then 'rated' else coalesce(f.action, 'accepted') end),
    original_draft = coalesce(f.original_draft, r.output_text, ''),
    final_draft = coalesce(f.final_draft, f.edited_text),
    feedback = coalesce(f.feedback, f.comment)
from public.altr_assistant_runs r
where r.id = f.assistant_run_id
  and (f.outcome is null or f.original_draft is null or f.final_draft is null or f.feedback is null);

alter table public.altr_draft_feedback alter column outcome set not null;
alter table public.altr_draft_feedback alter column original_draft set not null;
alter table public.altr_draft_feedback drop constraint if exists altr_draft_feedback_outcome_check;
alter table public.altr_draft_feedback add constraint altr_draft_feedback_outcome_check
  check (outcome in ('accepted','rejected','edited','copied','rated'));
alter table public.altr_draft_feedback drop constraint if exists altr_draft_feedback_rating_check;
alter table public.altr_draft_feedback add constraint altr_draft_feedback_rating_check check (rating between 1 and 5);

alter table public.altr_draft_feedback enable row level security;

drop policy if exists "users read own draft feedback" on public.altr_draft_feedback;
drop policy if exists "users insert own draft feedback" on public.altr_draft_feedback;
drop policy if exists "users update own draft feedback" on public.altr_draft_feedback;
drop policy if exists "draft feedback own all" on public.altr_draft_feedback;
create policy "draft feedback own all" on public.altr_draft_feedback
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create unique index if not exists altr_draft_feedback_run_outcome_idx
  on public.altr_draft_feedback(user_id, assistant_run_id, outcome);
create index if not exists altr_memories_embedding_hnsw_idx
  on public.altr_memories using hnsw (embedding extensions.vector_cosine_ops)
  where embedding is not null and is_active = true;
create index if not exists altr_import_extraction_queue_idx
  on public.altr_conversation_imports(user_id, extraction_status, created_at)
  where status = 'completed' and extraction_status in ('pending','failed');

create or replace function public.altr_match_active_memories(
  query_embedding extensions.vector(1536),
  match_count integer default 8,
  match_threshold double precision default 0.72
)
returns table (
  id uuid,
  category text,
  title text,
  description text,
  confidence numeric,
  similarity double precision
)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select m.id, m.category, m.title, m.description, m.confidence,
    1 - (m.embedding <=> query_embedding) as similarity
  from public.altr_memories m
  where m.user_id = (select auth.uid())
    and m.is_active = true
    and m.embedding is not null
    and 1 - (m.embedding <=> query_embedding) >= match_threshold
  order by m.embedding <=> query_embedding
  limit least(greatest(match_count, 1), 20);
$$;

revoke all on function public.altr_match_active_memories(extensions.vector, integer, double precision) from public, anon;
grant execute on function public.altr_match_active_memories(extensions.vector, integer, double precision) to authenticated;

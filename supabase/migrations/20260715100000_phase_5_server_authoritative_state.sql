alter table public.altr_profiles add column if not exists training_progress integer not null default 0 check (training_progress between 0 and 100);

alter table public.altr_memories
  add column if not exists source_type text not null default 'manual',
  add column if not exists extraction_model text,
  add column if not exists extraction_version text;

alter table public.altr_memory_sources
  add column if not exists assistant_run_id uuid references public.altr_assistant_runs(id) on delete set null;

alter table public.altr_memory_sources drop constraint if exists altr_memory_sources_source_type_check;
alter table public.altr_memory_sources add constraint altr_memory_sources_source_type_check
  check (source_type in ('conversation','message','import','assistant_run','manual','feedback'));

alter table public.altr_conversation_imports
  add column if not exists parser_version text,
  add column if not exists mime_type text,
  add column if not exists file_extension text,
  add column if not exists raw_file_stored boolean not null default false,
  add column if not exists normalized_at timestamptz;

alter table public.altr_auth_rate_limits drop constraint if exists altr_auth_rate_limits_action_check;
alter table public.altr_auth_rate_limits add constraint altr_auth_rate_limits_action_check
  check (action in ('register','login','forgot','reset','billing_checkout','import_create','import_chunk','memory_write','assistant_write'));

create unique index if not exists altr_active_twin_per_user_idx
  on public.altr_assistant_configs(user_id) where assistant_type = 'digital_twin' and is_active = true;
create index if not exists altr_memories_search_idx on public.altr_memories(user_id, updated_at desc);
create index if not exists altr_memory_sources_memory_idx on public.altr_memory_sources(memory_id, created_at desc);
create index if not exists altr_conversations_import_idx on public.altr_conversations(import_id);
create index if not exists altr_messages_user_conversation_idx on public.altr_messages(user_id, conversation_id, sent_at);

insert into public.altr_user_preferences (user_id)
select id from auth.users on conflict (user_id) do nothing;

insert into public.altr_assistant_configs (user_id, name, assistant_type, system_instructions, tone, is_active, config)
select p.user_id, coalesce(nullif(p.altr_name, ''), 'My Altr'), 'digital_twin',
  'Draft replies in the authenticated user''s style. Never send or execute external actions.', p.tone, true,
  jsonb_build_object('mode','draft_only','version',1)
from public.altr_profiles p
where not exists (select 1 from public.altr_assistant_configs a where a.user_id = p.user_id and a.assistant_type = 'digital_twin');

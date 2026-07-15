create index if not exists altr_memory_sources_assistant_run_idx
  on public.altr_memory_sources(assistant_run_id)
  where assistant_run_id is not null;

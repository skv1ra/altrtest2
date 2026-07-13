create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create index if not exists altr_consents_user_id_idx on public.altr_consents(user_id);
create index if not exists altr_conversation_imports_user_id_idx on public.altr_conversation
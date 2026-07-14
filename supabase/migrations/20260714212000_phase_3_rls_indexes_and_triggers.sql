do $$
declare t text;
begin
  foreach t in array array[
    'altr_user_preferences','altr_data_connections','altr_consent_events','altr_conversations','altr_messages','altr_memory_sources','altr_assistant_configs','altr_assistant_runs','altr_draft_feedback','altr_deletion_requests','altr_audit_events','altr_usage_counters','altr_billing_orders','altr_billing_invoices','altr_billing_webhook_events'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

revoke all on public.altr_billing_orders, public.altr_billing_invoices, public.altr_billing_webhook_events from anon, authenticated;
grant select on public.altr_billing_orders, public.altr_billing_invoices to authenticated;
revoke all on public.altr_audit_events from anon, authenticated;

create policy "preferences own all" on public.altr_user_preferences for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "connections own all" on public.altr_data_connections for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "consent events own select" on public.altr_consent_events for select to authenticated using ((select auth.uid()) = user_id);
create policy "conversations own all" on public.altr_conversations for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "messages own all" on public.altr_messages for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "memory sources own all" on public.altr_memory_sources for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "assistant configs own all" on public.altr_assistant_configs for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "assistant runs own all" on public.altr_assistant_runs for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "draft feedback own all" on public.altr_draft_feedback for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "deletion requests own select" on public.altr_deletion_requests for select to authenticated using ((select auth.uid()) = user_id);
create policy "deletion requests own insert" on public.altr_deletion_requests for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "billing orders own select" on public.altr_billing_orders for select to authenticated using ((select auth.uid()) = user_id);
create policy "billing invoices own select" on public.altr_billing_invoices for select to authenticated using ((select auth.uid()) = user_id);

create index if not exists altr_data_connections_user_id_idx on public.altr_data_connections(user_id);
create index if not exists altr_consent_events_user_id_idx on public.altr_consent_events(user_id);
create index if not exists altr_conversations_user_id_idx on public.altr_conversations(user_id);
create index if not exists altr_conversations_last_message_idx on public.altr_conversations(user_id, last_message_at desc);
create index if not exists altr_messages_user_id_idx on public.altr_messages(user_id);
create index if not exists altr_messages_conversation_time_idx on public.altr_messages(conversation_id, sent_at asc);
create index if not exists altr_memories_category_idx on public.altr_memories(user_id, category);
create index if not exists altr_memories_active_idx on public.altr_memories(user_id, is_active) where is_active = true;
create index if not exists altr_memories_embedding_hnsw_idx on public.altr_memories using hnsw (embedding vector_cosine_ops) where embedding is not null;
create index if not exists altr_memory_sources_user_id_idx on public.altr_memory_sources(user_id);
create index if not exists altr_assistant_configs_user_id_idx on public.altr_assistant_configs(user_id);
create index if not exists altr_assistant_runs_user_id_idx on public.altr_assistant_runs(user_id);
create index if not exists altr_draft_feedback_user_id_idx on public.altr_draft_feedback(user_id);
create index if not exists altr_deletion_requests_user_id_idx on public.altr_deletion_requests(user_id);
create index if not exists altr_usage_counters_user_id_idx on public.altr_usage_counters(user_id);
create unique index if not exists altr_subscriptions_provider_subscription_idx on public.altr_subscriptions(provider, provider_subscription_id) where provider_subscription_id is not null;
create index if not exists altr_subscriptions_provider_customer_idx on public.altr_subscriptions(provider, provider_customer_id) where provider_customer_id is not null;
create index if not exists altr_subscriptions_provider_order_idx on public.altr_subscriptions(provider, provider_order_id) where provider_order_id is not null;
create index if not exists altr_billing_orders_user_id_idx on public.altr_billing_orders(user_id);
create index if not exists altr_billing_invoices_user_id_idx on public.altr_billing_invoices(user_id);
create unique index if not exists altr_webhook_payload_hash_idx on public.altr_billing_webhook_events(provider, payload_hash);

do $$
declare t text;
begin
  foreach t in array array[
    'altr_profiles','altr_user_preferences','altr_data_connections','altr_conversations','altr_assistant_configs','altr_assistant_runs','altr_deletion_requests','altr_usage_counters','altr_subscriptions','altr_billing_orders','altr_billing_invoices'
  ] loop
    execute format('drop trigger if exists %I on public.%I', t || '_updated_at', t);
    execute format('create trigger %I before update on public.%I for each row execute function public.altr_set_updated_at()', t || '_updated_at', t);
  end loop;
end $$;

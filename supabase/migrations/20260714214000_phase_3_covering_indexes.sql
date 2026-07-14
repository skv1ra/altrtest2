drop index if exists public.altr_webhook_payload_hash_idx;

create index if not exists altr_assistant_runs_config_idx on public.altr_assistant_runs(assistant_config_id) where assistant_config_id is not null;
create index if not exists altr_assistant_runs_conversation_idx on public.altr_assistant_runs(conversation_id) where conversation_id is not null;
create index if not exists altr_audit_events_user_id_idx on public.altr_audit_events(user_id) where user_id is not null;
create index if not exists altr_billing_orders_subscription_idx on public.altr_billing_orders(subscription_id) where subscription_id is not null;
create index if not exists altr_billing_invoices_subscription_idx on public.altr_billing_invoices(subscription_id) where subscription_id is not null;
create index if not exists altr_billing_invoices_order_idx on public.altr_billing_invoices(billing_order_id) where billing_order_id is not null;
create index if not exists altr_conversations_import_idx on public.altr_conversations(import_id) where import_id is not null;
create index if not exists altr_conversations_connection_idx on public.altr_conversations(data_connection_id) where data_connection_id is not null;
create index if not exists altr_draft_feedback_run_idx on public.altr_draft_feedback(assistant_run_id);
create index if not exists altr_memory_sources_memory_idx on public.altr_memory_sources(memory_id);
create index if not exists altr_memory_sources_conversation_idx on public.altr_memory_sources(conversation_id) where conversation_id is not null;
create index if not exists altr_memory_sources_message_idx on public.altr_memory_sources(message_id) where message_id is not null;
create index if not exists altr_memory_sources_import_idx on public.altr_memory_sources(import_id) where import_id is not null;

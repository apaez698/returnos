-- ReturnOS Campaigns Message Tracking (Phase 1)
-- Migration: 20260327010000_campaigns_message_tracking_phase1

-- ============================================================
-- campaigns: scheduling and aggregated counters
-- ============================================================
alter table campaigns
  add column scheduled_at timestamptz,
  add column sent_at timestamptz,
  add column total_messages integer not null default 0,
  add column messages_sent integer not null default 0,
  add column messages_failed integer not null default 0;

alter table campaigns
  add constraint chk_campaigns_scheduled_at_required
    check (status != 'scheduled' or scheduled_at is not null),
  add constraint chk_campaigns_message_counters_non_negative
    check (
      total_messages >= 0
      and messages_sent >= 0
      and messages_failed >= 0
    ),
  add constraint chk_campaigns_message_counters_consistent
    check (messages_sent + messages_failed <= total_messages),
  add constraint chk_campaigns_sent_at_order
    check (sent_at is null or sent_at >= created_at);

create index idx_campaigns_status_scheduled_at on campaigns(status, scheduled_at);
create index idx_campaigns_sent_at on campaigns(sent_at);

-- ============================================================
-- campaign_messages
-- Replaces campaign_deliveries as the canonical message history.
-- ============================================================
create table campaign_messages (
  id              uuid primary key default gen_random_uuid(),
  campaign_id     uuid not null references campaigns(id) on delete cascade,
  customer_id     uuid not null references customers(id) on delete cascade,
  delivery_status text not null default 'pending'
                  check (delivery_status in ('pending', 'simulated', 'sent', 'failed')),
  sent_at         timestamptz,
  created_at      timestamptz not null default now(),
  unique (campaign_id, customer_id),
  constraint chk_campaign_messages_sent_at
    check (delivery_status != 'sent' or sent_at is not null)
);

create index idx_campaign_messages_campaign_id on campaign_messages(campaign_id);
create index idx_campaign_messages_customer_id on campaign_messages(customer_id);
create index idx_campaign_messages_delivery_status on campaign_messages(delivery_status);
create index idx_campaign_messages_sent_at on campaign_messages(sent_at);

-- ============================================================
-- Data migration: campaign_deliveries -> campaign_messages
-- ============================================================
insert into campaign_messages (
  id,
  campaign_id,
  customer_id,
  delivery_status,
  sent_at,
  created_at
)
select
  id,
  campaign_id,
  customer_id,
  delivery_status,
  sent_at,
  created_at
from campaign_deliveries;

-- ============================================================
-- campaign_stats
-- Aggregated message counters per campaign.
-- ============================================================
create table campaign_stats (
  id                        uuid primary key default gen_random_uuid(),
  campaign_id               uuid not null unique references campaigns(id) on delete cascade,
  total_messages            integer not null default 0,
  messages_sent             integer not null default 0,
  messages_failed           integer not null default 0,
  messages_pending          integer not null default 0,
  last_message_processed_at timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint chk_campaign_stats_non_negative
    check (
      total_messages >= 0
      and messages_sent >= 0
      and messages_failed >= 0
      and messages_pending >= 0
    ),
  constraint chk_campaign_stats_totals
    check (total_messages = messages_sent + messages_failed + messages_pending)
);

create index idx_campaign_stats_last_message_processed_at
  on campaign_stats(last_message_processed_at);

-- ============================================================
-- Aggregate refresh helpers
-- ============================================================
create or replace function refresh_campaign_message_aggregates_for(p_campaign_id uuid)
returns void
language plpgsql
as $$
declare
  v_total integer := 0;
  v_sent integer := 0;
  v_failed integer := 0;
  v_pending integer := 0;
  v_last_message_processed_at timestamptz := null;
begin
  select
    count(*)::integer,
    count(*) filter (where delivery_status = 'sent')::integer,
    count(*) filter (where delivery_status = 'failed')::integer,
    max(sent_at)
  into
    v_total,
    v_sent,
    v_failed,
    v_last_message_processed_at
  from campaign_messages
  where campaign_id = p_campaign_id;

  v_pending := greatest(v_total - v_sent - v_failed, 0);

  update campaigns
  set
    total_messages = v_total,
    messages_sent = v_sent,
    messages_failed = v_failed,
    sent_at = v_last_message_processed_at
  where id = p_campaign_id;

  insert into campaign_stats (
    campaign_id,
    total_messages,
    messages_sent,
    messages_failed,
    messages_pending,
    last_message_processed_at,
    updated_at
  )
  select
    c.id,
    v_total,
    v_sent,
    v_failed,
    v_pending,
    v_last_message_processed_at,
    now()
  from campaigns c
  where c.id = p_campaign_id
  on conflict (campaign_id)
  do update set
    total_messages = excluded.total_messages,
    messages_sent = excluded.messages_sent,
    messages_failed = excluded.messages_failed,
    messages_pending = excluded.messages_pending,
    last_message_processed_at = excluded.last_message_processed_at,
    updated_at = now();
end;
$$;

create or replace function trg_refresh_campaign_message_aggregates()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and old.campaign_id is distinct from new.campaign_id then
    perform refresh_campaign_message_aggregates_for(old.campaign_id);
    perform refresh_campaign_message_aggregates_for(new.campaign_id);
  elsif tg_op = 'DELETE' then
    perform refresh_campaign_message_aggregates_for(old.campaign_id);
  else
    perform refresh_campaign_message_aggregates_for(new.campaign_id);
  end if;

  return null;
end;
$$;

create trigger trg_campaign_messages_refresh_aggregates
after insert or update or delete on campaign_messages
for each row
execute function trg_refresh_campaign_message_aggregates();

-- Backfill aggregate columns in campaigns and seed campaign_stats.
update campaigns c
set
  total_messages = source.total_messages,
  messages_sent = source.messages_sent,
  messages_failed = source.messages_failed,
  sent_at = source.last_message_processed_at
from (
  select
    cm.campaign_id,
    count(*)::integer as total_messages,
    count(*) filter (where cm.delivery_status = 'sent')::integer as messages_sent,
    count(*) filter (where cm.delivery_status = 'failed')::integer as messages_failed,
    max(cm.sent_at) as last_message_processed_at
  from campaign_messages cm
  group by cm.campaign_id
) source
where c.id = source.campaign_id;

insert into campaign_stats (
  campaign_id,
  total_messages,
  messages_sent,
  messages_failed,
  messages_pending,
  last_message_processed_at
)
select
  c.id,
  c.total_messages,
  c.messages_sent,
  c.messages_failed,
  greatest(c.total_messages - c.messages_sent - c.messages_failed, 0) as messages_pending,
  c.sent_at
from campaigns c
on conflict (campaign_id)
do nothing;

-- Replace old table after migration is complete.
drop table campaign_deliveries;

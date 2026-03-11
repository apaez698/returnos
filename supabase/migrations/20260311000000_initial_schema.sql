-- ReturnOS Initial Schema
-- Migration: 20260311000000_initial_schema

create extension if not exists "pgcrypto";

-- ============================================================
-- businesses
-- Core tenant. Each small business is one row.
-- ============================================================
create table businesses (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(trim(name)) > 0),
  slug          text not null unique check (slug ~ '^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$'),
  business_type text not null check (business_type in ('restaurant', 'bakery')),
  created_at    timestamptz not null default now()
);

create index idx_businesses_slug on businesses(slug);

-- ============================================================
-- business_users
-- Links Supabase auth users to a business with a role.
-- ============================================================
create table business_users (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'owner' check (role in ('owner', 'staff')),
  created_at  timestamptz not null default now(),
  unique (business_id, user_id)
);

create index idx_business_users_business_id on business_users(business_id);
create index idx_business_users_user_id on business_users(user_id);

-- ============================================================
-- customers
-- Loyalty program members registered by a business.
-- ============================================================
create table customers (
  id                uuid primary key default gen_random_uuid(),
  business_id       uuid not null references businesses(id) on delete cascade,
  name              text not null check (char_length(trim(name)) > 0),
  phone             text not null check (phone ~ '^\+?[0-9]{7,15}$'),
  email             text check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  birthday          date check (birthday <= current_date),
  consent_marketing boolean not null default false,
  points            integer not null default 0 check (points >= 0),
  last_visit_at     timestamptz,
  created_at        timestamptz not null default now(),
  unique (business_id, phone),
  unique (id, business_id)
);

create index idx_customers_business_id on customers(business_id);
create index idx_customers_last_visit_at on customers(last_visit_at);

-- ============================================================
-- visits
-- Each check-in or purchase by a customer at a business.
-- ============================================================
create table visits (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references businesses(id) on delete cascade,
  customer_id      uuid not null,
  points_earned    integer not null default 0 check (points_earned >= 0),
  amount           numeric(10,2) check (amount is null or amount >= 0),
  product_category text,
  source           text not null default 'in_store' check (source in ('in_store', 'qr', 'manual')),
  created_at       timestamptz not null default now(),
  constraint fk_visits_customer_business
    foreign key (customer_id, business_id)
    references customers(id, business_id)
    on delete cascade
);

create index idx_visits_business_id on visits(business_id);
create index idx_visits_customer_id on visits(customer_id);
create index idx_visits_created_at on visits(created_at);

-- ============================================================
-- reward_rules
-- Defines what a customer can redeem with their points.
-- ============================================================
create table reward_rules (
  id                 uuid primary key default gen_random_uuid(),
  business_id        uuid not null references businesses(id) on delete cascade,
  name               text not null check (char_length(trim(name)) > 0),
  points_required    integer not null check (points_required > 0),
  reward_description text not null check (char_length(trim(reward_description)) > 0),
  is_active          boolean not null default true,
  created_at         timestamptz not null default now()
);

create index idx_reward_rules_business_id on reward_rules(business_id);

-- ============================================================
-- campaigns
-- Stores campaigns for reactivation and engagement.
-- ============================================================
create table campaigns (
  id                   uuid primary key default gen_random_uuid(),
  business_id          uuid not null references businesses(id) on delete cascade,
  name                 text not null check (char_length(trim(name)) > 0),
  campaign_type        text not null default 'manual'
                       check (campaign_type in ('manual', 'reactivation', 'birthday', 'promotion')),
  audience_type        text not null default 'inactive_customers'
                       check (audience_type in ('all_customers', 'inactive_customers', 'birthday_customers')),
  message              text not null check (char_length(trim(message)) > 0),
  target_inactive_days integer check (target_inactive_days > 0),
  status               text not null default 'draft'
                       check (status in ('draft', 'scheduled', 'sent')),
  created_at           timestamptz not null default now(),
  -- reactivation campaigns must declare how many inactive days to target
  constraint chk_campaigns_reactivation_days
    check (audience_type != 'inactive_customers' or target_inactive_days is not null)
);

create index idx_campaigns_business_id on campaigns(business_id);

-- ============================================================
-- campaign_deliveries
-- Tracks which customers received a campaign message.
-- ============================================================
create table campaign_deliveries (
  id              uuid primary key default gen_random_uuid(),
  campaign_id     uuid not null references campaigns(id) on delete cascade,
  customer_id     uuid not null references customers(id) on delete cascade,
  delivery_status text not null default 'pending'
                  check (delivery_status in ('pending', 'simulated', 'sent', 'failed')),
  sent_at         timestamptz,
  created_at      timestamptz not null default now(),
  unique (campaign_id, customer_id),
  -- sent_at must be populated when the delivery is marked as sent
  constraint chk_campaign_deliveries_sent_at
    check (delivery_status != 'sent' or sent_at is not null)
);

create index idx_campaign_deliveries_campaign_id on campaign_deliveries(campaign_id);
create index idx_campaign_deliveries_customer_id on campaign_deliveries(customer_id);
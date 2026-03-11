-- ReturnOS: Add reward_redemptions table
-- Migration: 20260312000000_add_reward_redemptions

-- ============================================================
-- reward_redemptions
-- Tracks when a customer redeems points for a reward.
-- ============================================================
create table reward_redemptions (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references businesses(id) on delete cascade,
  customer_id     uuid not null references customers(id) on delete cascade,
  reward_rule_id  uuid not null references reward_rules(id) on delete cascade,
  points_spent    integer not null check (points_spent > 0),
  redeemed_at     timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index idx_reward_redemptions_business_id on reward_redemptions(business_id);
create index idx_reward_redemptions_customer_id on reward_redemptions(customer_id);
create index idx_reward_redemptions_reward_rule_id on reward_redemptions(reward_rule_id);

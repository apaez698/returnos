# ReturnOS — Database Validation Checklist

Use this checklist after running the initial schema migration in Supabase (SQL Editor or `supabase db push`).

---

## 1. Schema Structure Checks

Run these in the Supabase SQL Editor to confirm every table exists with the correct columns.

```sql
-- List all ReturnOS tables
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'businesses', 'business_users', 'customers',
    'visits', 'reward_rules', 'campaigns', 'campaign_deliveries'
  )
order by table_name;
-- Expected: 7 rows
```

```sql
-- Confirm UUID primary keys exist on all tables
select table_name, column_name, data_type, column_default
from information_schema.columns
where table_schema = 'public'
  and column_name = 'id'
  and table_name in (
    'businesses', 'business_users', 'customers',
    'visits', 'reward_rules', 'campaigns', 'campaign_deliveries'
  )
order by table_name;
-- Expected: 7 rows, data_type = 'uuid', default contains gen_random_uuid()
```

```sql
-- Confirm created_at timestamps exist
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and column_name = 'created_at'
  and table_name in (
    'businesses', 'business_users', 'customers',
    'visits', 'reward_rules', 'campaigns', 'campaign_deliveries'
  )
order by table_name;
-- Expected: 7 rows, data_type = 'timestamp with time zone'
```

---

## 2. Insert & Relationship Verification

Paste these in order. Each block builds on the previous.

```sql
-- Step 1: Insert a business
insert into businesses (name, slug, business_type)
values ('Panadería Sol', 'panaderia-sol', 'bakery')
returning *;
```

```sql
-- Step 2: Insert a business_user linked to the business
-- Replace <business_id> with the id returned above.
-- Note: user_id must be a valid auth.users id in production.
-- In the SQL editor you can use a real user id from auth.users.
insert into business_users (business_id, user_id, role)
values (
  '<business_id>',
  '<auth_user_id>',
  'owner'
)
returning *;
```

```sql
-- Step 3: Insert two customers
insert into customers (business_id, name, phone, email)
values
  ('<business_id>', 'María García', '+521234567890', 'maria@example.com'),
  ('<business_id>', 'Juan López',   '+529876543210', null)
returning *;
```

```sql
-- Step 4: Insert visits for both customers
-- Replace <customer_id_1> and <customer_id_2> with ids from Step 3
insert into visits (business_id, customer_id, points_earned, source)
values
  ('<business_id>', '<customer_id_1>', 10, 'qr'),
  ('<business_id>', '<customer_id_1>', 10, 'in_store'),
  ('<business_id>', '<customer_id_2>', 10, 'in_store')
returning *;
```

```sql
-- Step 5: Insert a reward rule
insert into reward_rules (business_id, name, points_required, reward_description)
values ('<business_id>', 'Free Coffee', 50, 'Redeem for one free coffee')
returning *;
```

```sql
-- Step 6: Insert a reactivation campaign (requires target_inactive_days)
insert into campaigns (
  business_id, name, campaign_type, audience_type,
  message, target_inactive_days, status
)
values (
  '<business_id>',
  'Come Back Campaign',
  'reactivation',
  'inactive_customers',
  'We miss you! Come in this week for a free pastry.',
  30,
  'draft'
)
returning *;
```

```sql
-- Step 7: Insert campaign deliveries (status defaults to 'pending')
-- Replace <campaign_id> with the id returned in Step 6
insert into campaign_deliveries (campaign_id, customer_id)
values
  ('<campaign_id>', '<customer_id_1>'),
  ('<campaign_id>', '<customer_id_2>')
returning *;
```

```sql
-- Step 8: Mark a delivery as sent (sent_at must be provided)
update campaign_deliveries
set delivery_status = 'sent',
    sent_at = now()
where campaign_id = '<campaign_id>'
  and customer_id = '<customer_id_1>'
returning *;
```

---

## 3. Relationship & Join Queries

```sql
-- All customers for a business with their total visit count
select
  c.id,
  c.name,
  c.points,
  c.last_visit_at,
  count(v.id) as visit_count
from customers c
left join visits v on v.customer_id = c.id
where c.business_id = '<business_id>'
group by c.id, c.name, c.points, c.last_visit_at
order by visit_count desc;
-- Expected: 2 rows (María: 2 visits, Juan: 1 visit)
```

```sql
-- Active reward rules for a business
select id, name, points_required, reward_description
from reward_rules
where business_id = '<business_id>'
  and is_active = true;
-- Expected: 1 row (Free Coffee, 50 points)
```

```sql
-- Campaign deliveries with customer details and delivery status
select
  cd.id              as delivery_id,
  cd.delivery_status,
  cd.sent_at,
  c.name             as customer_name,
  c.phone
from campaign_deliveries cd
join customers c on c.id = cd.customer_id
where cd.campaign_id = '<campaign_id>'
order by cd.delivery_status;
-- Expected: 2 rows (1 sent, 1 pending)
```

```sql
-- Identify inactive customers using last_visit_at (fast, uses index)
select id, name, phone, last_visit_at
from customers
where business_id = '<business_id>'
  and (
    last_visit_at < now() - interval '30 days'
    or last_visit_at is null
  );
```

```sql
-- Identify inactive customers by computing from visits (accurate fallback)
select
  c.id,
  c.name,
  max(v.created_at) as last_computed_visit
from customers c
left join visits v on v.customer_id = c.id
where c.business_id = '<business_id>'
group by c.id, c.name
having max(v.created_at) < now() - interval '30 days'
   or max(v.created_at) is null;
```

---

## 4. Constraint Checks

```sql
-- Invalid slug format should fail (must be lowercase alphanumeric + hyphens)
insert into businesses (name, slug, business_type)
values ('Bad Slug', 'Panaderia_SOL', 'bakery');
-- Expected: ERROR — new row violates check constraint "businesses_slug_check"

-- Duplicate slug should fail
insert into businesses (name, slug, business_type)
values ('Another Bakery', 'panaderia-sol', 'bakery');
-- Expected: ERROR — duplicate key value violates unique constraint

-- Empty business name should fail
insert into businesses (name, slug, business_type)
values ('   ', 'empty-name', 'bakery');
-- Expected: ERROR — new row violates check constraint

-- Invalid business_type should fail
insert into businesses (name, slug, business_type)
values ('MiTienda', 'mi-tienda', 'pharmacy');
-- Expected: ERROR — new row violates check constraint

-- Invalid phone format should fail
insert into customers (business_id, name, phone)
values ('<business_id>', 'Test', 'abc-invalid');
-- Expected: ERROR — new row violates check constraint "customers_phone_check"

-- Invalid email format should fail
insert into customers (business_id, name, phone, email)
values ('<business_id>', 'Test', '+521234567890', 'not-an-email');
-- Expected: ERROR — new row violates check constraint "customers_email_check"

-- Future birthday should fail
insert into customers (business_id, name, phone, birthday)
values ('<business_id>', 'Future Born', '+521234567890', '2099-01-01');
-- Expected: ERROR — new row violates check constraint "customers_birthday_check"

-- Negative points should fail
insert into customers (business_id, name, phone, points)
values ('<business_id>', 'Bad Actor', '+521234567890', -1);
-- Expected: ERROR — new row violates check constraint

-- Invalid visit source should fail
insert into visits (business_id, customer_id, points_earned, source)
values ('<business_id>', '<customer_id_1>', 5, 'app');
-- Expected: ERROR — new row violates check constraint "visits_source_check"

-- Invalid role should fail
insert into business_users (business_id, user_id, role)
values ('<business_id>', '<auth_user_id>', 'superadmin');
-- Expected: ERROR — new row violates check constraint

-- Reactivation campaign without target_inactive_days should fail
insert into campaigns (
  business_id, name, campaign_type, audience_type, message
)
values (
  '<business_id>', 'Bad Reactivation', 'reactivation',
  'inactive_customers', 'Come back!'
);
-- Expected: ERROR — new row violates check constraint "chk_campaigns_reactivation_days"

-- Invalid campaign status should fail
insert into campaigns (
  business_id, name, campaign_type, audience_type,
  message, target_inactive_days, status
)
values ('<business_id>', 'Bad Campaign', 'manual', 'all_customers', 'msg', null, 'archived');
-- Expected: ERROR — new row violates check constraint

-- Marking delivery as 'sent' without sent_at should fail
insert into campaign_deliveries (campaign_id, customer_id, delivery_status)
values ('<campaign_id>', '<customer_id_2>', 'sent');
-- Expected: ERROR — new row violates check constraint "chk_campaign_deliveries_sent_at"

-- Duplicate campaign delivery should fail
insert into campaign_deliveries (campaign_id, customer_id)
values ('<campaign_id>', '<customer_id_1>');
-- Expected: ERROR — duplicate key value violates unique constraint
```

---

## 5. Cascade Delete Check

```sql
-- Deleting a business should cascade to all related rows
delete from businesses where slug = 'panaderia-sol';

-- Verify all child rows are gone
select count(*) from customers         where business_id = '<business_id>';  -- 0
select count(*) from visits            where business_id = '<business_id>';  -- 0
select count(*) from reward_rules      where business_id = '<business_id>';  -- 0
select count(*) from campaigns         where business_id = '<business_id>';  -- 0
select count(*) from business_users    where business_id = '<business_id>';  -- 0
```

---

## 6. Index Verification

```sql
-- Confirm all indexes were created
select indexname, tablename
from pg_indexes
where schemaname = 'public'
  and tablename in (
    'businesses', 'business_users', 'customers', 'visits',
    'reward_rules', 'campaigns', 'campaign_deliveries'
  )
order by tablename, indexname;
-- Expected indexes:
--   businesses:           idx_businesses_slug
--   business_users:       idx_business_users_business_id, idx_business_users_user_id
--   customers:            idx_customers_business_id, idx_customers_last_visit_at
--   visits:               idx_visits_business_id, idx_visits_created_at, idx_visits_customer_id
--   reward_rules:         idx_reward_rules_business_id
--   campaigns:            idx_campaigns_business_id
--   campaign_deliveries:  idx_campaign_deliveries_campaign_id, idx_campaign_deliveries_customer_id
```

---

## Manual Test Checklist

| #   | Check                                                               | Pass |
| --- | ------------------------------------------------------------------- | ---- |
| 1   | All 7 tables exist in `public` schema                               | [ ]  |
| 2   | All tables have UUID `id` with `gen_random_uuid()` default          | [ ]  |
| 3   | All tables have `timestamptz` `created_at` with `now()` default     | [ ]  |
| 4   | `businesses.slug` rejects uppercase and special characters          | [ ]  |
| 5   | `businesses.slug` is unique                                         | [ ]  |
| 6   | `businesses.name` rejects blank/whitespace-only values              | [ ]  |
| 7   | `businesses.business_type` only accepts `restaurant` or `bakery`    | [ ]  |
| 8   | `customers.phone` rejects non-numeric / malformed numbers           | [ ]  |
| 9   | `customers.email` rejects values without `@domain.tld` format       | [ ]  |
| 10  | `customers.birthday` rejects future dates                           | [ ]  |
| 11  | `customers.points` cannot be negative                               | [ ]  |
| 12  | `customers (business_id, phone)` unique pair enforced               | [ ]  |
| 13  | `visits.source` only accepts `in_store`, `qr`, `manual`             | [ ]  |
| 14  | Composite FK on `visits (customer_id, business_id)` enforced        | [ ]  |
| 15  | `business_users.role` only accepts `owner` or `staff`               | [ ]  |
| 16  | `campaigns.status` only accepts `draft`, `scheduled`, `sent`        | [ ]  |
| 17  | `campaigns.campaign_type` only accepts allowed values               | [ ]  |
| 18  | Reactivation campaign without `target_inactive_days` is rejected    | [ ]  |
| 19  | `campaign_deliveries.delivery_status = 'sent'` requires `sent_at`   | [ ]  |
| 20  | `campaign_deliveries` prevents duplicate (campaign, customer) pairs | [ ]  |
| 21  | Deleting a business cascades to all child tables                    | [ ]  |
| 22  | All 12 indexes exist as listed in Section 6                         | [ ]  |
| 23  | Join query returns correct visit counts per customer                | [ ]  |
| 24  | Inactive customer query returns expected results                    | [ ]  |

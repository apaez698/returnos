-- Store member email in business_users so team tables can render email safely.

alter table business_users
add column if not exists user_email text
  check (user_email is null or user_email = lower(trim(user_email)))
  check (user_email is null or user_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$');

-- Backfill existing memberships from auth.users.
update business_users as bu
set user_email = lower(trim(au.email))
from auth.users as au
where bu.user_id = au.id
  and au.email is not null
  and (bu.user_email is null or bu.user_email <> lower(trim(au.email)));

create index if not exists idx_business_users_user_email
  on business_users(user_email);

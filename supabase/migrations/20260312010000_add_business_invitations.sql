-- Add collaborator invitation flow and admin role support.

alter table business_users
drop constraint if exists business_users_role_check;

alter table business_users
add constraint business_users_role_check
check (role in ('owner', 'admin', 'staff'));

create table business_invitations (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  email       text not null
              check (email = lower(trim(email)))
              check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role        text not null check (role in ('admin', 'staff')),
  invited_by  uuid not null references auth.users(id) on delete cascade,
  status      text not null default 'pending'
              check (status in ('pending', 'accepted', 'revoked', 'expired')),
  token       text not null unique check (char_length(token) >= 20),
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index idx_business_invitations_business_id
  on business_invitations(business_id);

create index idx_business_invitations_email
  on business_invitations(email);

create index idx_business_invitations_status
  on business_invitations(status);

create unique index idx_business_invitations_pending_unique
  on business_invitations(business_id, email)
  where status = 'pending';

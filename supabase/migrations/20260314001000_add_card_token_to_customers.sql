-- Add persistent loyalty card token per customer.
-- Keeps historical rows consistent and prevents future insert failures.

alter table customers
add column if not exists card_token uuid;

update customers
set card_token = gen_random_uuid()
where card_token is null;

alter table customers
alter column card_token set default gen_random_uuid();

alter table customers
alter column card_token set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'customers_card_token_key'
      and conrelid = 'customers'::regclass
  ) then
    alter table customers
    add constraint customers_card_token_key unique (card_token);
  end if;
end
$$;

create index if not exists idx_customers_card_token
on customers(card_token);

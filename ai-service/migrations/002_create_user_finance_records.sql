-- User-owned investments and manual transactions

create table if not exists investments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null default 'Stock',
  quantity numeric(18,6) not null default 1,
  invested_amount numeric(12,2) not null,
  current_value numeric(12,2) not null,
  purchase_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_investments_user_id on investments(user_id);
create index if not exists idx_investments_created on investments(created_at desc);
alter table investments enable row level security;
drop policy if exists "Users can read own investments" on investments;
create policy "Users can read own investments" on investments for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own investments" on investments;
create policy "Users can insert own investments" on investments for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own investments" on investments;
create policy "Users can update own investments" on investments for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own investments" on investments;
create policy "Users can delete own investments" on investments for delete using (auth.uid() = user_id);

create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  merchant text not null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  amount numeric(12,2) not null,
  date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_user_id on transactions(user_id);
create index if not exists idx_transactions_date on transactions(date desc);
alter table transactions enable row level security;
drop policy if exists "Users can read own transactions" on transactions;
create policy "Users can read own transactions" on transactions for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own transactions" on transactions;
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own transactions" on transactions;
create policy "Users can update own transactions" on transactions for update using (auth.uid() = user_id);
drop policy if exists "Users can delete own transactions" on transactions;
create policy "Users can delete own transactions" on transactions for delete using (auth.uid() = user_id);
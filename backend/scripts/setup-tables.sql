-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- This creates all required tables for the FMS backend.

-- ============================================================
-- 1. EXPENSES TABLE (AI-processed receipts + manual)
-- ============================================================
create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,

  amount numeric(12,2) not null,
  currency text not null default 'INR',
  category text not null,
  description text,
  merchant text,
  expense_date date,
  payment_method text,

  source text not null default 'manual',
  ocr_text text,
  ai_confidence numeric(4,3),
  ai_category_confidence numeric(4,3),
  receipt_url text,

  duplicate_of uuid references expenses(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_expenses_user_id on expenses(user_id);
create index if not exists idx_expenses_category on expenses(category);
create index if not exists idx_expenses_date on expenses(expense_date);
create index if not exists idx_expenses_created on expenses(created_at desc);

create unique index if not exists idx_expenses_dedup
  on expenses(user_id, merchant, amount, expense_date)
  where merchant is not null and expense_date is not null;

alter table expenses enable row level security;

create policy "Users can read own expenses"
  on expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on expenses for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 2. INVESTMENTS TABLE
-- ============================================================
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

-- ============================================================
-- 3. TRANSACTIONS TABLE
-- ============================================================
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

-- ============================================================
-- 4. AUTO-UPDATE TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists expenses_updated_at on expenses;
create trigger expenses_updated_at
  before update on expenses
  for each row
  execute function update_updated_at();

drop trigger if exists investments_updated_at on investments;
create trigger investments_updated_at
  before update on investments
  for each row
  execute function update_updated_at();

-- AURA Finance: expenses table for AI-processed receipts
-- Run this in Supabase SQL Editor or via migration

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

-- Indexes
create index if not exists idx_expenses_user_id on expenses(user_id);
create index if not exists idx_expenses_category on expenses(category);
create index if not exists idx_expenses_date on expenses(expense_date);
create index if not exists idx_expenses_created on expenses(created_at desc);

-- Unique constraint for duplicate detection
create unique index if not exists idx_expenses_dedup
  on expenses(user_id, merchant, amount, expense_date)
  where merchant is not null and expense_date is not null;

-- RLS: users can only access their own expenses
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

-- Auto-update updated_at
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

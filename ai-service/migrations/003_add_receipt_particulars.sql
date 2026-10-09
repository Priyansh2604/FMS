-- AURA Finance: Add receipt particulars columns to expenses table
-- Run this in Supabase SQL Editor or via migration

alter table expenses
  add column if not exists subcategory text,
  add column if not exists gst_amount numeric(12,2),
  add column if not exists gst_percent numeric(5,2),
  add column if not exists cgst numeric(12,2),
  add column if not exists sgst numeric(12,2),
  add column if not exists igst numeric(12,2),
  add column if not exists subtotal numeric(12,2),
  add column if not exists tax_rate numeric(5,2),
  add column if not exists invoice_number text,
  add column if not exists vendor_gstin text,
  add column if not exists receipt_number text,
  add column if not exists tip_amount numeric(12,2),
  add column if not exists discount_amount numeric(12,2),
  add column if not exists total_items integer,
  add column if not exists payment_method_detail text,
  add column if not exists card_last_four text,
  add column if not exists upi_id text,
  add column if not exists store_address text,
  add column if not exists store_phone text,
  add column if not exists line_items jsonb;

-- Indexes for new columns
create index if not exists idx_expenses_subcategory on expenses(subcategory);
create index if not exists idx_expenses_invoice_number on expenses(invoice_number);
create index if not exists idx_expenses_vendor_gstin on expenses(vendor_gstin);
create index if not exists idx_expenses_payment_method on expenses(payment_method);
create index if not exists idx_expenses_upi_id on expenses(upi_id);
create index if not exists idx_expenses_card_last_four on expenses(card_last_four);

-- Update unique constraint for duplicate detection to include subcategory
drop index if exists idx_expenses_dedup;
create unique index if not exists idx_expenses_dedup
  on expenses(user_id, merchant, amount, expense_date)
  where merchant is not null and expense_date is not null;
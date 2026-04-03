-- Add size fields to products table
-- Replaces duration (days) with size_value + size_unit for ml/g/oz based tracking
-- 2026-04-02

alter table products
  add column if not exists size_value numeric,
  add column if not exists size_unit text check (size_unit in ('ml', 'g', 'oz'));

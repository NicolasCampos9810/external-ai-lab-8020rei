-- Add company field to profiles
alter table public.profiles add column if not exists company text;

-- ============================================================================
-- Taskline: Table Privileges & Row Level Security (No Auth Required)
-- Run this script after schema.sql in the Supabase SQL Editor.
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tasks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.accounts TO anon, authenticated;

-- Tasks RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow public read access" ON public.tasks;
DROP POLICY IF EXISTS "Allow public insert access" ON public.tasks;
DROP POLICY IF EXISTS "Allow public update access" ON public.tasks;
DROP POLICY IF EXISTS "Allow public delete access" ON public.tasks;

CREATE POLICY "Allow public read access"
  ON public.tasks FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert access"
  ON public.tasks FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON public.tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete access"
  ON public.tasks FOR DELETE TO anon, authenticated USING (true);

-- Accounts RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read accounts" ON public.accounts;
DROP POLICY IF EXISTS "Allow public insert accounts" ON public.accounts;
DROP POLICY IF EXISTS "Allow public delete accounts" ON public.accounts;

CREATE POLICY "Allow public read accounts"
  ON public.accounts FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert accounts"
  ON public.accounts FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public delete accounts"
  ON public.accounts FOR DELETE TO anon, authenticated USING (true);

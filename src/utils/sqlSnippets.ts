export const SCHEMA_SQL = `CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) > 0),
  email TEXT NOT NULL UNIQUE CHECK (char_length(trim(email)) > 0),
  role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounts_created_at ON public.accounts (created_at DESC);

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
  category TEXT,
  due_date DATE,
  due_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;
ALTER TABLE public.tasks ALTER COLUMN user_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks (created_at DESC);

CREATE OR REPLACE FUNCTION public.handle_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_tasks_updated ON public.tasks;
CREATE TRIGGER on_tasks_updated
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_tasks_updated_at();`;

export const RLS_SQL = `GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tasks TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.accounts TO anon, authenticated;

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

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read accounts" ON public.accounts;
DROP POLICY IF EXISTS "Allow public insert accounts" ON public.accounts;
DROP POLICY IF EXISTS "Allow public delete accounts" ON public.accounts;

CREATE POLICY "Allow public read accounts"
  ON public.accounts FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert accounts"
  ON public.accounts FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public delete accounts"
  ON public.accounts FOR DELETE TO anon, authenticated USING (true);`;

export const COMBINED_SETUP_SQL = `${SCHEMA_SQL}

${RLS_SQL}`;

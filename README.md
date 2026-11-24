# Taskline — Full-Stack To-Do List Application with Supabase

A modern, responsive SaaS task management application built with **React**, **TypeScript**, **Tailwind CSS**, **React Router**, and **Supabase PostgreSQL**.

## 1. Environment Configuration

Copy `.env.example` to `.env` and fill in your Supabase project credentials from **Supabase Dashboard → Project Settings → API**:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
```

> **Security Note:** Never expose your Supabase `service_role` key in frontend code or `VITE_*` variables.

## 2. Database Setup (Supabase SQL Editor)

1. Open your Supabase project and navigate to **SQL Editor**.
2. Run `supabase/schema.sql` to create the `public.accounts` and `public.tasks` tables, indexes, and automatic `updated_at` trigger.
3. Run `supabase/rls_policies.sql` to grant table privileges and enable direct workspace access without a login gate.

## 3. Run Locally

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:3000`.

## 4. Production Build & Deployment

```bash
npm run build
npm start
```

Running `npm start` starts `server.ts` on port `3000` (or `PORT`), serves the built `dist/` bundle with SPA routing fallback, and exposes public Supabase config at `/api/config` from runtime environment variables. If deploying `dist/` to a static host (Vercel, Netlify, Cloudflare Pages), set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host's build-time environment variables before `npm run build` runs.


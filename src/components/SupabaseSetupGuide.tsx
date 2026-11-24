import { useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Database,
  FileCode2,
  RefreshCw,
  Rocket,
  ShieldCheck,
} from 'lucide-react';
import { getSupabaseConfigError } from '../services/supabase';
import { RLS_SQL, SCHEMA_SQL } from '../utils/sqlSnippets';

type SetupTab = 'env' | 'schema' | 'rls' | 'deploy';

const ENV_EXAMPLE = `VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key`;

interface SupabaseSetupGuideProps {
  onRetry?: () => void;
  retrying?: boolean;
}

export function SupabaseSetupGuide({ onRetry, retrying = false }: SupabaseSetupGuideProps) {
  const [activeTab, setActiveTab] = useState<SetupTab>('env');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setCopiedKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/60 dark:bg-amber-950/30">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                Connect Supabase to Start Managing Tasks
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {getSupabaseConfigError() ??
                  'Supabase credentials are not configured yet. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live PostgreSQL persistence.'}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                If your preview works but a deployed URL shows this guide, add{' '}
                <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
                <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to your deployment
                hosting environment variables / secrets and redeploy.
              </p>
            </div>
          </div>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              className="inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-lg border border-amber-300 bg-white px-3.5 py-2 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-50 disabled:opacity-60 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-200 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${retrying ? 'animate-spin' : ''}`} />
              <span>{retrying ? 'Checking...' : 'Retry Connection'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap gap-1 border-b border-slate-200 p-2 dark:border-slate-800">
            {[
              { id: 'env' as const, label: '1. Environment Variables', icon: Database },
              { id: 'schema' as const, label: '2. Table Schema SQL', icon: FileCode2 },
              { id: 'rls' as const, label: '3. RLS Policies SQL', icon: ShieldCheck },
              { id: 'deploy' as const, label: '4. Local & Deploy', icon: Rocket },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#4F46E5] text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'env' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Configure Your Supabase Project Credentials
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    In your Supabase Dashboard, open <strong>Project Settings → API</strong> and copy
                    your <strong>Project URL</strong> and <strong>anon / publishable key</strong>.
                    Never place the <code className="font-mono text-xs">service_role</code> key in
                    frontend code or <code className="font-mono text-xs">VITE_*</code> variables.
                  </p>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950">
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                      .env
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('env', ENV_EXAMPLE)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {copiedKey === 'env' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedKey === 'env' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="overflow-x-auto bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100">
                    {ENV_EXAMPLE}
                  </pre>
                </div>

                <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li>Create or update your <code className="font-mono text-xs">.env</code> file (or AI Studio Secrets) with both variables above.</li>
                  <li>Run the SQL scripts in tabs 2 and 3 inside the Supabase SQL Editor.</li>
                  <li>Reload this application to create user accounts and manage tasks directly.</li>
                </ol>
              </div>
            )}

            {activeTab === 'schema' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Create Accounts &amp; Tasks Tables
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Run this script first in the Supabase SQL Editor (also saved at{' '}
                    <code className="font-mono text-xs">supabase/schema.sql</code>).
                  </p>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950">
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                      supabase/schema.sql
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('schema', SCHEMA_SQL)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {copiedKey === 'schema' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedKey === 'schema' ? 'Copied' : 'Copy SQL'}</span>
                    </button>
                  </div>
                  <pre className="max-h-96 overflow-auto bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100">
                    {SCHEMA_SQL}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'rls' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Configure Table Privileges &amp; RLS
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Run this script after creating the tables (also saved at{' '}
                    <code className="font-mono text-xs">supabase/rls_policies.sql</code>) to enable
                    direct CRUD access for accounts and tasks without authentication.
                  </p>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950">
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                      supabase/rls_policies.sql
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('rls', RLS_SQL)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {copiedKey === 'rls' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedKey === 'rls' ? 'Copied' : 'Copy SQL'}</span>
                    </button>
                  </div>
                  <pre className="max-h-96 overflow-auto bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100">
                    {RLS_SQL}
                  </pre>
                </div>
              </div>
            )}

            {activeTab === 'deploy' && (
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Running Locally & Deploying
                  </h2>
                  <p className="mt-1">
                    Follow these commands to install dependencies, run locally, and build for
                    production hosting (Vercel, Netlify, Cloudflare Pages, or Cloud Run).
                  </p>
                </div>

                <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100">
{`# 1. Install dependencies
npm install

# 2. Configure .env from .env.example
cp .env.example .env

# 3. Start development server on port 3000
npm run dev

# 4. Build and start full-stack server in production
npm run build
npm start`}
                </pre>

                <p>
                  When running on Node/Cloud Run via <code className="font-mono text-xs">npm start</code>,{' '}
                  <code className="font-mono text-xs">server.ts</code> serves the built bundle and
                  supplies <code className="font-mono text-xs">VITE_SUPABASE_URL</code> and{' '}
                  <code className="font-mono text-xs">VITE_SUPABASE_ANON_KEY</code> at runtime via{' '}
                  <code className="font-mono text-xs">/api/config</code>. For static hosts (Vercel,
                  Netlify, Cloudflare Pages), configure both{' '}
                  <code className="font-mono text-xs">VITE_*</code> variables in your host&apos;s
                  build environment before running <code className="font-mono text-xs">npm run build</code>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

import { useState } from 'react';
import {
  Check,
  Copy,
  Database,
  Monitor,
  Moon,
  Sun,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { ThemePreference, useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { getSupabaseProjectHost } from '../services/supabase';
import { UserAccount } from '../types/account';
import { formatTimestamp } from '../utils/dateUtils';
import { RLS_SQL, SCHEMA_SQL } from '../utils/sqlSnippets';

interface SettingsProps {
  accounts: UserAccount[];
  activeAccount: UserAccount | null;
  accountsLoading: boolean;
  onOpenCreateAccount: () => void;
  onSelectAccount: (accountId: string) => void;
  onDeleteAccount: (account: UserAccount) => Promise<boolean>;
}

export function Settings({
  accounts,
  activeAccount,
  accountsLoading,
  onOpenCreateAccount,
  onSelectAccount,
  onDeleteAccount,
}: SettingsProps) {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const [copiedSql, setCopiedSql] = useState<'schema' | 'rls' | null>(null);

  const handleCopy = async (kind: 'schema' | 'rls', sql: string) => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopiedSql(kind);
      showToast('success', 'SQL copied', 'Paste into the Supabase SQL Editor.');
      window.setTimeout(() => setCopiedSql(null), 2000);
    } catch {
      showToast('error', 'Copy failed', 'Unable to copy to clipboard.');
    }
  };

  const themeOptions: { id: ThemePreference; label: string; icon: typeof Sun }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage created user accounts, appearance preferences, and database SQL scripts.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              User Account
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {activeAccount
                ? `Signed profile: ${activeAccount.full_name}`
                : 'Create your user profile directly in Supabase without passwords or login barriers.'}
            </p>
          </div>
          {!accountsLoading && accounts.length === 0 && (
            <button
              type="button"
              onClick={onOpenCreateAccount}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 whitespace-nowrap"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              <span>Create Account</span>
            </button>
          )}
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          {accountsLoading ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading accounts...</p>
          ) : accounts.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No accounts created yet. Click <strong>Create Account</strong> to register a profile.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {accounts.map((acc) => {
                const isActive = activeAccount?.id === acc.id;
                return (
                  <div
                    key={acc.id}
                    className="flex flex-col justify-between gap-3 py-3 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {acc.full_name}
                        {isActive && (
                          <span className="ml-2 text-xs font-medium text-[#4F46E5] dark:text-indigo-400">
                            (Active)
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {acc.email}
                        {acc.role ? ` · ${acc.role}` : ''} · Created {formatTimestamp(acc.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => onSelectAccount(acc.id)}
                          className="min-h-[36px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          Set Active
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteAccount(acc)}
                        aria-label={`Remove ${acc.full_name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Supabase Connection
        </h3>
        <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Database className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {getSupabaseProjectHost() ? `Connected to ${getSupabaseProjectHost()}` : 'Supabase Connected'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct PostgreSQL workspace with account creation (no authentication gate).
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Appearance
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Choose how Taskline looks across your workspace.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = theme === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                className={`flex min-h-[48px] items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  isSelected
                    ? 'border-[#4F46E5] bg-indigo-50 text-[#4F46E5] dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Supabase SQL Reference
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Copy and run the PostgreSQL schema and RLS scripts in your Supabase SQL Editor.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleCopy('schema', SCHEMA_SQL)}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {copiedSql === 'schema' ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span>{copiedSql === 'schema' ? 'Copied Table Schema' : 'Copy Table Schema SQL'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleCopy('rls', RLS_SQL)}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {copiedSql === 'rls' ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span>{copiedSql === 'rls' ? 'Copied RLS Policies' : 'Copy RLS Policies SQL'}</span>
          </button>
        </div>
      </section>
    </div>
  );
}

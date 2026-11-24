import React, { useEffect, useState } from 'react';
import { Check, Copy, Loader2, UserPlus, X } from 'lucide-react';
import { CreateAccountInput } from '../types/account';
import { COMBINED_SETUP_SQL } from '../utils/sqlSnippets';

interface CreateAccountModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: CreateAccountInput) => Promise<void>;
}

export function CreateAccountModal({ open, onClose, onCreate }: CreateAccountModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFullName('');
    setEmail('');
    setRole('');
    setError(null);
    setSubmitting(false);
    setCopiedSql(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, submitting, onClose]);

  if (!open) return null;

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(COMBINED_SETUP_SQL);
      setCopiedSql(true);
      window.setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      setCopiedSql(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Full name is required.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onCreate({
        full_name: trimmedName,
        email: trimmedEmail,
        role: role.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  const isSqlMissing =
    error !== null &&
    (error.includes('Supabase SQL Editor') || error.includes('"accounts" table'));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-account-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-[#4F46E5] dark:bg-indigo-950/60 dark:text-indigo-400">
              <UserPlus className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="create-account-title"
                className="text-base font-semibold text-slate-900 dark:text-slate-100"
              >
                Create User Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Save a user profile directly to Supabase (no login required).
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            aria-label="Close create account modal"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          {error && (
            <div
              role="alert"
              className="space-y-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300"
            >
              <p className="leading-relaxed">{error}</p>
              {isSqlMissing && (
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 rounded border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-slate-900 dark:text-red-300"
                >
                  {copiedSql ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedSql ? 'Copied Setup SQL' : 'Copy Setup SQL'}</span>
                </button>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="account-full-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Full Name <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <input
              id="account-full-name"
              type="text"
              required
              maxLength={100}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Rivera"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="account-email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Email Address <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <input
              id="account-email"
              type="email"
              required
              maxLength={150}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="account-role"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Role / Team <span className="text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="account-role"
              type="text"
              maxLength={80}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Product Engineering"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              <span>{submitting ? 'Creating...' : 'Create Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

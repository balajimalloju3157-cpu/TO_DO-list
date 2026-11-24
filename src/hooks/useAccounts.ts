import { useCallback, useEffect, useState } from 'react';
import { accountService } from '../services/accountService';
import { isSupabaseConfigured } from '../services/supabase';
import { CreateAccountInput, UserAccount } from '../types/account';
import { useToast } from './useToast';

const ACTIVE_ACCOUNT_STORAGE_KEY = 'taskline_active_account_id';

export function useAccounts() {
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(() => isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);
  const [activeAccountId, setActiveAccountIdState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(ACTIVE_ACCOUNT_STORAGE_KEY);
  });

  const refreshAccounts = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const list = await accountService.fetchAccounts();
      setAccounts(list);
      if (list.length > 0) {
        setActiveAccountIdState((prev) => {
          const exists = prev && list.some((a) => a.id === prev);
          const next = exists ? prev : list[0].id;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(ACTIVE_ACCOUNT_STORAGE_KEY, next);
          }
          return next;
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load accounts.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  const setActiveAccountId = useCallback((id: string | null) => {
    setActiveAccountIdState(id);
    if (typeof window !== 'undefined') {
      if (id) {
        window.localStorage.setItem(ACTIVE_ACCOUNT_STORAGE_KEY, id);
      } else {
        window.localStorage.removeItem(ACTIVE_ACCOUNT_STORAGE_KEY);
      }
    }
  }, []);

  const createAccount = useCallback(
    async (input: CreateAccountInput): Promise<UserAccount> => {
      try {
        const created = await accountService.createAccount(input);
        setAccounts((prev) => [created, ...prev]);
        setActiveAccountId(created.id);
        showToast('success', 'Account created', `Account for ${created.full_name} is ready.`);
        return created;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not create account.';
        showToast('error', 'Account creation failed', message);
        throw err;
      }
    },
    [setActiveAccountId, showToast]
  );

  const deleteAccount = useCallback(
    async (account: UserAccount): Promise<boolean> => {
      try {
        await accountService.deleteAccount(account.id);
        setAccounts((prev) => {
          const remaining = prev.filter((a) => a.id !== account.id);
          if (activeAccountId === account.id) {
            setActiveAccountId(remaining[0]?.id ?? null);
          }
          return remaining;
        });
        showToast('success', 'Account removed', `${account.full_name} was removed.`);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not remove account.';
        showToast('error', 'Remove failed', message);
        return false;
      }
    },
    [activeAccountId, setActiveAccountId, showToast]
  );

  const activeAccount = accounts.find((a) => a.id === activeAccountId) ?? accounts[0] ?? null;

  return {
    accounts,
    activeAccount,
    loading,
    error,
    refreshAccounts,
    setActiveAccountId,
    createAccount,
    deleteAccount,
  };
}

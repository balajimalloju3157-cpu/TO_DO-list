import { CreateAccountInput, UserAccount } from '../types/account';
import { getSupabaseClient } from './supabase';

function requireClient() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.'
    );
  }
  return client;
}

function formatAccountError(error: { message: string; code?: string }): Error {
  const msg = error.message ?? '';
  if (error.code === '42P01' || error.code === 'PGRST205' || msg.includes('schema cache')) {
    return new Error(
      'The "accounts" table does not exist in Supabase yet. Copy and run the Setup SQL in your Supabase SQL Editor.'
    );
  }
  if (error.code === '23505') {
    return new Error('An account with this email address already exists.');
  }
  if (error.code === '42501') {
    return new Error(
      'Permission denied on "accounts". Run the Setup SQL (GRANT & RLS policies) in your Supabase SQL Editor.'
    );
  }
  return new Error(msg || 'Unable to process account request.');
}

export const accountService = {
  async fetchAccounts(): Promise<UserAccount[]> {
    const client = requireClient();
    const { data, error } = await client
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw formatAccountError(error);
    }
    return (data ?? []) as UserAccount[];
  },

  async createAccount(input: CreateAccountInput): Promise<UserAccount> {
    const client = requireClient();
    const payload = {
      full_name: input.full_name.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role?.trim() ? input.role.trim() : null,
    };

    const { data, error } = await client
      .from('accounts')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw formatAccountError(error);
    }
    return data as UserAccount;
  },

  async deleteAccount(accountId: string): Promise<void> {
    const client = requireClient();
    const { error } = await client.from('accounts').delete().eq('id', accountId);
    if (error) {
      throw formatAccountError(error);
    }
  },
};

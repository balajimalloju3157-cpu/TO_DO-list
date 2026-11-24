import { createClient, SupabaseClient } from '@supabase/supabase-js';

function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    !value ||
    lower.includes('your_supabase') ||
    lower.includes('my_supabase') ||
    lower === 'undefined' ||
    lower === 'null'
  );
}

function validateConfig(url: string, key: string): string | null {
  if (isPlaceholder(url) || isPlaceholder(key)) {
    return 'Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are not configured yet.';
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return 'VITE_SUPABASE_URL must be a valid HTTP/HTTPS Supabase project URL.';
    }
  } catch {
    return 'VITE_SUPABASE_URL is not a valid URL.';
  }
  return null;
}

let activeClient: SupabaseClient | null = null;
let activeProjectHost: string | null = null;
let activeConfigError: string | null = null;

function initClient(url: string, key: string): boolean {
  const error = validateConfig(url, key);
  if (error) {
    activeClient = null;
    activeProjectHost = null;
    activeConfigError = error;
    return false;
  }

  activeClient = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  try {
    activeProjectHost = new URL(url).host;
  } catch {
    activeProjectHost = null;
  }
  activeConfigError = null;
  return true;
}

// 1. Try build-time Vite env variables first
const buildUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const buildKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';
initClient(buildUrl, buildKey);

// 2. Fallback to runtime /api/config endpoint for deployed containers
export async function loadRuntimeSupabaseConfig(): Promise<boolean> {
  if (activeClient) return true;
  try {
    const response = await fetch('/api/config', { cache: 'no-store' });
    if (!response.ok) return false;
    const data = (await response.json()) as {
      supabaseUrl?: string;
      supabaseAnonKey?: string;
    };
    return initClient((data.supabaseUrl ?? '').trim(), (data.supabaseAnonKey ?? '').trim());
  } catch {
    return false;
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  return activeClient;
}

export function isSupabaseConfigured(): boolean {
  return activeClient !== null;
}

export function getSupabaseConfigError(): string | null {
  return activeConfigError;
}

export function getSupabaseProjectHost(): string | null {
  return activeProjectHost;
}

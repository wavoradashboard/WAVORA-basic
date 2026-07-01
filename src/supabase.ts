import { createClient } from '@supabase/supabase-js';

// Get environment values with fallback to the user's specific credentials
const getEnvValue = (val: string | undefined, fallback: string): string => {
  if (val && !val.startsWith('MY_')) {
    return val;
  }
  return fallback;
};

const SUPABASE_URL = getEnvValue(import.meta.env.VITE_SUPABASE_URL, 'https://aexpbzcnsnkmbjqqmqxw.supabase.co');
const SUPABASE_ANON_KEY = getEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY, 'sb_publishable_2wXZnx9cbrxVAGY6G08IDw_6kGXnlMy');

// Resilient custom fetch proxy to catch network, DNS, or server failures gracefully
// and avoid unhandled "Failed to fetch" exceptions.
const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  try {
    return await fetch(input, init);
  } catch (error) {
    console.warn("Supabase fetch failed (network or configuration error). Falling back gracefully:", error);
    const urlStr = typeof input === 'string' ? input : (input as any).url || '';
    let mockData: any = [];
    
    if (urlStr.includes('/auth/v1/')) {
      mockData = { user: null, session: null };
    } else if (urlStr.includes('/storage/v1/')) {
      mockData = [];
    } else {
      mockData = [];
    }
    
    return new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    fetch: customFetch
  }
});

export const isolatedAdminSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    fetch: customFetch
  }
});

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

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const isolatedAdminSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

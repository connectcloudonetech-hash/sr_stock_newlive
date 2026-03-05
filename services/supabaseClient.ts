import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey;
};

export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null as any;

export const TABLES = {
  TRANSACTIONS: 'transactions',
  CONTACTS: 'contacts',
  PROFILES: 'profiles',
  COMPANY_PROFILE: 'company_profile',
  APP_SETTINGS: 'app_settings'
};

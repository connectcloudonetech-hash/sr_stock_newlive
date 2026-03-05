import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  URL: 'sr_supabase_url',
  KEY: 'sr_supabase_key'
};

export const getSupabaseCredentials = () => {
  const DEFAULT_URL = 'https://rarkvvedhflyodpzczrze.supabase.co';
  const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcmt2dmVkaGZseW9kcHpjcnplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzQyMzIsImV4cCI6MjA4ODMxMDIzMn0.ZJAuSiDNCAgDzF9Wmdn7J63kZG5bVO0R1y8RRTeoNr0';
  
  const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem(STORAGE_KEYS.URL) || DEFAULT_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem(STORAGE_KEYS.KEY) || DEFAULT_KEY;
  return { url, key };
};

export const isSupabaseConfigured = () => {
  const { url, key } = getSupabaseCredentials();
  return !!url && !!key && url.startsWith('http');
};

const createSupabaseClient = () => {
  if (isSupabaseConfigured()) {
    const { url, key } = getSupabaseCredentials();
    try {
      return createClient(url, key);
    } catch (e) {
      console.error('Failed to create Supabase client:', e);
      return null;
    }
  }
  return null;
};

export let supabase = createSupabaseClient();

export const updateSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem(STORAGE_KEYS.URL, url);
  localStorage.setItem(STORAGE_KEYS.KEY, key);
  supabase = createClient(url, key);
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem(STORAGE_KEYS.URL);
  localStorage.removeItem(STORAGE_KEYS.KEY);
  supabase = null;
};

export const TABLES = {
  TRANSACTIONS: 'transactions',
  CONTACTS: 'contacts',
  PROFILES: 'profiles',
  COMPANY_PROFILE: 'company_profile',
  APP_SETTINGS: 'app_settings'
};

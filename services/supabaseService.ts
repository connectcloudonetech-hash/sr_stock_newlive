import { supabase, TABLES } from './supabaseClient';
import { Transaction, Contact, CompanyProfile, AppSettings, User } from '../types';

export const supabaseService = {
  // Transactions
  async getTransactions() {
    if (!supabase) return [];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false });
    
    if (error) throw error;
    return data as Transaction[];
  },

  async saveTransaction(transaction: Transaction) {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .upsert({
        id: transaction.id,
        user_id: user.id,
        name: transaction.name,
        particular: transaction.particular,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        transaction_date: transaction.date
      });
    
    if (error) throw error;
  },

  async deleteTransaction(id: string) {
    if (!supabase) return;
    const { error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Contacts
  async getContacts() {
    if (!supabase) return [];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from(TABLES.CONTACTS)
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as Contact[];
  },

  async saveContact(contact: Contact) {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from(TABLES.CONTACTS)
      .upsert({
        id: contact.id,
        user_id: user.id,
        name: contact.name,
        type: contact.type,
        phone: contact.phone,
        email: contact.email,
        address: contact.address
      });
    
    if (error) throw error;
  },

  async deleteContact(id: string) {
    if (!supabase) return;
    const { error } = await supabase
      .from(TABLES.CONTACTS)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Company Profile
  async getCompanyProfile() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from(TABLES.COMPANY_PROFILE)
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data as CompanyProfile | null;
  },

  async saveCompanyProfile(profile: CompanyProfile) {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from(TABLES.COMPANY_PROFILE)
      .upsert({
        user_id: user.id,
        name: profile.name,
        address: profile.address,
        phone: profile.phone,
        email: profile.email,
        tax_id: profile.taxId,
        logo_url: profile.logoUrl
      });
    
    if (error) throw error;
  },

  // App Settings
  async getAppSettings() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from(TABLES.APP_SETTINGS)
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as any | null;
  },

  async saveAppSettings(settings: AppSettings, currencyCode: string) {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from(TABLES.APP_SETTINGS)
      .upsert({
        user_id: user.id,
        appearance: settings.appearance,
        app_lock_pin: settings.appLockPin,
        is_fingerprint_enabled: settings.isFingerprintEnabled,
        currency_code: currencyCode
      });
    
    if (error) throw error;
  }
};

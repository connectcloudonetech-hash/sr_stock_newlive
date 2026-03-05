import { supabase, TABLES } from './supabaseClient';
import { Transaction, Contact, CompanyProfile, AppSettings, User } from '../types';

export const supabaseService = {
  // Transactions
  async getTransactions() {
    const { data, error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .select('*')
      .order('transaction_date', { ascending: false });
    
    if (error) throw error;
    return data as Transaction[];
  },

  async saveTransaction(transaction: Transaction) {
    const { error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .upsert({
        id: transaction.id,
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
    const { error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Contacts
  async getContacts() {
    const { data, error } = await supabase
      .from(TABLES.CONTACTS)
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as Contact[];
  },

  async saveContact(contact: Contact) {
    const { error } = await supabase
      .from(TABLES.CONTACTS)
      .upsert({
        id: contact.id,
        name: contact.name,
        type: contact.type,
        phone: contact.phone,
        email: contact.email,
        address: contact.address
      });
    
    if (error) throw error;
  },

  async deleteContact(id: string) {
    const { error } = await supabase
      .from(TABLES.CONTACTS)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Company Profile
  async getCompanyProfile() {
    const { data, error } = await supabase
      .from(TABLES.COMPANY_PROFILE)
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data as CompanyProfile | null;
  },

  async saveCompanyProfile(profile: CompanyProfile) {
    const { error } = await supabase
      .from(TABLES.COMPANY_PROFILE)
      .upsert({
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
    const { data, error } = await supabase
      .from(TABLES.APP_SETTINGS)
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as any | null;
  },

  async saveAppSettings(settings: AppSettings, currencyCode: string) {
    const { error } = await supabase
      .from(TABLES.APP_SETTINGS)
      .upsert({
        appearance: settings.appearance,
        app_lock_pin: settings.appLockPin,
        is_fingerprint_enabled: settings.isFingerprintEnabled,
        currency_code: currencyCode
      });
    
    if (error) throw error;
  }
};

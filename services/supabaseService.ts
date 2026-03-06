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
    return (data as any[]).map(t => ({
      id: t.id,
      name: t.name,
      particular: t.particular,
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category,
      date: t.transaction_date
    })) as Transaction[];
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

  async saveTransactions(transactions: Transaction[]) {
    if (!supabase || transactions.length === 0) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from(TABLES.TRANSACTIONS)
      .upsert(transactions.map(t => ({
        id: t.id,
        user_id: user.id,
        name: t.name,
        particular: t.particular,
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category,
        transaction_date: t.date
      })));
    
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

    console.log('Fetching company profile for user:', user.id);
    const { data, error } = await supabase
      .from(TABLES.COMPANY_PROFILE)
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching company profile:', error);
      throw error;
    }
    if (!data) {
      console.log('No company profile found in cloud');
      return null;
    }
    
    return {
      name: data.name,
      address: data.address,
      phone: data.phone,
      email: data.email,
      taxId: data.tax_id,
      logoUrl: data.logo_url,
      logoBase64: data.logo_base64
    } as CompanyProfile;
  },

  async saveCompanyProfile(profile: CompanyProfile) {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    console.log('Saving company profile to cloud...', profile.name);
    const { error } = await supabase
      .from(TABLES.COMPANY_PROFILE)
      .upsert({
        user_id: user.id,
        name: profile.name,
        address: profile.address,
        phone: profile.phone,
        email: profile.email,
        tax_id: profile.taxId,
        logo_url: profile.logoUrl,
        logo_base64: profile.logoBase64
      });
    
    if (error) {
      console.error('Error saving company profile:', error);
      throw error;
    }
    console.log('Company profile saved successfully');
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
  },

  // Team Members
  async getTeamMembers() {
    if (!supabase) return [];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    console.log('Fetching team members for user:', user.id);
    const { data, error } = await supabase
      .from(TABLES.TEAM_MEMBERS)
      .select('*')
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
    return (data as any[]).map(m => ({
      id: m.id,
      username: m.username,
      password: m.password,
      role: m.role,
      name: m.name
    })) as User[];
  },

  async saveTeamMember(member: User) {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    console.log('Saving team member to cloud:', member.username);
    const { error } = await supabase
      .from(TABLES.TEAM_MEMBERS)
      .upsert({
        id: member.id,
        user_id: user.id,
        username: member.username,
        password: member.password,
        role: member.role,
        name: member.name
      });
    
    if (error) {
      console.error('Error saving team member:', error);
      throw error;
    }
    console.log('Team member saved successfully');
  },

  async deleteTeamMember(id: string) {
    if (!supabase) return;
    const { error } = await supabase
      .from(TABLES.TEAM_MEMBERS)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

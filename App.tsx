import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import StatCard from './components/StatCard';
import TransactionForm from './components/TransactionForm';
import ConfirmModal from './components/ConfirmModal';
import ExportModal from './components/ExportModal';
import LoginPage from './components/LoginPage';
import AdminPage from './components/AdminPage';
import ReportPage from './components/ReportPage';
import ContactsPage from './components/ContactsPage';
import SettingsPage from './components/SettingsPage';
import ProfilePage from './components/ProfilePage';
import LockScreen from './components/LockScreen';
import TransactionFilters, { FilterState } from './components/TransactionFilters';
import { Transaction, TransactionType, DashboardStats, User, UserRole, Contact, Currency, CompanyProfile, AppSettings } from './types';
import { INITIAL_USERS, DEFAULT_CURRENCY, CURRENCIES, NAMES, PARTICULARS, MOCK_TRANSACTIONS, MOCK_CONTACTS, LOGO_URL, DEFAULT_COMPANY_PROFILE } from './constants';
import { History, Download, SearchX, Plus, ChevronRight, Inbox, Filter, ShieldCheck, Users, Cloud, CloudOff, AlertCircle, RefreshCw } from 'lucide-react';
import { supabaseService } from './services/supabaseService';
import { isSupabaseConfigured, supabase, updateSupabaseConfig, clearSupabaseConfig } from './services/supabaseClient';

const LOCAL_STORAGE_KEY = 'sr_fintrack_local_data';
const CONTACTS_STORAGE_KEY = 'sr_fintrack_contacts_data';
const USER_STORAGE_KEY = 'sr_fintrack_current_user';
const CURRENCY_STORAGE_KEY = 'sr_fintrack_currency';
const COMPANY_PROFILE_STORAGE_KEY = 'sr_fintrack_company_profile';
const SETTINGS_STORAGE_KEY = 'sr_fintrack_app_settings';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [view, setView] = useState<'dashboard' | 'statement' | 'reports' | 'contacts' | 'settings' | 'profile'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    appearance: 'light',
    appLockPin: null,
    isFingerprintEnabled: false
  });
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [initialType, setInitialType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [cloudConfig, setCloudConfig] = useState({ url: '', key: '' });
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'offline' | 'error'>('offline');

  const [availableNames] = useState<string[]>(NAMES);
  const [availableParticulars] = useState<string[]>(PARTICULARS);

  const dynamicNames = useMemo(() => {
    const contactNames = contacts.map(c => c.name);
    const transactionNames = Array.from(new Set(transactions.map(t => t.name)));
    return Array.from(new Set([...NAMES, ...contactNames, ...transactionNames])).sort();
  }, [contacts, transactions]);

  const [filters, setFilters] = useState<FilterState>({
    period: 'All',
    startDate: '',
    endDate: '',
    category: 'All',
    type: 'All',
    name: 'All',
    search: ''
  });

  // Load user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }

    // Load local data first
    const savedTransactions = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions));
      } catch (e) {
        console.error('Failed to parse local transactions:', e);
      }
    }

    const savedContacts = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (savedContacts) {
      try {
        setContacts(JSON.parse(savedContacts));
      } catch (e) {
        console.error('Failed to parse local contacts:', e);
      }
    }

    // Supabase Auth Listener
    if (isSupabaseConfigured() && supabase?.auth) {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            setCloudStatus('connected');
            console.log('Supabase session active:', session.user.email);
          } else {
            setCloudStatus('offline');
          }
        });
        return () => subscription?.unsubscribe();
      } catch (e) {
        console.error('Supabase auth listener error:', e);
        setCloudStatus('error');
      }
    } else {
      setCloudStatus('offline');
    }
  }, []);

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      if (isSupabaseConfigured()) {
        try {
          const { data: { user } } = await supabase!.auth.getUser();
          if (user) {
            setCloudStatus('connected');
            const [cloudTransactions, cloudContacts, cloudProfile, cloudSettings, cloudTeam] = await Promise.all([
              supabaseService.getTransactions(),
              supabaseService.getContacts(),
              supabaseService.getCompanyProfile(),
              supabaseService.getAppSettings(),
              supabaseService.getTeamMembers()
            ]);

            if (cloudTransactions && cloudTransactions.length > 0) {
              setTransactions(cloudTransactions);
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudTransactions));
            }
            if (cloudContacts && cloudContacts.length > 0) {
              setContacts(cloudContacts);
              localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(cloudContacts));
            }
            if (cloudTeam && cloudTeam.length > 0) {
              setAllUsers(cloudTeam);
              localStorage.setItem('sr_fintrack_all_users', JSON.stringify(cloudTeam));
            }
            if (cloudProfile) setCompanyProfile(cloudProfile);
            if (cloudSettings) {
              setAppSettings({
                appearance: cloudSettings.appearance,
                appLockPin: cloudSettings.app_lock_pin,
                isFingerprintEnabled: cloudSettings.is_fingerprint_enabled
              });
              if (cloudSettings.app_lock_pin) setIsLocked(true);
              const foundCurrency = CURRENCIES.find(c => c.code === cloudSettings.currency_code);
              if (foundCurrency) setCurrency(foundCurrency);
            }
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error loading from Supabase:', error);
          setCloudStatus('error');
        }
      }

      // Fallback to local storage or mock data if not logged in
      const savedTransactions = localStorage.getItem(LOCAL_STORAGE_KEY);
      const savedContacts = localStorage.getItem(CONTACTS_STORAGE_KEY);

      if (!savedTransactions) setTransactions(MOCK_TRANSACTIONS);
      if (!savedContacts) setContacts(MOCK_CONTACTS);
      
      setCurrency(DEFAULT_CURRENCY);
      setCompanyProfile(DEFAULT_COMPANY_PROFILE);
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Persist to local storage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
    }
  }, [contacts, isLoading]);

  // Sync data to Supabase when coming online
  useEffect(() => {
    if (isLoading) return;
    
    if (isSupabaseConfigured() && cloudStatus === 'connected') {
      // Sync all local data to cloud
      if (transactions.length > 0) {
        supabaseService.saveTransactions(transactions).catch(err => {
          console.error('Error syncing transactions to Supabase:', err);
          setCloudStatus('error');
        });
      }
      if (contacts.length > 0) {
        // We could add saveContacts batch too, but let's keep it simple for now or add it later
        contacts.forEach(c => supabaseService.saveContact(c).catch(console.error));
      }
    }
  }, [cloudStatus, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    
    if (isSupabaseConfigured() && cloudStatus === 'connected') {
      supabaseService.saveAppSettings(appSettings, currency.code).catch(console.error);
    }
  }, [currency, appSettings, isLoading, cloudStatus]);

  useEffect(() => {
    if (isLoading) return;
    
    if (isSupabaseConfigured() && cloudStatus === 'connected') {
      supabaseService.saveCompanyProfile(companyProfile).catch(console.error);
    }
  }, [companyProfile, isLoading, cloudStatus]);

  useEffect(() => {
    // Apply appearance
    const root = window.document.documentElement;
    const body = window.document.body;
    
    const applyTheme = (theme: 'light' | 'dark') => {
      if (theme === 'dark') {
        root.classList.add('dark');
        body.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    if (appSettings.appearance === 'dark') {
      applyTheme('dark');
    } else {
      // Default to light
      applyTheme('light');
    }
  }, [appSettings]);

  // Splash screen timeout
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Toast timeout
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleLogin = (username: string, password: string): boolean => {
    const user = allUsers.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      showToast('Welcome back!', 'success');
      return true;
    }
    showToast('Invalid credentials', 'error');
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    setView('dashboard');
  };

  const handleUpdatePassword = (newPassword: string) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, password: newPassword };
    setCurrentUser(updatedUser);
    
    const updatedAllUsers = allUsers.map(u => u.id === currentUser.id ? updatedUser : u);
    setAllUsers(updatedAllUsers);
    
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    localStorage.setItem('sr_fintrack_all_users', JSON.stringify(updatedAllUsers));

    if (isSupabaseConfigured() && cloudStatus === 'connected') {
      supabaseService.saveTeamMember(updatedUser).catch(console.error);
    }
    
    showToast('Password updated successfully');
  };

  const handleManualSync = async () => {
    if (!isSupabaseConfigured()) {
      setShowCloudModal(true);
      return;
    }

    setIsCloudSyncing(true);
    try {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) {
        showToast('Please sign in to cloud first', 'error');
        setView('settings');
        return;
      }

      showToast('Syncing with cloud...', 'success');
      
      // Sync all data
      await Promise.all([
        ...transactions.map(t => supabaseService.saveTransaction(t)),
        ...contacts.map(c => supabaseService.saveContact(c)),
        supabaseService.saveCompanyProfile(companyProfile),
        supabaseService.saveAppSettings(appSettings, currency.code)
      ]);

      showToast('Cloud sync complete');
      setCloudStatus('connected');
    } catch (err) {
      console.error('Manual sync error:', err);
      showToast('Sync failed. Check connection.', 'error');
      setCloudStatus('error');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleSaveCloudConfig = () => {
    if (cloudConfig.url && cloudConfig.key) {
      updateSupabaseConfig(cloudConfig.url, cloudConfig.key);
      setShowCloudModal(false);
      showToast('Cloud configuration updated');
      window.location.reload();
    } else {
      showToast('Please enter both URL and Key', 'error');
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = filters.type === 'All' || t.type === filters.type;
      const matchesCategory = filters.category === 'All' || t.particular === filters.category;
      const matchesName = filters.name === 'All' || t.name === filters.name;
      const matchesStart = !filters.startDate || t.date >= filters.startDate;
      const matchesEnd = !filters.endDate || t.date <= filters.endDate;
      
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        t.name.toLowerCase().includes(searchLower) || 
        t.particular.toLowerCase().includes(searchLower) || 
        (t.description && t.description.toLowerCase().includes(searchLower));

      return matchesType && matchesCategory && matchesName && matchesStart && matchesEnd && matchesSearch;
    });
  }, [transactions, filters]);

  const stats: DashboardStats = useMemo(() => {
    const totalIn = filteredTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalOut = filteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyMap: Record<string, { income: number, expense: number }> = {};
    transactions.forEach(t => {
      const monthYear = t.date.substring(0, 7);
      if (!monthlyMap[monthYear]) monthlyMap[monthYear] = { income: 0, expense: 0 };
      if (t.type === TransactionType.INCOME) monthlyMap[monthYear].income += t.amount;
      else monthlyMap[monthYear].expense += t.amount;
    });

    const monthlyData = Object.entries(monthlyMap)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { totalIn, totalOut, balance: totalIn - totalOut, monthlyData };
  }, [filteredTransactions, transactions]);

  const handleAddTransaction = (newT: Omit<Transaction, 'id'>) => {
    const localT = { 
      ...newT, 
      id: crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }) 
    } as Transaction;

    const updatedTransactions = [localT, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTransactions));

    if (isSupabaseConfigured() && cloudStatus === 'connected') {
      supabaseService.saveTransaction(localT).catch(err => {
        console.error('Failed to save to Supabase:', err);
        showToast('Saved locally, sync failed', 'error');
      });
    }

    setShowAddForm(false);
    showToast('Transaction added successfully');
  };

  const handleUpdateTransaction = (updatedT: Transaction) => {
    const updatedTransactions = transactions.map(t => t.id === updatedT.id ? updatedT : t);
    setTransactions(updatedTransactions);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTransactions));

    if (isSupabaseConfigured() && cloudStatus === 'connected') {
      supabaseService.saveTransaction(updatedT).catch(err => {
        console.error('Failed to update in Supabase:', err);
        showToast('Updated locally, sync failed', 'error');
      });
    }

    setEditingTransaction(null);
    setShowAddForm(false);
    showToast('Transaction updated');
  };

  const handleDeleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTransactions));
    
    if (isSupabaseConfigured() && cloudStatus === 'connected') {
      supabaseService.deleteTransaction(id).catch(console.error);
    }
    setDeleteConfirmId(null);
    setShowAddForm(false);
    showToast('Transaction deleted', 'error');
  };

  const handleEditRequest = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setFilters({ period: 'All', startDate: '', endDate: '', category: 'All', type: 'All', name: 'All', search: '' });
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[1000] flex flex-col items-center justify-center animate-fade-in">
        <div className="w-24 h-24 bg-[#E31E24] rounded-3xl flex items-center justify-center animate-scale-in">
          <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain brightness-0 invert" referrerPolicy="no-referrer" />
        </div>
        <div className="mt-8 text-center">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{companyProfile.name}</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-1">Pro Edition</p>
        </div>
        <div className="absolute bottom-12 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-[#E31E24] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-1.5 h-1.5 bg-[#E31E24] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1.5 h-1.5 bg-[#E31E24] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  if (isLocked && appSettings.appLockPin) {
    return (
      <LockScreen 
        pin={appSettings.appLockPin} 
        isFingerprintEnabled={appSettings.isFingerprintEnabled} 
        onUnlock={() => setIsLocked(false)} 
      />
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar 
        onNavChange={setView as any} 
        activeView={view} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        companyName={companyProfile.name}
        cloudStatus={cloudStatus}
        onCloudClick={() => setShowCloudModal(true)}
      />

      <main className="flex-1 overflow-y-auto px-4 pt-20 pb-32 no-scrollbar">
        {/* Connectivity Banner */}
        {!isSupabaseConfigured() && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600">
                <CloudOff size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-amber-900 dark:text-amber-400 uppercase tracking-tight">Offline Mode Active</p>
                <p className="text-[10px] font-bold text-amber-600/70 dark:text-amber-400/50 uppercase tracking-widest">Data saved locally only</p>
              </div>
            </div>
            <button 
              onClick={() => setShowCloudModal(true)}
              className="px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-amber-200 dark:shadow-none"
            >
              Connect Cloud
            </button>
          </div>
        )}

        {isSupabaseConfigured() && cloudStatus !== 'connected' && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-2xl flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600">
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-rose-900 dark:text-rose-400 uppercase tracking-tight">Cloud Session Expired</p>
                <p className="text-[10px] font-bold text-rose-600/70 dark:text-rose-400/50 uppercase tracking-widest">Sign in to sync data</p>
              </div>
            </div>
            <button 
              onClick={() => setView('settings')}
              className="px-4 py-2 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-rose-200 dark:shadow-none"
            >
              Sign In
            </button>
          </div>
        )}

        {view === 'dashboard' && (
          <div className="space-y-6 animate-slide-up">
            <header className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Overview</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Financial Summary</p>
              </div>
              <div className="flex items-center gap-2">
                {isSupabaseConfigured() && (
                  <button 
                    onClick={handleManualSync}
                    disabled={isCloudSyncing}
                    className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                      isCloudSyncing 
                        ? 'bg-slate-100 text-slate-400 border-slate-200 animate-pulse' 
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 active:scale-95'
                    }`}
                    title="Sync with Cloud"
                  >
                    <RefreshCw size={16} className={isCloudSyncing ? 'animate-spin' : ''} />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Sync</span>
                  </button>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                  <ShieldCheck size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Secure</span>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
              <StatCard title="Total Cash In" amount={stats.totalIn} type="income" currencySymbol={currency.symbol} />
              <div className="grid grid-cols-2 gap-4">
                <StatCard title="Total Out" amount={stats.totalOut} type="expense" currencySymbol={currency.symbol} />
                <StatCard title="Net Balance" amount={stats.balance} type="total" currencySymbol={currency.symbol} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Filter size={16} className="text-[#E31E24]" />
                  Quick Filters
                </h2>
                <button onClick={resetFilters} className="text-[10px] font-bold text-[#E31E24] uppercase tracking-widest">Reset</button>
              </div>
              <TransactionFilters 
                filters={filters} 
                onFilterChange={setFilters} 
                onReset={resetFilters} 
                names={dynamicNames} 
                particulars={availableParticulars} 
                hideSearch={true}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <History size={20} className="text-[#E31E24]" />
                Recent Entries
              </h2>
              <button onClick={() => setView('statement')} className="text-[#E31E24] font-bold text-xs flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shimmer" />)
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.slice(0, 5).map((t) => (
                  <div key={t.id} onClick={() => handleEditRequest(t)} className="mobile-card dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${t.type === TransactionType.INCOME ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'}`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{t.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.particular} • {t.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-base ${t.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                        {currency.symbol}{t.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-dashed border-slate-200 dark:border-slate-800">
                  <Inbox size={32} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No entries found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'statement' && (
          <div className="space-y-6 animate-slide-up">
            <header className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">History</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Transaction Ledger</p>
              </div>
              <button onClick={() => setIsExportModalOpen(true)} disabled={transactions.length === 0} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white shadow-sm disabled:opacity-30">
                <Download size={20} />
              </button>
            </header>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <TransactionFilters 
                filters={filters} 
                onFilterChange={setFilters} 
                onReset={resetFilters} 
                names={dynamicNames} 
                particulars={availableParticulars} 
                hideSearch={false}
              />
            </div>

            <div className="space-y-3">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <div key={t.id} onClick={() => handleEditRequest(t)} className="mobile-card dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${t.type === TransactionType.INCOME ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'}`}>
                        {t.particular.charAt(0) || 'T'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{t.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.particular} • {t.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-base ${t.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                        {currency.symbol}{t.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <SearchX size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No matching records</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'reports' && (
          <div className="animate-slide-up">
            <ReportPage 
              transactions={transactions} 
              onExport={() => setIsExportModalOpen(true)}
              currencySymbol={currency.symbol}
              companyName={companyProfile.name}
            />
          </div>
        )}

        {view === 'contacts' && (
          <div className="animate-slide-up">
            <ContactsPage 
              contacts={contacts}
              onAddContact={(c) => { 
                const newId = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
                  const r = Math.random() * 16 | 0;
                  const v = ch === 'x' ? r : (r & 0x3 | 0x8);
                  return v.toString(16);
                });
                const newContact = { ...c, id: newId };
                const updatedContacts = [...contacts, newContact];
                setContacts(updatedContacts); 
                localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));

                if (isSupabaseConfigured() && cloudStatus === 'connected') {
                  supabaseService.saveContact(newContact).catch(console.error);
                }
                showToast('Contact added'); 
              }}
              onUpdateContact={(updated) => { 
                const updatedContacts = contacts.map(c => c.id === updated.id ? updated : c);
                setContacts(updatedContacts); 
                localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));

                if (isSupabaseConfigured() && cloudStatus === 'connected') {
                  supabaseService.saveContact(updated).catch(console.error);
                }
                showToast('Contact updated'); 
              }}
              onRemoveContact={(id) => { 
                const updatedContacts = contacts.filter(c => c.id !== id);
                setContacts(updatedContacts); 
                localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));
                
                if (isSupabaseConfigured() && cloudStatus === 'connected') {
                  supabaseService.deleteContact(id).catch(console.error);
                }
                showToast('Contact removed', 'error'); 
              }}
            />
          </div>
        )}

        {view === 'settings' && currentUser?.role === UserRole.ADMIN && (
          <div className="animate-slide-up">
            <SettingsPage 
              currentUser={currentUser!}
              users={allUsers}
              currency={currency}
              onCurrencyChange={(c) => { setCurrency(c); showToast(`Currency set to ${c.code}`); }}
              companyProfile={companyProfile}
              onUpdateCompany={(p) => { setCompanyProfile(p); showToast('Company profile updated'); }}
              appSettings={appSettings}
              onUpdateSettings={(s) => { setAppSettings(s); showToast('Settings updated'); }}
              onAddUser={(u) => { 
                const newId = Math.random().toString(36).substr(2, 9);
                const newUser = { ...u, id: newId };
                const updatedUsers = [...allUsers, newUser];
                setAllUsers(updatedUsers); 
                localStorage.setItem('sr_fintrack_all_users', JSON.stringify(updatedUsers));

                if (isSupabaseConfigured() && cloudStatus === 'connected') {
                  supabaseService.saveTeamMember(newUser).catch(console.error);
                }
                showToast('User added'); 
              }} 
              onRemoveUser={(id) => { 
                const updatedUsers = allUsers.filter(u => u.id !== id);
                setAllUsers(updatedUsers); 
                localStorage.setItem('sr_fintrack_all_users', JSON.stringify(updatedUsers));

                if (isSupabaseConfigured() && cloudStatus === 'connected') {
                  supabaseService.deleteTeamMember(id).catch(console.error);
                }
                showToast('User removed', 'error'); 
              }} 
              onLogout={handleLogout}
              onBackup={() => {
                const data = {
                  transactions,
                  contacts,
                  allUsers,
                  currency,
                  companyProfile,
                  appSettings,
                  timestamp: new Date().toISOString()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `SR_Accounts_Backup_${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                showToast('Backup downloaded');
              }}
              onRestore={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e: any) => {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onload = (re) => {
                    try {
                      const data = JSON.parse(re.target?.result as string);
                      if (data.transactions) setTransactions(data.transactions);
                      if (data.contacts) setContacts(data.contacts);
                      if (data.allUsers) setAllUsers(data.allUsers);
                      if (data.currency) setCurrency(data.currency);
                      if (data.companyProfile) setCompanyProfile(data.companyProfile);
                      if (data.appSettings) setAppSettings(data.appSettings);
                      showToast('Data restored successfully');
                    } catch (err) {
                      showToast('Invalid backup file', 'error');
                    }
                  };
                  reader.readAsText(file);
                };
                input.click();
              }}
              onDeleteAllData={() => {
                setDeleteConfirmId('all_data');
              }}
            />
          </div>
        )}
        {view === 'profile' && (
          <div className="animate-slide-up">
            <ProfilePage 
              currentUser={currentUser!}
              onUpdatePassword={handleUpdatePassword}
            />
          </div>
        )}
      </main>

      {/* FAB */}
      <div className="fixed bottom-24 right-6 z-[200] flex flex-col items-center gap-3">
        {isFabOpen && (
          <div className="flex flex-col gap-3 animate-slide-up">
            <div className="flex items-center gap-3">
              <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg">Income</span>
              <button 
                onClick={() => { setEditingTransaction(null); setInitialType(TransactionType.INCOME); setShowAddForm(true); setIsFabOpen(false); }}
                className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all"
              >
                <Plus size={24} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg">Expense</span>
              <button 
                onClick={() => { setEditingTransaction(null); setInitialType(TransactionType.EXPENSE); setShowAddForm(true); setIsFabOpen(false); }}
                className="w-14 h-14 bg-rose-600 text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
          </div>
        )}
        <button 
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-16 h-16 bg-[#E31E24] text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all ${isFabOpen ? 'rotate-45 bg-slate-900' : ''}`}
        >
          <Plus size={32} />
        </button>
      </div>

      {/* Modals */}
      {showCloudModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowCloudModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-scale-in">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Cloud className="text-[#E31E24]" size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center tracking-tight mb-2">Cloud Configuration</h2>
            <p className="text-slate-400 text-xs font-bold text-center uppercase tracking-widest mb-8">Supabase Integration</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Project URL</label>
                <input 
                  type="text" 
                  value={cloudConfig.url}
                  onChange={(e) => setCloudConfig({ ...cloudConfig, url: e.target.value })}
                  placeholder="https://your-project.supabase.co"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#E31E24] transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">Anon Key</label>
                <input 
                  type="password" 
                  value={cloudConfig.key}
                  onChange={(e) => setCloudConfig({ ...cloudConfig, key: e.target.value })}
                  placeholder="your-anon-key"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#E31E24] transition-all"
                />
              </div>
              
              <div className="pt-4 flex flex-col gap-3">
                <button 
                  onClick={handleSaveCloudConfig}
                  className="w-full py-4 bg-[#E31E24] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-100 dark:shadow-none active:scale-95 transition-all"
                >
                  Save & Connect
                </button>
                {isSupabaseConfigured() && (
                  <button 
                    onClick={() => { clearSupabaseConfig(); setShowCloudModal(false); window.location.reload(); }}
                    className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all"
                  >
                    Clear Config
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-[500] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setShowAddForm(false); setEditingTransaction(null); }} />
          <div className="relative bg-white w-full rounded-t-[2.5rem] p-6 pb-12 shadow-2xl animate-slide-up max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
            <TransactionForm 
              onAdd={handleAddTransaction} 
              onUpdate={handleUpdateTransaction} 
              onDelete={(id) => setDeleteConfirmId(id)}
              editingTransaction={editingTransaction}
              onCancelEdit={() => { setShowAddForm(false); setEditingTransaction(null); }}
              availableNames={dynamicNames}
              availableParticulars={availableParticulars}
              initialType={initialType}
              currencySymbol={currency.symbol}
            />
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-up ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-sm font-bold tracking-tight">{toast.message}</span>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!deleteConfirmId} 
        onClose={() => setDeleteConfirmId(null)} 
        onConfirm={() => {
          if (deleteConfirmId === 'all_data') {
            setTransactions([]);
            setContacts([]);
            showToast('All data cleared', 'error');
            setDeleteConfirmId(null);
          } else if (deleteConfirmId) {
            handleDeleteTransaction(deleteConfirmId);
          }
        }} 
        title={deleteConfirmId === 'all_data' ? "Clear All Data?" : "Delete Entry?"} 
        message={deleteConfirmId === 'all_data' ? "This will permanently remove all transactions and contacts. This action cannot be undone." : "This will permanently remove this record from your ledger."} 
      />

      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        transactions={filteredTransactions} 
        currency={currency}
        companyProfile={companyProfile}
      />
    </div>
  );
};

export default App;
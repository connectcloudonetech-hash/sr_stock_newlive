import React, { useState } from 'react';
import { 
  Settings, Building2, UserPlus, Coins, Database, 
  Palette, Lock, LifeBuoy, ChevronRight, Download, 
  Trash2, Sun, Moon, Monitor, Fingerprint, Grid3X3,
  ArrowLeft, Save, Shield, LogOut, Mail, Phone, Globe,
  Cloud, CloudOff
} from 'lucide-react';
import { User, UserRole, Currency, CompanyProfile, AppSettings } from '../types';
import AdminPage from './AdminPage';
import { CURRENCIES } from '../constants';
import { Camera, X as XIcon } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface SettingsPageProps {
  currentUser: User;
  users: User[];
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  companyProfile: CompanyProfile;
  onUpdateCompany: (profile: CompanyProfile) => void;
  appSettings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onBackup?: () => void;
  onRestore?: () => void;
  onDeleteAllData?: () => void;
  onAddUser: (user: Omit<User, 'id'>) => void;
  onRemoveUser: (id: string) => void;
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  currentUser, 
  users,
  currency,
  onCurrencyChange,
  companyProfile,
  onUpdateCompany,
  appSettings,
  onUpdateSettings,
  onBackup, 
  onRestore, 
  onDeleteAllData,
  onAddUser,
  onRemoveUser,
  onLogout
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [tempProfile, setTempProfile] = useState<CompanyProfile>(companyProfile);
  const [pinInput, setPinInput] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);

  const handleProfileSave = () => {
    onUpdateCompany(tempProfile);
    setActiveSection(null);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => {
        setTempProfile({ ...tempProfile, logoBase64: re.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePinSave = () => {
    if (pinInput.length === 4) {
      onUpdateSettings({ ...appSettings, appLockPin: pinInput });
      setIsSettingPin(false);
      setPinInput('');
    }
  };

  const sections = [
    { 
      id: 'profile', 
      title: 'Company Profile', 
      subtitle: 'Edit business details', 
      icon: <Building2 size={20} />,
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      id: 'users', 
      title: 'Add Users', 
      subtitle: 'Manage team access', 
      icon: <UserPlus size={20} />,
      color: 'bg-emerald-50 text-emerald-600',
      adminOnly: true
    },
    { 
      id: 'currency', 
      title: 'Currency', 
      subtitle: `Default: ${currency.code} (${currency.symbol})`, 
      icon: <Coins size={20} />,
      color: 'bg-amber-50 text-amber-600'
    },
    { 
      id: 'data', 
      title: 'Data Control', 
      subtitle: 'Backup & Maintenance', 
      icon: <Database size={20} />,
      color: 'bg-purple-50 text-purple-600'
    },
    { 
      id: 'appearance', 
      title: 'Default Theme', 
      subtitle: appSettings.appearance === 'light' ? 'Light Mode Active' : 'Dark Mode Active', 
      icon: <Palette size={20} />,
      color: 'bg-rose-50 text-rose-600'
    },
    { 
      id: 'security', 
      title: 'Security', 
      subtitle: 'App Lock & Biometrics', 
      icon: <Lock size={20} />,
      color: 'bg-slate-100 text-slate-600'
    },
    { 
      id: 'support', 
      title: 'Support', 
      subtitle: 'Help & Documentation', 
      icon: <LifeBuoy size={20} />,
      color: 'bg-indigo-50 text-indigo-600'
    },
    { 
      id: 'cloud', 
      title: 'Cloud Sync', 
      subtitle: isSupabaseConfigured() ? 'Connected to Supabase' : 'Local Storage Only', 
      icon: isSupabaseConfigured() ? <Cloud size={20} /> : <CloudOff size={20} />,
      color: isSupabaseConfigured() ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
    },
    { 
      id: 'logout', 
      title: 'Logout', 
      subtitle: 'Sign out of your account', 
      icon: <LogOut size={20} />,
      color: 'bg-rose-50 text-rose-600'
    }
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6 animate-slide-up">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                    {tempProfile.logoBase64 ? (
                      <img src={tempProfile.logoBase64} alt="Company Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 size={32} className="text-slate-300 dark:text-slate-700" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#E31E24] text-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer active:scale-90 transition-all">
                    <Camera size={18} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  {tempProfile.logoBase64 && (
                    <button 
                      onClick={() => setTempProfile({...tempProfile, logoBase64: undefined})}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-700 active:scale-90 transition-all"
                    >
                      <XIcon size={14} />
                    </button>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="font-black text-slate-900 dark:text-white">Company Logo</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Upload brand identity</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Company Name</label>
                  <input 
                    type="text" 
                    value={tempProfile.name} 
                    onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 dark:text-white text-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tax ID / GSTIN</label>
                  <input 
                    type="text" 
                    value={tempProfile.taxId} 
                    onChange={(e) => setTempProfile({...tempProfile, taxId: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 dark:text-white text-sm" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Address</label>
                  <textarea 
                    rows={3} 
                    value={tempProfile.address} 
                    onChange={(e) => setTempProfile({...tempProfile, address: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 dark:text-white text-sm resize-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone</label>
                    <input 
                      type="text" 
                      value={tempProfile.phone} 
                      onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 dark:text-white text-sm" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                    <input 
                      type="email" 
                      value={tempProfile.email} 
                      onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 dark:text-white text-sm" 
                    />
                  </div>
                </div>
              </div>
              <button 
                onClick={handleProfileSave}
                className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        );
      case 'data':
        return (
          <div className="space-y-4 animate-slide-up">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white">Backup Database</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Download local data file</p>
                </div>
                <button onClick={onBackup} className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl active:scale-90 transition-all">
                  <Download size={20} />
                </button>
              </div>
              <div className="h-px bg-slate-50 dark:bg-slate-800" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white">Restore Data</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Upload backup file</p>
                </div>
                <button onClick={onRestore} className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl active:scale-90 transition-all">
                  <Database size={20} />
                </button>
              </div>
              <div className="h-px bg-slate-50 dark:bg-slate-800" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-rose-600">Delete All Data</h3>
                  <p className="text-[10px] font-bold text-rose-300 uppercase tracking-widest mt-0.5">Permanent action</p>
                </div>
                <button onClick={onDeleteAllData} className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl active:scale-90 transition-all">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-4 animate-slide-up">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="font-black text-slate-900 dark:text-white mb-1">Application Theme</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Set your preferred default view</p>
              
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'light', label: 'Light Mode', icon: <Sun size={20} />, desc: 'Clean & bright interface' },
                  { id: 'dark', label: 'Dark Mode', icon: <Moon size={20} />, desc: 'Easy on the eyes' }
                ].map((mode) => (
                  <button 
                    key={mode.id}
                    onClick={() => onUpdateSettings({...appSettings, appearance: mode.id as any})}
                    className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${
                      appSettings.appearance === mode.id 
                        ? 'bg-white dark:bg-slate-900 border-[#E31E24] dark:border-[#E31E24] text-slate-900 dark:text-white shadow-xl ring-1 ring-[#E31E24]/20' 
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${appSettings.appearance === mode.id ? 'bg-red-50 dark:bg-red-900/20 text-[#E31E24]' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                        {mode.icon}
                      </div>
                      <div className="text-left">
                        <span className="font-black text-sm uppercase tracking-widest block">{mode.label}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{mode.desc}</span>
                      </div>
                    </div>
                    {appSettings.appearance === mode.id && (
                      <div className="w-6 h-6 bg-[#E31E24] rounded-full flex items-center justify-center text-white shadow-lg animate-scale-in">
                        <Save size={12} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center leading-relaxed">
                  Your selection is saved locally and will be applied automatically every time you open the application.
                </p>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-4 animate-slide-up">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center">
                    <Grid3X3 size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white">4-Digit App Lock</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {appSettings.appLockPin ? 'PIN is active' : 'Require PIN on startup'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (appSettings.appLockPin) {
                      onUpdateSettings({...appSettings, appLockPin: null});
                    } else {
                      setIsSettingPin(true);
                    }
                  }}
                  className={`w-12 h-6 rounded-full transition-all relative ${appSettings.appLockPin ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${appSettings.appLockPin ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {isSettingPin && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-4 animate-in slide-in-from-top-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Enter 4-Digit PIN</label>
                    <input 
                      type="password" 
                      maxLength={4}
                      placeholder="0000"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24] font-black text-slate-900 dark:text-white text-center text-lg tracking-[1em]" 
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setIsSettingPin(false); setPinInput(''); }}
                      className="flex-1 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handlePinSave}
                      disabled={pinInput.length !== 4}
                      className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30"
                    >
                      Set PIN
                    </button>
                  </div>
                </div>
              )}

              <div className="h-px bg-slate-50 dark:bg-slate-800" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center">
                    <Fingerprint size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white">Biometric Unlock</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Fingerprint or Face ID</p>
                  </div>
                </div>
                <button 
                  onClick={() => onUpdateSettings({...appSettings, isFingerprintEnabled: !appSettings.isFingerprintEnabled})}
                  className={`w-12 h-6 rounded-full transition-all relative ${appSettings.isFingerprintEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${appSettings.isFingerprintEnabled ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="animate-slide-up">
            <AdminPage 
              users={users}
              onAddUser={onAddUser}
              onRemoveUser={onRemoveUser}
            />
          </div>
        );
      case 'currency':
        return (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 animate-slide-up">
            {CURRENCIES.map((curr) => (
              <button 
                key={curr.code}
                onClick={() => onCurrencyChange(curr)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                  currency.code === curr.code ? 'bg-slate-50 dark:bg-slate-800 text-[#E31E24]' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex flex-col text-left">
                  <span className="font-black text-sm uppercase tracking-widest">{curr.code} ({curr.symbol})</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{curr.label}</span>
                </div>
                {currency.code === curr.code && <Save size={16} />}
              </button>
            ))}
          </div>
        );
      case 'support':
        return (
          <div className="space-y-4 animate-slide-up">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                  <LifeBuoy size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white">Help Center</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Guides & Tutorials</p>
                </div>
              </div>
              
              <div className="h-px bg-slate-50 dark:bg-slate-800" />
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Cloud One Technologies</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Official Support Partner</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 pl-2">
                  <a href="mailto:info@cloudonetechuae.com" className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-active:scale-90 transition-all">
                      <Mail size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">info@cloudonetechuae.com</span>
                    </div>
                  </a>

                  <a href="tel:+971555791309" className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-active:scale-90 transition-all">
                      <Phone size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer Care</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">+971 555 791 309</span>
                    </div>
                  </a>

                  <a href="https://cloudonetechuae.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-active:scale-90 transition-all">
                      <Globe size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Website</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">cloudonetechuae.com</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            
            <div className="text-center py-6">
              <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">{companyProfile.name} v2.4.0</p>
              <p className="text-[9px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest mt-1">© 2026 {companyProfile.name}</p>
            </div>
          </div>
        );
      case 'cloud':
        return (
          <div className="space-y-4 animate-slide-up">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto ${isSupabaseConfigured() ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                {isSupabaseConfigured() ? <Cloud size={40} /> : <CloudOff size={40} />}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isSupabaseConfigured() ? 'Cloud Sync Active' : 'Cloud Sync Inactive'}
                </h3>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">
                  {isSupabaseConfigured() 
                    ? 'Your data is being synced to Supabase' 
                    : 'Using local storage only'}
                </p>
              </div>
              
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-left space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connection Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Status</span>
                    <span className={`text-[11px] font-black uppercase ${isSupabaseConfigured() ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isSupabaseConfigured() ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Database</span>
                    <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase">Supabase (PostgreSQL)</span>
                  </div>
                </div>
              </div>

              {!isSupabaseConfigured() && (
                <div className="text-left p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl">
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
                    To enable cloud sync, please set the <code className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> environment variables in your project settings.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      case 'logout':
        return (
          <div className="animate-slide-up">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center space-y-6">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
                <LogOut size={40} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Sign Out?</h3>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Are you sure you want to logout?</p>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={onLogout}
                  className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-rose-100 dark:shadow-none active:scale-95 transition-all"
                >
                  Confirm Logout
                </button>
                <button 
                  onClick={() => setActiveSection(null)}
                  className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {activeSection && (
            <button 
              onClick={() => setActiveSection(null)}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white shadow-sm active:scale-90 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeSection ? sections.find(s => s.id === activeSection)?.title : 'Settings'}
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              {activeSection ? 'Configure your preferences' : 'App Configuration'}
            </p>
          </div>
        </div>
        {!activeSection && (
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 shadow-sm">
            <Settings size={20} />
          </div>
        )}
      </header>

      {activeSection ? (
        renderSectionContent()
      ) : (
        <div className="space-y-3">
          {sections.map((section) => {
            if (section.adminOnly && currentUser.role !== UserRole.ADMIN) return null;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="w-full bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${section.color} dark:bg-opacity-10 rounded-2xl flex items-center justify-center group-active:scale-90 transition-transform`}>
                    {section.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-tight">{section.title}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{section.subtitle}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

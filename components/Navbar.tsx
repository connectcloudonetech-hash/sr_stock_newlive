import React from 'react';
import { Wallet, FileText, Shield, LogOut, BarChart3, Users, Settings, UserCircle, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { User, UserRole } from '../types';
import { LOGO_URL } from '../constants';

interface NavbarProps {
  onNavChange: (view: 'dashboard' | 'statement' | 'reports' | 'contacts' | 'settings' | 'profile') => void;
  activeView: string;
  currentUser: User;
  onLogout: () => void;
  companyName: string;
  cloudStatus?: 'connected' | 'offline' | 'error';
  onCloudClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onNavChange, 
  activeView, 
  currentUser, 
  onLogout, 
  companyName,
  cloudStatus = 'offline',
  onCloudClick
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: <Wallet size={22} /> },
    { id: 'statement', label: 'History', icon: <FileText size={22} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={22} /> },
    { id: 'contacts', label: 'Contacts', icon: <Users size={22} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={22} />, adminOnly: true },
  ].filter(item => !item.adminOnly || currentUser.role === UserRole.ADMIN);

  return (
    <>
      {/* Top Header - App Style */}
      <header className="fixed top-0 left-0 right-0 z-[150] glass dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#E31E24] rounded-xl flex items-center justify-center shadow-lg shadow-red-100">
            <img src={LOGO_URL} alt="SR" className="w-6 h-6 object-contain brightness-0 invert" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">{companyName}</h1>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Accounts Pro</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onCloudClick}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
              cloudStatus === 'connected' 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' 
                : cloudStatus === 'error'
                ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
            }`}
            title={cloudStatus === 'connected' ? 'Cloud Connected' : 'Cloud Offline'}
          >
            {cloudStatus === 'connected' ? <Cloud size={18} /> : <CloudOff size={18} />}
          </button>
          <button 
            onClick={() => onNavChange('profile')}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
              activeView === 'profile' 
                ? 'bg-red-50 dark:bg-red-900/20 text-[#E31E24]' 
                : 'text-slate-400 active:bg-slate-50 dark:active:bg-slate-800'
            }`}
          >
            <UserCircle size={20} />
          </button>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-900 dark:text-white leading-none">{currentUser.name.split(' ')[0]}</p>
            <p className="text-[8px] font-bold text-[#E31E24] uppercase tracking-widest mt-0.5">{currentUser.role}</p>
          </div>
          <button 
            onClick={onLogout}
            className="w-9 h-9 flex items-center justify-center text-slate-400 active:text-red-600 active:bg-red-50 dark:active:bg-red-900/20 rounded-xl transition-all"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Bottom Navigation - Native Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-[150] glass dark:bg-slate-900/80 border-t border-slate-200/50 dark:border-slate-800/50 pb-safe">
        <div className="flex justify-around items-center h-20 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id as any)}
              className={`flex flex-col items-center justify-center w-full h-full transition-all relative ${
                activeView === item.id
                  ? 'text-[#E31E24]'
                  : 'text-slate-400'
              }`}
            >
              {activeView === item.id && (
                <div className="absolute top-0 w-8 h-1 bg-[#E31E24] rounded-b-full" />
              )}
              <div className={`transition-transform duration-300 ${activeView === item.id ? 'scale-110 -translate-y-1' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-bold mt-1 tracking-tight transition-all ${activeView === item.id ? 'opacity-100' : 'opacity-70'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
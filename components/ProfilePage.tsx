import React, { useState } from 'react';
import { User, Lock, ShieldCheck, Save, Eye, EyeOff, UserCircle } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfilePageProps {
  currentUser: UserType;
  onUpdatePassword: (newPassword: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, onUpdatePassword }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    onUpdatePassword(newPassword);
    setSuccess(true);
    setNewPassword('');
    setConfirmPassword('');
    setCurrentPassword('');
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <header>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">My Account</h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Manage your profile & security</p>
      </header>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-[#E31E24] rounded-2xl flex items-center justify-center">
            <UserCircle size={32} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight">{currentUser.name}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">@{currentUser.username} • {currentUser.role}</p>
          </div>
        </div>

        <div className="h-px bg-slate-50 dark:bg-slate-800" />

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Lock size={14} className="text-[#E31E24]" />
              Change Password
            </h4>
            <button 
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="text-[10px] font-black text-[#E31E24] uppercase tracking-widest"
            >
              {showPasswords ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
            <div className="relative">
              <input 
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 dark:text-white text-sm"
                placeholder="Enter new password"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Password</label>
            <div className="relative">
              <input 
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 dark:text-white text-sm"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-widest rounded-xl text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-xl text-center">
              Password updated successfully!
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Save size={16} />
            Update Password
          </button>
        </form>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-4">
        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="font-black text-emerald-900 dark:text-emerald-400 text-sm tracking-tight">Account Secured</h3>
          <p className="text-[10px] font-bold text-emerald-700/60 dark:text-emerald-400/60 uppercase tracking-widest">Your data is encrypted locally</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

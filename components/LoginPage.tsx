import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { LOGO_URL } from '../constants';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean> | boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await onLogin(username, password);
    if (!success) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 flex flex-col p-8 animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-[#E31E24] rounded-3xl flex items-center justify-center mb-8 animate-scale-in">
          <img src={LOGO_URL} alt="SR Logo" className="w-16 h-16 object-contain brightness-0 invert" referrerPolicy="no-referrer" />
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Welcome Back</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={18} />
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] outline-none transition-all font-bold text-slate-900 dark:text-white"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={18} />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] outline-none transition-all font-bold text-slate-900 dark:text-white"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-3 group mt-4"
          >
            Sign In
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-[#E31E24]" />
          </button>
        </form>
      </div>

      <div className="mt-auto pt-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-slate-300 dark:text-slate-700 text-[10px] font-bold uppercase tracking-widest">
          <ShieldCheck size={14} className="text-emerald-500" />
          Secure Enterprise Access
        </div>
        <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full" />
      </div>
    </div>
  );
};

export default LoginPage;
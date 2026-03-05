import React, { useState, useEffect } from 'react';
import { Lock, Fingerprint, Delete } from 'lucide-react';

interface LockScreenProps {
  pin: string;
  isFingerprintEnabled: boolean;
  onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ pin, isFingerprintEnabled, onUnlock }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleNumberClick = (num: string) => {
    if (input.length < 4) {
      const newInput = input + num;
      setInput(newInput);
      if (newInput.length === 4) {
        if (newInput === pin) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => {
            setInput('');
            setError(false);
          }, 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setInput(input.slice(0, -1));
  };

  const handleFingerprint = async () => {
    if (isFingerprintEnabled) {
      // In a real app, we'd use WebAuthn here.
      // For this demo, we'll simulate a successful scan.
      onUnlock();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-[2000] flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-[#E31E24] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-100 dark:shadow-none">
          <Lock size={32} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">App Locked</h1>
        <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Enter your 4-digit PIN</p>
      </div>

      <div className="flex gap-4 mb-12">
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
              error ? 'bg-rose-500 border-rose-500 animate-shake' :
              input.length > i ? 'bg-[#E31E24] border-[#E31E24] scale-110' : 'border-slate-200 dark:border-slate-800'
            }`} 
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xl font-black text-slate-900 dark:text-white shadow-sm active:scale-90 active:bg-slate-50 dark:active:bg-slate-800 transition-all flex items-center justify-center mx-auto"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleFingerprint}
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-all ${
            isFingerprintEnabled ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 active:scale-90' : 'opacity-0 pointer-events-none'
          }`}
        >
          <Fingerprint size={24} />
        </button>
        <button
          onClick={() => handleNumberClick('0')}
          className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xl font-black text-slate-900 dark:text-white shadow-sm active:scale-90 active:bg-slate-50 dark:active:bg-slate-800 transition-all flex items-center justify-center mx-auto"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 active:scale-90 transition-all flex items-center justify-center mx-auto"
        >
          <Delete size={24} />
        </button>
      </div>
    </div>
  );
};

export default LockScreen;

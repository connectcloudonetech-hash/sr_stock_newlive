
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{title}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
            {message}
          </p>
          
          <div className="mt-8 flex flex-col gap-2">
            <button
              onClick={onConfirm}
              className="w-full py-4 bg-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-lg shadow-rose-100 dark:shadow-none"
            >
              Confirm Delete
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 text-slate-400 dark:text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl active:bg-slate-50 dark:active:bg-slate-800 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

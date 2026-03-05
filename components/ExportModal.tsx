import React from 'react';
import { X, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Transaction, TransactionType, Currency, CompanyProfile } from '../types';
import { downloadTransactionsAsExcel } from '../utils/exportUtils';
import { generateFinancialPDF } from '../utils/pdfExportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  currency: Currency;
  companyProfile: CompanyProfile;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, transactions, currency, companyProfile }) => {
  const handlePDFExport = () => {
    const income = transactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
    
    generateFinancialPDF(transactions, {
      title: 'Ledger Statement',
      period: `Statement as of ${new Date().toLocaleDateString()}`,
      stats: { income, expense, balance: income - expense },
      currencyCode: currency.code,
      companyProfile: companyProfile
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-end justify-center animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2.5rem] p-6 pb-12 shadow-2xl animate-slide-up">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Export Data</h2>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Secure Export Portal</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 dark:text-slate-500 active:text-slate-600 dark:active:text-slate-300">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => {
              downloadTransactionsAsExcel(transactions, currency.code, companyProfile.name);
              onClose();
            }}
            className="w-full flex items-center gap-4 p-5 bg-slate-900 dark:bg-slate-950 border border-slate-800 dark:border-slate-800 rounded-[2rem] active:bg-black transition-all text-left group shadow-xl shadow-slate-200 dark:shadow-none"
          >
            <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
              <FileSpreadsheet size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-white text-base tracking-tight">Excel Spreadsheet</h3>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Professional Corporate Layout</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white group-active:text-emerald-500 transition-colors">
              <Download size={18} />
            </div>
          </button>

          <button
            onClick={handlePDFExport}
            className="w-full flex items-center gap-4 p-5 bg-slate-900 dark:bg-slate-950 border border-slate-800 dark:border-slate-800 rounded-[2rem] active:bg-black transition-all text-left group shadow-xl shadow-slate-200 dark:shadow-none"
          >
            <div className="w-14 h-14 bg-[#E31E24] text-white rounded-2xl flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
              <FileText size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-white text-base tracking-tight">PDF Document</h3>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Official Financial Report</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white group-active:text-[#E31E24] transition-colors">
              <Download size={18} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
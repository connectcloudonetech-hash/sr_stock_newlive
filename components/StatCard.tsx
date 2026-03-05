
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Coins, LayoutGrid } from 'lucide-react';

interface StatCardProps {
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'total';
  currencySymbol: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, amount, type, currencySymbol }) => {
  const isIncome = type === 'income';
  const isExpense = type === 'expense';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-3 shadow-sm active:scale-[0.98] transition-transform">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isIncome ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 
          isExpense ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' : 'bg-red-50 dark:bg-red-900/20 text-[#E31E24]'
        }`}>
          {isIncome ? <ArrowUpRight size={20} /> : isExpense ? <ArrowDownRight size={20} /> : <Coins size={20} />}
        </div>
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
          isIncome ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 
          isExpense ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' : 'bg-red-50 dark:bg-red-900/20 text-[#E31E24]'
        }`}>
          {type}
        </span>
      </div>
      
      <div>
        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-tight mb-0.5">{title}</p>
        <div className="flex items-baseline gap-0.5">
          <span className="text-slate-900 dark:text-white font-black text-lg">{currencySymbol}</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {Math.abs(amount).toLocaleString()}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default StatCard;

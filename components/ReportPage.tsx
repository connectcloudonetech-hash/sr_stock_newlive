import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { LOGO_URL } from '../constants';
import { 
  Calendar, Download, ChevronDown, PieChart, 
  ArrowUpRight, ArrowDownRight, Wallet, Printer, 
  FileCheck, Clock, User, Tag, CalendarDays
} from 'lucide-react';

interface ReportPageProps {
  transactions: Transaction[];
  onExport: () => void;
  currencySymbol: string;
  companyName: string;
}

type ReportType = 'monthly' | 'quarterly' | 'annual' | 'customer' | 'category' | 'custom';

const ReportPage: React.FC<ReportPageProps> = ({ transactions, onExport, currencySymbol, companyName }) => {
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);

  const years = useMemo(() => {
    const yearsSet = new Set<number>(transactions.map(t => new Date(t.date).getFullYear()));
    yearsSet.add(new Date().getFullYear());
    return Array.from(yearsSet).sort((a: number, b: number) => b - a);
  }, [transactions]);

  const uniqueCustomers = useMemo(() => {
    const names = Array.from(new Set(transactions.map(t => t.name))).sort();
    if (names.length > 0 && !selectedCustomer) setSelectedCustomer(names[0]);
    return names;
  }, [transactions]);

  const uniqueCategories = useMemo(() => {
    const particulars = Array.from(new Set(transactions.map(t => t.particular))).sort();
    if (particulars.length > 0 && !selectedCategory) setSelectedCategory(particulars[0]);
    return particulars;
  }, [transactions]);

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      if (reportType === 'customer') return t.name === selectedCustomer;
      if (reportType === 'category') return t.particular === selectedCategory;
      if (reportType === 'custom') return t.date >= customStartDate && t.date <= customEndDate;

      const date = new Date(t.date);
      const yearMatches = date.getFullYear() === selectedYear;
      if (!yearMatches) return false;

      if (reportType === 'monthly') return date.getMonth() === selectedMonth;
      if (reportType === 'quarterly') {
        const q = Math.floor(date.getMonth() / 3) + 1;
        return q === selectedQuarter;
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, reportType, selectedYear, selectedMonth, selectedQuarter, selectedCustomer, selectedCategory, customStartDate, customEndDate]);

  const stats = useMemo(() => {
    const income = filteredData.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    const expense = filteredData.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filteredData]);

  return (
    <div className="space-y-6 animate-slide-up">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial Reports</h1>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Analysis & Export</p>
          </div>
          <button 
            onClick={onExport} 
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white shadow-sm active:scale-95 transition-all"
          >
            <Download size={20} />
          </button>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex p-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm overflow-x-auto no-scrollbar">
            {(['monthly', 'quarterly', 'annual', 'customer', 'category', 'custom'] as ReportType[]).map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${
                  reportType === type ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Selectors Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        {reportType !== 'customer' && reportType !== 'category' && reportType !== 'custom' && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Year</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={16} />
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl appearance-none outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 dark:text-white text-sm"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 pointer-events-none" />
            </div>
          </div>
        )}

        {reportType === 'monthly' && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Month</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={16} />
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl appearance-none outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 dark:text-white text-sm"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>{new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2000, i, 1))}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 pointer-events-none" />
            </div>
          </div>
        )}

        {reportType === 'quarterly' && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Quarter</label>
            <div className="relative">
              <PieChart className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={16} />
              <select 
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl appearance-none outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 dark:text-white text-sm"
              >
                <option value={1}>Q1 (Jan - Mar)</option>
                <option value={2}>Q2 (Apr - Jun)</option>
                <option value={3}>Q3 (Jul - Sep)</option>
                <option value={4}>Q4 (Oct - Dec)</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 pointer-events-none" />
            </div>
          </div>
        )}

        {reportType === 'customer' && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Customer / Entity</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={16} />
              <select 
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl appearance-none outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 dark:text-white text-sm"
              >
                {uniqueCustomers.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 pointer-events-none" />
            </div>
          </div>
        )}

        {reportType === 'category' && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Category</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={16} />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl appearance-none outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 dark:text-white text-sm"
              >
                {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 pointer-events-none" />
            </div>
          </div>
        )}

        {reportType === 'custom' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Start</label>
              <input 
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 dark:text-white text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">End</label>
              <input 
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-4">
          <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
            <ArrowUpRight size={24} />
          </div>
          <div>
            <p className="text-emerald-700/60 dark:text-emerald-400/60 font-black text-[9px] uppercase tracking-widest mb-0.5">Cash In</p>
            <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-400">{currencySymbol}{stats.income.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-5 border border-rose-100 dark:border-rose-900/30 flex items-center gap-4">
          <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm">
            <ArrowDownRight size={24} />
          </div>
          <div>
            <p className="text-rose-700/60 dark:text-rose-400/60 font-black text-[9px] uppercase tracking-widest mb-0.5">Cash Out</p>
            <h3 className="text-xl font-black text-rose-900 dark:text-rose-400">{currencySymbol}{stats.expense.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-slate-900 rounded-2xl p-5 border border-slate-800 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 dark:bg-white/5 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500 font-black text-[9px] uppercase tracking-widest mb-0.5">Net Flow</p>
            <h3 className="text-xl font-black text-white">{currencySymbol}{stats.balance.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Preview List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="text-[#E31E24]" size={18} />
            Preview
          </h2>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">{filteredData.length} records</p>
        </div>
        
        <div className="space-y-3">
          {filteredData.length > 0 ? (
            filteredData.map((t) => (
              <div key={t.id} className="mobile-card dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${t.type === TransactionType.INCOME ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'}`}>
                    {t.particular.charAt(0) || 'T'}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.particular} • {t.date}</p>
                    {t.description && (
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5 italic">
                        Note: {t.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-base ${t.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    {currencySymbol}{t.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800">
              <Printer className="mx-auto text-slate-100 dark:text-slate-800 mb-4" size={40} />
              <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">No records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;

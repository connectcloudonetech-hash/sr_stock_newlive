import React from 'react';
import { TransactionType } from '../types';
import { Filter, Search, X, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

export interface FilterState {
  period: 'All' | 'Today' | 'This Week' | 'This Month' | 'Custom Range';
  startDate: string;
  endDate: string;
  category: string;
  type: string;
  name: string;
  search: string;
}

interface TransactionFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  names: string[];
  particulars: string[];
  hideSearch?: boolean;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ 
  filters, 
  onFilterChange, 
  onReset,
  names,
  particulars,
  hideSearch = false
}) => {
  const hasActiveFilters = 
    filters.period !== 'All' || 
    filters.startDate || 
    filters.endDate || 
    filters.category !== 'All' || 
    filters.type !== 'All' || 
    filters.name !== 'All' ||
    filters.search !== '';

  const handlePeriodChange = (period: FilterState['period']) => {
    const now = new Date();
    let start = '';
    let end = now.toISOString().split('T')[0];

    if (period === 'Today') {
      start = end;
    } else if (period === 'This Week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
      const monday = new Date(now.setDate(diff));
      start = monday.toISOString().split('T')[0];
    } else if (period === 'This Month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      start = firstDay.toISOString().split('T')[0];
    } else if (period === 'All') {
      start = '';
      end = '';
    }

    onFilterChange({
      ...filters,
      period,
      startDate: period === 'Custom Range' ? filters.startDate : start,
      endDate: period === 'Custom Range' ? filters.endDate : end,
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Search Bar */}
      {!hideSearch && (
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 group-focus-within:text-[#E31E24] transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by name, category or description..."
            className="w-full pl-12 pr-10 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/20 outline-none transition-all font-bold text-slate-900 dark:text-white text-sm shadow-sm placeholder-slate-300 dark:placeholder-slate-700"
            value={filters.search}
            onChange={(e) => onFilterChange({...filters, search: e.target.value})}
          />
          {filters.search && (
            <button 
              onClick={() => onFilterChange({...filters, search: ''})}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        <button 
          onClick={onReset}
          className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
            !hasActiveFilters ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Filter size={12} />
          Reset
        </button>

        {/* Period Dropdown */}
        <div className="relative flex-shrink-0">
          <select 
            value={filters.period}
            onChange={(e) => handlePeriodChange(e.target.value as any)}
            className={`pl-4 pr-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border-none appearance-none cursor-pointer transition-all ${
              filters.period !== 'All' ? 'bg-red-50 dark:bg-red-900/20 text-[#E31E24] dark:text-red-400 ring-1 ring-red-100 dark:ring-red-900/30' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 ring-1 ring-slate-100 dark:ring-slate-800'
            }`}
          >
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="Custom Range">Custom Range</option>
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
        </div>
        
        <div className="relative flex-shrink-0">
          <select 
            value={filters.type}
            onChange={(e) => onFilterChange({...filters, type: e.target.value})}
            className={`pl-4 pr-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border-none appearance-none cursor-pointer transition-all ${
              filters.type !== 'All' ? 'bg-red-50 dark:bg-red-900/20 text-[#E31E24] dark:text-red-400 ring-1 ring-red-100 dark:ring-red-900/30' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 ring-1 ring-slate-100 dark:ring-slate-800'
            }`}
          >
            <option value="All">All Types</option>
            <option value={TransactionType.INCOME}>Cash In</option>
            <option value={TransactionType.EXPENSE}>Cash Out</option>
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
        </div>

        <div className="relative flex-shrink-0">
          <select 
            value={filters.name}
            onChange={(e) => onFilterChange({...filters, name: e.target.value})}
            className={`pl-4 pr-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border-none appearance-none cursor-pointer transition-all ${
              filters.name !== 'All' ? 'bg-red-50 dark:bg-red-900/20 text-[#E31E24] dark:text-red-400 ring-1 ring-red-100 dark:ring-red-900/30' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 ring-1 ring-slate-100 dark:ring-slate-800'
            }`}
          >
            <option value="All">All Entities</option>
            {names.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
        </div>

        <div className="relative flex-shrink-0">
          <select 
            value={filters.category}
            onChange={(e) => onFilterChange({...filters, category: e.target.value})}
            className={`pl-4 pr-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border-none appearance-none cursor-pointer transition-all ${
              filters.category !== 'All' ? 'bg-red-50 dark:bg-red-900/20 text-[#E31E24] dark:text-red-400 ring-1 ring-red-100 dark:ring-red-900/30' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 ring-1 ring-slate-100 dark:ring-slate-800'
            }`}
          >
            <option value="All">All Categories</option>
            {particulars.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
        </div>
      </div>

      {filters.period === 'Custom Range' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Start Date</label>
            <div className="relative">
              <CalendarIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E31E24]" />
              <input
                type="date"
                className="w-full bg-white dark:bg-slate-800 pl-11 pr-4 py-3 rounded-xl text-xs font-bold text-slate-900 dark:text-white border-none outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-[#E31E24] transition-all"
                value={filters.startDate}
                onChange={(e) => onFilterChange({...filters, startDate: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">End Date</label>
            <div className="relative">
              <CalendarIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900/40 dark:text-slate-600" />
              <input
                type="date"
                className="w-full bg-white dark:bg-slate-800 pl-11 pr-4 py-3 rounded-xl text-xs font-bold text-slate-900 dark:text-white border-none outline-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-2 focus:ring-[#E31E24] transition-all"
                value={filters.endDate}
                onChange={(e) => onFilterChange({...filters, endDate: e.target.value})}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilters;

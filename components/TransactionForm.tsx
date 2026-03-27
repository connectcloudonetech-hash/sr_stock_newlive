import React, { useState, useEffect, useRef } from 'react';
import { Transaction, TransactionType } from '../types';
import { 
  Save, Trash2, Calendar, User, Tag, 
  MessageSquare, X, ChevronDown, Check, Search,
  ShoppingCart, Briefcase, Utensils, Zap, Car, Home, Plus,
  ArrowDownCircle, ArrowUpCircle
} from 'lucide-react';

interface TransactionFormProps {
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  onUpdate: (t: Transaction) => void;
  onDelete: (id: string) => void;
  editingTransaction?: Transaction | null;
  onCancelEdit: () => void;
  availableNames: string[];
  availableParticulars: string[];
  initialType?: TransactionType;
  currencySymbol: string;
}

const PRESET_CATEGORIES = [
  { name: 'CARRY IN', icon: <ArrowDownCircle size={14} />, defaultType: TransactionType.INCOME },
  { name: 'CARRY OUT', icon: <ArrowUpCircle size={14} />, defaultType: TransactionType.EXPENSE },
  { name: 'Inventory', icon: <ShoppingCart size={14} /> },
  { name: 'Salary', icon: <Briefcase size={14} /> },
  { name: 'Food/Meals', icon: <Utensils size={14} /> },
  { name: 'Electricity', icon: <Zap size={14} /> },
  { name: 'Transport', icon: <Car size={14} /> },
  { name: 'Rent', icon: <Home size={14} /> },
  { name: 'Miscellaneous', icon: <Plus size={14} /> },
];

const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onAdd, 
  onUpdate, 
  onDelete, 
  editingTransaction, 
  onCancelEdit,
  availableNames,
  availableParticulars,
  initialType,
  currencySymbol
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState('');
  const [particular, setParticular] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(initialType || TransactionType.EXPENSE);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNameDropdownOpen, setIsNameDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [nameSearchTerm, setNameSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const nameDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingTransaction) {
      setDate(editingTransaction.date);
      setName(editingTransaction.name);
      setParticular(editingTransaction.particular);
      setDescription(editingTransaction.description || '');
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
    } else if (initialType) {
      setType(initialType);
    }
  }, [editingTransaction, initialType]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (nameDropdownRef.current && !nameDropdownRef.current.contains(event.target as Node)) {
        setIsNameDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCategory = (cat: string) => {
    setParticular(cat);
    setIsDropdownOpen(false);
    setSearchTerm('');
    
    // Auto-toggle type if the category has a fixed default
    const preset = PRESET_CATEGORIES.find(p => p.name === cat);
    if (preset?.defaultType) {
      setType(preset.defaultType);
    }
  };

  const handleSelectName = (selectedName: string) => {
    setName(selectedName);
    setIsNameDropdownOpen(false);
    setNameSearchTerm('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !particular || !amount) return;

    const transactionData = {
      name,
      particular,
      description,
      amount: parseFloat(amount),
      type,
      category: particular,
      date
    };

    if (editingTransaction) {
      onUpdate({ ...transactionData, id: editingTransaction.id });
    } else {
      onAdd(transactionData);
    }
  };

  const allCategories = Array.from(new Set([...PRESET_CATEGORIES.map(c => c.name), ...availableParticulars]));
  const filteredCategories = allCategories.filter(cat => 
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNames = availableNames.filter(n => 
    n.toLowerCase().includes(nameSearchTerm.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto pb-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {editingTransaction ? 'Edit Entry' : 'New Entry'}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            {type === TransactionType.INCOME ? 'Cash Inflow' : 'Cash Outflow'}
          </p>
        </div>
        <button type="button" onClick={onCancelEdit} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full active:scale-90 transition-all">
          <X size={20} />
        </button>
      </div>

      {/* Type Selector - More Native Feel */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <button
          type="button"
          onClick={() => setType(TransactionType.EXPENSE)}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            type === TransactionType.EXPENSE 
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm' 
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <ArrowUpCircle size={14} className={type === TransactionType.EXPENSE ? 'text-rose-600 dark:text-rose-400' : 'text-slate-300 dark:text-slate-700'} />
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType(TransactionType.INCOME)}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            type === TransactionType.INCOME 
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' 
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <ArrowDownCircle size={14} className={type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-700'} />
          Income
        </button>
      </div>

      {/* Amount Field - Refined */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Amount</label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300 dark:text-slate-700">
            {currencySymbol}
          </div>
          <input
            type="number"
            step="1"
            placeholder="0"
            className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-50 dark:border-slate-800 focus:border-slate-900 dark:focus:border-white focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-2xl font-black text-slate-900 dark:text-white transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700 outline-none"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus={!editingTransaction}
          />
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={16} />
              <input
                type="date"
                className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-50 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-sm font-bold text-slate-900 dark:text-white transition-all outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2" ref={dropdownRef}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Category</label>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`relative w-full flex items-center justify-between pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-50 dark:border-slate-800 rounded-2xl cursor-pointer transition-all ${isDropdownOpen ? 'ring-2 ring-slate-900 dark:ring-white' : ''}`}
            >
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={16} />
              <span className={`text-sm font-bold truncate ${particular ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-700'}`}>
                {particular || 'Select...'}
              </span>
              <ChevronDown size={14} className={`text-slate-300 dark:text-slate-700 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className="absolute z-[110] left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                  <Search size={14} className="text-slate-400 dark:text-slate-500" />
                  <input 
                    type="text" 
                    autoFocus
                    className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 dark:text-white w-full placeholder:text-slate-400 dark:placeholder:text-slate-600 uppercase"
                    placeholder="SEARCH..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto no-scrollbar py-2">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleSelectCategory(cat)}
                        className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${particular === cat ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors'}`}>
                            {PRESET_CATEGORIES.find(p => p.name === cat)?.icon || <Tag size={12} />}
                          </div>
                          <span className={`text-xs ${particular === cat ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-500 dark:text-slate-400'}`}>{cat}</span>
                        </div>
                        {particular === cat && <Check size={14} className="text-slate-900 dark:text-white" />}
                      </button>
                    ))
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectCategory(searchTerm)}
                      className="w-full flex items-center gap-2 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                    >
                      <Plus size={14} />
                      <span className="text-xs font-black uppercase">Add "{searchTerm}"</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2" ref={nameDropdownRef}>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
            {type === TransactionType.EXPENSE ? 'Paid To (Vendor)' : 'Received From (Client)'}
          </label>
          <div 
            onClick={() => setIsNameDropdownOpen(!isNameDropdownOpen)}
            className={`relative w-full flex items-center justify-between pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-50 dark:border-slate-800 rounded-2xl cursor-pointer transition-all ${isNameDropdownOpen ? 'ring-2 ring-slate-900 dark:ring-white' : ''}`}
          >
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={16} />
            <span className={`text-sm font-bold truncate ${name ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-700'}`}>
              {name || (type === TransactionType.EXPENSE ? 'Select Vendor...' : 'Select Client...')}
            </span>
            <ChevronDown size={14} className={`text-slate-300 dark:text-slate-700 transition-transform ${isNameDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {isNameDropdownOpen && (
            <div className="absolute z-[110] left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
                <Search size={14} className="text-slate-400 dark:text-slate-500" />
                <input 
                  type="text" 
                  autoFocus
                  className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 dark:text-white w-full placeholder:text-slate-400 dark:placeholder:text-slate-600 uppercase"
                  placeholder="SEARCH NAME..."
                  value={nameSearchTerm}
                  onChange={(e) => setNameSearchTerm(e.target.value.toUpperCase())}
                />
              </div>
              <div className="max-h-48 overflow-y-auto no-scrollbar py-2">
                {filteredNames.length > 0 ? (
                  filteredNames.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleSelectName(n)}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${name === n ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors'}`}>
                          <User size={12} />
                        </div>
                        <span className={`text-xs ${name === n ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-500 dark:text-slate-400'}`}>{n}</span>
                      </div>
                      {name === n && <Check size={14} className="text-slate-900 dark:text-white" />}
                    </button>
                  ))
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectName(nameSearchTerm)}
                    className="w-full flex items-center gap-2 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                  >
                    <Plus size={14} />
                    <span className="text-xs font-black uppercase">Add "{nameSearchTerm}"</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Notes (Optional)</label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 text-slate-300 dark:text-slate-700" size={16} />
            <textarea
              placeholder="ADDITIONAL DETAILS..."
              className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-50 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-sm font-bold min-h-[80px] text-slate-900 dark:text-white transition-all uppercase outline-none resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value.toUpperCase())}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        {editingTransaction && (
          <button
            type="button"
            onClick={() => onDelete(editingTransaction.id)}
            className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center active:scale-90 transition-all"
          >
            <Trash2 size={20} />
          </button>
        )}
        <button
          type="submit"
          className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          {editingTransaction ? <Save size={18} className="text-[#E31E24]" /> : <Plus size={18} className="text-[#E31E24]" />}
          {editingTransaction ? 'Update Record' : 'Save Transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
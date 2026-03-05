
import React, { useState } from 'react';
import { Contact, EntityType } from '../types';
import { 
  Users, UserPlus, Search, Phone, Mail, MapPin, 
  Trash2, Edit2, X, Check, Filter, 
  ChevronRight, Building2, User as UserIcon
} from 'lucide-react';

interface ContactsPageProps {
  contacts: Contact[];
  onAddContact: (contact: Omit<Contact, 'id'>) => void;
  onUpdateContact: (contact: Contact) => void;
  onRemoveContact: (id: string) => void;
}

const ContactsPage: React.FC<ContactsPageProps> = ({ 
  contacts, onAddContact, onUpdateContact, onRemoveContact 
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | EntityType>('all');

  const [formData, setFormData] = useState({
    name: '',
    type: EntityType.CUSTOMER,
    phone: '',
    email: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name) {
      if (editingContact) {
        onUpdateContact({ ...formData, id: editingContact.id });
      } else {
        onAddContact(formData);
      }
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: EntityType.CUSTOMER,
      phone: '',
      email: '',
      address: ''
    });
    setEditingContact(null);
    setIsAddOpen(false);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      type: contact.type,
      phone: contact.phone || '',
      email: contact.email || '',
      address: contact.address || ''
    });
    setIsAddOpen(true);
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (c.phone && c.phone.includes(searchTerm)) ||
                         (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Vendors & Customers</h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Relationship Management</p>
        </div>
        
        <button 
          onClick={() => setIsAddOpen(true)}
          className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <UserPlus size={18} className="text-[#E31E24]" />
          Add New Contact
        </button>
      </header>

      {/* Search and Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={18} />
          <input 
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24] font-bold text-slate-900 dark:text-white text-sm shadow-sm"
          />
        </div>
        <div className="flex p-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
          {(['all', EntityType.CUSTOMER, EntityType.VENDOR] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                typeFilter === type ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {type}s
            </button>
          ))}
        </div>
      </div>

      {/* Contacts List View */}
      <div className="space-y-3">
        {filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => (
            <div key={contact.id} className="mobile-card dark:bg-slate-900 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                    contact.type === EntityType.CUSTOMER ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  }`}>
                    {contact.type === EntityType.CUSTOMER ? <UserIcon size={20} /> : <Building2 size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{contact.name}</p>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400`}>
                      {contact.type}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(contact)} className="p-2 text-slate-400 active:text-slate-900 dark:active:text-white active:bg-slate-50 dark:active:bg-slate-800 rounded-lg transition-all">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onRemoveContact(contact.id)} className="p-2 text-slate-400 active:text-red-600 active:bg-red-50 dark:active:bg-red-900/20 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50 dark:border-slate-800">
                {contact.phone && (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Phone size={12} className="text-slate-300 dark:text-slate-700" />
                    <span className="text-[10px] font-bold">{contact.phone}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Mail size={12} className="text-slate-300 dark:text-slate-700" />
                    <span className="text-[10px] font-bold truncate">{contact.email}</span>
                  </div>
                )}
              </div>
              
              {contact.address && (
                <div className="flex items-start gap-2 text-slate-400 dark:text-slate-500 pt-1">
                  <MapPin size={12} className="text-slate-300 dark:text-slate-700 mt-0.5 flex-shrink-0" />
                  <span className="text-[10px] font-bold line-clamp-1">{contact.address}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800">
            <Users size={40} className="mx-auto text-slate-100 dark:text-slate-800 mb-4" />
            <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">No contacts found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Bottom Sheet Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[400] flex items-end justify-center animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2.5rem] p-6 pb-12 shadow-2xl animate-slide-up max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {editingContact ? 'Edit Contact' : 'New Contact'}
              </h2>
              <button onClick={resetForm} className="p-2 text-slate-400 dark:text-slate-500 active:text-slate-600 dark:active:text-slate-300">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex p-1 bg-slate-50 dark:bg-slate-800 rounded-xl">
                {(Object.values(EntityType)).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      formData.type === type ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Name</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] font-bold text-slate-900 dark:text-white text-sm"
                  placeholder="Full Name / Business Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Phone</label>
                  <input 
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] font-bold text-slate-900 dark:text-white text-sm"
                    placeholder="Phone Number"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Email</label>
                  <input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] font-bold text-slate-900 dark:text-white text-sm"
                    placeholder="Email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Address</label>
                <textarea 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] font-bold text-slate-900 dark:text-white text-sm resize-none h-20"
                  placeholder="Physical Address"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
              >
                <Check size={18} className="text-[#E31E24]" />
                {editingContact ? 'Save Changes' : 'Create Contact'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;

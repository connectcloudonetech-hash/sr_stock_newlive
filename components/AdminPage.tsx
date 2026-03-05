
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Shield, UserPlus, Trash2, ShieldCheck, ShieldAlert, X } from 'lucide-react';

interface AdminPageProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onRemoveUser: (id: string) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ users, onAddUser, onRemoveUser }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.STAFF);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername && newName) {
      onAddUser({
        username: newUsername.toLowerCase(),
        name: newName,
        role: newRole,
        password: 'password123' // Default password
      });
      setNewUsername('');
      setNewName('');
      setIsAddOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Shield className="text-[#E31E24]" size={24} />
            System Admin
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">User Access Control</p>
        </div>
        
        <button 
          onClick={() => setIsAddOpen(true)}
          className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <UserPlus size={18} className="text-[#E31E24]" />
          Add New User
        </button>
      </header>

      {/* User List View */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Authorized Personnel</h2>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">{users.length} users</p>
        </div>
        
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="mobile-card dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-slate-400 dark:text-slate-500 text-sm">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{u.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">@{u.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                  u.role === UserRole.ADMIN ? 'bg-red-50 dark:bg-red-900/20 text-[#E31E24]' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {u.role}
                </span>
                {users.length > 1 && (
                  <button 
                    onClick={() => onRemoveUser(u.id)}
                    className="p-2 text-slate-300 dark:text-slate-700 active:text-red-600 dark:active:text-red-400 active:bg-red-50 dark:active:bg-red-900/20 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add User Bottom Sheet Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[400] flex items-end justify-center animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-[2.5rem] p-6 pb-12 shadow-2xl animate-slide-up max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6" />
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Add User Account</h2>
              <button onClick={() => setIsAddOpen(false)} className="p-2 text-slate-400 dark:text-slate-500 active:text-slate-600 dark:active:text-slate-300">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Username</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] font-bold text-slate-900 dark:text-white text-sm"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="e.g. jdoe"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] font-bold text-slate-900 dark:text-white text-sm"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Access Level</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#E31E24]/20 focus:border-[#E31E24] font-bold text-slate-900 dark:text-white text-sm appearance-none"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                >
                  <option value={UserRole.STAFF}>Staff (Viewer)</option>
                  <option value={UserRole.ADMIN}>Admin (Full Access)</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
              >
                <ShieldCheck size={18} className="text-[#E31E24]" />
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Edit2, Key, Info, CheckCircle, XCircle } from 'lucide-react';
import { User, Plan } from '../types';
import { supabase } from '../supabase';

interface MemberPoolProps {
  currentUser: User;
  users: User[];
  onImpersonateUser: (user: User) => void;
  onUpdateUser: (email: string, updates: Partial<User>) => void;
}

export default function MemberPool({ currentUser, users, onImpersonateUser, onUpdateUser }: MemberPoolProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPasswordEmail, setEditingPasswordEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordChangeSuccessEmail, setPasswordChangeSuccessEmail] = useState<string | null>(null);

  // Group active members (not pending, not admin, not rejected)
  const activeUsers = users.filter(u => u.isApproved === true && u.email.toLowerCase() !== 'admin@g.g' && u.email.toLowerCase() !== 'wavoradashboard@gmail.com');
  const displayedUsers = activeUsers.filter(user => 
    user.artistName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdminChangePassword = async (email: string) => {
    if (!newPassword.trim() || newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    
    // Attempt real Auth update if the target user was created in Auth
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn("No active admin session for auth update; applying locally.");
      }
    } catch (err: any) {
      console.warn("Auth check failed:", err.message);
    }
    
    onUpdateUser(email, { password: newPassword.trim() });
    setEditingPasswordEmail(null);
    setNewPassword('');
    setPasswordChangeSuccessEmail(email);
    setTimeout(() => {
      setPasswordChangeSuccessEmail(null);
    }, 4000);
  };

  const handleUpdatePlan = (email: string, plan: Plan) => {
    onUpdateUser(email, { plan });
  };

  const handlePlanStartDateUpdate = (email: string, dateStr: string) => {
    onUpdateUser(email, { planStartDate: dateStr });
  };

  const handlePlanDateUpdate = (email: string, dateStr: string) => {
    onUpdateUser(email, { planEndDate: dateStr });
  };

  return (
    <div className="space-y-6" id="member_pool_root">
      {/* Header */}
      <div className="p-6 bg-[#0f1424] rounded-3xl border border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Active Member Pool</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Monitor, manage, and impersonate all globally active accounts on the platform. Adjust plans, set expiry dates, and modify access credentials.
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pt-0.5">
            <Search className="w-4 h-4 text-slate-500" />
          </div>
          <input
            type="text"
            className="w-full bg-[#151c2e] border border-slate-800 rounded-xl py-2 pl-10 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-[#0f1424] rounded-3xl border border-slate-900 overflow-hidden" id="member_table_container">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#151c2e]/50 border-b border-slate-800/80">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Alias / Email</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Account Type</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Subscription Plan</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Plan Start Date</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Plan End Date</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400">Security</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {displayedUsers.length > 0 ? (
                displayedUsers.map((user) => (
                  <tr key={user.email} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex flex-col items-center justify-center font-black text-xs text-white shadow-xl border border-white/5 bg-[#6366F1]`}>
                           {user.artistName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-200">{user.artistName}</div>
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded text-[10px] font-bold uppercase tracking-wider border border-indigo-500/20">Standard User</span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={user.plan}
                        onChange={(e) => handleUpdatePlan(user.email, e.target.value as Plan)}
                        className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="Basic">Basic</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="date"
                        value={user.planStartDate || user.registeredAt.split('T')[0]} // Default to registered start
                        onChange={(e) => handlePlanStartDateUpdate(user.email, e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 cursor-text min-w-[130px] color-scheme-dark"
                        style={{ colorScheme: 'dark' }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="date"
                        value={user.planEndDate || ''}
                        onChange={(e) => handlePlanDateUpdate(user.email, e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500 cursor-text min-w-[130px] color-scheme-dark"
                        style={{ colorScheme: 'dark' }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 w-48">
                        {user.password && (
                          <div className="text-[10px] text-indigo-400 font-medium font-mono bg-indigo-950/30 border border-indigo-500/10 px-2 py-1 rounded w-full flex items-center justify-between">
                            <span className="flex items-center gap-1"><Key className="w-3 h-3" /> Creds:</span> 
                            <span className="font-extrabold truncate max-w-[80px]">{user.password}</span>
                          </div>
                        )}
                        {passwordChangeSuccessEmail === user.email && (
                          <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Updated!
                          </div>
                        )}
                        {editingPasswordEmail === user.email ? (
                          <div className="flex items-center gap-1 mt-1">
                            <input
                              type="text"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="New pass..."
                              className="w-24 bg-zinc-900 border border-zinc-700 text-white rounded px-2 py-1 text-[10px] focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              onClick={() => handleAdminChangePassword(user.email)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2 py-1 rounded text-[9px] uppercase cursor-pointer transition-colors shrink-0"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setEditingPasswordEmail(null); setNewPassword(''); }}
                              className="bg-red-500/20 hover:bg-red-500/40 text-red-400 font-bold p-1 rounded cursor-pointer transition-colors flex items-center justify-center shrink-0"
                            >
                              <XCircle className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingPasswordEmail(user.email); setNewPassword(''); }}
                            className="text-[9px] text-slate-400 hover:text-white uppercase tracking-wider font-bold transition-colors w-fit border-b border-transparent hover:border-white mt-0.5"
                          >
                            Change Password
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onImpersonateUser(user)}
                        className="px-3 py-1.5 bg-white hover:bg-gray-200 text-black font-extrabold rounded text-[10px] uppercase tracking-wider cursor-pointer transition shadow-lg inline-flex items-center gap-1.5"
                      >
                         Impersonate
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                       <Info className="w-8 h-8 text-slate-700" />
                       <p>No active members found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

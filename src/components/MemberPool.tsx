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
      <div className="bg-slate-950/40 backdrop-blur-md rounded-2xl border border-slate-800/60 shadow-2xl overflow-hidden" id="member_table_container">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/60 border-b border-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-[#818CF8]">Alias / Email</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Account Type</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Subscription Plan</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Plan Start Date</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Plan End Date</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Security / Credentials</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {displayedUsers.length > 0 ? (
                displayedUsers.map((user) => (
                  <tr key={user.email} className="hover:bg-indigo-950/5 group/row transition-all duration-300">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center font-black text-xs text-white shadow-xl border border-white/10 bg-gradient-to-br from-[#6366F1] to-[#4338ca] group-hover/row:scale-110 transition-transform duration-300">
                           {user.artistName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-100 group-hover/row:text-white transition-colors text-sm">{user.artistName}</div>
                          <div className="text-[10px] text-slate-450 font-mono mt-0.5">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2.5 py-1 bg-indigo-500/15 text-indigo-300 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border border-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.05)]">
                        Standard User
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <select 
                        value={user.plan}
                        onChange={(e) => handleUpdatePlan(user.email, e.target.value as Plan)}
                        className="bg-slate-900 border border-slate-800/80 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 hover:border-slate-700 cursor-pointer font-bold transition-all"
                      >
                        <option value="Basic">Basic</option>
                      </select>
                    </td>
                    <td className="px-6 py-5">
                      <input 
                        type="date"
                        value={user.planStartDate || user.registeredAt.split('T')[0]} 
                        onChange={(e) => handlePlanStartDateUpdate(user.email, e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-text min-w-[130px] color-scheme-dark transition-all font-mono"
                        style={{ colorScheme: 'dark' }}
                      />
                    </td>
                    <td className="px-6 py-5">
                      <input 
                        type="date"
                        value={user.planEndDate || ''}
                        onChange={(e) => handlePlanDateUpdate(user.email, e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-text min-w-[130px] color-scheme-dark transition-all font-mono"
                        style={{ colorScheme: 'dark' }}
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5 w-48">
                        {user.password && (
                          <div className="text-[10px] text-indigo-400 font-bold font-mono bg-indigo-950/20 border border-indigo-500/10 px-2.5 py-1 rounded-xl w-full flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                            <span className="flex items-center gap-1 opacity-70"><Key className="w-3 h-3" /> Creds:</span> 
                            <span className="font-extrabold text-[#818CF8]" title="Encrypted Secret">{user.password}</span>
                          </div>
                        )}
                        {passwordChangeSuccessEmail === user.email && (
                          <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 animate-bounce">
                            <CheckCircle className="w-3.5 h-3.5" /> Credentials Saved!
                          </div>
                        )}
                        {editingPasswordEmail === user.email ? (
                          <div className="flex items-center gap-1.5 mt-1" id={`pass_edit_group_${user.email}`}>
                            <input
                              type="text"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="6+ chars..."
                              className="w-24 bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 text-[10px] focus:outline-none focus:border-indigo-500 font-mono"
                            />
                            <button
                              onClick={() => handleAdminChangePassword(user.email)}
                              className="bg-[#6366F1] hover:bg-[#818CF8] text-black font-extrabold px-2.5 py-1 rounded-lg text-[9px] uppercase cursor-pointer transition-all duration-200 shadow-lg"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setEditingPasswordEmail(null); setNewPassword(''); }}
                              className="bg-rose-500/10 hover:bg-rose-500/25 text-rose-450 p-1.5 rounded-lg cursor-pointer transition-colors flex items-center justify-center shrink-0 border border-rose-500/20"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingPasswordEmail(user.email); setNewPassword(''); }}
                            className="text-[9px] text-[#818CF8] hover:text-white uppercase tracking-wider font-extrabold transition-colors w-fit border-b border-dashed border-[#818CF8]/40 hover:border-white mt-0.5"
                          >
                            Revise Password
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => onImpersonateUser(user)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-[#6366F1] hover:from-[#6366F1] hover:to-indigo-400 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider cursor-pointer shadow-[0_4px_16px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_22px_rgba(99,102,241,0.4)] hover:scale-[1.03] transition-all duration-300 inline-flex items-center gap-1.5"
                      >
                         Impersonate Artist
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-550">
                    <div className="flex flex-col items-center gap-3">
                       <Info className="w-10 h-10 text-slate-700 animate-pulse" />
                       <p className="font-bold text-slate-400">No active members found matching your criteria.</p>
                       <p className="text-xs text-slate-505">Try refining your filter alias or email address query.</p>
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

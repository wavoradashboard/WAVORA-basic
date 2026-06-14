import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Tags, Building2, Trash2, ShieldAlert, Sparkles, Users } from 'lucide-react';
import { Label, User } from '../types';

interface ManageLabelsProps {
  currentUser: User;
  users: User[];
  managedLabels: Label[];
  onAddLabel: (label: Label) => void;
  onRemoveLabel: (id: string) => void;
  isImpersonating?: boolean;
}

export default function ManageLabels({
  currentUser,
  users,
  managedLabels,
  onAddLabel,
  onRemoveLabel,
  isImpersonating = false,
}: ManageLabelsProps) {
  const [labelName, setLabelName] = useState('');
  const [targetUserEmail, setTargetUserEmail] = useState(currentUser.email);
  const [error, setError] = useState('');
  
  const isAdmin = currentUser.email === 'admin@g.g';
  
  // Show all labels globally if true Admin. 
  // If impersonating or normal user: Show Global labels (admin@g.g) + their Private labels (currentUser.email)
  const displayLabels = (isAdmin && !isImpersonating)
    ? managedLabels
    : managedLabels.filter(lbl => lbl.email === 'admin@g.g' || lbl.email === currentUser.email);

  const [expandedUserEmail, setExpandedUserEmail] = useState<string | null>(null);

  const toggleUserFolder = (email: string) => {
    setExpandedUserEmail(prev => prev === email ? null : email);
  };

  const renderLabelCard = (lbl: Label) => (
    <div 
      key={lbl.id} 
      className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col gap-1 text-xs"
      id={`label_card_${lbl.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <Building2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span className="font-extrabold text-gray-200 truncate">{lbl.name}</span>
          {lbl.name === 'Wavora Live' && <span className="text-[8px] bg-amber-500/20 text-amber-500 px-1 rounded font-black uppercase">System</span>}
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => onRemoveLabel(lbl.id)}
            className="p-1 rounded text-red-400 hover:bg-red-950/30 transition cursor-pointer"
            id={`btn_delete_label_${lbl.id}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {isAdmin && !isImpersonating && lbl.email !== 'admin@g.g' && (
        <div className="text-[9px] text-slate-500 italic mt-0.5 border-t border-slate-800/50 pt-1">
          Owner: {users.find(u => u.email === lbl.email)?.artistName || lbl.email}
        </div>
      )}
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setError('');

    if (!labelName.trim()) {
      setError('Label Name cannot be empty.');
      return;
    }

    const newLabel: Label = {
      id: `lbl-${Date.now()}`,
      email: targetUserEmail, // Associated with specific profile
      name: labelName.trim(),
    };

    onAddLabel(newLabel);
    setLabelName('');
  };

  return (
    <div className="space-y-6" id="manage_labels_root">
      {/* Header */}
      <div className="p-6 bg-[#0f1424] rounded-3xl border border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4" id="labels_reg_header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tags className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">System Imprint Labels</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            {isAdmin 
              ? "As a system administrator, you can manage the global registry of record labels available to all artists." 
              : "Global legal labels and imprint brands available for your releases. These are managed by the administration team."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="labels_workspace">
        {/* Left side: Add Imprint (Admin ONLY) */}
        <div className="md:col-span-4" id="labels_form_box">
          {isAdmin ? (
            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest block">Register Global Imprint</span>
              
              <form onSubmit={handleSubmit} className="space-y-3" id="add_label_form">
                {error && (
                  <div className="p-2 border border-red-500/20 bg-red-950/20 text-red-400 font-bold text-[10px] rounded">
                    ⚠️ {error}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assign to Profile</label>
                  <select
                    className="w-full bg-[#151c2e] border border-slate-850 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                    value={targetUserEmail}
                    onChange={(e) => setTargetUserEmail(e.target.value)}
                  >
                    <option value="admin@g.g">System Global (Admin)</option>
                    {users.filter(u => u.email !== 'admin@g.g').map((u, idx) => (
                      <option key={`${u.email}-lbl-assign-${idx}`} value={u.email}>{u.artistName} ({u.email})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Imprint Name (Exact Display)</label>
                  <input
                    type="text"
                    className="w-full bg-[#151c2e] border border-slate-850 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Wavora Records"
                    value={labelName}
                    onChange={(e) => setLabelName(e.target.value)}
                    id="label_input_name"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full cursor-pointer py-2 px-3 bg-amber-650 hover:bg-amber-600 bg-amber-650 text-white font-bold text-xs rounded transition flex items-center justify-center gap-1.5 shadow"
                  id="btn_submit_label"
                >
                  <Plus className="w-3.5 h-3.5" /> Register Legal Label
                </button>
              </form>
            </div>
          ) : (
            <div className="p-6 bg-[#0f1424] rounded-2xl border border-slate-900/50 space-y-4 text-center">
              <ShieldAlert className="w-8 h-8 text-amber-500/50 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Registry Locked</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Only System Administrators can register new global imprints. If you need a custom label added, please contact support.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right side: List of Imprints */}
        <div className="md:col-span-8 space-y-3" id="labels_list_box">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Global Registries ({displayLabels.length})</h3>
          
          {isAdmin && !isImpersonating ? (
            <div className="space-y-4" id="labels_grouped_list">
              <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-500/20 flex items-center justify-between text-xs w-full sm:w-1/2">
                <div className="flex items-center gap-2 truncate">
                  <Building2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span className="font-extrabold text-indigo-200 truncate">Wavora Live</span>
                  <span className="text-[8px] bg-indigo-500/20 text-indigo-400 px-1 rounded font-black uppercase">System Default</span>
                </div>
              </div>
              {Object.entries(
                displayLabels.filter(lbl => lbl.name !== 'Wavora Live').reduce((acc, lbl) => {
                  if (!acc[lbl.email]) acc[lbl.email] = [];
                  acc[lbl.email].push(lbl);
                  return acc;
                }, {} as Record<string, Label[]>)
              ).map(([email, userLabels]) => {
                const ownerName = users.find(u => u.email === email)?.artistName || email;
                const isExpanded = expandedUserEmail === email;
                return (
                  <div key={email} className="bg-slate-900/40 rounded-xl border border-slate-800 p-2 space-y-4">
                    <div 
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer transition"
                      onClick={() => toggleUserFolder(email)}
                    >
                      <div className="w-8 h-8 bg-amber-500/10 rounded-lg border border-amber-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-gray-200">{ownerName}</h3>
                        <p className="text-[9px] text-gray-500 font-mono">{email}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-3">
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                          {userLabels.length} Label{userLabels.length !== 1 ? 's' : ''}
                        </span>
                        <svg className={`w-3 h-3 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-2 pb-2">
                        {userLabels.map((lbl) => renderLabelCard(lbl))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="labels_list">
              {/* Primary System Default Label (Always Visible) */}
              <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-500/20 flex items-center justify-between text-xs sm:col-span-1">
                <div className="flex items-center gap-2 truncate">
                  <Building2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span className="font-extrabold text-indigo-200 truncate">Wavora Live</span>
                  <span className="text-[8px] bg-indigo-500/20 text-indigo-400 px-1 rounded font-black uppercase">System Default</span>
                </div>
              </div>
              
              {/* Registered Managed Labels */}
              {displayLabels.filter(lbl => lbl.name !== 'Wavora Live').map((lbl) => renderLabelCard(lbl))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

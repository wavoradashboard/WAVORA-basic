import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, KeyRound, FileText, Shield, User as UserIcon, Check } from 'lucide-react';
import { User } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSavePassword: (currentPass: string, newPass: string) => { success: boolean; message: string };
}

export default function ProfileModal({ isOpen, onClose, currentUser, onSavePassword }: ProfileModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword || !newPassword) {
      setErrorMsg('Both current and new password fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMsg('New password cannot be the same as your current password.');
      return;
    }

    const result = onSavePassword(currentPassword, newPassword);
    if (result.success) {
      setSuccessMsg(result.message);
      setCurrentPassword('');
      setNewPassword('');
    } else {
      setErrorMsg(result.message);
    }
  };

  // Get plan badge styling
  const getPlanBadge = (plan: 'Basic') => {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase bg-[#1A1A1A] border border-[#2F2F2F] text-gray-300" id="badge_basic">
        Basic Tier
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md overflow-y-auto p-4" id="profile_modal_overlay">
      <div className="flex min-h-full items-center justify-center">
        {/* Backdrop Trigger for clicks outside */}
        <div 
          className="fixed inset-0 cursor-pointer -z-10" 
          onClick={onClose} 
          id="profile_modal_backdrop"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-[#0F0F0F] border border-[#232323] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] my-auto"
          id="profile_modal_box"
        >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20" id="profile_modal_header">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/25 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-[#6366F1]" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">Artist Profile Suite</h2>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Metadata, Security, and Terms</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#1C1C1C] text-gray-400 hover:text-white transition cursor-pointer"
            id="btn_close_profile_modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" id="profile_modal_body">
          
          {/* Section 1: User details card */}
          <div className="p-5 bg-[#141414] rounded-2xl border border-[rgba(255,255,255,0.1)] space-y-4" id="profile_user_details">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#6366F1] text-black font-black text-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/10">
                  {currentUser.artistName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-black tracking-tight text-white uppercase">{currentUser.artistName}</h3>
                  <p className="text-xs text-gray-400 font-mono font-medium">{currentUser.email}</p>
                </div>
              </div>
              <div>
                {getPlanBadge(currentUser.plan)}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left font-mono">
              <div>
                <span className="block text-[9px] text-gray-500 uppercase tracking-wider">REGISTRATION DATE</span>
                <span className="text-xs text-gray-300">
                  {new Date(currentUser.registeredAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 uppercase tracking-wider">PLAN END DATE</span>
                <span className="text-xs text-indigo-400 font-bold">
                  {currentUser.planEndDate ? (
                    new Date(currentUser.planEndDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  ) : (
                    'Indefinite'
                  )}
                </span>
              </div>
              <div>
                <span className="block text-[9px] text-gray-500 uppercase tracking-wider">ACCOUNT METRIC PIN</span>
                <span className="text-xs text-[#6366F1] font-bold">
                  VERIFIED_DSP_NODE
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Change Password Segment */}
          <div className="p-5 bg-[#141414] rounded-2xl border border-[rgba(255,255,255,0.1)] text-left" id="profile_change_password">
            <span className="text-xs font-black text-white uppercase tracking-widest block mb-4 flex items-center gap-1.5 border-b border-white/10 pb-2">
              <KeyRound className="w-3.5 h-3.5 text-[#6366F1]" /> Change Password Section
            </span>

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-black border border-white/10 rounded p-2.5 text-xs text-white outline-none focus:border-[#6366F1]"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    id="profile_current_password_input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    New Security Password
                  </label>
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    className="w-full bg-black border border-white/10 rounded p-2.5 text-xs text-white outline-none focus:border-[#6366F1]"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    id="profile_new_password_input"
                  />
                </div>
              </div>

              {/* Action feedback notifications */}
              {errorMsg && (
                <div className="p-2.5 text-xs text-red-400 bg-red-950/20 border border-red-500/20 rounded font-mono" id="profile_password_error">
                  ⚠ {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-2.5 text-xs text-indigo-400 bg-indigo-950/20 border border-indigo-500/20 rounded font-mono flex items-center gap-1.5" id="profile_password_success">
                  <Check className="w-4 h-4" /> {successMsg}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#6366F1] text-black hover:bg-[#818CF8] font-black text-xs uppercase tracking-wider rounded transition cursor-pointer"
                  id="btn_save_new_password"
                >
                  Update Account Password
                </button>
              </div>
            </form>
          </div>

          {/* Section 3: Terms and Conditions Area */}
          <div className="p-5 bg-[#141414] rounded-2xl border border-[rgba(255,255,255,0.1)] text-left" id="profile_terms_section">
            <span className="text-xs font-black text-white uppercase tracking-widest block mb-3 flex items-center gap-1.5 border-b border-white/10 pb-2">
              <FileText className="w-3.5 h-3.5 text-gray-400" /> Platform Rules & Distribution Agreement
            </span>

            <div 
              className="h-32 rounded bg-black border border-white/10 p-3 text-[11px] text-gray-400 font-sans overflow-y-auto leading-relaxed space-y-2.5 scrollbar-thin shadow-inner"
              id="platform_terms_scrollbox"
            >
              <p className="font-bold text-gray-200">1. CORE INTELLECTUAL PROPERTY & UPLOAD POLICY</p>
              <p>
                By registering and submitting digital music items to Wavora Live, you guarantee and warrant that you hold 100% of the underlying copyrights, master rights, mechanical licenses, and publishing credits for every composition uploaded under your associated unique user address.
              </p>
              <p className="font-bold text-gray-200">2. FORBIDDEN CONTENT & INFRINGEMENT</p>
              <p>
                Wavora Live enforces a zero-tolerance response code toward unauthorized bootlegs, Uncleared Samples, dynamic loops, copyright infringement, and AI-simulated recordings impersonating existing copyrighted entities without express legal authorization. Any violations will result in instantaneous account seizure, catalog removal, and indefinite royalty forfeiture.
              </p>
              <p className="font-bold text-gray-200">3. ROYALTYING & STORE DISTRIBUTION</p>
              <p>
                Royalties and monthly statement reports compiled from major Digital Service Providers (DSPs) are aggregated and disseminated within forty-five (45) days from the close of each corresponding monthly cycle. Dispersal triggers are strictly tied to real platform reports and subject to auditing rules.
              </p>
              <p className="font-bold text-gray-200">4. METADATA COMPLIANCE MANDATES</p>
              <p>
                All tracks must be meticulously labeled with genuine fields for composer, primary lyricist, main producer, primary vocals, and subgenres. Artworks containing URL configurations, offensive pixels, or trademarked logos are subject to reject decisions during human-curated reviews.
              </p>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-gray-500 font-mono uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-gray-500" /> End-to-End Cryptographic Validation Active
            </div>
          </div>
          
        </div>
        </motion.div>
      </div>
    </div>
  );
}

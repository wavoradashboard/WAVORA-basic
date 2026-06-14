import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HelpCircle, MessagesSquare, Youtube, Music, Send, CheckCircle2, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { User, SupportQuery, OacApplication } from '../types';

interface SupportPageProps {
  currentUser: User;
  supportQueries: SupportQuery[];
  onSubmitSupportQuery: (queryText: string) => void;
  oacApplications: OacApplication[];
  onSubmitOacApplication: (youtubeLink: string, spotifyLink: string, fullName: string) => void;
}

export default function SupportPage({
  currentUser,
  supportQueries,
  onSubmitSupportQuery,
  oacApplications,
  onSubmitOacApplication,
}: SupportPageProps) {
  // Support ticket form state
  const [queryString, setQueryString] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState('');

  // OAC Application form state
  const [ytLink, setYtLink] = useState('');
  const [spotLink, setSpotLink] = useState('');
  const [applicantFullName, setApplicantFullName] = useState('');
  const [oacSuccess, setOacSuccess] = useState('');
  const [oacError, setOacError] = useState('');

  // Filtering user-specific logs
  const userQueries = supportQueries.filter(q => q.email === currentUser.email);
  const userOacs = oacApplications.filter(app => app.email === currentUser.email);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSuccess('');

    if (!queryString.trim()) {
      return;
    }

    onSubmitSupportQuery(queryString.trim());
    setQueryString('');
    setTicketSuccess('Your ticket was logged and dispatched! An admin agent will review this in the control panel.');
  };

  const handleOacSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOacSuccess('');
    setOacError('');

    if (!ytLink.trim() || !spotLink.trim() || !applicantFullName.trim()) {
      setOacError('Please provide all requested registration links and full name.');
      return;
    }

    // Verify link format
    const isValidYt = ytLink.toLowerCase().includes('youtube.com') || ytLink.toLowerCase().includes('youtu.be');
    const isValidSpot = spotLink.toLowerCase().includes('spotify.com');

    if (!isValidYt || !isValidSpot) {
      setOacError('Verification alert: Please supply authentic Spotify artist addresses & Youtube channel links.');
      return;
    }

    onSubmitOacApplication(ytLink.trim(), spotLink.trim(), applicantFullName.trim());
    setYtLink('');
    setSpotLink('');
    setApplicantFullName('');
    setOacSuccess('Application registered! Your official artist channel verification holds status "Pending Review".');
  };

  return (
    <div className="space-y-6" id="support_root">
      {/* Page Header */}
      <div className="p-6 bg-[#0f1424] rounded-3xl border border-slate-900" id="support_header">
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Artist Assisting Station</h2>
        </div>
        <p className="text-xs text-slate-450 max-w-xl">
          Apply for verification seals or dispatch direct tickets to the admin desk regarding billing streams, royalty audits, or release corrections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="support_panel_mesh">
        {/* Left side: Submit queries */}
        <div className="md:col-span-6 space-y-6" id="support_queries_box">
          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest block flex items-center gap-1.5">
              <MessagesSquare className="w-4 h-4 text-indigo-500" /> Option 1: Log Technical Ticket Description
            </span>

            <form onSubmit={handleTicketSubmit} className="space-y-3" id="ticket_form">
              {ticketSuccess && (
                <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-indigo-400 text-xs flex gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{ticketSuccess}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Detail problem coordinates</label>
                <textarea
                  rows={4}
                  className="w-full bg-[#151c2e] border border-slate-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-505"
                  placeholder="Need assistance with release corrections or custom label registrations..."
                  value={queryString}
                  onChange={(e) => setQueryString(e.target.value)}
                  id="support_input_query"
                />
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer py-2 px-4 bg-indigo-650 hover:bg-indigo-600 bg-indigo-600 text-white font-bold text-xs rounded transition flex items-center justify-center gap-1.5 shadow"
                id="btn_submit_support_query"
              >
                <Send className="w-3.5 h-3.5" /> Submit Query to Moderation
              </button>
            </form>
          </div>

          {/* Historical tickets logged */}
          <div className="space-y-3" id="tickets_list_layer">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Logged Ticket Logs</h3>
            {userQueries.length === 0 ? (
              <span className="text-xs text-slate-500 block italic">No open assistance tickets located.</span>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1" id="tickets_pile">
                {userQueries.map((q) => (
                  <div 
                    key={q.id} 
                    className="p-3 bg-slate-950/40 rounded-2xl border border-slate-850 text-xs space-y-2 text-left"
                    id={`support_query_card_${q.id}`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold uppercase">
                      <span>Submitted: {new Date(q.submittedAt).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.2 rounded font-extrabold ${q.status === 'Resolved' ? 'bg-indigo-950/30 text-indigo-400 border border-indigo-500/20' : 'bg-amber-950/30 text-amber-400 border border-amber-500/20'}`}>
                        {q.status}
                      </span>
                    </div>

                    <p className="text-gray-200 mt-1 leading-relaxed">"{q.queryText}"</p>

                    {q.replyText && (
                      <div className="p-2 bg-slate-900 border-l-2 border-indigo-500 rounded text-[11px] text-indigo-300 space-y-0.5">
                        <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wide">Admin Response Statement:</span>
                        <p className="italic">"{q.replyText}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Apply Official Artist Channel */}
        <div className="md:col-span-6" id="support_oac_box">
          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest block flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Option 2: Apply for Official Artist Channel (OAC)
            </span>

            <form onSubmit={handleOacSubmit} className="space-y-3" id="oac_form">
              {oacSuccess && (
                <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-indigo-400 text-xs flex gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{oacSuccess}</span>
                </div>
              )}

              {oacError && (
                <div className="p-3 bg-red-955/20 border border-red-500/20 rounded-xl text-red-400 text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{oacError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Artist Name Profile</label>
                <input
                  type="text"
                  disabled
                  className="w-full bg-[#1d263a] border border-slate-850 rounded-xl py-1.5 px-3 text-xs text-gray-400 cursor-not-allowed font-medium"
                  value={currentUser.artistName}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Legal Name</label>
                <input
                  type="text"
                  className="w-full bg-[#151c2e] border border-slate-850 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Luna Mae Smith"
                  value={applicantFullName}
                  onChange={(e) => setApplicantFullName(e.target.value)}
                  id="oac_input_name"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Spotify Artist Link ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500 text-[10px]">Spotify</div>
                  <input
                    type="url"
                    className="w-full bg-[#151c2e] border border-slate-850 rounded-xl py-1.5 pl-14 pr-3 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="https://open.spotify.com/artist/..."
                    value={spotLink}
                    onChange={(e) => setSpotLink(e.target.value)}
                    id="oac_input_spotify"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active YouTube Channel Link</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500 text-[10px]">YouTube</div>
                  <input
                    type="url"
                    className="w-full bg-[#151c2e] border border-slate-850 rounded-xl py-1.5 pl-16 pr-3 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="https://youtube.com/channel/..."
                    value={ytLink}
                    onChange={(e) => setYtLink(e.target.value)}
                    id="oac_input_youtube"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer py-2 px-4 bg-amber-655 hover:bg-amber-600 bg-amber-600 text-white font-bold text-xs rounded transition flex items-center justify-center gap-1.5 shadow"
                id="btn_submit_oac"
              >
                <Youtube className="w-3.5 h-3.5 text-red-500" /> Apply for Official Verification
              </button>
            </form>
          </div>

          {/* OAC Registry status display */}
          <div className="space-y-3 pt-4" id="oacs_registry_layer">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Application Track Histories</h3>
            {userOacs.length === 0 ? (
              <span className="text-xs text-slate-500 block italic">No validation registries located yet.</span>
            ) : (
              <div className="space-y-2" id="oacs_registry_stack">
                {userOacs.map((app) => (
                  <div 
                    key={app.id} 
                    className="p-3 bg-slate-950/40 rounded-2xl border border-slate-850 flex items-center justify-between text-xs"
                    id={`oac_card_${app.id}`}
                  >
                    <div className="text-left">
                      <span className="font-extrabold text-gray-300 block">OAC Seal Verification</span>
                      <span className="text-[10px] text-gray-500 uppercase">Applicant: {app.fullName}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${
                      app.status === 'Approved' ? 'bg-indigo-950/30 text-indigo-450 border border-indigo-500/20 text-indigo-400' :
                      app.status === 'Rejected' ? 'bg-red-955/20 text-red-400 border border-red-500/10' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

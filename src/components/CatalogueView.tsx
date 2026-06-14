import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Disc, Music, Calendar, AlertTriangle, CheckCircle, Clock, Trash2, ChevronDown, ChevronUp, UserCheck } from 'lucide-react';
import { Release, TrackStatus, User } from '../types';

interface CatalogueViewProps {
  currentUser: User;
  releases: Release[];
  onDeleteRelease: (id: string) => void;
  onEditRelease?: (release: Release) => void;
}

export default function CatalogueView({
  currentUser,
  releases,
  onDeleteRelease,
  onEditRelease,
}: CatalogueViewProps) {
  const [activeTab, setActiveTab] = useState<TrackStatus>('Submitted');
  const [expandedRelease, setExpandedRelease] = useState<string | null>(null);

  // Filter current user releases
  const userReleases = releases.filter(r => r.email === currentUser.email);
  const tabReleases = userReleases.filter(r => r.status === activeTab);

  const toggleExpand = (id: string) => {
    setExpandedRelease((prev) => (prev === id ? null : id));
  };

  const statusThemes = {
    Submitted: {
      color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
      icon: Clock,
      label: 'Submitted for Review',
      desc: 'Our moderation crew is reviewing metadata compliance and WAV consistency.',
    },
    Approved: {
      color: 'text-blue-400 border-blue-500/30 bg-blue-950/20',
      icon: CheckCircle,
      label: 'Approved by Admin',
      desc: 'Metadata fully validated. Transitioning to global streaming network delivery.',
    },
    Rejected: {
      color: 'text-red-400 border-red-500/30 bg-red-950/20',
      icon: AlertTriangle,
      label: 'Requires Correction',
      desc: 'Check reviewer comments below to correct metadata coordinates, artwork, or audio tags.',
    },
    Live: {
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20',
      icon: UserCheck,
      label: 'Delivered Live to DSPs',
      desc: 'Actively ingested on Spotify, Apple Music, and active streaming catalogs.',
    },
  };

  const getStatusCount = (status: TrackStatus) => {
    return userReleases.filter(r => r.status === status).length;
  };

  return (
    <div className="space-y-6" id="catalogue_root">
      {/* Header info */}
      <div className="p-6 bg-white/2 rounded-3xl border border-white/10 flex items-center justify-between" id="catalogue_header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-[#6366F1]" />
            <h2 className="text-base font-black text-white uppercase tracking-tighter">My Ingestion Catalogue</h2>
          </div>
          <p className="text-xs text-gray-405 leading-relaxed">
            Monitor the lifecycle of your dispatches as they traverse from review submittal to active ingestion arrays.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 p-1.5 bg-black rounded-2xl border border-white/10" id="catalogue_tabs">
        {(['Submitted', 'Approved', 'Rejected', 'Live'] as TrackStatus[]).map((tab) => {
          const isActive = activeTab === tab;
          const count = getStatusCount(tab);
          return (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 text-center font-bold text-[10px] sm:text-xs uppercase rounded-xl transition cursor-pointer relative ${
                isActive 
                  ? 'bg-[#6366F1]/10 text-[#6366F1] border-b-2 border-[#6366F1]' 
                  : 'text-gray-450 hover:text-white hover:bg-white/5'
              }`}
              id={`cat_tab_trigger_${tab}`}
            >
              <span className="">{tab}</span>
              <span className={`ml-1 px-1 rounded text-[8px] sm:text-[9px] font-black ${isActive ? 'bg-[#6366F1]/20 text-[#6366F1]' : 'bg-white/2 text-gray-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Banner info text about active state */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${statusThemes[activeTab].color}`} id="active_tab_instructions_banner">
        {React.createElement(statusThemes[activeTab].icon, { className: 'w-5 h-5 mt-0.5 flex-shrink-0' })}
        <div>
          <h4 className="font-bold text-gray-100">{statusThemes[activeTab].label}</h4>
          <p className="opacity-80 mt-1">{statusThemes[activeTab].desc}</p>
        </div>
      </div>

      {/* Catalogue releases dynamic grid */}
      {tabReleases.length === 0 ? (
        <div className="py-16 text-center bg-[#0e1424] rounded-3xl border border-slate-900 space-y-3" id="catalogue_empty_box">
          <Disc className="w-12 h-12 text-slate-705 mx-auto animate-spin" style={{ animationDuration: '6s' }} />
          <h3 className="text-sm font-bold text-gray-300">No releases found here.</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">There are no files registered with status "{activeTab}" for your account.</p>
        </div>
      ) : (
        <div className="space-y-4" id="catalogue_releases_stack">
          {tabReleases.map((rel) => {
            const isExpanded = expandedRelease === rel.id;
            return (
              <div 
                key={rel.id} 
                className="bg-[#0f1322] border border-slate-850 rounded-2xl overflow-hidden hover:border-slate-800 transition"
                id={`cat_release_card_${rel.id}`}
              >
                {/* Visual Header portion */}
                <div 
                  onClick={() => toggleExpand(rel.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={rel.coverArtSignedUrl || rel.coverArtUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop'} 
                      alt="" 
                      className="w-14 h-14 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-0.5 text-left">
                      <h4 className="font-extrabold text-white text-sm tracking-wide">{rel.albumName}</h4>
                      <p className="text-xs text-gray-400">
                        {rel.mainArtistName} 
                        {rel.featureArtists && rel.featureArtists.length > 0 ? ` (feat. ${rel.featureArtists.join(', ')})` : ''}
                        {rel.otherArtists && rel.otherArtists.length > 0 ? ` (other. ${rel.otherArtists.join(', ')})` : ''}
                      </p>
                      <div className="text-[10px] text-gray-500 flex items-center gap-2">
                        <span className="font-medium bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 uppercase text-[9px]">
                          {rel.type}
                        </span>
                        <span>•</span>
                        <span>{rel.tracks.length} track(s)</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono"><Calendar className="w-3 h-3" /> {rel.releaseDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Digital Dispatch ID</span>
                      <span className="font-mono text-[10px] text-slate-400">{rel.id}</span>
                    </div>

                    <div className="p-1 rounded bg-slate-900 border border-slate-800 text-gray-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded metadata portion */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-900 bg-slate-950/30 overflow-hidden"
                    >
                      <div className="p-5 space-y-4 text-xs">
                        {/* Rejection comment */}
                        {rel.status === 'Rejected' && rel.feedback && (
                          <div className="p-3.5 bg-red-950/30 border border-red-500/20 rounded-2xl space-y-1 text-red-300">
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block">Reviewer Rejection Log:</span>
                            <p className="italic">"{rel.feedback}"</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Metadata block */}
                          <div className="space-y-2">
                            <span className="text-[10px] text-gray-500 uppercase font-bold block tracking-wider">Release Coordinates</span>
                            <div className="space-y-1.5 text-gray-300">
                              <div className="flex justify-between">
                                <span className="text-slate-500 text-[11px]">Primary Language:</span>
                                <span>{rel.language}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 text-[11px]">Primary Genre:</span>
                                <span>{rel.genre || 'Electronic'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-550 text-[11px]">Sub-Genre tag:</span>
                                <span>{rel.subGenre || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 text-[11px]">Origination Type:</span>
                                <span>{rel.contentType}</span>
                              </div>
                              {rel.labelName && (
                                <div className="flex justify-between text-indigo-400">
                                  <span className="text-slate-500 text-[11px]">Vanity Label Imprint:</span>
                                  <span>{rel.labelName}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Publishing block */}
                          <div className="space-y-2">
                            <span className="text-[10px] text-gray-500 uppercase font-bold block tracking-wider">Sound Recording Publishing rights</span>
                            <div className="space-y-1 text-gray-300">
                              <div>
                                <span className="text-slate-500 text-[10px] block font-bold uppercase">C Line (© Publisher)</span>
                                <span className="font-mono text-[11px] text-indigo-300">{rel.cLine || 'System Automated Default'}</span>
                              </div>
                              <div className="pt-2">
                                <span className="text-slate-500 text-[10px] block font-bold uppercase">P Line (℗ Recording)</span>
                                <span className="font-mono text-[11px] text-indigo-300">{rel.pLine || 'System Automated Default'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Pitch text / Special requests */}
                          <div className="space-y-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-900">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Special Requests to Reviewer</span>
                            <p className="text-gray-400 text-[11px] leading-relaxed italic">
                              {rel.specialRequest ? `"${rel.specialRequest}"` : 'No special pitching requests submitted.'}
                            </p>
                          </div>
                        </div>

                        {/* Tracks array list */}
                        <div className="space-y-2 pt-2 border-t border-slate-900/60">
                          <span className="text-[10px] text-gray-500 uppercase font-black block tracking-widest">Master audio tracks list ({rel.tracks.length})</span>
                          
                          <div className="space-y-2">
                            {rel.tracks.map((track, idx) => (
                              <div key={track.id} className="p-3 bg-slate-900/80 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div className="space-y-1">
                                  <div className="font-bold text-gray-200">
                                    {idx + 1}. {track.trackName} {track.explicitContent && <span className="align-middle inline-block ml-1 px-1 py-0.2 rounded bg-red-950/40 text-[8px] font-black text-red-500 border border-red-900/20">EXPLICIT</span>}
                                  </div>
                                  <p className="text-[10px] text-gray-400">
                                    Producer: <span className="text-slate-200">{track.producer}</span> • Composer: <span className="text-slate-200">{track.composer}</span> • Lyricist: <span className="text-slate-200">{track.lyricist}</span>
                                  </p>
                                </div>

                                <div className="text-left sm:text-right space-y-1 min-w-[150px]">
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    WAV: {track.audioFileName || 'MasterAudio.wav'}
                                  </div>
                                  <div className="text-[10px] text-blue-400 font-semibold font-mono">
                                    ISRC: {track.isrc || 'Generated on approval'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action buttons (allow deleting release when Pending review) */}
                        <div className="flex justify-between items-center pt-3 border-t border-slate-900/60">
                          <span className="text-[10px] text-slate-500">Submitted at: {new Date(rel.submittedAt).toLocaleString()}</span>
                          
                          <div className="flex gap-2">
                            {rel.status === 'Rejected' && onEditRelease && (
                              <button
                                type="button"
                                onClick={() => onEditRelease(rel)}
                                className="px-3 py-1 bg-amber-950/20 hover:bg-amber-950/60 text-amber-400 font-bold rounded text-[10px] tracking-wide transition flex items-center gap-1 cursor-pointer"
                                id={`btn_edit_release_${rel.id}`}
                              >
                                Edit & Resubmit
                              </button>
                            )}
                            {(rel.status === 'Submitted' || rel.status === 'Rejected') && (
                              <button
                                type="button"
                                onClick={() => onDeleteRelease(rel.id)}
                                className="px-3 py-1 bg-red-950/20 hover:bg-red-950/60 text-red-400 font-bold rounded text-[10px] tracking-wide transition flex items-center gap-1 cursor-pointer"
                                id={`btn_delete_release_${rel.id}`}
                              >
                                <Trash2 className="w-3 h-3" /> Recall Submission
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

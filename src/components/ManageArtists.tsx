import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Users, Trash2, Globe, Disc, Instagram, Compass } from 'lucide-react';
import { ArtistProfile, User } from '../types';

interface ManageArtistsProps {
  currentUser: User;
  users: User[];
  managedArtists: ArtistProfile[];
  onAddArtist: (profile: ArtistProfile) => void;
  onRemoveArtist: (id: string) => void;
  isImpersonating?: boolean;
}

export default function ManageArtists({
  currentUser,
  users,
  managedArtists,
  onAddArtist,
  onRemoveArtist,
  isImpersonating = false,
}: ManageArtistsProps) {
  const [showForm, setShowForm] = useState(false);
  const [targetUserEmail, setTargetUserEmail] = useState(currentUser.email);
  const [artistName, setArtistName] = useState('');
  const [hasSpotify, setHasSpotify] = useState('no');
  const [hasApple, setHasApple] = useState('no');
  const [spotifyLink, setSpotifyLink] = useState('');
  const [appleMusicLink, setAppleMusicLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [formError, setFormError] = useState('');

  const isAdmin = currentUser.email === 'admin@g.g';

  // Default artist name to profile name if no artists added yet
  React.useEffect(() => {
    const userArtists = managedArtists.filter(a => a.email === currentUser.email);
    if (userArtists.length === 0 && !artistName && !showForm) {
      setArtistName(currentUser.artistName);
    }
  }, [managedArtists, currentUser.email, currentUser.artistName, showForm]);

  // Filter logic: 
  // 1. If impersonating: Show ONLY impersonated user's artists (privacy)
  // 2. If real Admin (and not impersonating): Show ALL (for system management)
  // 3. If Normal User: Show ONLY their own artists
  const displayArtists = (isAdmin && !isImpersonating) 
    ? managedArtists 
    : managedArtists.filter(art => art.email === currentUser.email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!artistName.trim()) {
      setFormError('Artist alias/name cannot be empty.');
      return;
    }

    if (!instagramLink.trim()) {
      setFormError('Instagram link is required.');
      return;
    }

    // Prepare links default or validate
    const profile: ArtistProfile = {
      id: `art-${Date.now()}`,
      email: isAdmin ? targetUserEmail : currentUser.email,
      name: artistName,
      spotifyLink: (hasSpotify === 'yes' && spotifyLink.trim()) ? spotifyLink.trim() : (hasSpotify === 'no' ? 'NONE' : 'https://open.spotify.com/artist/dummy_id'),
      appleMusicLink: (hasApple === 'yes' && appleMusicLink.trim()) ? appleMusicLink.trim() : (hasApple === 'no' ? 'NONE' : 'https://music.apple.com/artist/dummy_id'),
      instagramLink: instagramLink.trim(),
    };

    onAddArtist(profile);

    // Reset inputs
    setArtistName('');
    setHasSpotify('no');
    setHasApple('no');
    setSpotifyLink('');
    setAppleMusicLink('');
    setInstagramLink('');
    setShowForm(false);
  };

  const [expandedUserEmail, setExpandedUserEmail] = useState<string | null>(null);

  const toggleUserFolder = (email: string) => {
    setExpandedUserEmail(prev => prev === email ? null : email);
  };

  const renderArtistCard = (artist: ArtistProfile) => (
    <div 
      key={artist.id} 
      className="p-5 bg-gradient-to-b from-[#111625] to-[#0a0e1c] rounded-2xl border border-slate-850 flex flex-col justify-between"
      style={{ minHeight: '11rem' }}
      id={`artist_card_${artist.id}`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-extrabold text-white text-sm tracking-wide truncate">{artist.name}</h4>
          <span className="p-1 rounded bg-blue-950/40 text-blue-400 border border-blue-900/30 text-[9px] uppercase font-bold">
            Profile Linked
          </span>
        </div>
        
        {isAdmin && !isImpersonating && artist.email !== 'admin@g.g' && (
          <div className="text-[9px] text-blue-400/70 italic mb-3 font-mono">
            Owner: {users.find(u => u.email === artist.email)?.artistName || artist.email}
          </div>
        )}
        
        <div className="space-y-2 mt-2 text-xs text-gray-400">
          <div className="flex items-center gap-2 justify-between group/link truncate text-[11px]">
            <div className="flex items-center gap-2 truncate">
              <Globe className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              {artist.spotifyLink === 'NONE' ? (
                <span className="text-red-400/60 font-medium italic">No Spotify ID</span>
              ) : (
                <a href={artist.spotifyLink} target="_blank" rel="noreferrer" className="hover:text-violet-400 hover:underline text-gray-400 truncate">
                  Spotify Account Profile
                </a>
              )}
            </div>
            {artist.spotifyLink && artist.spotifyLink !== 'NONE' && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(artist.spotifyLink);
                  alert('Spotify URL copied to clipboard');
                }}
                className="opacity-100 lg:opacity-0 lg:group-hover/link:opacity-100 p-0.5 hover:text-white transition cursor-pointer text-[10px]"
                title="Copy Link"
              >
                Copy
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 justify-between group/link truncate text-[11px]">
            <div className="flex items-center gap-2 truncate">
              <Disc className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              {artist.appleMusicLink === 'NONE' ? (
                <span className="text-red-400/60 font-medium italic">No Apple ID</span>
              ) : (
                <a href={artist.appleMusicLink} target="_blank" rel="noreferrer" className="hover:text-red-400 hover:underline text-gray-400 truncate">
                  Apple Music Profile
                </a>
              )}
            </div>
            {artist.appleMusicLink && artist.appleMusicLink !== 'NONE' && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(artist.appleMusicLink);
                  alert('Apple Music URL copied to clipboard');
                }}
                className="opacity-100 lg:opacity-0 lg:group-hover/link:opacity-100 p-0.5 hover:text-white transition cursor-pointer text-[10px]"
                title="Copy Link"
              >
                Copy
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 justify-between group/link truncate text-[11px]">
            <div className="flex items-center gap-2 truncate">
              <Instagram className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              {artist.instagramLink === 'NONE' ? (
                <span className="text-red-400/60 font-medium italic">No Instagram</span>
              ) : (
                <a href={artist.instagramLink} target="_blank" rel="noreferrer" className="hover:text-pink-400 hover:underline text-gray-400 truncate">
                  Instagram Link
                </a>
              )}
            </div>
            {artist.instagramLink && artist.instagramLink !== 'NONE' && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(artist.instagramLink);
                  alert('Instagram URL copied to clipboard');
                }}
                className="opacity-100 lg:opacity-0 lg:group-hover/link:opacity-100 p-0.5 hover:text-white transition cursor-pointer text-[10px]"
                title="Copy Link"
              >
                Copy
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-800/60 mt-2">
        <button
          type="button"
          onClick={() => onRemoveArtist(artist.id)}
          className="p-1 rounded bg-red-950/20 text-red-400 hover:bg-red-950/60 transition cursor-pointer"
          id={`btn_delete_artist_${artist.id}`}
          title="Remove Alias"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6" id="manage_artists_root">
      {/* Page description */}
      <div className="p-6 bg-[#0f1424] rounded-3xl border border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4" id="artist_reg_header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Managed Artist Profiles</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Register secondary guest features, aliases, or bands on your account. Once registered, these names can be selected inside the multi-track release wizard.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl flex items-center gap-1.5 transition self-start md:self-auto"
            id="btn_add_artist_trigger"
          >
            <Plus className="w-4 h-4" /> Add Managed Artist
          </button>
        )}
      </div>

      {showForm && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-[#0f1424] rounded-3xl border border-blue-900/40 shadow-2xl space-y-4"
          id="add_artist_form_container"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Register New Sub-Artist Portfolio</span>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-200 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="add_artist_form">
            {formError && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-500 font-semibold">
                ⚠️ {formError}
              </div>
            )}

            {isAdmin && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Assign to Profile</label>
                <select
                  className="w-full bg-[#151c2e] border border-slate-850 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  value={targetUserEmail}
                  onChange={(e) => setTargetUserEmail(e.target.value)}
                >
                  <option value="admin@g.g">Global Admin Asset</option>
                  {users.filter(u => u.email !== 'admin@g.g').map((u, idx) => (
                    <option key={`${u.email}-art-assign-${idx}`} value={u.email}>{u.artistName} ({u.email})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Artist Name / Studio Alias</label>
                <input
                  type="text"
                  className="w-full bg-[#151c2e] border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. DJ Solar Void"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  id="artist_input_name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Have a Spotify ID?</label>
                <div className="flex gap-4">
                  {['yes', 'no'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasSpotify"
                        value={opt}
                        checked={hasSpotify === opt}
                        onChange={(e) => setHasSpotify(e.target.value)}
                        className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700"
                      />
                      <span className="text-xs text-slate-300 capitalize">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {hasSpotify === 'yes' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Spotify Artist Profile URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs">Spotify</div>
                    <input
                      type="url"
                      className="w-full bg-[#151c2e] border border-slate-800 rounded-xl py-2 pl-16 pr-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      placeholder="https://open.spotify.com/artist/..."
                      value={spotifyLink}
                      onChange={(e) => setSpotifyLink(e.target.value)}
                      id="artist_input_spotify"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Have an Apple ID?</label>
                <div className="flex gap-4">
                  {['yes', 'no'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="hasApple"
                        value={opt}
                        checked={hasApple === opt}
                        onChange={(e) => setHasApple(e.target.value)}
                        className="w-4 h-4 text-pink-600 bg-slate-900 border-slate-700"
                      />
                      <span className="text-xs text-slate-300 capitalize">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {hasApple === 'yes' && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Apple Music Artist Profile URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs">Apple</div>
                    <input
                      type="url"
                      className="w-full bg-[#151c2e] border border-slate-800 rounded-xl py-2 pl-16 pr-3 text-sm text-white focus:outline-none focus:border-blue-500"
                      placeholder="https://music.apple.com/artist/..."
                      value={appleMusicLink}
                      onChange={(e) => setAppleMusicLink(e.target.value)}
                      id="artist_input_apple"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Instagram Handler link *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs">IG</div>
                  <input
                    type="url"
                    required
                    className="w-full bg-[#151c2e] border border-slate-800 rounded-xl py-2 pl-12 pr-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://instagram.com/..."
                    value={instagramLink}
                    onChange={(e) => setInstagramLink(e.target.value)}
                    id="artist_input_instagram"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full cursor-pointer py-2 px-4 bg-blue-600 hover:bg-blue-505 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition shadow-2xl shadow-indigo-500/10 shadow-blue-900/30"
              id="btn_submit_artist"
            >
              Verify & Add Artist Alias
            </button>
          </form>
        </motion.div>
      )}

      {/* Artists grid */}
      {displayArtists.length === 0 ? (
        <div className="p-12 text-center bg-[#0e1424] rounded-3xl border border-slate-900 space-y-3" id="no_artists_box">
          <Users className="w-12 h-12 text-slate-700 mx-auto" />
          <h3 className="text-sm font-bold text-gray-200">No managed artists found.</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">Click "Add Managed Artist" to configure aliases that populate guests and collaborators inputs on metadata sheets.</p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded text-white cursor-pointer mt-1"
            id="btn_add_first_artist"
          >
            Add Main Artist Profile
          </button>
        </div>
      ) : (
        isAdmin && !isImpersonating ? (
          <div className="space-y-6" id="artists_grouped_list">
            {Object.entries(
              displayArtists.reduce((acc, artist) => {
                if (!acc[artist.email]) acc[artist.email] = [];
                acc[artist.email].push(artist);
                return acc;
              }, {} as Record<string, ArtistProfile[]>)
            ).map(([email, userArtists]) => {
              const ownerName = users.find(u => u.email === email)?.artistName || email;
              const isExpanded = expandedUserEmail === email;
              return (
                <div key={email} className="bg-slate-900/40 rounded-2xl border border-slate-800 p-2 space-y-4">
                  <div 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 cursor-pointer transition"
                    onClick={() => toggleUserFolder(email)}
                  >
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl border border-blue-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-200">{ownerName}</h3>
                      <p className="text-[10px] text-gray-500 font-mono">{email}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                        {userArtists.length} Artist{userArtists.length !== 1 ? 's' : ''}
                      </span>
                      <svg className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-3 pb-3">
                      {userArtists.map((artist) => renderArtistCard(artist))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="artists_grid_list">
            {displayArtists.map((artist) => renderArtistCard(artist))}
          </div>
        )
      )}
    </div>
  );
}

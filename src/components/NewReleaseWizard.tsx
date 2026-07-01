import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Music, 
  Image as ImageIcon, 
  Sparkles, 
  FileCheck, 
  AlertCircle,
  AudioLines,
  HelpCircle,
  Compass,
  X,
  Users
} from 'lucide-react';
import { User, Release, ReleaseTrack, ArtistProfile, Label } from '../types';
import { supabase } from '../supabase';

export const GENRE_DATA: Record<string, string[]> = {
  "Alternative": ["Indie Rock", "Grunge", "Gothic Rock", "College Rock", "Britpop", "Dream Pop", "Shoegaze", "Post-Punk", "Noise Rock"],
  "Anime": ["J-Pop", "OST", "Vocaloid", "J-Rock", "Ani-Song"],
  "Blues": ["Delta Blues", "Chicago Blues", "Electric Blues", "Blues Rock", "Acoustic Blues", "Soul Blues"],
  "Brazilian": ["Bossa Nova", "Samba", "MPB", "Forró", "Pagode", "Sertanejo", "Funk Carioca"],
  "Children's Music": ["Nursery Rhymes", "Lullabies", "Educational", "Sing-Along", "Storytelling"],
  "Christian & Gospel": ["Contemporary Christian", "Gospel", "Worship", "Christian Rock", "Christian Hip-Hop"],
  "Classical": ["Baroque", "Romantic", "Classical Period", "Modern Classical", "Orchestral", "Opera", "Chamber Music", "Choral"],
  "Comedy": ["Stand-up", "Parody", "Satire", "Musical Comedy", "Novelty"],
  "Country": ["Traditional Country", "Outlaw Country", "Bluegrass", "Country Pop", "Honky Tonk", "Americana"],
  "Dance": ["House", "Techno", "Trance", "Dubstep", "Drum & Bass", "Hardstyle", "Eurodance", "Bassline", "Garage"],
  "Electronic": ["Ambient", "Downtempo", "IDM", "Synthwave", "Electro", "Chiptune", "Industrial", "Trip-Hop", "Folktronica"],
  "Folk": ["Traditional Folk", "Contemporary Folk", "Indie Folk", "Folk Rock", "Celtic", "Americana"],
  "Hip-Hop / Rap": ["Boom Bap", "Trap", "Lofi Hip Hop", "West Coast", "East Coast", "Conscious Rap", "Drill", "Grime", "Cloud Rap"],
  "Holiday": ["Christmas", "Halloween", "Thanksgiving", "New Year", "Hanukkah"],
  "Indian": ["Bollywood", "Hindustani Classical", "Carnatic Classical", "Ghazal", "Punjabi Pop", "Indie Pop", "Devotional", "Folk Indian"],
  "Instrumental": ["Solo Piano", "Ambient Instrumental", "Acoustic Guitar", "Orchestral Instrumental", "Cinematic", "Post-Rock"],
  "Jazz": ["Swing", "Bebop", "Cool Jazz", "Fusion", "Vocal Jazz", "Smooth Jazz", "Hard Bop", "Acid Jazz"],
  "Latin": ["Reggaeton", "Salsa", "Bachata", "Merengue", "Latin Pop", "Cumbia", "Latin Rock", "Mariachi"],
  "Metal": ["Heavy Metal", "Thrash Metal", "Death Metal", "Black Metal", "Power Metal", "Progressive Metal", "Doom Metal", "Nu Metal", "Metalcore"],
  "New Age": ["Meditation", "Healing", "Nature Sounds", "Spiritual", "Relaxation", "Astral Music"],
  "Pop": ["Synthpop", "Dance-Pop", "Indie Pop", "Teen Pop", "K-Pop", "J-Pop", "Art Pop", "Acoustic Pop"],
  "Punk": ["Pop Punk", "Hardcore Punk", "Post-Punk", "Ska Punk", "Skate Punk", "Anarcho Punk"],
  "R&B / Soul": ["Contemporary R&B", "Neo-Soul", "Motown", "Funk", "Quiet Storm", "Southern Soul", "Disco"],
  "Reggae": ["Roots Reggae", "Dancehall", "Dub", "Ska", "Rocksteady", "Lovers Rock"],
  "Rock": ["Classic Rock", "Hard Rock", "Progressive Rock", "Psychedelic Rock", "Garage Rock", "Glam Rock", "Arena Rock"],
  "Singer/Songwriter": ["Acoustic", "Folk-Pop", "Indie Songwriter", "Chamber Pop", "Bedroom Pop"],
  "Soundtrack": ["Film Score", "Video Game Music", "Television Theme", "Musical Theatre", "Anime OST"],
  "Spoken Word": ["Poetry", "Audiobooks", "Motivating Speech", "ASMR", "Podcast", "Comedy Monologue"],
  "World": ["Afrobeat", "Flamenco", "Celtic Folk", "K-Pop (World)", "Rai", "Reggae (World)", "Middle Eastern", "Carnatic"]
};

export const LANGUAGES_LIST = [
  "English",
  "Spanish",
  "Portuguese",
  "Hindi",
  "Punjabi",
  "Korean",
  "Japanese",
  "French",
  "German",
  "Italian",
  "Mandarin",
  "Cantonese",
  "Turkish",
  "Russian",
  "Arabic",
  "Dutch",
  "Swedish",
  "Polish",
  "Vietnamese",
  "Thai",
  "Indonesian",
  "Swahili",
  "Greek",
  "Tagalog",
  "Tamil",
  "Telugu",
  "Bengali",
  "Marathi",
  "Latin",
  "Instrumental (No Lyrics)"
];

interface NewReleaseWizardProps {
  currentUser: User;
  managedArtists: ArtistProfile[];
  managedLabels: Label[];
  onSubmitRelease: (release: Release) => void;
  setCurrentTab: (tab: string) => void;
  editingRelease?: Release | null;
  onCancelEdit?: () => void;
}

export default function NewReleaseWizard({
  currentUser,
  managedArtists,
  managedLabels,
  onSubmitRelease,
  setCurrentTab,
  editingRelease,
  onCancelEdit,
}: NewReleaseWizardProps) {
  const isAppAdmin = currentUser.email === 'admin@g.g' || currentUser.email === 'wavoradashboard@gmail.com';
  const filteredArtists = managedArtists.filter(art => art.email === currentUser.email);
  const filteredLabels = managedLabels.filter(lbl => isAppAdmin || lbl.email === currentUser.email);

  if (filteredArtists.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-12 text-center bg-[#0f1424] rounded-3xl border border-slate-900 shadow-2xl space-y-6 max-w-2xl mx-auto my-12"
      >
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
          <Users className="w-10 h-10 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Artist Profile Required</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            To maintain metadata compliance across digital platforms, you must configure your artist profile details (links, bio, etc.) before initiating a new release.
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button 
            onClick={() => setCurrentTab('manage-artists')}
            className="w-full sm:w-auto px-8 py-3 bg-[#6366F1] hover:bg-[#818CF8] text-black font-black rounded-xl transition active:scale-95 flex items-center justify-center gap-2 uppercase tracking-tight text-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Add My Artist Profile
          </button>
          <button 
            onClick={() => setCurrentTab('home')}
            className="w-full sm:w-auto px-8 py-3 bg-transparent hover:bg-white/5 text-gray-400 font-bold rounded-xl transition border border-slate-800 uppercase tracking-tight text-xs cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  const isFree = true;
  const isPro = false;
  const isElite = false;

  // Wizard state
  const [step, setStep] = useState(1);
  const [coverArtUploadProgress, setCoverArtUploadProgress] = useState<number>(0);
  const [trackUploadProgress, setTrackUploadProgress] = useState<Record<number, number>>({});
  const [error, setError] = useState('');

  // Step 1 parameters
  const [albumName, setAlbumName] = useState('');
  const [releaseType, setReleaseType] = useState<'Single' | 'EP' | 'Album'>('Single');
  const [featureArtists, setFeatureArtists] = useState<string[]>([]);
  const [otherArtists, setOtherArtists] = useState<string[]>([]);
  const [selectedFeatureToAdd, setSelectedFeatureToAdd] = useState('');
  const [primaryArtists, setPrimaryArtists] = useState<string[]>([currentUser.artistName]);
  const [selectedPrimaryToAdd, setSelectedPrimaryToAdd] = useState('');
  const [language, setLanguage] = useState('');
  const [contentType, setContentType] = useState<'Original' | 'Non-Exclusive' | 'AI Music' | 'Licensed' | 'AI' | ''>('');
  const [numTracks, setNumTracks] = useState(1);
  const [genre, setGenre] = useState('');
  const [subGenre, setSubGenre] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [cLine, setCLine] = useState('© Wavora Live');
  const [pLine, setPLine] = useState('℗ Wavora Live');
  const [releaseDate, setReleaseDate] = useState('');
  const [upc, setUpc] = useState('');

  const getMinReleaseDate = (): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysToAdd = isElite ? 1 : isPro ? 3 : 7;
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + daysToAdd);
    return minDate;
  };

  const getMinReleaseDateString = (): string => {
    const minDate = getMinReleaseDate();
    const year = minDate.getFullYear();
    const month = String(minDate.getMonth() + 1).padStart(2, '0');
    const day = String(minDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Set default release date based on plan
  useEffect(() => {
    if (!releaseDate) {
      setReleaseDate(getMinReleaseDateString());
    }
  }, [isElite, isPro, releaseDate]);

  // Synchronize C Line and P Line with the selected Publishing Label
  useEffect(() => {
    const label = selectedLabel || 'Wavora Live';
    setCLine(`© ${label}`);
    setPLine(`℗ ${label}`);
  }, [selectedLabel]);

  // Artwork file info
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [coverArtUrl, setCoverArtUrl] = useState('');
  const [artworkWarning, setArtworkWarning] = useState('');

  // Track detail state (holds dynamic array depending on numTracks)
  const [trackList, setTrackList] = useState<ReleaseTrack[]>([]);

  // Step 3 parameter
  const [specialRequest, setSpecialRequest] = useState('');

  // Populate data if editing an existing release
  useEffect(() => {
    if (editingRelease) {
      setAlbumName(editingRelease.albumName);
      setReleaseType(editingRelease.type);
      setFeatureArtists(editingRelease.featureArtists);
      setOtherArtists(editingRelease.otherArtists || []);
      
      const primaryNames = editingRelease.mainArtistName.split(',').map(n => n.trim()).filter(Boolean);
      setPrimaryArtists(primaryNames.length > 0 ? primaryNames : [currentUser.artistName]);
      
      setLanguage(editingRelease.language);
      setContentType(editingRelease.contentType);
      setNumTracks(editingRelease.numTracks);
      setGenre(editingRelease.genre);
      setSubGenre(editingRelease.subGenre);
      setSelectedLabel(editingRelease.labelName || '');
      setCLine(editingRelease.cLine || `© ${editingRelease.labelName || 'Wavora Live'}`);
      setPLine(editingRelease.pLine || `℗ ${editingRelease.labelName || 'Wavora Live'}`);
      setReleaseDate(editingRelease.releaseDate);
      setUpc(editingRelease.upc || '');
      setCoverArtUrl(editingRelease.coverArtUrl);
      setCoverArtPreview(editingRelease.coverArtSignedUrl || editingRelease.coverArtUrl);
      setTrackList(editingRelease.tracks);
      setSpecialRequest(editingRelease.specialRequest || '');
    }
  }, [editingRelease, currentUser.artistName]);

  // Sync trackList length with numTracks and primaryArtists
  useEffect(() => {
    setTrackList((prev) => {
      // If editing release, and trackList length already matches numTracks, skip
      if (editingRelease && prev.length === numTracks && prev.length > 0) return prev;
      
      let updated = [...prev];
      if (updated.length < numTracks) {
        // Append new empty templates
        for (let i = updated.length; i < numTracks; i++) {
          updated.push({
            id: `trk-temp-${Date.now()}-${i}`,
            trackName: '',
            mainArtistName: primaryArtists.length > 0 ? primaryArtists.join(', ') : 'Unknown Artist',
            featureArtists: [],
            otherArtists: [],
            genre: '',
            subGenre: '',
            language: '',
            producer: '',
            lyricist: '',
            composer: '',
            isrc: '',
            explicitContent: false,
            contentId: 'No',
            lyrics: '',
            googleDriveLink: '',
            crtbCut: '',
          });
        }
      } else if (updated.length > numTracks) {
        // Trim back
        updated = updated.slice(0, numTracks);
      }
      
      // Update empty main artists (or initialized but user clears it) with standard primary
      return updated.map(t => ({
        ...t,
        mainArtistName: t.mainArtistName ? t.mainArtistName : primaryArtists.join(', ')
      }));
    });
  }, [numTracks, primaryArtists, editingRelease]);

  // Cover Art Preview for UI
  const [coverArtPreview, setCoverArtPreview] = useState('');

  // Cover image validator mock/simulation
  const handleCoverArtChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArtworkWarning('');

    // Standard format constraint validation
    const fileType = file.type;
    const isJPEG = fileType === 'image/jpeg' || fileType === 'image/jpg' || fileType === 'image/pjpeg';

    if (!isJPEG) {
      setArtworkWarning('Cover Art must be in JPEG/JPG format.');
      setCoverArtFile(null);
      return;
    }

    // Dimension constraint validation
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      URL.revokeObjectURL(img.src);
      if (img.width !== 3000 || img.height !== 3000) {
        setArtworkWarning('Cover Art must be exactly 3000x3000 pixels.');
        setCoverArtFile(null);
        return;
      }
      
      setCoverArtFile(file);
      setCoverArtUploadProgress(1);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setCoverArtUploadProgress(prev => {
          if (prev >= 95) return 95;
          return prev + Math.floor(Math.random() * 10) + 5;
        });
      }, 200);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) throw new Error('Not authenticated');

        const ext = file.name.split('.').pop() || 'jpg';
        const safeArtist = (primaryArtists.length > 0 ? primaryArtists.join('_') : 'Unknown_Artist').replace(/[^a-zA-Z0-9_-]/g, '_');
        const safeRelease = (albumName || 'Unknown_Release').replace(/[^a-zA-Z0-9_-]/g, '_');
        const storagePath = `${session.user.id}/${safeArtist}/${safeRelease}/cover/cover_${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('app-files')
          .upload(storagePath, file);

        if (uploadError) throw uploadError;

        // Save the storage path for database submission
        setCoverArtUrl(storagePath);
        
        // Get signed URL for preview immediately
        const { data: urlData } = await supabase.storage
          .from('app-files')
          .createSignedUrl(storagePath, 3600);

        if (urlData?.signedUrl) {
          setCoverArtPreview(urlData.signedUrl);
        }
        setCoverArtUploadProgress(100);
        setTimeout(() => setCoverArtUploadProgress(0), 1000);
      } catch(err: any) {
        setArtworkWarning('Failed to upload via Supabase: ' + err.message);
        setCoverArtUploadProgress(0);
      } finally {
        clearInterval(progressInterval);
      }
    };
    img.onerror = () => {
      setArtworkWarning('Invalid image file.');
      setCoverArtFile(null);
    };
  };

  const selectPrebuiltCover = (url: string) => {
    setCoverArtUrl(url); // Stored as the raw URL in database since it's an external url
    setCoverArtPreview(url);
    setArtworkWarning('');
  };

  const handleTrackFieldChange = (index: number, field: keyof ReleaseTrack, value: any) => {
    setTrackList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAudioUploadMock = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size first: 50MB (50 * 1024 * 1024 = 52428800 bytes)
    const maxSizeBytes = 50 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert('Limit Exceeded: Audio files must be under 50MB in size.');
      return;
    }

    const isWav = file.name.toLowerCase().endsWith('.wav');
    const isMp3 = file.name.toLowerCase().endsWith('.mp3');
    if (!isWav && !isMp3) {
      alert('Strict Check: Audio is required in .wav or .mp3 format.');
      return;
    }

    setTrackUploadProgress(prev => ({ ...prev, [index]: 1 }));

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setTrackUploadProgress(prev => {
        const current = prev[index] || 1;
        if (current >= 95) return { ...prev, [index]: 95 };
        return { ...prev, [index]: current + Math.floor(Math.random() * 8) + 4 };
      });
    }, 250);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const safeArtist = (primaryArtists.length > 0 ? primaryArtists.join('_') : 'Unknown_Artist').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeRelease = (albumName || 'Unknown_Release').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeTrack = (trackList[index].title || `Track_${index + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileExt = file.name.toLowerCase().endsWith('.wav') ? 'wav' : 'mp3';
      const storagePath = `${session.user.id}/${safeArtist}/${safeRelease}/Track/${safeTrack}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('app-files')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      handleTrackFieldChange(index, 'audioFileName', storagePath);
      setTrackUploadProgress(prev => ({ ...prev, [index]: 100 }));
      setTimeout(() => {
        setTrackUploadProgress(prev => ({ ...prev, [index]: 0 }));
      }, 1000);
    } catch(err: any) {
      alert('Upload failed: ' + err.message);
      setTrackUploadProgress(prev => ({ ...prev, [index]: 0 }));
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleRemovePrimaryArtist = (artistToRemove: string) => {
    if (artistToRemove === currentUser.artistName) return; // Main artist is protected
    setPrimaryArtists(prev => prev.filter(name => name !== artistToRemove));
  };

  const handleAddPrimaryArtistClick = () => {
    if (selectedPrimaryToAdd && !primaryArtists.includes(selectedPrimaryToAdd)) {
      setPrimaryArtists(prev => [...prev, selectedPrimaryToAdd]);
      // Remove from featured if already selected
      setOtherArtists(prev => prev.filter(name => name !== selectedPrimaryToAdd));
      setSelectedPrimaryToAdd('');
    }
  };

  // Multiple selectors trigger
  const handleFeatureArtistToggle = (artistName: string) => {
    setFeatureArtists(prev => {
      if (prev.includes(artistName)) {
        return prev.filter(name => name !== artistName);
      } else {
        return [...prev, artistName];
      }
    });
  };

  const handleAddFeatureArtistClick = () => {
    if (selectedFeatureToAdd && !featureArtists.includes(selectedFeatureToAdd) && !primaryArtists.includes(selectedFeatureToAdd)) {
      setFeatureArtists(prev => [...prev, selectedFeatureToAdd]);
      setSelectedFeatureToAdd('');
    }
  };

  const handleRemoveFeatureArtist = (nameToRemove: string) => {
    setFeatureArtists(prev => prev.filter(name => name !== nameToRemove));
  };

  const validateStep1 = () => {
    if (!albumName.trim()) return 'Album/Single Name is required';
    if (!releaseDate) return 'Official Release Date is required';

    // Check release date minimum constraints based on tier
    const selectedDate = new Date(releaseDate + 'T00:00:00');
    const minAllowedDate = getMinReleaseDate();
    if (selectedDate < minAllowedDate) {
      const days = isElite ? '1 day' : isPro ? '3 days' : '7 days';
      const tier = isElite ? 'Elite' : isPro ? 'Pro' : 'Free';
      return `Release date must be at least ${days} from today for the ${tier} plan (Minimum allowed date: ${getMinReleaseDateString()})`;
    }

    if (!coverArtUrl) return 'You must upload or select a Cover Art image';
    if (!language) return 'Metadata Language is required';
    if (!contentType) return 'Origination (Content Type) is required';
    if (!genre) return 'Main Genre selection is required';
    if (!subGenre) return 'Sub-Genre selection is required';
    // Allow empty string to default to 'Wavora Live' as the publishing label
    return '';
  };

  const validateStep2 = () => {
    for (let i = 0; i < trackList.length; i++) {
      const t = trackList[i];
      if (!t.trackName.trim()) return `Track #${i + 1} Name cannot be empty`;
      if (!t.audioFileName && !t.googleDriveLink) return `Upload .WAV audio file or provide a Google Drive link for Track #${i + 1}`;
      if (!t.producer.trim()) return `Producer is required for Track #${i + 1}`;
      if (!t.composer.trim()) return `Composer/Songwriter is required for Track #${i + 1}`;
      if (!t.lyricist.trim()) return `Lyricist metadata is required for Track #${i + 1}`;
      if (!t.genre) return `Main Genre is required for Track #${i + 1}`;
      if (!t.subGenre) return `Sub-Genre is required for Track #${i + 1}`;
      if (!t.crtbCut?.trim()) return `CRTB Cut (Vocals Start Timestamp) is required for Track #${i + 1} (it is critical for digital platforms)`;
    }
    return '';
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        setError(err);
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinalSubmit = () => {
    const isAdmin = isAppAdmin;
    const newRelease: Release = {
      id: editingRelease?.id || crypto.randomUUID(),
      email: editingRelease?.email || currentUser.email,
      albumName,
      type: releaseType,
      mainArtistName: primaryArtists.join(', '),
      featureArtists,
      otherArtists,
      language,
      contentType,
      numTracks,
      genre,
      subGenre,
      labelName: selectedLabel || 'Wavora Live',
      upc: upc || '',
      contentId: trackList[0]?.contentId || 'No',
      cLine: cLine || '© Wavora Live',
      pLine: pLine || '℗ Wavora Live',
      releaseDate,
      coverArtUrl: coverArtUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop',
      tracks: trackList,
      specialRequest,
      status: 'Submitted',
      submittedAt: editingRelease ? editingRelease.submittedAt : new Date().toISOString(),
    };

    onSubmitRelease(newRelease);
    setCurrentTab('catalogue');
  };

  return (
    <div className="p-6 bg-[#0f1424] rounded-3xl border border-slate-900 shadow-xl space-y-6" id="wizard_root">
      {/* Step Indicator Header */}
      <div className="flex justify-between items-start pb-4 border-b border-slate-800" id="wizard_header">
        <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">
              {editingRelease ? 'Edit & Resubmit Release' : 'New Digital Release Pipeline'}
            </h2>
          <span className="text-xs text-slate-400 font-medium">Step {step} of 4 • {
            step === 1 ? 'Release Metadata & Cover Art' :
            step === 2 ? 'Track Metadata & Assets' :
            step === 3 ? 'Ingestion Command Notes' :
            'Validation & Global Proxy Submission'
          }</span>
        </div>

        <div className="flex items-center gap-3">
          {editingRelease && onCancelEdit && (
            <button
              onClick={onCancelEdit}
              className="text-xs px-4 py-2 font-bold text-slate-400 hover:text-white transition"
              id="wizard_cancel_edit_button"
            >
              Cancel Edit
            </button>
          )}
          <div className="text-right hidden sm:block">
            <span className="text-[9px] block text-gray-500 font-bold uppercase tracking-widest">Plan Eligibility</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-[#6366F1] bg-[#6366F1]/10 border border-[#6366F1]/30">
              {currentUser.plan} Plan
            </span>
          </div>
          <button 
            onClick={() => setCurrentTab('home')}
            className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-xl transition cursor-pointer"
            title="Cancel Ingestion"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid containing Wizard Progress Bar */}
      <div className="relative flex items-center justify-between px-2 sm:px-4" id="wizard_tracker_mesh">
        <div className="absolute left-0 right-0 h-[1px] bg-slate-800/50 pointer-events-none z-0 mx-6 sm:mx-8" />
        {[1, 2, 3, 4].map((num) => {
          const isActive = step === num;
          const isCompleted = step > num;
          return (
            <div 
              key={num} 
              className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${
                isActive 
                  ? 'scale-110' 
                  : ''
              }`}
            >
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-[10px] sm:text-xs border transition-all duration-300 ${
                isActive 
                  ? 'bg-[#6366F1] text-black border-[#6366F1] shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                  : isCompleted
                    ? 'bg-emerald-500 text-black border-emerald-500'
                    : 'bg-[#151c2e] text-gray-500 border-slate-800'
              }`}>
                {isCompleted ? '✓' : num}
              </div>
              <span className={`absolute -bottom-5 sm:-bottom-6 text-[7px] sm:text-[8px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-[#6366F1]' : 'text-gray-600'} ${num === 1 || num === 4 ? '' : 'hidden xs:block'}`}>
                {num === 1 ? 'Start' : num === 2 ? 'Assets' : num === 3 ? 'Notes' : 'Finish'}
              </span>
            </div>
          );
        })}
      </div>

      <div className="pt-2"></div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-start gap-2" id="w_error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Components */}
      <div className="min-h-[300px]" id="wizard_step_stage">
        {step === 1 && (
          <div className="space-y-8" id="wizard_step1_inputs">
            {/* Group 1: Release Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Music className="w-4 h-4 text-[#6366F1]" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Release Identity</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Single / Album Title</label>
                  <input
                    type="text"
                    className="w-full bg-[#111726] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#6366F1] transition shadow-inner"
                    placeholder="e.g. Midnight Horizon"
                    value={albumName}
                    onChange={(e) => setAlbumName(e.target.value)}
                    id="w_albumName"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Release Concept Format</label>
                  <select
                    className="w-full bg-[#111726] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#6366F1] transition"
                    value={releaseType}
                    onChange={(e) => {
                      const val = e.target.value as 'Single' | 'EP' | 'Album';
                      setReleaseType(val);
                      if (val === 'Single') setNumTracks(1);
                    }}
                    id="w_releaseType"
                  >
                    <option value="Single">Single (1 Track)</option>
                    <option value="EP">EP (2-6 Tracks)</option>
                    <option value="Album">Album (7-30 Tracks)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-slate-800/50" />

            {/* Group 2: Artist Matrix */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-[#6366F1]" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Artist Matrix</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2" id="primary_artists_section">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Artist(s)</label>
                  
                  {/* Current Primary Artists Chips */}
                  <div className="flex flex-wrap gap-1.5 p-3 bg-[#0a0f1d] border border-slate-900 rounded-2xl min-h-[50px] items-center shadow-inner" id="primary_artists_chips_wrapper">
                    {primaryArtists.map((artist, i) => {
                      const isDefaultMain = artist === currentUser.artistName;
                      return (
                        <span 
                          key={i} 
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#151c2e] border border-slate-800 rounded-lg text-[11px] font-bold text-white transition-all hover:border-slate-700"
                          id={`primary_artist_chip_${i}`}
                        >
                          <span className="truncate max-w-[120px]">{artist}</span>
                          {isDefaultMain ? (
                            <span className="text-[8px] bg-[#6366F1]/10 text-[#6366F1] px-1.5 py-0.5 rounded font-black uppercase tracking-widest border border-[#6366F1]/20">Main</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRemovePrimaryArtist(artist)}
                              className="cursor-pointer p-0.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded transition"
                              title="Remove Artist"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <select
                      className="flex-1 bg-[#111726]/50 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#6366F1] w-full"
                      value={selectedPrimaryToAdd}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val && !primaryArtists.includes(val)) {
                          setPrimaryArtists(prev => [...prev, val]);
                          setOtherArtists(prev => prev.filter(name => name !== val));
                        }
                        setSelectedPrimaryToAdd('');
                      }}
                      id="select_add_primary_artist"
                    >
                      <option value="">Choose Managed Artist...</option>
                      {filteredArtists
                        .filter(m => !primaryArtists.includes(m.name))
                        .map((artist) => (
                          <option key={artist.id} value={artist.name}>
                            {artist.name}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                <div className="space-y-3" id="featured_artists_section">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Featured Artist(s)</label>
                  
                  <div className="flex flex-wrap gap-1.5 p-3 bg-[#0a0f1d] border border-slate-900 rounded-2xl min-h-[50px] items-center shadow-inner" id="featured_artists_chips_wrapper">
                    {featureArtists.length === 0 ? (
                      <span className="text-[10px] text-gray-600 font-medium italic">No featured artists selected yet</span>
                    ) : (
                      featureArtists.map((artist, i) => (
                        <span 
                          key={i} 
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#151c2e] border border-[#6366F1]/20 rounded-lg text-[11px] font-bold text-[#6366F1] transition-all"
                          id={`featured_artist_chip_${i}`}
                        >
                          <span className="truncate max-w-[120px]">{artist}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeatureArtist(artist)}
                            className="cursor-pointer p-0.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded transition"
                            title="Remove Featured Artist"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <select
                      className="flex-1 bg-[#111726]/50 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#6366F1] w-full"
                      value={selectedFeatureToAdd}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val && !featureArtists.includes(val) && !primaryArtists.includes(val)) {
                          setFeatureArtists(prev => [...prev, val]);
                        }
                        setSelectedFeatureToAdd('');
                      }}
                      id="select_add_feature_artist"
                    >
                      <option value="">Choose Managed Artist...</option>
                      {managedArtists
                        .filter(m => !featureArtists.includes(m.name) && !primaryArtists.includes(m.name))
                        .map((artist) => (
                          <option key={artist.id} value={artist.name}>
                            {artist.name}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-slate-800/50" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="space-y-1">
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metadata Language</label>
                <select
                  className="w-full bg-[#111726] border border-slate-800 rounded-xl py-2 md:py-2.5 px-3 md:px-4 text-[11px] md:text-sm text-white focus:outline-none focus:border-[#6366F1]"
                  value={LANGUAGES_LIST.includes(language) ? language : (language === '' ? '' : "Custom")}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Custom") {
                      setLanguage('');
                    } else {
                      setLanguage(val);
                    }
                  }}
                  id="w_language_select"
                >
                  <option value="" disabled>Select...</option>
                  {LANGUAGES_LIST.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                  <option value="Custom">Other (Type...)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Origination</label>
                <select
                  className="w-full bg-[#111726] border border-slate-800 rounded-xl py-2 md:py-2.5 px-3 md:px-4 text-[11px] md:text-sm text-white focus:outline-none focus:border-[#6366F1]"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                  id="w_contentType"
                >
                  <option value="" disabled>Select...</option>
                  <option value="Original">Original</option>
                  <option value="Non-Exclusive">Non-Exclusive</option>
                  {isElite && <option value="AI Music">AI Music</option>}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Genre</label>
                <select
                  className="w-full bg-[#111726] border border-slate-800 rounded-xl py-2 md:py-2.5 px-3 md:px-4 text-[11px] md:text-sm text-white focus:outline-none focus:border-[#6366F1]"
                  value={genre}
                  onChange={(e) => {
                    const newGenre = e.target.value;
                    setGenre(newGenre);
                    setSubGenre('');
                  }}
                  id="w_genre"
                >
                  <option value="" disabled>Select...</option>
                  {Object.keys(GENRE_DATA).map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sub-Genre</label>
                <select
                  className="w-full bg-[#111726] border border-slate-800 rounded-xl py-2 md:py-2.5 px-3 md:px-4 text-[11px] md:text-sm text-white focus:outline-none focus:border-[#6366F1]"
                  value={subGenre}
                  onChange={(e) => setSubGenre(e.target.value)}
                  id="w_subGenre"
                >
                  <option value="" disabled>Select...</option>
                  {(GENRE_DATA[genre] || []).map((sg) => (
                    <option key={sg} value={sg}>{sg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-[1px] bg-slate-800/50" />

            <div className="p-5 bg-black/20 rounded-3xl border border-slate-800/50 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Number of Tracks</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    disabled={releaseType === 'Single'}
                    className="w-full bg-[#111726] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#6366F1] disabled:opacity-30 disabled:grayscale"
                    value={numTracks}
                    onChange={(e) => setNumTracks(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Publishing Label</label>
                  <select
                    className="w-full bg-[#111726] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#6366F1]"
                    value={selectedLabel}
                    onChange={(e) => setSelectedLabel(e.target.value)}
                  >
                    <option value="">Wavora Live (Global)</option>
                    {filteredLabels.map((lbl) => (
                      lbl.name !== 'Wavora Live' && <option key={lbl.id} value={lbl.name}>{lbl.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Release Date</label>
                  <input
                    type="date"
                    min={getMinReleaseDateString()}
                    className="w-full bg-[#111726] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#6366F1]"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                  />
                  <p className="text-[9px] text-[#6366F1] font-semibold">
                    Min. {isElite ? '1 day' : isPro ? '3 days' : '7 days'} from today ({isElite ? 'Elite' : isPro ? 'Pro' : 'Free'} tier)
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">UPC Code</label>
                    <span className="text-[9px] text-[#6366F1] font-bold uppercase tracking-wider">Optional</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 190296767228"
                    className="w-full bg-[#111726] border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-[#6366F1]"
                    value={upc}
                    onChange={(e) => setUpc(e.target.value.replace(/[^0-9]/g, ''))}
                    id="w_upc"
                  />
                </div>
              </div>

            {/* Pro and Elite C & P options */}
            {!isFree && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">C Line (© Publisher Tag)</label>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Synced with Label</span>
                  </div>
                  <input
                    type="text"
                    disabled
                    className="w-full bg-[#111726]/50 border border-slate-800/80 rounded-xl py-2 px-3 text-sm text-slate-450 cursor-not-allowed font-medium select-none text-slate-400"
                    value={cLine}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">P Line (℗ Phonographic Sound Tag)</label>
                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Synced with Label</span>
                  </div>
                  <input
                    type="text"
                    disabled
                    className="w-full bg-[#111726]/50 border border-slate-800/80 rounded-xl py-2 px-3 text-sm text-slate-450 cursor-not-allowed font-medium select-none text-slate-400"
                    value={pLine}
                  />
                </div>
              </div>
            )}
            </div>

            {/* Step 1 Cover Artwork */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#6366F1]" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Release Artwork</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 group relative flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-[#6366F1]/50 rounded-3xl p-8 bg-black/20 transition-all cursor-pointer overflow-hidden">
                  <input
                    type="file"
                    accept=".jpg,.jpeg"
                    onChange={handleCoverArtChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="text-center space-y-4 relative pointer-events-none">
                    <div className="w-16 h-16 bg-[#6366F1]/10 rounded-2xl flex items-center justify-center mx-auto transition group-hover:scale-110">
                      <ImageIcon className="w-8 h-8 text-[#6366F1]" />
                    </div>
                    <div className="space-y-1">
                      <span className="block text-sm font-black text-white uppercase tracking-tight">Drop Cover Art Here</span>
                      <span className="block text-[10px] text-gray-500 font-medium uppercase tracking-widest">3000x3000px JPEG Required</span>
                    </div>
                    
                    {coverArtUploadProgress > 0 && (
                      <div className="w-48 bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden mx-auto">
                        <motion.div 
                          className="bg-[#6366F1] h-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${coverArtUploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-4 p-4 bg-[#0a0f1d] rounded-3xl border border-slate-900 flex flex-col items-center justify-center shadow-inner min-h-[220px]">
                  {coverArtPreview || coverArtUrl ? (
                    <div className="text-center space-y-4">
                      <div className="relative group">
                        <img 
                          src={coverArtPreview || coverArtUrl} 
                          alt="Preview" 
                          className="w-32 h-32 rounded-2xl object-cover shadow-2xl border border-slate-800 transition group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-2xl flex items-center justify-center pointer-events-none">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <span className="text-[10px] block text-[#6366F1] font-black uppercase tracking-widest">Artwork Processed</span>
                    </div>
                  ) : (
                    <div className="text-center space-y-4 px-4">
                      <span className="text-[10px] text-gray-600 font-black uppercase tracking-[0.15em] block">Preservation Presets</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop',
                          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&auto=format&fit=crop',
                          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop',
                        ].map((u, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => selectPrebuiltCover(u)}
                            className="aspect-square rounded-lg border border-slate-800 overflow-hidden hover:scale-110 active:scale-95 transition cursor-pointer shadow-lg"
                          >
                            <img src={u} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {artworkWarning && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-500 flex items-center gap-2 font-bold uppercase tracking-wide"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{artworkWarning}</span>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6" id="wizard_step2_tracks">
            <span className="text-xs text-[#6366F1] font-black uppercase tracking-widest block">Metadata Schema for Tracks ({numTracks} track(s) configured)</span>
            
            <div className="space-y-6" id="tracks_builder_scrollarea">
              {trackList.map((track, idx) => (
                <div 
                  key={track.id} 
                  className="p-6 bg-[#0a0f1d] rounded-3xl border border-slate-900 space-y-5 relative shadow-inner"
                  id={`track_form_card_${idx}`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <AudioLines className="w-4 h-4 text-[#6366F1]" /> Track #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest bg-slate-950 px-2 py-0.5 rounded border border-slate-800">Master Ingestion</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">Track Display Name</label>
                      <input
                        type="text"
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                        placeholder="e.g. Retro Dreams (Radio Edit)"
                        value={track.trackName}
                        onChange={(e) => handleTrackFieldChange(idx, 'trackName', e.target.value)}
                        id={`w_track_${idx}_name`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">Main Artist(s)</label>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {track.mainArtistName.split(',').map(a => a.trim()).filter(Boolean).map((artist, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#1a2333] border border-slate-700/60 rounded text-[9px] font-semibold text-white">
                            {artist}
                            <button 
                              type="button" 
                              onClick={() => {
                                const newArr = track.mainArtistName.split(',').map(a => a.trim()).filter(Boolean).filter(a => a !== artist);
                                handleTrackFieldChange(idx, 'mainArtistName', newArr.join(', '));
                              }}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <select
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const current = track.mainArtistName.split(',').map(a => a.trim()).filter(Boolean);
                          if (!current.includes(val)) {
                            handleTrackFieldChange(idx, 'mainArtistName', [...current, val].join(', '));
                          }
                          e.target.value = '';
                        }}
                      >
                        <option value="">+ Add Main Artist</option>
                        {managedArtists.map(ma => (
                          <option key={ma.id} value={ma.name}>{ma.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">Feature Artist(s)</label>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {(track.featureArtists || []).map((artist, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#1a2333] border border-slate-700/60 rounded text-[9px] font-semibold text-white">
                            {artist}
                            <button 
                              type="button" 
                              onClick={() => {
                                handleTrackFieldChange(idx, 'featureArtists', (track.featureArtists || []).filter(a => a !== artist));
                              }}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <select
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const current = track.featureArtists || [];
                          if (!current.includes(val)) {
                            handleTrackFieldChange(idx, 'featureArtists', [...current, val]);
                          }
                          e.target.value = '';
                        }}
                      >
                        <option value="">+ Add Feature Artist</option>
                        {managedArtists.map(ma => (
                          <option key={ma.id} value={ma.name}>{ma.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">Track Genre (Main)</label>
                      <select
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                        value={track.genre}
                        onChange={(e) => {
                          const newGenre = e.target.value;
                          handleTrackFieldChange(idx, 'genre', newGenre);
                          handleTrackFieldChange(idx, 'subGenre', '');
                        }}
                        id={`w_track_${idx}_genre`}
                      >
                        <option value="" disabled>Select...</option>
                        {Object.keys(GENRE_DATA).map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">Track Sub-Genre</label>
                      <select
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                        value={track.subGenre}
                        onChange={(e) => handleTrackFieldChange(idx, 'subGenre', e.target.value)}
                        id={`w_track_${idx}_subgenre`}
                      >
                        <option value="" disabled>Select...</option>
                        {(GENRE_DATA[track.genre] || []).map((sg) => (
                          <option key={sg} value={sg}>{sg}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">Production Producer</label>
                      <input
                        type="text"
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                        placeholder="Full Name (eg. Albert Smith)"
                        value={track.producer}
                        onChange={(e) => handleTrackFieldChange(idx, 'producer', e.target.value)}
                        id={`w_track_${idx}_producer`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">Lyricist (Songwriter Name)</label>
                      <input
                        type="text"
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                        placeholder="Full Name (eg. Albert Smith)"
                        value={track.lyricist}
                        onChange={(e) => handleTrackFieldChange(idx, 'lyricist', e.target.value)}
                        id={`w_track_${idx}_lyricist`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">Composer (Songwriter Name)</label>
                      <input
                        type="text"
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                        placeholder="Full Name (eg. Albert Smith)"
                        value={track.composer}
                        onChange={(e) => handleTrackFieldChange(idx, 'composer', e.target.value)}
                        id={`w_track_${idx}_composer`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">ISRC (Optional Metadata Code)</label>
                      <input
                        type="text"
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 font-mono"
                        placeholder="e.g. US-WV-26-XXXXX"
                        value={track.isrc}
                        onChange={(e) => handleTrackFieldChange(idx, 'isrc', e.target.value)}
                        id={`w_track_${idx}_isrc`}
                      />
                    </div>

                    <div className="space-y-1 p-3 bg-indigo-950/20 rounded-xl border border-indigo-500/20 shadow-inner">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1">
                          <span>CRTB Cut (Vocals Start)</span>
                          <span className="text-red-500 font-bold">*</span>
                        </label>
                        <span className="text-[8px] bg-red-950/60 text-red-400 font-bold px-1.5 py-0.5 rounded border border-red-900/40 uppercase tracking-tighter">
                          Required
                        </span>
                      </div>
                      <p className="text-[9px] text-indigo-400/80 leading-tight">
                        Critical metadata used by platforms (TikTok, Reels, DSPs) to accurately align audio sync and starting previews.
                      </p>
                      <input
                        type="text"
                        className="w-full bg-[#0a0d1a] border border-indigo-900/50 rounded-xl py-1.5 px-3 text-xs text-indigo-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                        placeholder="e.g. 0:30 or 1:15"
                        value={track.crtbCut || ''}
                        onChange={(e) => handleTrackFieldChange(idx, 'crtbCut', e.target.value)}
                        id={`w_track_${idx}_crtb_cut`}
                      />
                    </div>
                  </div>

                  {/* Explicit Tag check */}
                  <div className="flex flex-col gap-3 p-3.5 bg-slate-950/45 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-gray-200 block">Explicit Parental Advisory Tagging</span>
                      <p className="text-[10px] text-gray-400">Strictly flag if the vocals contain strong profanity, drug references, or offensive content.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleTrackFieldChange(idx, 'explicitContent', true)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl border text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                          track.explicitContent
                            ? 'bg-red-950/50 text-red-400 border-red-500/40 shadow-2xl shadow-indigo-500/10 shadow-red-950/30'
                            : 'bg-[#121c2c]/40 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                        id={`w_track_${idx}_explicit_yes`}
                      >
                        ⚠️ Yes (Explicit)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTrackFieldChange(idx, 'explicitContent', false)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl border text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                          !track.explicitContent
                            ? 'bg-indigo-950/40 text-indigo-400 border-indigo-500/40 shadow-2xl shadow-indigo-500/10 shadow-indigo-950/30'
                            : 'bg-[#121c2c]/40 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                        id={`w_track_${idx}_explicit_no`}
                      >
                        ✓ No (Clean/Instrumental)
                      </button>
                    </div>
                  </div>

                  {/* Track-level Content ID Check */}
                  <div className="flex flex-col gap-3 p-3.5 bg-slate-950/45 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-gray-200 block">Content ID (YouTube / Meta)</span>
                      <p className="text-[10px] text-gray-400 font-medium">Enable copy-protection & fingerprinting matching systems for this specific track audio recording.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleTrackFieldChange(idx, 'contentId', 'Yes')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl border text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                          track.contentId === 'Yes'
                            ? 'bg-[#6366F1] text-black border-[#6366F1] shadow-2xl shadow-[#6366F1]/10 font-black'
                            : 'bg-[#121c2c]/40 text-slate-400 border-slate-800 hover:border-slate-700 font-bold'
                        }`}
                        id={`w_track_${idx}_content_id_yes`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTrackFieldChange(idx, 'contentId', 'No')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl border text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                          track.contentId === 'No' || !track.contentId
                            ? 'bg-[#6366F1] text-black border-[#6366F1] shadow-2xl shadow-[#6366F1]/10 font-black'
                            : 'bg-[#121c2c]/40 text-slate-400 border-slate-800 hover:border-slate-700 font-bold'
                        }`}
                        id={`w_track_${idx}_content_id_no`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  {/* Audio Upload Element */}
                  <div className="p-3 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold block text-slate-300 uppercase tracking-wider">Audio File Ingestion (.WAV or .MP3 - Max 50MB)</span>
                        {track.audioFileName ? (
                          <span className="text-xs font-semibold text-violet-400 mt-1 block font-mono">
                            ✓ File attached: {track.audioFileName}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-500 mt-1 block">Awaiting raw .wav or .mp3 file attachment...</span>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="file"
                          accept="audio/wav,audio/x-wav,audio/wave,audio/vnd.wave,.wav,audio/mp3,audio/mpeg,.mp3"
                          onChange={(e) => handleAudioUploadMock(idx, e)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          disabled={trackUploadProgress[idx] > 0}
                        />
                        <button
                          type="button"
                          disabled={trackUploadProgress[idx] > 0}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 disabled:bg-slate-800/50 disabled:text-slate-500 text-white text-[11px] font-bold rounded-xl transition"
                        >
                          Select Audio File
                        </button>
                      </div>
                    </div>
                    {trackUploadProgress[idx] > 0 && (
                      <div className="mt-3 w-full bg-slate-800 h-2 rounded overflow-hidden relative">
                        <div 
                          className="bg-violet-500 h-full transition-all duration-300"
                          style={{ width: `${trackUploadProgress[idx]}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white uppercase tracking-wider drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                          Uploading to Vault: {trackUploadProgress[idx]}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Fallback Google Drive Link */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-blue-900/5 border border-blue-500/10 active:border-blue-500/20 transition-colors">
                    <label className="block text-[10px] font-bold text-blue-300 uppercase tracking-widest">
                      Alternative: Google Drive Link (If upload fails)
                    </label>
                    <div className="flex items-center gap-2">
                       <input
                        type="url"
                        className="flex-1 bg-[#151c2e]/50 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
                        placeholder="Paste Public Google Drive Link"
                        value={track.googleDriveLink || ''}
                        onChange={(e) => handleTrackFieldChange(idx, 'googleDriveLink', e.target.value)}
                        id={`w_track_${idx}_drive`}
                      />
                    </div>
                    <span className="text-[9px] text-gray-500 block italic leading-tight">
                      Add a public Google Drive link if you face any issues with the WAV master file upload above. Ensure link sharing is set to "Anyone with the link".
                    </span>
                  </div>

                  {/* Lyrics area */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Full Lyrics (Optional)</label>
                    <textarea
                      rows={2}
                      className="w-full bg-[#151c2e] border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                      placeholder="Line by line lyrics for Sync publishing ingestion..."
                      value={track.lyrics || ''}
                      onChange={(e) => handleTrackFieldChange(idx, 'lyrics', e.target.value)}
                      id={`w_track_${idx}_lyrics`}
                    />
                  </div>
                </div>
              ))}

              {releaseType !== 'Single' && numTracks < 30 && (
                <button
                  type="button"
                  onClick={() => setNumTracks(prev => prev + 1)}
                  className="w-full py-3 border border-dashed border-slate-700 hover:border-slate-500 rounded-2xl bg-slate-900/40 hover:bg-slate-800/60 text-slate-400 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Another Track
                </button>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4" id="wizard_step3_special">
            <div>
              <span className="text-xs text-indigo-400 font-extrabold uppercase tracking-widest block">Step 3: Streaming Store Ingestion Notes</span>
              <h3 className="text-sm font-bold text-gray-200 mt-1">Special Delivery Requests</h3>
              <p className="text-xs text-gray-400 mt-1">Provide helpful commands or specific target playlists pitching references for the platform reviewing agents to execute.</p>
            </div>

            <textarea
              rows={8}
              className="w-full bg-[#151c2e] border border-slate-850 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-blue-500 md:text-sm"
              placeholder="e.g. I would like immediate submission to Beatport. Please configure the primary genre as Acid House instead of standard Trance. Also register under the active Apple Artist profile ID: 29841..."
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              id="w_specialRequest"
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6" id="wizard_step4_review">
            <div>
              <span className="text-xs text-indigo-400 font-extrabold uppercase tracking-widest block">Step 4: Audit & Verification</span>
              <h3 className="text-sm font-bold text-gray-200 mt-1">Confirm and Dispatch Tracks</h3>
              <p className="text-xs text-slate-400 mt-1">A brief audit of all package details before global ingestion transmission.</p>
            </div>

            <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-4" id="review_summary">
              {/* Primary Details */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-slate-800/80 pb-4">
                <img 
                  src={coverArtPreview || coverArtUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop'} 
                  alt="Artwork Summary" 
                  className="w-16 h-16 rounded object-cover flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-extrabold text-base text-white">{albumName}</h4>
                  <div className="text-xs text-gray-400 flex flex-wrap gap-2 mt-1">
                    <span>{releaseType}</span>
                    <span>•</span>
                    <span>{currentUser.artistName}</span>
                    {(featureArtists.length > 0 || otherArtists.length > 0) && (
                      <>
                        <span>•</span>
                        <span>ft. {[...featureArtists, ...otherArtists].join(', ')}</span>
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Origination: {contentType} • Tone Language: {language}
                  </div>
                </div>
              </div>

              {/* Subgenre & Dates */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs border-b border-slate-800/80 pb-4">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Release Date</span>
                  <span className="text-gray-300 font-medium">{new Date(releaseDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Main Genre</span>
                  <span className="text-gray-300 font-medium">{genre} / {subGenre || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">UPC Code</span>
                  <span className="text-emerald-400 font-mono font-medium">{upc || 'Not Provided (System)'}</span>
                </div>
                {isElite && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Bespoke Label</span>
                    <span className="text-indigo-400 font-medium">{selectedLabel || 'Prism Records (Elite)'}</span>
                  </div>
                )}
                {!isFree && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Publishing Lines</span>
                    <span className="text-purple-400 font-mono text-[9px] block truncate">{cLine || '© Custom'}</span>
                  </div>
                )}
              </div>

              {/* Tracks Review List */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Tracks Array Ingestion ({trackList.length} files)</span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {trackList.map((t, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                      <div>
                        <span className="font-bold text-gray-200 block">{idx + 1}. {t.trackName || 'Unnamed track'}</span>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                           By: <span className="font-bold text-gray-300">{t.mainArtistName}</span>
                            {( (t.featureArtists && t.featureArtists.length > 0) || (t.otherArtists && t.otherArtists.length > 0) ) && 
                              ` (feat. ${[...(t.featureArtists || []), ...(t.otherArtists || [])].join(', ')})`}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase mt-1">
                          Producer: {t.producer || 'N/A'} • Composer: {t.composer || 'N/A'}
                          {t.crtbCut && ` • CRTB Cut: ${t.crtbCut}`}
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-[10px] bg-slate-800 text-blue-400 font-mono px-2 py-0.5 rounded border border-slate-700 inline-block sm:block text-center min-w-[120px]">
                          📢 wav attached
                        </span>
                        {t.explicitContent && (
                          <span className="text-[8px] bg-red-900/30 text-red-400 font-bold uppercase inline-block sm:block mt-2 sm:mt-1 px-1 rounded">Parental advisory</span>
                        )}
                        {t.contentId === 'Yes' && (
                          <span className="text-[8px] bg-green-950 text-green-400 font-bold uppercase inline-block sm:block mt-1 px-1 rounded font-mono">Content ID: Yes</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special instructions field summary */}
              {specialRequest && (
                <div className="p-2.5 rounded bg-slate-900/80 border border-indigo-950 text-xs">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Pitch Ingestion Notes to System Admin</span>
                  <p className="text-gray-300 italic">"{specialRequest}"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800/50" id="wizard_buttons_footer">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="cursor-pointer px-6 py-3 rounded-2xl bg-[#151c2e] hover:bg-slate-800 font-bold text-xs text-gray-400 hover:text-white transition-all flex items-center gap-2 border border-slate-800 active:scale-95"
            id="btn_wizard_back"
          >
            <ChevronLeft className="w-4 h-4" /> Go Back
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="cursor-pointer px-8 py-3 rounded-2xl bg-[#6366F1] hover:bg-[#818CF8] font-black text-xs text-black transition-all flex items-center gap-2 shadow-lg shadow-[#6366F1]/20 active:scale-95 uppercase tracking-tighter"
            id="btn_wizard_next"
          >
            {step === 3 ? 'Review Package' : 'Continue Step'} <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="cursor-pointer px-10 py-3 bg-gradient-to-r from-[#6366F1] to-emerald-400 hover:scale-[1.02] font-black text-xs text-black rounded-2xl shadow-xl shadow-[#6366F1]/20 transition-all flex items-center gap-2 active:scale-95 uppercase tracking-tighter"
            id="btn_wizard_submit"
          >
            <FileCheck className="w-4 h-4" /> Ingest Track Package
          </button>
        )}
      </div>
    </div>
  );
}

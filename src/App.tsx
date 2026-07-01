import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getStoredData, saveStoredData, AppState } from './data';
import { User, Release, ArtistProfile, Label, RevenueReport, SupportQuery, OacApplication, TrackStatus, PayoutRequest, Plan } from './types';
import { supabase, isolatedAdminSupabase } from './supabase';

// Importing Tab Components
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import NewReleaseWizard from './components/NewReleaseWizard';
import ManageArtists from './components/ManageArtists';
import ManageLabels from './components/ManageLabels';
import CatalogueView from './components/CatalogueView';
import RevenuePage from './components/RevenuePage';
import SupportPage from './components/SupportPage';
import AdminPanel from './components/AdminPanel';
import MemberPool from './components/MemberPool';
import ProfileModal from './components/ProfileModal';
import RevenueReportsModal from './components/RevenueReportsModal';
import NotificationsDrawer from './components/NotificationsDrawer';


import { 
  Menu, 
  X, 
  Disc, 
  User as UserIcon, 
  ShieldAlert, 
  Compass, 
  AudioLines, 
  HelpCircle,
  Landmark,
  Tags,
  Users,
  Layers,
  Sparkles,
  Home,
  Bell
} from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => getStoredData());

  // Current session parameters
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [realAdminUser, setRealAdminUser] = useState<User | null>(null);
  const [isImpersonating, setIsImpersonating] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState<boolean>(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState<boolean>(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);

  // Fetch all Supabase data
  const loadSupabaseData = async (userEmail: string, userId: string) => {
    try {
      const isAdmin = userEmail.toLowerCase() === 'admin@g.g' || userEmail.toLowerCase() === 'wavoradashboard@gmail.com';

      // Build scoped queries to enforce data privacy at the DB level
      const usersQuery = supabase.from('users').select('*');
      const releasesQuery = supabase.from('releases').select('*').order('submitted_at', { ascending: false });
      const artistsQuery = supabase.from('artists').select('*');
      const labelsQuery = supabase.from('labels').select('*');
      const revenueQuery = supabase.from('revenue_reports').select('*');
      const queriesQuery = supabase.from('support_queries').select('*').order('submitted_at', { ascending: false });
      const oacQuery = supabase.from('oac_applications').select('*').order('submitted_at', { ascending: false });
      const notifQuery = supabase.from('notifications').select('*').order('created_at', { ascending: false });
      const payoutsQuery = supabase.from('payout_requests').select('*').order('submitted_at', { ascending: false });

      // Apply row-level filtering if not admin
      if (!isAdmin) {
        usersQuery.eq('id', userId);
        releasesQuery.eq('user_id', userId);
        artistsQuery.eq('user_id', userId);
        labelsQuery.eq('user_id', userId);
        revenueQuery.eq('user_id', userId);
        queriesQuery.eq('user_id', userId);
        oacQuery.eq('user_id', userId);
        payoutsQuery.eq('user_id', userId);
      }

      const [
        { data: usersData, error: usersErr },
        { data: releasesData, error: releasesErr },
        { data: artistsData, error: artistsErr },
        { data: labelsData, error: labelsErr },
        { data: revenueData, error: revenueErr },
        { data: queriesData, error: queriesErr },
        { data: oacData, error: oacErr },
        { data: notifData, error: notifErr },
        { data: payoutsData, error: payoutsErr }
      ] = await Promise.all([
        usersQuery,
        releasesQuery,
        artistsQuery,
        labelsQuery,
        revenueQuery,
        queriesQuery,
        oacQuery,
        notifQuery,
        payoutsQuery
      ]);

      if (usersErr) console.error("Error loading users:", usersErr);
      if (releasesErr) console.error("Error loading releases:", releasesErr);
      if (artistsErr) console.error("Error loading artists:", artistsErr);
      if (labelsErr) console.error("Error loading labels:", labelsErr);
      if (revenueErr) console.error("Error loading revenue reports:", revenueErr);
      if (queriesErr) console.error("Error loading support queries:", queriesErr);
      if (oacErr) console.error("Error loading OAC applications:", oacErr);
      if (notifErr) console.error("Error loading notifications:", notifErr);
      if (payoutsErr) {
        console.error("Error loading payout requests:", payoutsErr);
        if (isAdmin && payoutsErr.code === '42P01') {
          console.warn("Table 'payout_requests' missing in Supabase. Payouts will only be local.");
        }
      }

      // Batch resolve signed URLs for private files
      const storagePathsToResolve: string[] = [];
      releasesData?.forEach((r: any) => {
        if (r.cover_art_url && !r.cover_art_url.startsWith('http')) {
          storagePathsToResolve.push(r.cover_art_url);
        }
      });

      const signedUrlMap: Record<string, string> = {};
      if (storagePathsToResolve.length > 0) {
        try {
          const { data: signedUrls } = await supabase.storage.from('app-files').createSignedUrls(storagePathsToResolve, 3600);
          signedUrls?.forEach((item: any) => {
            if (item.signedUrl) {
              signedUrlMap[item.path] = item.signedUrl;
            }
          });
        } catch (e) {
          console.warn("Failed resolving storage signed URLs:", e);
        }
      }

      // Convert users
      const uniqueUsers: User[] = [];
      const userEmailsSeen = new Set<string>();
      (usersData || []).forEach((u: any) => {
        const emailLower = u.email.toLowerCase();
        if (!userEmailsSeen.has(emailLower)) {
          userEmailsSeen.add(emailLower);

          let overridePassword = undefined;
          let extractedPlanEndDate = undefined;
          let extractedUpiId = undefined;
          let extractedBankName = undefined;
          let extractedBankAccountNo = undefined;
          let extractedBankIfsc = undefined;
          let extractedBankHolderName = undefined;
          const rawPLines = u.allowed_p_lines ? u.allowed_p_lines.split('|||') : [];
          const cleanPLines = rawPLines.filter((line: string) => {
            if (line.startsWith('__PWD_OVERRIDE__:')) {
              overridePassword = line.substring('__PWD_OVERRIDE__:'.length);
              return false;
            }
            if (line.startsWith('__PLAN_END_DATE__:')) {
              extractedPlanEndDate = line.substring('__PLAN_END_DATE__:'.length);
              return false;
            }
            if (line.startsWith('__UPI_ID__:')) {
              extractedUpiId = line.substring('__UPI_ID__:'.length);
              return false;
            }
            if (line.startsWith('__BANK_NAME__:')) {
              extractedBankName = line.substring('__BANK_NAME__:'.length);
              return false;
            }
            if (line.startsWith('__BANK_ACC__:')) {
              extractedBankAccountNo = line.substring('__BANK_ACC__:'.length);
              return false;
            }
            if (line.startsWith('__BANK_IFSC__:')) {
              extractedBankIfsc = line.substring('__BANK_IFSC__:'.length);
              return false;
            }
            if (line.startsWith('__BANK_HOLDER__:')) {
              extractedBankHolderName = line.substring('__BANK_HOLDER__:'.length);
              return false;
            }
            return true;
          });

          uniqueUsers.push({
            id: u.id,
            email: u.email,
            artistName: u.artist_name || u.email.split('@')[0],
            plan: u.plan as Plan || 'Free',
            isApproved: u.is_approved !== undefined ? u.is_approved : true,
            registeredAt: u.registered_at || new Date().toISOString(),
            planStartDate: u.plan_start_date ? u.plan_start_date.split('T')[0] : undefined,
            planEndDate: u.plan_end_date ? u.plan_end_date.split('T')[0] : extractedPlanEndDate,
            password: overridePassword,
            upiId: extractedUpiId,
            bankName: extractedBankName,
            bankAccountNo: extractedBankAccountNo,
            bankIfsc: extractedBankIfsc,
            bankHolderName: extractedBankHolderName,
            allowedCLines: u.allowed_c_lines ? u.allowed_c_lines.split('|||') : [],
            allowedPLines: cleanPLines
          });
        }
      });

      // Augment with current session user if not loaded
      const loggedInEmailLower = userEmail.toLowerCase();
      const hasLoggedInUser = uniqueUsers.some(u => u.email.toLowerCase() === loggedInEmailLower);
      if (!hasLoggedInUser && !isAdmin) {
        uniqueUsers.push({
          id: userId,
          email: userEmail,
          artistName: currentUser?.artistName || userEmail.split('@')[0],
          plan: currentUser?.plan || 'Free',
          isApproved: currentUser?.isApproved !== undefined ? currentUser.isApproved : true,
          registeredAt: currentUser?.registeredAt || new Date().toISOString(),
          allowedCLines: currentUser?.allowedCLines || [],
          allowedPLines: currentUser?.allowedPLines || []
        });
      }

      setAppState((prev) => ({
        ...prev,
        users: uniqueUsers.length > 0 ? uniqueUsers : prev.users,
        releases: releasesData 
          ? releasesData.map((r: any) => ({
              id: r.id,
              email: r.email,
              albumName: r.album_name,
              mainArtistName: r.main_artist_name,
              featureArtists: Array.isArray(r.feature_artists) ? r.feature_artists : [],
              otherArtists: Array.isArray(r.other_artists) ? r.other_artists : [],
              language: r.language || 'English',
              contentType: r.content_type || 'Original',
              numTracks: r.num_tracks || 0,
              genre: r.genre || '',
              subGenre: r.sub_genre || '',
              labelName: r.label_name || '',
              upc: r.upc || '',
              contentId: r.content_id || 'No',
              cLine: r.c_line || '',
              pLine: r.p_line || '',
              releaseDate: r.release_date || '',
              coverArtUrl: r.cover_art_url || '',
              coverArtSignedUrl: (r.cover_art_url && !r.cover_art_url.startsWith('http')) ? signedUrlMap[r.cover_art_url] : undefined,
              submittedAt: r.submitted_at || new Date().toISOString(),
              status: r.status as TrackStatus || 'Submitted',
              tracks: Array.isArray(r.tracks) ? r.tracks : [],
              specialRequest: r.special_request || '',
              feedback: r.feedback || '',
            }))
          : prev.releases,
        artists: artistsData
          ? artistsData.map((a: any) => ({
              id: a.id,
              email: a.email,
              name: a.name,
              spotifyLink: a.spotify_link || '',
              appleMusicLink: a.apple_music_link || '',
              instagramLink: a.instagram_link || '',
              defaultCLine: a.default_c_line || '',
              defaultPLine: a.default_p_line || ''
            }))
          : prev.artists,
        labels: labelsData
          ? labelsData.map((l: any) => ({
              id: l.id,
              email: l.email,
              name: l.name
            }))
          : prev.labels,
        revenueReports: revenueData
          ? revenueData.map((r: any) => ({
              id: r.id,
              email: r.email,
              month: r.month,
              amount: typeof r.amount === 'string' ? parseFloat(r.amount) : r.amount,
              breakdown: Array.isArray(r.breakdown) ? r.breakdown : [],
              currency: r.currency || 'USD'
            }))
          : prev.revenueReports,
        queries: queriesData
          ? queriesData.map((q: any) => ({
              id: q.id,
              email: q.email,
              artistName: q.artist_name || '',
              queryText: q.query_text,
              status: q.status || 'Pending',
              replyText: q.reply_text || '',
              submittedAt: q.submitted_at || new Date().toISOString()
            }))
          : prev.queries,
        oacApplications: oacData
          ? oacData.map((o: any) => ({
              id: o.id,
              email: o.email,
              artistName: o.artist_name || '',
              spotifyLink: o.spotify_link || '',
              youtubeLink: o.youtube_link || '',
              fullName: o.full_name || '',
              submittedAt: o.submitted_at || new Date().toISOString(),
              status: o.status || 'Pending'
            }))
          : prev.oacApplications,
        notifications: notifData
          ? notifData.map((n: any) => ({
              id: n.id,
              title: n.title,
              message: n.message,
              targetType: n.target_type as any,
              targetValue: n.target_value || '',
              severity: n.severity as any,
              createdAt: n.created_at || new Date().toISOString()
            }))
          : prev.notifications,
        payoutRequests: payoutsData
          ? payoutsData.map((p: any) => ({
              id: p.id,
              email: p.email,
              artistName: p.artist_name || '',
              amount: typeof p.amount === 'string' ? parseFloat(p.amount) : p.amount,
              currency: p.currency || 'USD',
              paymentMethod: p.payment_method || 'UPI',
              paymentDetails: typeof p.payment_details === 'object' ? p.payment_details : {},
              submittedAt: p.submitted_at || new Date().toISOString(),
              status: p.status || 'Pending',
              feedback: p.feedback || ''
            }))
          : prev.payoutRequests
      }));

      // Set active currentUser reference from DB user sync
      const matchEmail = (isImpersonating && currentUser) ? currentUser.email.toLowerCase() : userEmail.toLowerCase();
      setAppState((currentState) => {
        const freshUser = currentState.users.find(us => us.email.toLowerCase() === matchEmail);
        if (freshUser) {
          setCurrentUser(freshUser);
        }
        return currentState;
      });
    } catch (e) {
      console.error("Data load error:", e);
    }
  };

  // Sync session on mount with Supabase Auth or local storage fallback
  useEffect(() => {
    const initSupabaseSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const u = session.user;
          const metadata = u.user_metadata || {};
          
          const adminStr = 'admin@g.g';
          const isAppAdmin = (email: string) => email === adminStr || email === 'wavoradashboard@gmail.com';

          const mappedUser: User = {
            id: u.id,
            email: u.email!,
            artistName: metadata.artistName || u.email!.split('@')[0],
            plan: metadata.plan || 'Free',
            isApproved: metadata.isApproved !== undefined ? metadata.isApproved : true,
            registeredAt: u.created_at || new Date().toISOString()
          };

          // Synchronize locally first, then await real data load
          updateState((prev) => {
            const exists = prev.users.some(existing => existing.email.toLowerCase() === mappedUser.email.toLowerCase());
            if (!exists) {
              return {
                ...prev,
                users: [...prev.users, mappedUser]
              };
            }
            return prev;
          });

          // Fetch fresh data for this user ID
          await loadSupabaseData(mappedUser.email, u.id);

          // Get the user from latest app state after loadSupabaseData
          setAppState((prev) => {
            const fetchedUser = prev.users.find(user => user.email.toLowerCase() === mappedUser.email.toLowerCase());
            if (fetchedUser) {
              setCurrentUser(fetchedUser);
            } else {
              setCurrentUser(mappedUser);
            }
            return prev;
          });
          
          if (isAppAdmin(mappedUser.email)) {
            setCurrentTab('admin-panel');
          } else {
            setCurrentTab('home');
          }
        } else {
          // Fallback to local session
          const savedUserStr = localStorage.getItem('wavora_current_user');
          if (savedUserStr) {
            const user = JSON.parse(savedUserStr);
            const roster = getStoredData().users;
            const freshUser = roster.find(u => u.email.toLowerCase() === user.email.toLowerCase()) || user;
            
            setCurrentUser(freshUser);
            const adminStr = 'admin@g.g';
            const isAppAdmin = (email: string) => email === adminStr || email === 'wavoradashboard@gmail.com';
            
            if (isAppAdmin(freshUser.email)) {
              setCurrentTab('admin-panel');
            } else {
              setCurrentTab('home');
            }
            
            // Resolve Supabase user ID and load database asynchronously if they are saved locally
            try {
              const { data: matchedUser } = await supabase.from('users').select('id').eq('email', freshUser.email).single();
              if (matchedUser?.id) {
                await loadSupabaseData(freshUser.email, matchedUser.id);
              }
            } catch (supErr) {
              console.warn("Could not load matching Supabase row on mount fallback:", supErr);
            }
          }
        }
      } catch (e) {
        console.error('Supabase Session Initializer Error:', e);
      }
    };
    initSupabaseSession();
  }, []);

  // Auto-login logic for testing or keep sessions alive if needed (defaults to null for real authentication view)
  const users = appState.users;
  const releases = appState.releases;
  const artists = appState.artists;
  const labels = appState.labels;
  const revenueReports = appState.revenueReports;
  const queries = appState.queries;
  const oacApplications = appState.oacApplications;
  const notifications = appState.notifications || [];

  // Filter count of active, non-dismissed notifications for the bell badge
  const [headerDismissedIds, setHeaderDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const loadDismissed = () => {
      try {
        const saved = localStorage.getItem(`wavora_dismissed_notif_${currentUser.email}`);
        setHeaderDismissedIds(saved ? JSON.parse(saved) : []);
      } catch {
        setHeaderDismissedIds([]);
      }
    };

    // Load initially
    loadDismissed();

    // Listen to sync events when they are dismissed inside the drawer or other widgets
    window.addEventListener('wavora_notifications_synced', loadDismissed);
    return () => window.removeEventListener('wavora_notifications_synced', loadDismissed);
  }, [currentUser, isNotifDrawerOpen]);

  const filteredNotifs = notifications.filter(notif => {
    if (!currentUser) return false;
    if (notif.targetType === 'Everyone') return true;
    if (notif.targetType === 'Plan') return notif.targetValue?.toLowerCase() === currentUser.plan?.toLowerCase();
    if (notif.targetType === 'Artist') return notif.targetValue?.toLowerCase() === currentUser.email?.toLowerCase();
    return false;
  });

  const activeNotifCount = filteredNotifs.filter(n => !headerDismissedIds.includes(n.id)).length;

  // Synchronization helpers
  const updateState = (updater: (prev: AppState) => AppState) => {
    setAppState((prev) => {
      const next = updater(prev);
      saveStoredData(next);
      return next;
    });
  };

  // Auth Callbacks
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('wavora_current_user', JSON.stringify(user));
    setIsImpersonating(false);
    setRealAdminUser(null);
    const isAppAdmin = (email?: string) => email === 'admin@g.g' || email === 'wavoradashboard@gmail.com';

    if (isAppAdmin(user.email)) {
      setCurrentTab('admin-panel');
    } else {
      setCurrentTab('home');
    }

    // Load active Supabase data for the logged-in user in the background
    const loadDbOnLogin = async () => {
      try {
        const { data: matchedUser } = await supabase.from('users').select('id').eq('email', user.email).single();
        if (matchedUser?.id) {
          await loadSupabaseData(user.email, matchedUser.id);
        }
      } catch (e) {
        console.warn("Could not load fresh Supabase state on login:", e);
      }
    };
    loadDbOnLogin();
  };

  const handleRegister = (newUser: User) => {
    updateState((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
    }));
    // Auto-login registered user and redirect
    setCurrentUser(newUser);
    localStorage.setItem('wavora_current_user', JSON.stringify(newUser));
    setCurrentTab('home');

    // Register details on Supabase
    const pushSignupRow = async () => {
      try {
        await supabase.from('users').insert({
          id: newUser.id || crypto.randomUUID(),
          email: newUser.email,
          artist_name: newUser.artistName,
          plan: newUser.plan,
          is_approved: newUser.isApproved !== undefined ? newUser.isApproved : true,
          registered_at: newUser.registeredAt || new Date().toISOString()
        });
      } catch (e) {
        console.warn("Could not insert signup row to Supabase:", e);
      }
    };
    pushSignupRow();
  };

  const handleLogout = () => {
    supabase.auth.signOut().catch((e: any) => console.warn("Signout backend error:", e));
    setCurrentUser(null);
    setRealAdminUser(null);
    setIsImpersonating(false);
    setCurrentTab('home');
    localStorage.removeItem('wavora_current_user');
  };

  // Admin Actions
  const handleApproveUser = async (email: string) => {
    try {
      await supabase.from('users').update({ is_approved: true }).eq('email', email);
    } catch (e) {
      console.warn("Supabase approval failed, updating local state only:", e);
    }
    updateState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.email === email ? { ...u, isApproved: true } : u)),
    }));
  };

  const handleRejectUser = async (email: string) => {
    try {
      await supabase.from('users').delete().eq('email', email);
    } catch (e) {
      console.warn("Supabase user rejection failed, updating local state only:", e);
    }
    updateState((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.email !== email),
    }));
  };

  const handleDeleteUser = async (email: string) => {
    const confirmed = window.confirm(`Are you absolutely sure you want to permanently DELETE the user ${email}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      // Delete from Supabase 'users' table
      const { error } = await supabase.from('users').delete().eq('email', email);
      if (error) {
        console.error("Supabase user deletion error:", error);
        alert(`Cloud deletion failed: ${error.message}`);
      }
    } catch (e) {
      console.error("User deletion exception:", e);
    }

    // Update local state regardless of cloud success to keep UI snappy
    updateState((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.email !== email),
      // Also remove their releases, artists, etc. if required, but for now just users
    }));
  };

  const handleCreateUser = async (newUser: User): Promise<{ success: boolean; message: string }> => {
    const exists = appState.users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase());
    if (exists) {
      return { success: false, message: 'This email is already in use.' };
    }

    try {
      // Create user auth in Supabase using the isolatedAdminSupabase client (which avoids logging out the admin session).
      let signedUpUser: any = null;
      try {
        const { data, error: signUpError } = await isolatedAdminSupabase.auth.signUp({
          email: newUser.email,
          password: newUser.password || 'password',
          options: {
            data: {
              artistName: newUser.artistName,
              plan: newUser.plan,
              isApproved: true,
              registeredAt: newUser.registeredAt || new Date().toISOString()
            }
          }
        });
        if (signUpError) {
          console.error("SignUp error:", signUpError);
        } else {
          signedUpUser = data;
        }
      } catch (authError) {
        console.warn("Auth signup threw, falling back to offline/mock:", authError);
      }

      // Add user to the local roster state too so they instantly appear in lists
      // Note: A database trigger in Supabase should ideally insert into `users` 
      // but to be safe, we insert explicitly here for the mock.
      const finalUserId = signedUpUser?.user?.id || crypto.randomUUID();
      try {
        await supabase.from('users').insert({
          id: finalUserId,
          email: newUser.email,
          artist_name: newUser.artistName,
          plan: newUser.plan,
          is_approved: true,
          registered_at: newUser.registeredAt || new Date().toISOString()
        });
      } catch (dbError) {
        console.warn("Database user insert rejected, proceeding mock/offline:", dbError);
      }

      const userWithId: User = {
        ...newUser,
        id: finalUserId
      };

      updateState((prev) => ({
        ...prev,
        users: [...prev.users, userWithId],
      }));

      return { success: true, message: 'User account created and pre-approved!' };
    } catch (err: any) {
      return { success: false, message: 'Supabase link failure: ' + (err.message || err) };
    }
  };

  const handleUpdateReleaseStatus = async (releaseId: string, status: TrackStatus, feedback?: string) => {
    try {
      await supabase.from('releases').update({ status, feedback: feedback || null }).eq('id', releaseId);
    } catch (e) {
      console.warn("Release update failed, updating locally only:", e);
    }
    updateState((prev) => ({
      ...prev,
      releases: prev.releases.map((r) => 
        r.id === releaseId 
          ? { ...r, status, feedback: feedback || r.feedback } 
          : r
      ),
    }));
  };

  const handleUpdateRelease = async (releaseId: string, updates: Partial<Release>) => {
    try {
      // In Supabase we mainly care about 'tracks' for now, but handle generically
      let dbUpdates: any = {};
      if (updates.tracks !== undefined) dbUpdates.tracks = updates.tracks;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.feedback !== undefined) dbUpdates.feedback = updates.feedback;
      
      await supabase.from('releases').update(dbUpdates).eq('id', releaseId);
    } catch (e) {
      console.warn("Release full update failed, updating locally only:", e);
    }
    updateState((prev) => ({
      ...prev,
      releases: prev.releases.map((r) => 
        r.id === releaseId 
          ? { ...r, ...updates } 
          : r
      ),
    }));
  };

  const handleReplySupportQuery = async (queryId: string, replyText: string) => {
    try {
      await supabase.from('support_queries').update({ status: 'Resolved', reply_text: replyText }).eq('id', queryId);
    } catch (e) {
      console.warn("Query support reply failed, updating locally only:", e);
    }
    updateState((prev) => ({
      ...prev,
      queries: prev.queries.map((q) => 
        q.id === queryId 
          ? { ...q, status: 'Resolved' as const, replyText } 
          : q
      ),
    }));
  };

  const handleUpdateOacStatus = async (oacId: string, status: 'Approved' | 'Rejected') => {
    try {
      await supabase.from('oac_applications').update({ status }).eq('id', oacId);
    } catch (e) {
      console.warn("OAC status update failed, updating locally only:", e);
    }
    updateState((prev) => ({
      ...prev,
      oacApplications: prev.oacApplications.map((app) => 
        app.id === oacId 
          ? { ...app, status } 
          : app
      ),
    }));
  };

  const handlePostRevenue = async (email: string, month: string, amount: number, releaseName: string, currency: 'USD' | 'INR' = 'USD') => {
    
    // We should lookup user_id by email before sending to Supabase
    // But since this is a mock implementation with `public.users` available as lookup we can easily fetch it
    let targetUserId = crypto.randomUUID();
    try {
      const { data: targetUser } = await supabase.from('users').select('id').eq('email', email).single();
      if (targetUser) {
        targetUserId = targetUser.id;
      }
    } catch (e) {
      console.warn("User lookup for revenue insertion failed, using custom/offline tracking:", e);
    }

    try {
      await supabase.from('revenue_reports').insert({
        user_id: targetUserId,
        email,
        month,
        amount,
        currency,
        breakdown: [{ releaseName, amount }]
      });
    } catch (e) {
      console.warn("Revenue report insertion failed, saving to local state only:", e);
    }

    updateState((prev) => {
      // Find existing report for this user, month, and currency
      const existingIdx = prev.revenueReports.findIndex(
        r => r.email === email && r.month === month && (r.currency || 'USD') === currency
      );
      
      const newBreakdownItem = { releaseName, amount };
      
      let updatedReports = [...prev.revenueReports];
      
      if (existingIdx > -1) {
        // Append breakdown and add amount
        const currentRep = updatedReports[existingIdx];
        updatedReports[existingIdx] = {
          ...currentRep,
          amount: currentRep.amount + amount,
          breakdown: [...currentRep.breakdown, newBreakdownItem],
        };
      } else {
        // Insert brand new report block
        const newReport: RevenueReport = {
          id: crypto.randomUUID(),
          email,
          month,
          amount,
          currency,
          breakdown: [newBreakdownItem],
        };
        updatedReports = [newReport, ...updatedReports];
      }

      return {
        ...prev,
        revenueReports: updatedReports,
      };
    });
  };

  // Impersonating mechanics
  const isAppAdmin = (email?: string) => email === 'admin@g.g' || email === 'wavoradashboard@gmail.com';

  const handleImpersonateUser = (targetUser: User) => {
    if (isAppAdmin(currentUser?.email)) {
      setRealAdminUser(currentUser);
    }
    setCurrentUser(targetUser);
    setIsImpersonating(true);
    setCurrentTab('home');
  };

  const handleExitImpersonation = () => {
    if (realAdminUser) {
      setCurrentUser(realAdminUser);
      setRealAdminUser(null);
    } else {
      // Fallback
      const admin = users.find(u => isAppAdmin(u.email));
      if (admin) setCurrentUser(admin);
    }
    setIsImpersonating(false);
    setCurrentTab('admin-panel');
  };

  const handleSavePassword = async (currentPass: string, newPass: string) => {
    if (!currentUser) return { success: false, message: 'No active user session.' };
    
    // Find absolute exact current state of the user password to make sure current password matches
    const actualUser = appState.users.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
    
    if (!actualUser) {
      return { success: false, message: 'User not found in roster statistics.' };
    }

    if (actualUser.password !== currentPass) {
      return { success: false, message: 'Incorrect current password.' };
    }

    // 1. Update in Supabase Authentication if connected
    try {
      const { error: authError } = await supabase.auth.updateUser({ password: newPass });
      if (authError) {
        console.warn("Failed updating Supabase auth password:", authError);
      }
    } catch (e) {
      console.warn("Error calling supabase.auth.updateUser:", e);
    }

    // 2. Sync password in public.users table (inside allowed_p_lines using our standard helper) so admin can see it
    try {
      await handleUpdateUser(currentUser.email, { password: newPass });
    } catch (e) {
      console.warn("Error updating user database with new password:", e);
    }

    // 3. Save and persist in local state
    updateState((prev) => ({
      ...prev,
      users: prev.users.map((u) => 
        u.email.toLowerCase() === currentUser.email.toLowerCase() 
          ? { ...u, password: newPass } 
          : u
      ),
    }));

    // Update local state copy
    setCurrentUser((prevUser) => prevUser ? { ...prevUser, password: newPass } : null);

    return { success: true, message: 'Password updated successfully and synchronized to database!' };
  };

  // Artist Actions
  const handleAddArtist = async (profile: ArtistProfile) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Use the email specifically set on the artist object (important for admin registrations)
      const targetEmail = profile.email || currentUser?.email;

      // If admin is adding for another user (or impersonating), look up their ID
      let targetUserId = session.user.id;
      const isActuallyAdmin = isAppAdmin(realAdminUser?.email) || isAppAdmin(currentUser?.email);
      
      if (isActuallyAdmin && targetEmail !== (realAdminUser?.email || currentUser?.email)) {
        // Use the known ID of the currentUser if we are impersonating them
        if (isImpersonating && currentUser && targetEmail === currentUser.email) {
          targetUserId = currentUser.id;
        } else {
          try {
            const { data: targetUser } = await supabase.from('users').select('id').eq('email', targetEmail).single();
            if (targetUser) targetUserId = targetUser.id;
          } catch (e) {
            console.error("Error looking up target user id:", e);
          }
        }
      }

      const payload: any = {
        user_id: targetUserId,
        email: targetEmail,
        name: profile.name,
        spotify_link: profile.spotifyLink,
        apple_music_link: profile.appleMusicLink,
        instagram_link: profile.instagramLink,
      };

      try {
        const fullPayload = {
          ...payload,
          default_c_line: profile.defaultCLine,
          default_p_line: profile.defaultPLine
        };
        const { error } = await supabase.from('artists').insert(fullPayload);
        if (error) {
          console.warn("Inserting artist custom lines failed, falling back without default lines:", error);
          const { error: fallbackError } = await supabase.from('artists').insert(payload);
          if (fallbackError) {
            console.error("Artist fallback insert failed too:", fallbackError);
          }
        }
      } catch (e) {
        console.error("Artist insertion exception:", e);
      }
    } else {
      console.warn("No active session found. Saving artist to local state only.");
    }

    updateState((prev) => ({
      ...prev,
      artists: [...prev.artists, profile],
    }));
  };

  const handleRemoveArtist = async (id: string) => {
    try {
      await supabase.from('artists').delete().eq('id', id);
    } catch (e) {
      console.error("Artist deletion error:", e);
    }
    updateState((prev) => ({
      ...prev,
      artists: prev.artists.filter((art) => art.id !== id),
    }));
  };

  const handleUpdateArtist = async (id: string, updates: Partial<ArtistProfile>) => {
    const baseUpdates: any = {
      ...(updates.name && { name: updates.name }),
      ...(updates.spotifyLink && { spotify_link: updates.spotifyLink }),
      ...(updates.appleMusicLink && { apple_music_link: updates.appleMusicLink }),
      ...(updates.instagramLink && { instagram_link: updates.instagramLink }),
    };

    try {
      const fullUpdates = {
        ...baseUpdates,
        ...(updates.defaultCLine !== undefined && { default_c_line: updates.defaultCLine }),
        ...(updates.defaultPLine !== undefined && { default_p_line: updates.defaultPLine })
      };
      const { error } = await supabase.from('artists').update(fullUpdates).eq('id', id);
      if (error) {
        console.warn("Updating artist custom lines failed, trying fallback without default lines:", error);
        const { error: fallbackError } = await supabase.from('artists').update(baseUpdates).eq('id', id);
        if (fallbackError) {
          console.error("Artist update fallback failed too:", fallbackError);
        }
      }
    } catch (e) {
      console.error("Artist update exception:", e);
    }

    updateState((prev) => ({
      ...prev,
      artists: prev.artists.map((art) => art.id === id ? { ...art, ...updates } : art),
    }));
  };

  const handleUpdateUser = async (email: string, updates: Partial<User>) => {
    const targetUser = appState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Determine target/base PLines
    let basePLines = updates.allowedPLines !== undefined ? updates.allowedPLines : (targetUser?.allowedPLines || []);
    
    // Filter out previously injected overrides
    let filteredPLines = basePLines.filter(line => 
      !line.startsWith('__PWD_OVERRIDE__:') && 
      !line.startsWith('__PLAN_END_DATE__:') && 
      !line.startsWith('__UPI_ID__:') && 
      !line.startsWith('__BANK_NAME__:') && 
      !line.startsWith('__BANK_ACC__:') && 
      !line.startsWith('__BANK_IFSC__:') && 
      !line.startsWith('__BANK_HOLDER__:')
    );
    
    // Collect active values for overrides
    const activePassword = updates.password !== undefined ? updates.password : targetUser?.password;
    const activePlanEndDate = updates.planEndDate !== undefined ? updates.planEndDate : targetUser?.planEndDate;
    const activeUpiId = updates.upiId !== undefined ? updates.upiId : targetUser?.upiId;
    const activeBankName = updates.bankName !== undefined ? updates.bankName : targetUser?.bankName;
    const activeBankAccountNo = updates.bankAccountNo !== undefined ? updates.bankAccountNo : targetUser?.bankAccountNo;
    const activeBankIfsc = updates.bankIfsc !== undefined ? updates.bankIfsc : targetUser?.bankIfsc;
    const activeBankHolderName = updates.bankHolderName !== undefined ? updates.bankHolderName : targetUser?.bankHolderName;
    
    let rawPLinesToCommit = [...filteredPLines];
    if (activePassword) {
      rawPLinesToCommit.push(`__PWD_OVERRIDE__:${activePassword}`);
    }
    // We used to pack planEndDate here. But let's also preserve it here for backward compatibility or let native DB take precedence.
    if (activePlanEndDate) {
      rawPLinesToCommit.push(`__PLAN_END_DATE__:${activePlanEndDate}`);
    }
    if (activeUpiId) {
      rawPLinesToCommit.push(`__UPI_ID__:${activeUpiId}`);
    }
    if (activeBankName) {
      rawPLinesToCommit.push(`__BANK_NAME__:${activeBankName}`);
    }
    if (activeBankAccountNo) {
      rawPLinesToCommit.push(`__BANK_ACC__:${activeBankAccountNo}`);
    }
    if (activeBankIfsc) {
      rawPLinesToCommit.push(`__BANK_IFSC__:${activeBankIfsc}`);
    }
    if (activeBankHolderName) {
      rawPLinesToCommit.push(`__BANK_HOLDER__:${activeBankHolderName}`);
    }

    const baseUpdates: any = {
      ...(updates.artistName && { artist_name: updates.artistName }),
      ...(updates.plan && { plan: updates.plan }),
      ...(updates.isApproved !== undefined && { is_approved: updates.isApproved }),
      ...(updates.registeredAt && { registered_at: updates.registeredAt }),
      ...(updates.planStartDate && { plan_start_date: updates.planStartDate }),
      ...(updates.planEndDate && { plan_end_date: updates.planEndDate }),
    };

    try {
      const fullUpdates = {
        ...baseUpdates,
        ...(updates.allowedCLines !== undefined && { allowed_c_lines: updates.allowedCLines.join('|||') }),
        allowed_p_lines: rawPLinesToCommit.join('|||')
      };
      const { error } = await supabase.from('users').update(fullUpdates).eq('email', email);
      if (error) {
        console.warn("Updating user allowed lines failed, trying fallback without them:", error);
        const { error: fallbackError } = await supabase.from('users').update(baseUpdates).eq('email', email);
        if (fallbackError) {
          console.error("User update fallback failed too:", fallbackError);
        }
      }
    } catch (e) {
      console.error("User update exception:", e);
    }

    updateState((prev) => {
      return {
        ...prev,
        users: prev.users.map((u) => u.email === email ? { 
          ...u, 
          ...updates,
          allowedCLines: updates.allowedCLines !== undefined ? updates.allowedCLines : u.allowedCLines,
          allowedPLines: filteredPLines
        } : u),
      };
    });

    if (currentUser?.email === email) {
      setCurrentUser(prev => prev ? {
        ...prev,
        ...updates,
        allowedCLines: updates.allowedCLines !== undefined ? updates.allowedCLines : prev.allowedCLines,
        allowedPLines: filteredPLines
      } : null);
    }
  };

  const handleAddPayoutRequest = async (
    amount: number,
    currency: 'USD' | 'INR',
    method: 'UPI' | 'Bank',
    details: { upiId?: string; bankName?: string; bankAccountNo?: string; bankIfsc?: string; bankHolderName?: string }
  ) => {
    if (!currentUser) return;
    const newRequest: PayoutRequest = {
      id: crypto.randomUUID(),
      email: currentUser.email,
      artistName: currentUser.artistName,
      amount,
      currency,
      paymentMethod: method,
      paymentDetails: details,
      submittedAt: new Date().toISOString(),
      status: 'Pending' as const
    };

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      try {
        const { error: insError } = await supabase.from('payout_requests').insert({
          id: newRequest.id,
          user_id: session.user.id,
          email: newRequest.email,
          artist_name: newRequest.artistName,
          amount: newRequest.amount,
          currency: newRequest.currency,
          payment_method: newRequest.paymentMethod,
          payment_details: newRequest.paymentDetails,
          submitted_at: newRequest.submittedAt,
          status: newRequest.status
        });
        if (insError) {
          console.error("Payout request insert error:", insError);
          alert(`System Error: Failed to sync payout request with the cloud database. ${insError.message}`);
        }
      } catch (e) {
        console.error("Payout request insert exception:", e);
      }
    } else {
      console.warn("No active session found. Saving payout request to local state only.");
    }

    updateState((prev) => ({
      ...prev,
      payoutRequests: [newRequest, ...(prev.payoutRequests || [])]
    }));
  };

  const handleUpdatePayoutRequest = async (id: string, status: 'Approved' | 'Rejected', feedback?: string) => {
    try {
      const { data, error: updErr } = await supabase.from('payout_requests').update({ status, feedback }).eq('id', id).select();
      if (updErr) {
        console.error("Payout request update error:", updErr);
        alert(`Failed to update payout status in the database: ${updErr.message}`);
      } else if (data && data.length === 0) {
        alert("Database update returned 0 rows! Update was blocked by Row Level Security permissions. Check your admin email casing.");
      } else {
        // Optional: uncomment below if you want visible confirmation
        // alert(`Successfully marked request ${id} as ${status}`);
      }
    } catch (e) {
      console.error("Payout request update error:", e);
    }
    updateState((prev) => ({
      ...prev,
      payoutRequests: (prev.payoutRequests || []).map(r => r.id === id ? { ...r, status, feedback } : r)
    }));
  };

  const handleAddLabel = async (label: Label) => {
    let targetUserId = "";
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        targetUserId = session.user.id;
        
        // Use the email specifically set on the label object (important for admin registrations)
        const targetEmail = label.email || currentUser?.email;

        // If admin is adding for another user (or impersonating), we might need that user's actual ID
        const isActuallyAdmin = isAppAdmin(realAdminUser?.email) || isAppAdmin(currentUser?.email);

        if (isActuallyAdmin && targetEmail !== (realAdminUser?.email || currentUser?.email)) {
          // Use the known ID of the currentUser if we are impersonating them
          if (isImpersonating && currentUser && targetEmail === currentUser.email) {
            targetUserId = currentUser.id;
          } else {
            const { data: targetUser } = await supabase.from('users').select('id').eq('email', targetEmail).single();
            if (targetUser) targetUserId = targetUser.id;
          }
        }

        await supabase.from('labels').insert({
          user_id: targetUserId,
          email: targetEmail,
          name: label.name
        });
      }
    } catch (e) {
      console.warn("Failed syncing label to Supabase, updating locally only:", e);
    }

    updateState((prev) => ({
      ...prev,
      labels: [...prev.labels, label],
    }));
  };

  const handleRemoveLabel = async (id: string) => {
    try {
      await supabase.from('labels').delete().eq('id', id);
    } catch (e) {
      console.warn("Failed removing label from Supabase, updating locally only:", e);
    }
    updateState((prev) => ({
      ...prev,
      labels: prev.labels.filter((lbl) => lbl.id !== id),
    }));
  };

  const handleDeleteRelease = async (id: string) => {
    // 1. Fetch the release to get its file paths
    const releaseToDelete = appState.releases.find(r => r.id === id);
    if (releaseToDelete) {
      const filesToDelete: string[] = [];
      
      // Cover Art
      if (releaseToDelete.coverArtUrl && !releaseToDelete.coverArtUrl.startsWith('http')) {
        filesToDelete.push(releaseToDelete.coverArtUrl);
      }
      
      // Audio files
      if (releaseToDelete.tracks) {
        releaseToDelete.tracks.forEach(track => {
          if (track.audioFileName && !track.audioFileName.startsWith('http') && track.audioFileName.includes('/audio/')) {
            filesToDelete.push(track.audioFileName);
          }
        });
      }
      
      // Attempt storage deletion
      if (filesToDelete.length > 0) {
        try {
          await supabase.storage.from('app-files').remove(filesToDelete);
        } catch(e) {
          console.error("Failed to delete storage files", e);
        }
      }
    }

    // 2. Delete from DB
    try {
      await supabase.from('releases').delete().eq('id', id);
    } catch (e) {
      console.warn("Failed deleting release from Supabase, updating locally only:", e);
    }
    
    // 3. Update local state
    updateState((prev) => ({
      ...prev,
      releases: prev.releases.filter((r) => r.id !== id),
    }));
  };

  const handleEditRelease = (release: Release) => {
    setEditingRelease(release);
    setCurrentTab('new-release');
  };

  useEffect(() => {
    if (currentTab !== 'new-release') {
      setEditingRelease(null);
    }
  }, [currentTab]);

  const handleSubmitRelease = async (newRelease: Release) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Ensure valid UUID for the database in case of legacy local state IDs
        let dbId = newRelease.id;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dbId);
        if (!isUUID) {
          dbId = crypto.randomUUID();
          newRelease.id = dbId; // ensure local state matches
          console.warn(`Legacy ID format detected. Re-assigned standard UUID for database: ${dbId}`);
        }

        const payload: any = {
          id: dbId,
          user_id: session.user.id,
          email: currentUser?.email,
          album_name: newRelease.albumName,
          type: newRelease.type,
          main_artist_name: newRelease.mainArtistName,
          other_artists: newRelease.otherArtists,
          language: newRelease.language,
          content_type: newRelease.contentType,
          num_tracks: newRelease.numTracks,
          genre: newRelease.genre,
          sub_genre: newRelease.subGenre,
          label_name: newRelease.labelName,
          upc: newRelease.upc,
          content_id: newRelease.contentId || 'No',
          c_line: newRelease.cLine,
          p_line: newRelease.pLine,
          release_date: newRelease.releaseDate,
          cover_art_url: newRelease.coverArtUrl,
          tracks: newRelease.tracks,
          special_request: newRelease.specialRequest,
          status: 'Submitted',
          submitted_at: newRelease.submittedAt
        };

        try {
          const fullPayload = {
            ...payload,
            feature_artists: newRelease.featureArtists
          };
          
          let firstError = null;
          // If editing AND it was a valid UUID, try updating. Otherwise, just insert it.
          if (editingRelease && isUUID) {
            const { error } = await supabase.from('releases').update(fullPayload).eq('id', dbId);
            firstError = error;
          } else {
            const { error } = await supabase.from('releases').insert(fullPayload);
            firstError = error;
          }

          if (firstError) {
            console.warn("First attempt failed, trying fallback serialize within other_artists", firstError);
            const fallbackPayload = {
              ...payload,
              other_artists: {
                serialized_other: newRelease.otherArtists,
                serialized_feature: newRelease.featureArtists
              }
            };
            
            let fallbackError = null;
            if (editingRelease && isUUID) {
               const { error } = await supabase.from('releases').update(fallbackPayload).eq('id', dbId);
               fallbackError = error;
            } else {
               const { error } = await supabase.from('releases').insert(fallbackPayload);
               fallbackError = error;
            }

            if (fallbackError) {
              console.error("Fallback operation also failed:", fallbackError);
              alert("Failed to save release to database. Error: " + fallbackError.message);
            }
          }
        } catch (e: any) {
          console.error("Release database exception:", e);
          alert("Exception while saving release: " + e.message);
        }
      } else {
        console.warn("No active session found during release submission. Saving to local state only.");
      }
    } catch (e) {
      console.warn("Auth initialization failed during release submit:", e);
    }

    let coverArtSignedUrl = newRelease.coverArtSignedUrl;
    try {
      if (newRelease.coverArtUrl && !newRelease.coverArtUrl.startsWith('http')) {
        const { data: urlData } = await supabase.storage.from('app-files').createSignedUrl(newRelease.coverArtUrl, 3600);
        if (urlData?.signedUrl) {
           coverArtSignedUrl = urlData.signedUrl;
        }
      }
    } catch (e) {
      console.warn("Could not generate cover art signed URL online, keeping original:", e);
    }

    updateState((prev) => {
      const existingIdx = prev.releases.findIndex(r => r.id === newRelease.id);
      const newArray = [...prev.releases];
      if (existingIdx !== -1) {
        newArray[existingIdx] = { ...newRelease, coverArtSignedUrl };
      } else {
        newArray.unshift({ ...newRelease, coverArtSignedUrl });
      }
      return {
        ...prev,
        releases: newArray,
      };
    });
  };

  const handleSubmitSupportQuery = async (queryText: string) => {
    if (!currentUser) return;
    const { data: { session } } = await supabase.auth.getSession();

    const newQuery: SupportQuery = {
      id: crypto.randomUUID(),
      email: currentUser.email,
      artistName: currentUser.artistName,
      queryText,
      submittedAt: new Date().toISOString(),
      status: 'Pending',
    };

    if (session?.user) {
      try {
        await supabase.from('support_queries').insert({
          user_id: session.user.id,
          email: currentUser.email,
          artist_name: currentUser.artistName,
          query_text: queryText,
          status: 'Pending',
          submitted_at: newQuery.submittedAt
        });
      } catch (e) {
        console.error("Support query insert error:", e);
      }
    } else {
      console.warn("No active session found. Saving support query to local state only.");
    }

    updateState((prev) => ({
      ...prev,
      queries: [newQuery, ...prev.queries],
    }));
  };

  const handleSubmitOacApplication = async (youtubeLink: string, spotifyLink: string, fullName: string) => {
    if (!currentUser) return;
    const { data: { session } } = await supabase.auth.getSession();

    const newOac: OacApplication = {
      id: crypto.randomUUID(),
      email: currentUser.email,
      artistName: currentUser.artistName,
      spotifyLink,
      youtubeLink,
      fullName,
      submittedAt: new Date().toISOString(),
      status: 'Pending',
    };

    if (session?.user) {
      try {
        await supabase.from('oac_applications').insert({
          user_id: session.user.id,
          email: currentUser.email,
          artist_name: currentUser.artistName,
          spotify_link: spotifyLink,
          youtube_link: youtubeLink,
          full_name: fullName,
          status: 'Pending',
          submitted_at: newOac.submittedAt
        });
      } catch (e) {
        console.error("OAC application insert error:", e);
      }
    } else {
      console.warn("No active session found. Saving OAC application to local state only.");
    }

    updateState((prev) => ({
      ...prev,
      oacApplications: [newOac, ...prev.oacApplications],
    }));
  };

  const handlePushNotification = async (newNotif: any) => {
    try {
      await supabase.from('notifications').insert({
        title: newNotif.title,
        message: newNotif.message,
        target_type: newNotif.targetType,
        target_value: newNotif.targetValue,
        severity: newNotif.severity,
        created_at: newNotif.createdAt
      });
    } catch (e) {
      console.warn("Could not push notification to Supabase, running local state only:", e);
    }

    updateState((prev) => ({
      ...prev,
      notifications: [newNotif, ...(prev.notifications || [])],
    }));
  };

  const handleDeleteNotification = async (notifId: string) => {
    try {
      await supabase.from('notifications').delete().eq('id', notifId);
    } catch (e) {
      console.warn("Could not delete notification from Supabase, running local state only:", e);
    }
    updateState((prev) => ({
      ...prev,
      notifications: (prev.notifications || []).filter(n => n.id !== notifId),
    }));
  };

  const handleDownloadFile = async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from('app-files').createSignedUrl(path, 60);
      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err: any) {
      alert('Download Error: ' + err.message);
    }
  };

  const ensureMainArtistProfile = async (user: User, userId: string) => {
    if (user.email === 'admin@g.g' || user.email === 'wavoradashboard@gmail.com') return;
    
    // Check if user already has an artist profile with their main name
    // We check if THEY HAVE ANY artists first. If they have 0 artists, we definitely add the main one.
    // If they have artists, we check if one matches their artistName.
    const { data: existing } = await supabase.from('artists')
      .select('id')
      .eq('email', user.email)
      .eq('name', user.artistName);

    if (!existing || existing.length === 0) {
      await supabase.from('artists').insert({
        user_id: userId,
        email: user.email,
        name: user.artistName,
        spotify_link: 'https://open.spotify.com/artist/verify_required',
        apple_music_link: 'https://music.apple.com/artist/verify_required',
        instagram_link: 'https://instagram.com/verify_required'
      });
      // Refresh to reflect in UI
      await loadSupabaseData(user.email, userId);
    }
  };

  // Render view router based on currentTab
  const renderCurrentView = () => {
    if (!currentUser) return null;

    let viewComponent: React.ReactNode;

    switch (currentTab) {
      case 'home':
        viewComponent = (
          <DashboardHome
            currentUser={currentUser}
            releases={releases}
            revenueReports={revenueReports}
            setCurrentTab={setCurrentTab}
            onOpenRevenueModal={() => setIsRevenueModalOpen(true)}
            notifications={notifications}
          />
        );
        break;
      case 'new-release':
        viewComponent = (
          <NewReleaseWizard
            currentUser={currentUser}
            managedArtists={artists}
            managedLabels={labels}
            onSubmitRelease={handleSubmitRelease}
            setCurrentTab={setCurrentTab}
            editingRelease={editingRelease}
            onCancelEdit={() => {
              setEditingRelease(null);
              setCurrentTab('catalogue');
            }}
          />
        );
        break;
      case 'manage-artists':
        viewComponent = (
          <ManageArtists
            currentUser={currentUser}
            users={users}
            managedArtists={artists}
            onAddArtist={handleAddArtist}
            onRemoveArtist={handleRemoveArtist}
            isImpersonating={isImpersonating}
          />
        );
        break;
      case 'member-pool':
        viewComponent = (
          <MemberPool
            currentUser={currentUser}
            users={users}
            onImpersonateUser={handleImpersonateUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        );
        break;
      case 'manage-labels':
        viewComponent = (
          <ManageLabels
            currentUser={currentUser}
            users={users}
            managedLabels={labels}
            onAddLabel={handleAddLabel}
            onRemoveLabel={handleRemoveLabel}
            isImpersonating={isImpersonating}
          />
        );
        break;
      case 'catalogue':
        viewComponent = (
          <CatalogueView
            currentUser={currentUser}
            releases={releases}
            onDeleteRelease={handleDeleteRelease}
            onEditRelease={handleEditRelease}
          />
        );
        break;
      case 'revenue':
        viewComponent = (
          <RevenuePage
            currentUser={currentUser}
            revenueReports={revenueReports}
            onOpenRevenueModal={() => setIsRevenueModalOpen(true)}
            payoutRequests={appState.payoutRequests || []}
            onAddPayoutRequest={handleAddPayoutRequest}
            onUpdateUser={handleUpdateUser}
          />
        );
        break;
      case 'support':
        viewComponent = (
          <SupportPage
            currentUser={currentUser}
            supportQueries={queries}
            onSubmitSupportQuery={handleSubmitSupportQuery}
            oacApplications={oacApplications}
            onSubmitOacApplication={handleSubmitOacApplication}
          />
        );
        break;
      case 'admin-panel':
        viewComponent = (
          <AdminPanel
            currentUser={currentUser}
            users={users}
            releases={releases}
            artists={artists}
            supportQueries={queries}
            oacApplications={oacApplications}
            onApproveUser={handleApproveUser}
            onRejectUser={handleRejectUser}
            onCreateUser={handleCreateUser}
            onUpdateReleaseStatus={handleUpdateReleaseStatus}
            onUpdateRelease={handleUpdateRelease}
            onReplySupportQuery={handleReplySupportQuery}
            onUpdateOacStatus={handleUpdateOacStatus}
            onPostRevenue={handlePostRevenue}
            onImpersonateUser={handleImpersonateUser}
            notifications={notifications}
            onPushNotification={handlePushNotification}
            onDeleteNotification={handleDeleteNotification}
            onDownloadFile={handleDownloadFile}
            onUpdateArtist={handleUpdateArtist}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            payoutRequests={appState.payoutRequests || []}
            onUpdatePayoutRequest={handleUpdatePayoutRequest}
          />
        );
        break;
      default:
        viewComponent = (
          <div className="p-8 text-center text-gray-400">
            <h3 className="font-bold text-lg">Work in Progress</h3>
            <p className="text-xs mt-1">This module is under construction.</p>
          </div>
        );
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full flex flex-col"
        >
          {viewComponent}
        </motion.div>
      </AnimatePresence>
    );
  };

  // Unauthenticated screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        allUsers={users}
      />
    );
  }

  // Get active tab icon
  const getTabIcon = () => {
    switch (currentTab) {
      case 'home': return <Home className="w-4 h-4 text-[#6366F1]" />;
      case 'new-release': return <Disc className="w-4 h-4 text-[#6366F1]" />;
      case 'manage-artists': return <Users className="w-4 h-4 text-[#6366F1]" />;
      case 'member-pool': return <Users className="w-4 h-4 text-[#6366F1]" />;
      case 'manage-labels': return <Tags className="w-4 h-4 text-[#6366F1]" />;
      case 'catalogue': return <Layers className="w-4 h-4 text-[#6366F1]" />;
      case 'revenue': return <Landmark className="w-4 h-4 text-[#6366F1]" />;
      case 'support': return <HelpCircle className="w-4 h-4 text-[#6366F1]" />;
      default: return <Sparkles className="w-4 h-4 text-[#6366F1]" />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] w-full bg-transparent text-white font-sans overflow-hidden" id="app_root_layout">
      
      {/* Sidebar Component */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        isImpersonating={isImpersonating}
        onExitImpersonation={handleExitImpersonation}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      {/* Main viewport block */}
      <main className="flex-1 flex flex-col min-w-0 lg:p-4 overflow-hidden" id="app_main_wrapper">
        <div className="bg-[#0a0f1d] lg:border border-white/10 lg:rounded-[2rem] w-full h-full flex flex-col overflow-y-auto shadow-2xl shadow-indigo-500/10 relative">
        
        {/* Editorial Top Bar / Header - Conditionally hidden for New Release Wizard to prevent double headers */}
        {currentTab !== 'new-release' && (
          <header className="h-16 md:h-20 shrink-0 border-b border-white/10 flex items-center justify-between px-4 md:px-8 bg-[#070710] sticky top-0 z-30" id="editorial_top_bar">
          <div className="flex items-center gap-2 md:gap-3 animate-fade-in">
            {/* Mobile Nav Toggle */}
            <button
              type="button"
              onClick={() => setIsOpenMobile(true)}
              className="lg:hidden p-1.5 -ml-1 rounded-xl hover:bg-white/5 text-gray-400 hover:text-[#6366F1] transition cursor-pointer"
              id="btn_hamburger_mobile"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            {isSidebarCollapsed && (
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className="hidden lg:flex p-1.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-[#6366F1] transition cursor-pointer mr-2.5"
                id="btn_expand_sidebar"
                title="Expand Sidebar"
              >
                <Menu className="w-5 h-5 text-gray-400 hover:text-[#6366F1]" />
              </button>
            )}
            <div className="hidden md:block p-2 bg-white/5 border border-white/10 rounded-xl">
              {getTabIcon()}
            </div>
            <div className="text-left">
              <h1 className="text-sm md:text-2xl font-black tracking-tighter text-white flex items-center gap-1.5 md:gap-3">
                <span className="capitalize truncate max-w-[120px] md:max-w-none">{currentTab.replace('-', ' ')}</span>
                <span className="text-[#6366F1] text-[8px] md:text-xs">●</span>
                <span className="text-gray-500 font-medium text-[10px] md:text-sm tracking-widest uppercase hidden md:inline">
                  {currentTab === 'admin-panel' ? 'Administration Suite' : 'Workspace'}
                </span>
              </h1>
              <p className="text-[8px] md:text-[11px] text-gray-400 font-medium uppercase tracking-widest hidden sm:block mt-0.5">
                {(currentUser.email === 'admin@g.g' || currentUser.email === 'wavoradashboard@gmail.com') ? 'System Administrator Portal' : 'Standard Artist Account'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-gray-350">{currentUser.artistName}</p>
              <p className="text-[10px] text-indigo-650 flex items-center gap-1 justify-end font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                Verified Artist Account
              </p>
            </div>

            {/* Premium Notification Bell Trigger with Badge */}
            <button
              type="button"
              onClick={() => setIsNotifDrawerOpen(true)}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#6366F1]/50 flex items-center justify-center relative transition-all cursor-pointer shadow-inner active:scale-95 group"
              id="btn_header_notification_bell"
              title="Open System Bulletins"
            >
              <Bell className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] text-gray-400 group-hover:text-[#6366F1] transition-all group-hover:rotate-12" />
              {activeNotifCount > 0 && (
                <span 
                  className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-[14px] px-0.5 items-center justify-center rounded-full bg-red-500 text-[7px] md:text-[9px] font-black text-white leading-none ring-[2px] ring-[#070710] animate-pulse"
                  id="notif_header_badge_count"
                >
                  {activeNotifCount}
                </span>
              )}
            </button>

            {/* User Badge avatar - Clickable */}
            <button 
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#6366F1]/50 flex items-center justify-center font-bold text-[10px] md:text-xs text-[#6366F1] transition-all cursor-pointer shadow-inner active:scale-95 group relative"
              id="btn_header_profile_avatar"
              title="View Profile Suite"
            >
              <span className="group-hover:scale-105 transition-transform">
                {currentUser.artistName.charAt(0).toUpperCase()}
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 md:w-2.5 h-2 md:h-2.5 bg-[#6366F1] border border-[#070710] rounded-full" />
            </button>
          </div>
        </header>
        )}

        {/* Dashboard Content Container */}
        <div className="p-4 md:p-8 flex-1 max-w-7xl w-full mx-auto" id="app_view_viewport">
          {renderCurrentView()}
        </div>

        {/* Friendly Footer */}
        <footer className="py-4 px-6 lg:px-8 bg-transparent border-t border-white/10 flex flex-col lg:flex-row items-center justify-between text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold gap-3 mt-auto shrink-0" id="editorial_footer">
          <div className="flex gap-4 lg:gap-6">
            <span>© 2026 Wavora Live</span>
            <span>Status: <span className="text-emerald-600 underline">Active & Guarded</span></span>
          </div>
          <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
            <button type="button" onClick={() => setCurrentTab('support')} className="hover:text-white cursor-pointer transition">Official Artist Channel Request</button>
            <span className="opacity-40">|</span>
            <span className="hover:text-white cursor-pointer">Legal & Copyright</span>
            <span className="opacity-40">|</span>
            <button type="button" onClick={() => setCurrentTab('support')} className="hover:text-white cursor-pointer transition">Contact Support Desk</button>
          </div>
        </footer>

        </div>
      </main>

      {currentUser && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          currentUser={currentUser}
          onSavePassword={handleSavePassword}
        />
      )}

      {currentUser && (
        <RevenueReportsModal
          isOpen={isRevenueModalOpen}
          onClose={() => setIsRevenueModalOpen(false)}
          currentUser={currentUser}
          revenueReports={revenueReports}
        />
      )}

      {currentUser && (
        <NotificationsDrawer
          isOpen={isNotifDrawerOpen}
          onClose={() => setIsNotifDrawerOpen(false)}
          currentUser={currentUser}
          notifications={notifications}
        />
      )}
    </div>
  );
}

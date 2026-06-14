import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  X, 
  Calendar, 
  Inbox, 
  RotateCcw
} from 'lucide-react';
import { User, Notification } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  notifications: Notification[];
}

export default function NotificationsDrawer({ isOpen, onClose, currentUser, notifications }: NotificationsDrawerProps) {
  const storageKey = `wavora_dismissed_notif_${currentUser.email}`;
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep state synced with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(dismissedIds));
    } catch (e) {
      console.error('Failed storing dismissed states in drawer:', e);
    }
    
    // Sync external widgets by triggering a storage event if needed, but standard React state in app fits best
    const event = new Event('wavora_notifications_synced');
    window.dispatchEvent(event);
  }, [dismissedIds, storageKey]);

  // Listen for local synchronization events from other widgets
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setDismissedIds(JSON.parse(saved));
        }
      } catch {}
    };
    window.addEventListener('wavora_notifications_synced', handleSync);
    return () => window.removeEventListener('wavora_notifications_synced', handleSync);
  }, [storageKey]);

  // Filter actual notifications directed to this particular artist
  const filteredNotifications = notifications.filter(notif => {
    if (notif.targetType === 'Everyone') {
      return true;
    }
    if (notif.targetType === 'Plan') {
      return notif.targetValue?.toLowerCase() === currentUser.plan?.toLowerCase();
    }
    if (notif.targetType === 'Artist') {
      return notif.targetValue?.toLowerCase() === currentUser.email?.toLowerCase();
    }
    return false;
  });

  // Active notifications (excluding dismissed ones)
  const activeNotifications = filteredNotifications.filter(notif => !dismissedIds.includes(notif.id));
  
  // Archival/Read notifications (only the dismissed ones which apply to the user)
  const archivedNotifications = filteredNotifications.filter(notif => dismissedIds.includes(notif.id));

  const handleDismiss = (id: string) => {
    if (!dismissedIds.includes(id)) {
      setDismissedIds(prev => [...prev, id]);
    }
  };

  const handleRestore = (id: string) => {
    setDismissedIds(prev => prev.filter(item => item !== id));
  };

  const handleDismissAll = () => {
    const userNotifsIds = filteredNotifications.map(n => n.id);
    setDismissedIds(prev => {
      const merged = new Set([...prev, ...userNotifsIds]);
      return Array.from(merged);
    });
  };

  const handleResetAll = () => {
    setDismissedIds([]);
  };

  const getSeverityIcon = (severity: Notification['severity']) => {
    switch (severity) {
      case 'Critical':
        return <AlertOctagon className="w-4 h-4 text-red-400" />;
      case 'Warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'Success':
        return <CheckCircle2 className="w-4 h-4 text-[#6366F1]" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityColorClasses = (severity: Notification['severity']) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-950/25 border-red-500/20 text-red-200';
      case 'Warning':
        return 'bg-amber-950/25 border-amber-500/10 text-amber-200';
      case 'Success':
        return 'bg-indigo-950/20 border-indigo-500/10 text-indigo-200';
      default:
        return 'bg-blue-950/20 border-blue-500/10 text-blue-200';
    }
  };

  const getSeverityLabelColors = (severity: Notification['severity']) => {
    switch (severity) {
      case 'Critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Success': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" id="global_notifications_portal">
          {/* Backdrop with elegant fade transition */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            id="notif_drawer_backdrop"
          />

          {/* Drawer content sliding in nicely */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-md h-full bg-[#0E0E0E] border-l border-white/10 text-white shadow-2xl flex flex-col z-10"
            id="notif_drawer_surface"
          >
            {/* Header section */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-xl bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/25">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black md:text-base uppercase tracking-tight text-white flex items-center gap-1.5">
                    Artist Notifications
                    {activeNotifications.length > 0 && (
                      <span className="text-[10px] font-extrabold bg-[#6366F1] text-black px-1.5 py-0.5 rounded-full leading-none">
                        {activeNotifications.length}
                      </span>
                    )}
                  </h2>
                  <p className="text-[10px] text-gray-500 font-medium">Broadcast & targeted announcements feed.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition cursor-pointer"
                id="btn_close_notif_drawer"
                title="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" id="notif_drawer_feed">
              {/* Unread Alerts block */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Alerts ({activeNotifications.length})</span>
                  {activeNotifications.length > 0 && (
                    <button
                      onClick={handleDismissAll}
                      className="text-[9px] text-gray-400 hover:text-[#6366F1] font-bold uppercase tracking-wider transition hover:underline cursor-pointer"
                      id="btn_dismiss_all_drawer"
                    >
                      Dismiss All
                    </button>
                  )}
                </div>

                <AnimatePresence mode="popLayout">
                  {activeNotifications.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="py-10 px-4 text-center rounded-2xl bg-black/20 border border-[#171717] flex flex-col items-center justify-center gap-2"
                      id="drawer_notifs_empty"
                    >
                      <Inbox className="w-7 h-7 text-gray-700" />
                      <p className="text-xs text-gray-400">All caught up! No active administrative notices targeting your account.</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {activeNotifications.map((notif) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, scale: 0.96, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`p-4 rounded-2xl border flex gap-3 transition relative group ${getSeverityColorClasses(notif.severity)}`}
                          id={`drawer_notif_card_${notif.id}`}
                        >
                          <div className="flex-shrink-0 pt-0.5">
                            <div className="p-1.5 rounded-xl bg-black/40 border border-white/5">
                              {getSeverityIcon(notif.severity)}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1 space-y-1 text-left">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-extrabold text-[12px] text-white tracking-tight uppercase leading-none">
                                {notif.title}
                              </span>
                              <span className={`text-[7.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${getSeverityLabelColors(notif.severity)}`}>
                                {notif.severity}
                              </span>
                            </div>

                            <p className="text-xs text-gray-300 leading-relaxed font-normal whitespace-pre-wrap">
                              {notif.message}
                            </p>

                            <div className="flex items-center gap-2 pt-1 text-[9px] text-gray-500 font-mono">
                              <Calendar className="w-3 h-3 text-gray-600" />
                              <span>{new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              {notif.targetType !== 'Everyone' && (
                                <span className="text-[#6366F1] text-[8px] bg-black/40 px-1 border border-white/5 rounded">
                                  {notif.targetType}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDismiss(notif.id)}
                            className="p-1 hover:bg-black/30 text-gray-500 hover:text-white rounded transition self-start cursor-pointer"
                            title="Dismiss notification"
                            id={`btn_drawer_dismiss_${notif.id}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Archived Alerts block (Only shows if they exist to keep UI tidy) */}
              {archivedNotifications.length > 0 && (
                <div className="space-y-3.5 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hidden Archive ({archivedNotifications.length})</span>
                    <button
                      onClick={handleResetAll}
                      className="text-[9px] text-gray-400 hover:text-yellow-500 font-bold uppercase tracking-wider transition hover:underline cursor-pointer"
                      id="btn_restore_all_drawer"
                    >
                      Restore All
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {archivedNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3 rounded-xl border border-[#161616] bg-black/20 flex items-center justify-between gap-3 text-xs opacity-60 hover:opacity-100 transition"
                        id={`archived_notif_${notif.id}`}
                      >
                        <div className="min-w-0 flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-gray-400 text-xs truncate uppercase">
                              {notif.title}
                            </span>
                            <span className="text-[7px] text-gray-500 font-mono">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 truncate">{notif.message}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRestore(notif.id)}
                          className="flex items-center justify-center p-1.5 rounded-md hover:bg-white/5 backdrop-blur-md text-[#6366F1] hover:text-[#818CF8] transition cursor-pointer"
                          title="Restore back to alerts"
                          id={`btn_drawer_restore_${notif.id}`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer feedback */}
            <div className="p-4 border-t border-white/10 bg-black/40 text-center">
              <span className="text-[9px] text-gray-650 uppercase font-mono tracking-widest">
                Wavora Distribution Broadcast Node
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

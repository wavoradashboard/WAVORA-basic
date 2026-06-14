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
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { User, Notification } from '../types';

interface NotificationsWidgetProps {
  currentUser: User;
  notifications: Notification[];
}

export default function NotificationsWidget({ currentUser, notifications }: NotificationsWidgetProps) {
  // Save dismissed notification IDs per user in localStorage
  const storageKey = `wavora_dismissed_notif_${currentUser.email}`;
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(dismissedIds));
    } catch (e) {
      console.error('Failed storing dismissed notification states:', e);
    }
  }, [dismissedIds, storageKey]);

  // Filter notifications based on target configurations
  const activeNotifications = notifications.filter(notif => {
    // Check if dismissed
    if (dismissedIds.includes(notif.id)) return false;

    // Target check
    if (notif.targetType === 'Everyone') {
      return true;
    }
    if (notif.targetType === 'Plan') {
      // Direct match or plan level (case insensitive/general check)
      return notif.targetValue?.toLowerCase() === currentUser.plan?.toLowerCase();
    }
    if (notif.targetType === 'Artist') {
      return notif.targetValue?.toLowerCase() === currentUser.email?.toLowerCase();
    }
    return false;
  });

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
  };

  const handleResetAll = () => {
    setDismissedIds([]);
  };

  // Icon chooser
  const getSeverityIcon = (severity: Notification['severity']) => {
    switch (severity) {
      case 'Critical':
        return <AlertOctagon className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />;
      case 'Warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />;
      case 'Success':
        return <CheckCircle2 className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />;
    }
  };

  // Severity color pairings
  const getSeverityClasses = (severity: Notification['severity']) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-950/20 border-red-500/20 hover:border-red-500/30 text-red-200';
      case 'Warning':
        return 'bg-amber-950/20 border-amber-500/10 hover:border-amber-500/20 text-amber-200';
      case 'Success':
        return 'bg-indigo-950/20 border-indigo-500/10 hover:border-indigo-500/20 text-indigo-200';
      default:
        return 'bg-blue-950/20 border-blue-500/10 hover:border-blue-500/20 text-blue-200';
    }
  };

  const getSeverityLabelColor = (severity: Notification['severity']) => {
    switch (severity) {
      case 'Critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Success': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="p-5 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 text-left" id="notifications_dashboard_panel">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">Broadcast Bulletin Board</h3>
            <p className="text-[10px] text-gray-500">System updates, pipeline notices, and plan-specific instructions.</p>
          </div>
        </div>

        {dismissedIds.length > 0 && (
          <button
            onClick={handleResetAll}
            className="text-[9px] text-[#6366F1] hover:text-[#818CF8] font-bold uppercase tracking-wider hover:underline"
            id="btn_restore_dismissed_notifications"
          >
            Restore Hidden ({dismissedIds.length})
          </button>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {activeNotifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-6 px-4 text-center rounded-2xl bg-black/30 border border-[#161616] flex flex-col items-center justify-center gap-2"
            id="notifications_empty_state"
          >
            <Inbox className="w-8 h-8 text-gray-700" />
            <p className="text-xs text-gray-400 font-medium">All caught up! No active administrative notifications broadcasted.</p>
            <span className="text-[9px] text-gray-600 font-mono">BROADCAST_PIPELINE: ACTIVE_EMPTY</span>
          </motion.div>
        ) : (
          <div className="space-y-3" id="notifications_active_list">
            {activeNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-3 sm:p-4 rounded-2xl border flex gap-3 transition group relative ${getSeverityClasses(notif.severity)}`}
                id={`notification_card_${notif.id}`}
              >
                {/* Severity pill on left */}
                <div className="flex-shrink-0 flex items-start justify-center pt-0.5">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                    {getSeverityIcon(notif.severity)}
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-extrabold text-sm text-white tracking-tight uppercase leading-none">{notif.title}</h4>
                    <span className={`text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded border ${getSeverityLabelColor(notif.severity)}`}>
                      {notif.severity}
                    </span>
                    {notif.targetType !== 'Everyone' && (
                      <span className="text-[8px] font-bold text-gray-400 bg-slate-800/60 border border-slate-700/60 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        🎯 {notif.targetType}: {notif.targetValue}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-300 leading-relaxed font-normal whitespace-pre-wrap">{notif.message}</p>
                  
                  <div className="flex items-center gap-2 pt-1 text-[9px] text-gray-500 font-mono">
                    <Calendar className="w-3 h-3 text-gray-600" />
                    <span>{new Date(notif.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                </div>

                {/* Dismiss button */}
                <button
                  type="button"
                  onClick={() => handleDismiss(notif.id)}
                  className="p-1 hover:bg-black/40 text-gray-500 hover:text-white rounded-md self-start transition cursor-pointer"
                  title="Dismiss announcement"
                  id={`btn_dismiss_notification_${notif.id}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

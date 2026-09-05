import { getUserNotificationsFromFirestore } from '../../lib/firestoreService';
import React, { useState, useEffect } from 'react';
import {
  Bell,
  MessageSquare,
  Briefcase,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Download,
  Filter,
  Search,
  CheckCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  Trash2,
  X
} from 'lucide-react';
import { UserProfile } from '../../types';
import { adminStore } from '../admin/adminStore';
import { AdminNotificationRecord, AdminFormRecord } from '../admin/AdminTypes';

interface NotificationsPageProps {
  user?: UserProfile;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'jobs' | 'forms'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<AdminNotificationRecord[]>([]);
  const [formRequests, setFormRequests] = useState<AdminFormRecord[]>([]);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sff_user_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sff_user_dismissed_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load notifications from adminStore
  // Load admin notifications + current user's personal notifications
const loadData = async () => {
  // ADMIN notifications â€” untouched
  const adminNotifs = adminStore.getNotifications();

  // Forms â€” untouched
  const allForms = adminStore.getForms();

  // Personal notifications for current logged-in user
  let personalNotifs: AdminNotificationRecord[] = [];

  const currentUserId = user?.sffUserId || user?.userId;

  if (currentUserId) {
    try {
      const firestoreNotifs = await getUserNotificationsFromFirestore(currentUserId);

      personalNotifs = firestoreNotifs.map((n: any) => ({
  id: n.id,
  title: n.title || 'Notification',
  message: n.message || '',
  notificationType:
  n.notificationType ||
  (n.type === 'success'
    ? 'Application Status'
    : 'Personal Message'),
  sentDate: n.createdAt || new Date().toISOString(),
  priority: 'Medium',
  status: 'Sent',
  targetAudience: 'Selected Users',
  targetMode: 'Single User',
  targetValue: currentUserId,
  createdBy: 'Razorpay Webhook',
  attachmentName: n.attachmentName,
  attachmentUrl: n.attachmentUrl,
}));
    } catch (error) {
      console.error('Failed to load personal notifications:', error);
    }
  }

  // Admin notifications + this user's personal notifications
  setNotifications([...adminNotifs, ...personalNotifs]);
  setFormRequests(allForms);
};

  useEffect(() => {
  loadData();

  const unsubscribe = adminStore.subscribe(() => {
    loadData();
  });

  return () => unsubscribe();
}, [user?.sffUserId, user?.userId]);

  // Save read IDs
  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      try {
        localStorage.setItem('sff_user_read_notifications', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save read state', e);
      }
    }
  };

  const markAllAsRead = () => {
    const allIds = userNotifications.map((n) => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem('sff_user_read_notifications', JSON.stringify(allIds));
    } catch (e) {
      console.error('Failed to save read state', e);
    }
  };

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem('sff_user_dismissed_notifications', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save dismissed state', err);
    }
  };

  // Helper: check if notification belongs to this user
  const isNotificationForUser = (n: AdminNotificationRecord): boolean => {
    if (!user) return false;

    const currentUserId = (user.sffUserId || user.userId || '').toLowerCase().trim();

    // Scheduled notifications are hidden until their scheduled time.
    if (n.status === 'Scheduled' && n.scheduledDate) {
      if (new Date(n.scheduledDate).getTime() > Date.now()) {
        return false;
      }
    }

    // IMPORTANT: Single User notifications are ALWAYS private.
    // They must match the current user's SFF User ID exactly.
    if (n.targetMode === 'Single User') {
      const targetUserId = (n.targetValue || '').toLowerCase().trim();
      return !!currentUserId && !!targetUserId && currentUserId === targetUserId;
    }

    // All Users notifications are intentionally public.
    if (
      n.targetAudience === 'All Users' ||
      n.targetMode === 'All Users' ||
      n.targetValue === 'All Registered Users'
    ) {
      return true;
    }

    const val = (n.targetValue || '').toLowerCase().trim();

    // Do not expose an unspecified targeted notification.
    if (!n.targetMode) {
      return false;
    }

    if (!val) return false;

    // Stream Wise
    if (n.targetMode === 'Stream Wise') {
      const uStream = (user.qualification || '').toLowerCase().trim();
      return !!uStream && uStream.includes(val);
    }

    // Qualification Wise
    if (n.targetMode === 'Qualification Wise') {
      const uQual = (user.qualification || '').toLowerCase().trim();
      return !!uQual && uQual.includes(val);
    }

    // District Wise
    if (n.targetMode === 'District Wise') {
      const uDist = (user.district || user.presentDistrict || '').toLowerCase().trim();
      return !!uDist && uDist.includes(val);
    }

    // Category Wise
    if (n.targetMode === 'Category Wise') {
      const uCat = (user.category || '').toLowerCase().trim();
      return !!uCat && uCat.includes(val);
    }

    // Unknown target mode = do not show.
    return false;
  };
  // Filter notifications for this user (sent by Admin)
  const userNotifications = notifications.filter(isNotificationForUser);

  // Combine Admin-sent notification items for rendering
  const items = userNotifications.map((n) => ({
    id: n.id,
    type:
  n.notificationType === 'Personal Message'
    ? ('personal' as const)
    : n.notificationType === 'Application Status'
    ? ('form' as const)
    : n.notificationType === 'Job Alert'
    ? ('job' as const)
    : ('form' as const),
    title: n.title,
    message: n.message,
    date: n.sentDate,
    priority: n.priority,
    attachmentName: n.attachmentName,
    attachmentUrl: n.attachmentUrl,
    targetValue: n.targetValue,
    original: n,
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter out dismissed items
  const visibleItems = items.filter((item) => !dismissedIds.includes(item.id));

  // Filtered by tab and search
  const filteredItems = visibleItems.filter((item) => {
    if (activeTab === 'personal' && item.type !== 'personal') return false;
    if (activeTab === 'jobs' && item.type !== 'job') return false;
    if (activeTab === 'forms' && item.type !== 'form') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return item.title.toLowerCase().includes(q) || item.message.toLowerCase().includes(q);
    }
    return true;
  });

  const unreadCount = visibleItems.filter((i) => !readIds.includes(i.id)).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-2 sm:px-4">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-blue-900 via-[#0B3B8C] to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Official Notifications & Personal Inbox</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">Notification Center</h2>
            <p className="text-blue-100/80 text-xs sm:text-sm mt-1 max-w-lg">
              Check all official job announcements, portal updates, and direct personal messages sent to you by the SFF Admin Team.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-black text-xs shadow-md transition-transform active:scale-95 flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-[#0B3B8C] text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>All ({visibleItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('personal')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'personal'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Personal Messages ({visibleItems.filter((i) => i.type === 'personal').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'jobs'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Alerts ({visibleItems.filter((i) => i.type === 'job').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('forms')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'forms'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Application Status ({visibleItems.filter((i) => i.type === 'form').length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Notification Cards List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No Notifications Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              You do not have any {activeTab !== 'all' ? activeTab : ''} notifications at the moment. Official updates and personal messages sent by SFF Admin will appear here.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isRead = readIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={`p-5 rounded-2xl border transition-all relative overflow-hidden cursor-pointer ${
                  !isRead
                    ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800/80 shadow-md ring-1 ring-blue-400/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Unread Accent Bar */}
                {!isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0B3B8C] dark:bg-blue-500" />
                )}

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Icon Category Badge */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                        item.type === 'personal'
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : item.type === 'job'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                      }`}
                    >
                      {item.type === 'personal' && <MessageSquare className="w-5 h-5" />}
                      {item.type === 'job' && <Briefcase className="w-5 h-5" />}
                      {item.type === 'form' && <FileText className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      {/* Header Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.type === 'personal'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                              : item.type === 'job'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300'
                          }`}
                        >
                          {item.type === 'personal'
                            ? 'Personal Message'
                            : item.type === 'job'
                            ? 'Job Alert'
                            : 'Application Status'}
                        </span>

                        {item.priority === 'High' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            High Priority
                          </span>
                        )}

                        {!isRead && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white animate-pulse">
                            NEW
                          </span>
                        )}

                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => dismissNotification(item.id, e)}
                            title="Delete / Ignore Notification"
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug pt-0.5">
                        {item.title}
                      </h4>

                      {/* Message Body */}
                      <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 mt-2">
                        {item.message}
                      </div>

                      {/* Attachment Button if present */}
                      {item.attachmentUrl && (
                        <div className="pt-2">
                          <a
                            href={item.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-900 dark:text-slate-100 text-xs font-bold transition-colors"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Attachment: {item.attachmentName || 'View Document'}</span>
                            <Download className="w-3.5 h-3.5 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};





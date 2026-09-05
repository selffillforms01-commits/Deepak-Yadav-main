import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Search,
  Calendar,
  Trash2,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  Paperclip,
  Users,
  GraduationCap,
  MapPin,
  BookOpen,
  X,
  Filter,
  PlusCircle,
  RefreshCw,
  Eye,
  Check,
  ChevronRight,
  Briefcase,
  MessageSquare,
  CheckSquare
} from 'lucide-react';
import { adminStore } from './adminStore';
import { AdminNotificationRecord, AdminFormRecord, NotificationTargetMode } from './AdminTypes';

interface AdminNotificationsProps {
  darkMode: boolean;
}

const ODISHA_DISTRICTS = [
  'Angul', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack', 'Deogarh', 'Dhenkanal',
  'Gajapati', 'Ganjam', 'Jagatsinghpur', 'Jajpur', 'Jharsuguda', 'Kalahandi', 'Kandhamal',
  'Kendrapara', 'Keonjhar', 'Khordha', 'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur',
  'Nayagarh', 'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh', 'Bolangir'
];

const STREAM_OPTIONS = ['Arts', 'Commerce', 'Science', 'Diploma', 'ITI'];

const QUALIFICATION_OPTIONS = [
  '10th Pass',
  '+2 Pass',
  'Graduation (+3)',
  'Post Graduation',
  'Nursing',
  'Diploma',
  'ITI'
];

const CASTE_CATEGORY_OPTIONS = ['General', 'OBC', 'SEBC', 'SC', 'ST', 'EWS', 'PwD'];

const JOB_CATEGORY_OPTIONS = [
  'Central Govt Jobs',
  'Odisha State Govt Jobs',
  'Railway Jobs',
  'Defence & Police Jobs',
  'Banking Jobs',
  'Teaching Jobs',
  'Medical & Nursing Jobs',
  'Scholarship & Admission'
];

export const AdminNotifications: React.FC<AdminNotificationsProps> = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'send'>('requests');
  const [searchQuery, setSearchQuery] = useState('');

  // User Request Notifications
  const [userRequests, setUserRequests] = useState<AdminFormRecord[]>([]);

  // Admin Sent Notifications
  const [sentNotifications, setSentNotifications] = useState<AdminNotificationRecord[]>([]);

  // Selection states for bulk operations
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<string[]>([]);

  // Modal / Compose Form State
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [targetMode, setTargetMode] = useState<NotificationTargetMode>('All Users');
  const [targetValue, setTargetValue] = useState('');

  // Message Type Toggle: 'job' (Job Alert Format) or 'personal' (Personal/Custom Message)
  const [msgType, setMsgType] = useState<'job' | 'personal'>('personal');

  // Personal Message State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  // Job Format State
  const [jobData, setJobData] = useState({
    recruitmentTitle: '',
    department: '',
    totalPosts: '',
    qualification: '',
    lastDate: '',
    applyFee: '',
    officialUrl: '',
    otherDetails: '',
  });

  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [sendOption, setSendOption] = useState<'Send Now' | 'Schedule'>('Send Now');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  // Status Filter for User Requests
  const [requestStatusFilter, setRequestStatusFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');

  // Delete Confirmation Modal & Toast State
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    type: 'single-notif' | 'bulk-notif' | 'single-request' | 'bulk-request';
    id?: string;
    count?: number;
    title?: string;
  } | null>(null);

  const [actionToast, setActionToast] = useState<string | null>(null);

  const loadData = () => {
    setUserRequests(adminStore.getForms());
    setSentNotifications(adminStore.getNotifications());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = adminStore.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  // Filter User Requests (Sorted by submission date and time - Latest first)
  const filteredRequests = userRequests
    .filter((req) => {
      const statusMatch =
        requestStatusFilter === 'All'
          ? true
          : requestStatusFilter === 'Pending'
          ? req.status === 'Pending'
          : requestStatusFilter === 'In Progress'
          ? req.status === 'Under Review' || req.status === 'Approved'
          : req.status === 'Approved' || req.status === 'Rejected';

      const q = searchQuery.toLowerCase().trim();
      const searchMatch =
        !q ||
        req.applicantId.toLowerCase().includes(q) ||
        req.serviceTitle.toLowerCase().includes(q) ||
        req.formNumber.toLowerCase().includes(q);

      return statusMatch && searchMatch;
    })
    .sort((a, b) => {
      const timeA = new Date(a.submissionDate).getTime() || 0;
      const timeB = new Date(b.submissionDate).getTime() || 0;
      return timeB - timeA;
    });

  // Filter Sent Notifications (Sorted by creation date and time - Latest first)
  const filteredSent = sentNotifications
    .filter((n) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        (n.targetValue && n.targetValue.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      const timeA = new Date(a.sentDate).getTime() || 0;
      const timeB = new Date(b.sentDate).getTime() || 0;
      return timeB - timeA;
    });

  // Handle Attachment Upload
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachmentUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Admin Notification
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();

    if (targetMode === 'Single User' && !targetValue.trim()) {
      alert('Please enter the user ID, email or mobile number.');
      return;
    }

    if (
      (targetMode === 'Stream Wise' ||
        targetMode === 'Qualification Wise' ||
        targetMode === 'District Wise') &&
      !targetValue
    ) {
      alert('Please select a target group / district from the dropdown.');
      return;
    }

    let finalTitle = '';
    let finalMessage = '';

    if (msgType === 'job') {
      if (!jobData.recruitmentTitle.trim()) {
        alert('Please enter the Recruitment Title.');
        return;
      }
      finalTitle = `ðŸ“¢ JOB ALERT: ${jobData.recruitmentTitle}`;
      finalMessage = `ðŸ“‹ Job Title: ${jobData.recruitmentTitle}
ðŸ¢ Department: ${jobData.department || 'N/A'}
ðŸ‘¥ Total Posts: ${jobData.totalPosts || 'N/A'}
ðŸŽ“ Required Qualification: ${jobData.qualification || 'N/A'}
ðŸ“… Application Last Date: ${jobData.lastDate || 'N/A'}
ðŸ’° Application Fee: ${jobData.applyFee || 'As per official rules'}
ðŸ”— Official Portal Link: ${jobData.officialUrl || 'SelfFill Forms Portal'}
${jobData.otherDetails ? `\nðŸ“Œ Important Details: ${jobData.otherDetails}` : ''}`;
    } else {
      if (!title.trim() || !message.trim()) {
        alert('Please enter both Title and Message.');
        return;
      }
      finalTitle = title;
      finalMessage = message;
    }

    const newRecord: AdminNotificationRecord = {
      id: `NTF-${Date.now().toString().slice(-6)}`,
      title: finalTitle,
      message: finalMessage,
      notificationType: msgType === 'job' ? 'Job Alert' : 'Personal Message',
      targetAudience: targetMode === 'All Users' ? 'All Users' : 'Selected Users',
      targetMode,
      targetValue: targetMode === 'All Users' ? 'All Registered Users' : targetValue,
      priority,
      attachmentName: attachmentName || undefined,
      attachmentUrl: attachmentUrl || undefined,
      sendOption,
      scheduledDate: sendOption === 'Schedule' ? scheduledDateTime : undefined,
      sentDate: new Date().toISOString(),
      status: sendOption === 'Schedule' ? 'Scheduled' : 'Sent',
      createdBy: 'Super Admin',
    };

    adminStore.saveNotification(newRecord);
    alert(
      sendOption === 'Schedule'
        ? `Notification scheduled for ${scheduledDateTime} successfully!`
        : `Notification sent successfully to recipient(s)!`
    );

    // Reset Form
    setShowComposeModal(false);
    setTitle('');
    setMessage('');
    setJobData({
      recruitmentTitle: '',
      department: '',
      totalPosts: '',
      qualification: '',
      lastDate: '',
      applyFee: '',
      officialUrl: '',
      otherDetails: '',
    });
    setMsgType('personal');
    setTargetMode('All Users');
    setTargetValue('');
    setAttachmentName('');
    setAttachmentUrl('');
    setSendOption('Send Now');
    setScheduledDateTime('');
  };

  const handleDeleteNotification = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = sentNotifications.find((n) => n.id === id);
    setDeleteConfirmModal({
      type: 'single-notif',
      id,
      title: target?.title || id,
    });
  };

  const handleBulkDeleteNotifications = () => {
    if (selectedNotificationIds.length === 0) return;
    setDeleteConfirmModal({
      type: 'bulk-notif',
      count: selectedNotificationIds.length,
    });
  };

  const handleDeleteRequest = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = userRequests.find((r) => r.id === id);
    setDeleteConfirmModal({
      type: 'single-request',
      id,
      title: target ? `${target.serviceTitle} (${target.applicantId || target.applicantName})` : id,
    });
  };

  const handleBulkDeleteRequests = () => {
    if (selectedRequestIds.length === 0) return;
    setDeleteConfirmModal({
      type: 'bulk-request',
      count: selectedRequestIds.length,
    });
  };

  const executeDeleteAction = () => {
    if (!deleteConfirmModal) return;

    const { type, id } = deleteConfirmModal;

    try {
      if (type === 'single-notif' && id) {
        adminStore.deleteNotification(id);
        setSentNotifications((prev) => prev.filter((n) => n.id !== id));
        setSelectedNotificationIds((prev) => prev.filter((i) => i !== id));
        setActionToast('Notification deleted successfully!');
      } else if (type === 'bulk-notif') {
        adminStore.bulkDeleteNotifications(selectedNotificationIds);
        setSentNotifications((prev) => prev.filter((n) => !selectedNotificationIds.includes(n.id)));
        setActionToast(`${selectedNotificationIds.length} notification(s) deleted successfully!`);
        setSelectedNotificationIds([]);
      } else if (type === 'single-request' && id) {
        adminStore.deleteForm(id);
        setUserRequests((prev) => prev.filter((r) => r.id !== id));
        setSelectedRequestIds((prev) => prev.filter((i) => i !== id));
        setActionToast('User request deleted successfully!');
      } else if (type === 'bulk-request') {
        adminStore.bulkDeleteForms(selectedRequestIds);
        setUserRequests((prev) => prev.filter((r) => !selectedRequestIds.includes(r.id)));
        setActionToast(`${selectedRequestIds.length} user request(s) deleted successfully!`);
        setSelectedRequestIds([]);
      }
    } catch (err) {
      console.error('Failed to execute delete:', err);
      setActionToast('Failed to delete: ' + (err as Error).message);
    } finally {
      setDeleteConfirmModal(null);
      setTimeout(() => setActionToast(null), 3500);
    }
  };

  const toggleSelectRequest = (id: string) => {
    setSelectedRequestIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllRequests = () => {
    if (selectedRequestIds.length === filteredRequests.length && filteredRequests.length > 0) {
      setSelectedRequestIds([]);
    } else {
      setSelectedRequestIds(filteredRequests.map((r) => r.id));
    }
  };

  const toggleSelectNotification = (id: string) => {
    setSelectedNotificationIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllNotifications = () => {
    if (selectedNotificationIds.length === filteredSent.length && filteredSent.length > 0) {
      setSelectedNotificationIds([]);
    } else {
      setSelectedNotificationIds(filteredSent.map((n) => n.id));
    }
  };

  // Status mapping display for user requests
  const renderRequestStatusBadge = (status: AdminFormRecord['status']) => {
    if (status === 'Pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5" />
          <span>Pending</span>
        </span>
      );
    }
    if (status === 'Under Review' || status === 'Approved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/15 text-blue-400 border border-blue-500/30">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>In Progress</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Completed</span>
      </span>
    );
  };

  const handleUpdateRequestStatus = (formId: string, newStatus: AdminFormRecord['status']) => {
    adminStore.updateFormStatus(formId, newStatus);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 shadow-lg shadow-amber-500/20 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#071D49] rounded-[10px] flex items-center justify-center">
                <Bell className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span>Notification Control Center</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Live Notifications
                </span>
              </h1>
              <p className={`text-xs sm:text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                View live user request status and broadcast job alerts or custom notifications.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 flex items-center gap-2 border-b border-slate-800/80 pb-1">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border ${
              activeTab === 'requests'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'bg-slate-800/50 text-slate-400 border-slate-700/60 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. User Notifications (Requests from Users)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'requests' ? 'bg-slate-950 text-amber-400' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {userRequests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('send')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border ${
              activeTab === 'send'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'bg-slate-800/50 text-slate-400 border-slate-700/60 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>2. Send Notifications (Admin to Users)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'send' ? 'bg-slate-950 text-amber-400' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {sentNotifications.length}
            </span>
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'requests'
                ? 'Search by Permanent User ID, Service...'
                : 'Search sent notifications by title or text...'
            }
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border outline-hidden transition-all ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-amber-500'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-600'
            }`}
          />
        </div>

        {activeTab === 'requests' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Filter Status:
            </span>
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
              {(['All', 'Pending', 'In Progress', 'Completed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setRequestStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    requestStatusFilter === st
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 1: USER REQUEST NOTIFICATIONS */}
      {activeTab === 'requests' && (
        <div
          className={`rounded-2xl border overflow-hidden ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>User Requests Stream</span>
            </h3>
            <div className="flex items-center gap-3">
              {selectedRequestIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDeleteRequests}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedRequestIds.length})</span>
                </button>
              )}
              <span className="text-xs font-bold text-slate-400">
                {filteredRequests.length} Total Requests
              </span>
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-bold text-slate-300">No User Requests Available</p>
              <p className="text-xs text-slate-500 mt-1">
                When users submit requests for forms or services, they will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr
                    className={`border-b text-[11px] font-black uppercase tracking-wider ${
                      darkMode
                        ? 'border-slate-800 bg-slate-800/50 text-slate-400'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <th className="p-3.5 pl-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedRequestIds.length > 0 &&
                          selectedRequestIds.length === filteredRequests.length
                        }
                        onChange={toggleSelectAllRequests}
                        className="rounded border-slate-700 accent-amber-500 w-4 h-4 cursor-pointer"
                        title="Select All"
                      />
                    </th>
                    <th className="p-3.5 pl-2">Permanent User ID</th>
                    <th className="p-3.5">Requested Service</th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right pr-5">Actions / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs font-medium">
                  {filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className={`transition-colors hover:${darkMode ? 'bg-slate-800/30' : 'bg-slate-50'}`}
                    >
                      {/* Selection Checkbox */}
                      <td className="p-3.5 pl-4 w-10">
                        <input
                          type="checkbox"
                          checked={selectedRequestIds.includes(req.id)}
                          onChange={() => toggleSelectRequest(req.id)}
                          className="rounded border-slate-700 accent-amber-500 w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* Permanent User ID */}
                      <td className="p-3.5 pl-2 whitespace-nowrap">
                        <div className="font-black text-amber-400 text-sm flex items-center gap-1.5">
                          <User className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>{req.applicantId || 'SFF-USER'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {req.applicantName} ({req.applicantMobile || req.applicantEmail})
                        </div>
                      </td>

                      {/* Requested Service */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-100">{req.serviceTitle}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Form #: {req.formNumber}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-300 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          <span>
                            {new Date(req.submissionDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(req.submissionDate).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        {renderRequestStatusBadge(req.status)}
                      </td>

                      {/* Update Status Actions */}
                      <td className="p-3.5 text-right pr-5 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, 'Pending')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                              req.status === 'Pending'
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : 'bg-slate-800 text-slate-400 hover:text-amber-400'
                            }`}
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, 'Under Review')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                              req.status === 'Under Review' || req.status === 'Approved'
                                ? 'bg-blue-600 text-white font-black'
                                : 'bg-slate-800 text-slate-400 hover:text-blue-400'
                            }`}
                          >
                            In Progress
                          </button>
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, 'Rejected')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                              req.status === 'Rejected'
                                ? 'bg-emerald-600 text-white font-black'
                                : 'bg-slate-800 text-slate-400 hover:text-emerald-400'
                            }`}
                          >
                            Completed
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(req.id)}
                            className="p-1.5 ml-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                            title="Delete Request"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: SEND NOTIFICATIONS (ADMIN TO USERS) */}
      {activeTab === 'send' && (
        <div className="space-y-6">
          {/* Create Notification Trigger Card */}
          <div
            className={`p-6 rounded-2xl border ${
              darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                  <Send className="w-5 h-5 text-amber-400" />
                  <span>Send Broadcast / Targeted Notification</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Send notifications to Single User, All Users, Stream-wise, Qualification-wise, or District-wise.
                </p>
              </div>
              <button
                onClick={() => setShowComposeModal(true)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Compose New Notification</span>
              </button>
            </div>
          </div>

          {/* Sent Notifications List */}
          <div
            className={`rounded-2xl border overflow-hidden ${
              darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                {filteredSent.length > 0 && (
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={
                        selectedNotificationIds.length > 0 &&
                        selectedNotificationIds.length === filteredSent.length
                      }
                      onChange={toggleSelectAllNotifications}
                      className="rounded border-slate-700 accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Select All ({filteredSent.length})</span>
                  </label>
                )}
                <h3 className="text-sm font-black text-slate-200 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>Broadcast History ({filteredSent.length})</span>
                </h3>
              </div>

              <div className="flex items-center gap-3">
                {selectedNotificationIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBulkDeleteNotifications}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Selected ({selectedNotificationIds.length})</span>
                  </button>
                )}
                <span className="text-xs text-slate-400">Firebase Synced Realtime Notifications</span>
              </div>
            </div>

            {filteredSent.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-bold text-slate-300">No Notifications Sent</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                  Click "Compose New Notification" above to send a notification to users.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {filteredSent.map((n) => (
                  <div
                    key={n.id}
                    className={`p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors hover:${
                      darkMode ? 'bg-slate-800/30' : 'bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedNotificationIds.includes(n.id)}
                        onChange={() => toggleSelectNotification(n.id)}
                        className="mt-1 rounded border-slate-700 accent-amber-500 w-4 h-4 cursor-pointer shrink-0"
                      />
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Notification Format Type Badge */}
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-black rounded-full border flex items-center gap-1 ${
                              n.notificationType === 'Job Alert'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            }`}
                          >
                            {n.notificationType === 'Job Alert' ? (
                              <Briefcase className="w-3 h-3 text-cyan-400" />
                            ) : (
                              <MessageSquare className="w-3 h-3 text-purple-400" />
                            )}
                            <span>{n.notificationType || 'Notification'}</span>
                          </span>

                          {/* Target Mode Badge */}
                          <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{n.targetMode || n.targetAudience}</span>
                          </span>

                          {/* Target Value if any */}
                          {n.targetValue && (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              Target: {n.targetValue}
                            </span>
                          )}

                          {/* Status */}
                          <span
                            className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                              n.status === 'Scheduled'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {n.status}
                          </span>

                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(n.sentDate).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <h4 className="font-black text-sm text-slate-100">{n.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{n.message}</p>

                        {/* Attachment preview if any */}
                        {n.attachmentName && (
                          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-amber-300 font-bold">
                            <Paperclip className="w-3.5 h-3.5 text-amber-400" />
                            <span>Attachment: {n.attachmentName}</span>
                            {n.attachmentUrl && (
                              <a
                                href={n.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="ml-2 text-[10px] underline text-blue-400 hover:text-blue-300"
                              >
                                View File
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteNotification(n.id, e)}
                      className="p-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl cursor-pointer self-end sm:self-start transition-colors"
                      title="Delete Notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPOSE NOTIFICATION MODAL */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
            {/* Modal Header - Fixed at Top */}
            <div className="flex items-center justify-between p-4 sm:px-6 sm:py-4 border-b border-slate-800 shrink-0 bg-slate-900">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black">Compose & Send Notification</h3>
              </div>
              <button
                onClick={() => setShowComposeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSendNotification} className="flex flex-col flex-1 min-h-0">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              {/* 1. Target Mode Selector */}
              <div>
                <label className="text-xs font-bold text-amber-400 block mb-1.5">
                  1. Target Audience Mode
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { mode: 'Single User' as const, label: 'Single User', icon: <User className="w-3.5 h-3.5" /> },
                    { mode: 'All Users' as const, label: 'All Users', icon: <Users className="w-3.5 h-3.5" /> },
                    { mode: 'Stream Wise' as const, label: 'Stream Wise', icon: <BookOpen className="w-3.5 h-3.5" /> },
                    { mode: 'Qualification Wise' as const, label: 'Qualification Wise', icon: <GraduationCap className="w-3.5 h-3.5" /> },
                    { mode: 'District Wise' as const, label: 'District Wise', icon: <MapPin className="w-3.5 h-3.5" /> },
                    { mode: 'Category Wise' as const, label: 'Category / Caste', icon: <CheckSquare className="w-3.5 h-3.5" /> },
                    { mode: 'Job Category Wise' as const, label: 'Job Sector Wise', icon: <Briefcase className="w-3.5 h-3.5" /> },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.mode}
                      onClick={() => {
                        setTargetMode(item.mode);
                        setTargetValue('');
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        targetMode === item.mode
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Target Input based on Mode */}
              {targetMode === 'Single User' && (
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
                  <label className="font-bold text-slate-300 block">Permanent User ID (e.g. SFF-884920)</label>
                  <input
                    type="text"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="Enter User Permanent ID (e.g. SFF-884920)"
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-300 font-mono font-bold outline-hidden focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    This notification will be received only by this specific User ID.
                  </p>
                </div>
              )}

              {targetMode === 'Stream Wise' && (
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
                  <label className="font-bold text-slate-300 block">Select Stream</label>
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-300 font-bold outline-hidden focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">-- Choose Stream --</option>
                    {STREAM_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetMode === 'Qualification Wise' && (
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
                  <label className="font-bold text-slate-300 block">Select Qualification</label>
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-300 font-bold outline-hidden focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">-- Choose Qualification --</option>
                    {QUALIFICATION_OPTIONS.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetMode === 'District Wise' && (
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
                  <label className="font-bold text-slate-300 block">Select Odisha District</label>
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-300 font-bold outline-hidden focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">-- Choose Odisha District --</option>
                    {ODISHA_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist} District
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetMode === 'Category Wise' && (
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
                  <label className="font-bold text-slate-300 block">Select Category / Caste</label>
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-300 font-bold outline-hidden focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">-- Choose Caste/Social Category --</option>
                    {CASTE_CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat} Category
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetMode === 'Job Category Wise' && (
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 space-y-1">
                  <label className="font-bold text-slate-300 block">Select Job Sector / Category</label>
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-300 font-bold outline-hidden focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">-- Choose Job Sector/Category --</option>
                    {JOB_CATEGORY_OPTIONS.map((jcat) => (
                      <option key={jcat} value={jcat}>
                        {jcat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 2. Notification Message Format Option (Job Format vs Personal Message) */}
              <div>
                <label className="text-xs font-bold text-amber-400 block mb-1.5">
                  2. Select Notification Format Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option 1: Job Notification Format */}
                  <label
                    onClick={() => setMsgType('job')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 relative ${
                      msgType === 'job'
                        ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500/50'
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="pt-0.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          msgType === 'job' ? 'border-cyan-400 bg-cyan-500/30' : 'border-slate-500'
                        }`}
                      >
                        {msgType === 'job' && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
                      </div>
                    </div>
                    <div>
                      <div className="font-black text-xs text-cyan-300 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Job Notification Format</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Structured form for Post Title, Vacancies, Qualification, Last Date, and Official URL.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Personal / Custom Message */}
                  <label
                    onClick={() => setMsgType('personal')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 relative ${
                      msgType === 'personal'
                        ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/50'
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="pt-0.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          msgType === 'personal' ? 'border-amber-400 bg-amber-500/30' : 'border-slate-500'
                        }`}
                      >
                        {msgType === 'personal' && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                      </div>
                    </div>
                    <div>
                      <div className="font-black text-xs text-amber-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                        <span>Personal / Custom Message</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Custom title and free-text message for general or specific notices.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* DYNAMIC FORM FIELDS BASED ON SELECTED FORMAT TYPE */}
              {msgType === 'job' ? (
                /* JOB FORMAT INPUTS */
                <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-cyan-500/30 space-y-3">
                  <div className="text-[11px] font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-cyan-500/20">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Job Alert Form Details</span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">
                      Recruitment / Job Title *
                    </label>
                    <input
                      type="text"
                      value={jobData.recruitmentTitle}
                      onChange={(e) => setJobData((prev) => ({ ...prev, recruitmentTitle: e.target.value }))}
                      placeholder="e.g. SSC CGL 2026 Recruitment / OSSC Junior Assistant"
                      required={msgType === 'job'}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-hidden focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Department / Organization</label>
                      <input
                        type="text"
                        value={jobData.department}
                        onChange={(e) => setJobData((prev) => ({ ...prev, department: e.target.value }))}
                        placeholder="e.g. Staff Selection Commission"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium outline-hidden focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Total Vacancies / Posts</label>
                      <input
                        type="text"
                        value={jobData.totalPosts}
                        onChange={(e) => setJobData((prev) => ({ ...prev, totalPosts: e.target.value }))}
                        placeholder="e.g. 12,450 Posts"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium outline-hidden focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Required Qualification</label>
                      <input
                        type="text"
                        value={jobData.qualification}
                        onChange={(e) => setJobData((prev) => ({ ...prev, qualification: e.target.value }))}
                        placeholder="e.g. Graduation (+3) / 10th Pass / ITI"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium outline-hidden focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Last Date to Apply</label>
                      <input
                        type="text"
                        value={jobData.lastDate}
                        onChange={(e) => setJobData((prev) => ({ ...prev, lastDate: e.target.value }))}
                        placeholder="e.g. 25 Aug 2026"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium outline-hidden focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Application Fee</label>
                      <input
                        type="text"
                        value={jobData.applyFee}
                        onChange={(e) => setJobData((prev) => ({ ...prev, applyFee: e.target.value }))}
                        placeholder="e.g. Rs 100 (SC/ST/Female: Rs 0)"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium outline-hidden focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-300 block mb-1">Official Apply Link / URL</label>
                      <input
                        type="text"
                        value={jobData.officialUrl}
                        onChange={(e) => setJobData((prev) => ({ ...prev, officialUrl: e.target.value }))}
                        placeholder="e.g. https://ssc.gov.in"
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium outline-hidden focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Additional Notes / Key Details</label>
                    <textarea
                      rows={2}
                      value={jobData.otherDetails}
                      onChange={(e) => setJobData((prev) => ({ ...prev, otherDetails: e.target.value }))}
                      placeholder="e.g. Age limit 18-30 years. SelfFill Forms team is available for online application assistance."
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium outline-hidden focus:border-cyan-500 resize-none"
                    />
                  </div>
                </div>
              ) : (
                /* PERSONAL MESSAGE INPUTS */
                <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-amber-500/30 space-y-3">
                  <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-amber-500/20">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Personal Message Details</span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Notification Title *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Portal Important Notice / Account Status Update"
                      required={msgType === 'personal'}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Notification Message *</label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type custom notification message for users here..."
                      required={msgType === 'personal'}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium outline-hidden focus:border-amber-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Attachment Optional */}
              <div>
                <label className="font-bold text-slate-300 block mb-1 flex items-center justify-between">
                  <span>Attachment (Optional)</span>
                  {attachmentName && (
                    <button
                      type="button"
                      onClick={() => {
                        setAttachmentName('');
                        setAttachmentUrl('');
                      }}
                      className="text-rose-400 hover:underline text-[10px]"
                    >
                      Remove File
                    </button>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleAttachmentChange}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-xs outline-hidden file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-amber-500 file:text-slate-950 file:font-bold file:cursor-pointer"
                  />
                </div>
                {attachmentName && (
                  <p className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Attached: {attachmentName}
                  </p>
                )}
              </div>

              {/* Send Option: Send Now vs Schedule */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Send Timing</label>
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setSendOption('Send Now')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        sendOption === 'Send Now'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Send Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setSendOption('Schedule')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        sendOption === 'Schedule'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Schedule
                    </button>
                  </div>
                </div>

                {sendOption === 'Schedule' ? (
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Schedule Date & Time</label>
                    <input
                      type="datetime-local"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold outline-hidden focus:border-amber-500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Priority Level</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold outline-hidden focus:border-amber-500 cursor-pointer"
                    >
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                  </div>
                )}
              </div>

              </div>

              {/* Submit / Cancel Buttons - Fixed at Bottom */}
              <div className="p-4 sm:px-6 py-3.5 flex items-center justify-end gap-2 border-t border-slate-800 bg-slate-900 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sendOption === 'Schedule' ? 'Schedule Notification' : 'Broadcast Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#0B132B] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-100 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-100">Confirm Permanent Delete</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {deleteConfirmModal.type.includes('bulk')
                    ? `Are you sure you want to delete ${deleteConfirmModal.count} item(s)?`
                    : `Are you sure you want to delete "${deleteConfirmModal.title || 'this item'}"?`}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-rose-300 font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>This action is permanent and will remove the item completely.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteAction}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Toast Banner */}
      {actionToast && (
        <div className="fixed top-5 right-5 z-[120] bg-emerald-600 text-white font-black text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{actionToast}</span>
        </div>
      )}
    </div>
  );
};




import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Search,
  ListTodo,
  CheckCircle2,
  Bell,
  User,
  LogOut,
  Headset,
  ChevronDown,
  FileText,
  Info,
  Check,
  X,
  Send,
  ArrowRight,
  Clock,
  Menu,
  AlertCircle
} from 'lucide-react';
import { DesktopGuard } from '../DesktopGuard';
import { adminStore } from '../admin/adminStore';
import {
  MaintenanceTaskRecord,
  AdminUserRecord,
  AdminFormRecord,
  AdminNotificationRecord,
  MaintenanceTaskStatus
} from '../admin/AdminTypes';

interface MaintenanceDashboardProps {
  userName?: string;
  onLogout: () => void;
  logoUrl?: string;
}

export const MaintenanceDashboard: React.FC<MaintenanceDashboardProps> = ({
  userName = 'Maintenance Specialist',
  onLogout,
  logoUrl = '/sff-logo.svg'
}) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'my-jobs' | 'search-user' | 'assigned-jobs' | 'completed-jobs' | 'notifications' | 'profile'
  >('dashboard');

  // Real store data
  const [realTasks, setRealTasks] = useState<MaintenanceTaskRecord[]>([]);
  const [notifications, setNotifications] = useState<AdminNotificationRecord[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUserRecord[]>([]);
  const [allForms, setAllForms] = useState<AdminFormRecord[]>([]);

  // User search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedUser, setSearchedUser] = useState<AdminUserRecord | null>(null);
  const [searchedUserForms, setSearchedUserForms] = useState<AdminFormRecord[]>([]);
  const [searchHasRun, setSearchHasRun] = useState(false);

  // Modals & Active items
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatSentToast, setChatSentToast] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);

  const [activeTask, setActiveTask] = useState<MaintenanceTaskRecord | null>(null);
  const [jobStatus, setJobStatus] = useState<MaintenanceTaskStatus>('In Progress');
  const [jobRemarks, setJobRemarks] = useState('');
  const [jobToast, setJobToast] = useState<string | null>(null);

  // Sync with AdminStore
  useEffect(() => {
    const syncData = () => {
      const tasks = adminStore.getMaintenanceTasks();
      const notifs = adminStore.getNotifications();
      const users = adminStore.getUsers();
      const forms = adminStore.getForms();

      setRealTasks(tasks);
      setNotifications(notifs);
      setAllUsers(users);
      setAllForms(forms);

      // Auto select first task if none selected
      if (tasks.length > 0 && !activeTask) {
        setActiveTask(tasks[0]);
        setJobStatus(tasks[0].status);
        setJobRemarks(tasks[0].staffRemarks || '');
      }
    };

    syncData();
    const unsub = adminStore.subscribe(syncData);
    return () => unsub();
  }, [activeTask]);

  // Handle User Search against real admin store data
  const handleSearchUser = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    setSearchHasRun(true);

    if (!query) {
      setSearchedUser(null);
      setSearchedUserForms([]);
      return;
    }

    // Match by ID, name, email, or mobile
    const matchedUser = allUsers.find(
      (u) =>
        u.id.toLowerCase().includes(query) ||
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.mobile.toLowerCase().includes(query)
    );

    if (matchedUser) {
      setSearchedUser(matchedUser);
      // Filter forms for this user
      const userForms = allForms.filter(
        (f) =>
          f.applicantId === matchedUser.id ||
          f.applicantEmail.toLowerCase() === matchedUser.email.toLowerCase() ||
          f.applicantName.toLowerCase() === matchedUser.name.toLowerCase()
      );
      setSearchedUserForms(userForms);
    } else {
      setSearchedUser(null);
      setSearchedUserForms([]);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    adminStore.addLog('System', `Maintenance staff (${userName}) message to Admin: "${chatMessage.trim()}"`);
    setChatMessage('');
    setChatSentToast(true);
    setTimeout(() => setChatSentToast(false), 3000);
  };

  const handleUpdateJobStatus = () => {
    if (!activeTask) return;

    adminStore.updateMaintenanceTaskStatus(activeTask.id, jobStatus, jobRemarks);

    setJobToast(`Job status updated to "${jobStatus}" successfully!`);
    setTimeout(() => {
      setJobToast(null);
      setJobModalOpen(false);
    }, 1200);
  };

  const openTaskModal = (task: MaintenanceTaskRecord) => {
    setActiveTask(task);
    setJobStatus(task.status);
    setJobRemarks(task.staffRemarks || '');
    setJobModalOpen(true);
  };

  // Filter tasks
  const pendingOrAssignedTasks = realTasks.filter((t) => t.status !== 'Completed');
  const completedTasks = realTasks.filter((t) => t.status === 'Completed');
  const latestTaskAlert = pendingOrAssignedTasks.length > 0 ? pendingOrAssignedTasks[0] : null;

  return (
    <DesktopGuard portalName="Maintenance" onReturnToUser={onLogout}>
      <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* TOP HEADER */}
      <header className="h-16 bg-[#0d1527] border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo Branding */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-md flex items-center justify-center">
              <span className="font-black text-xs text-slate-950 tracking-tighter">SFF</span>
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-wider text-white uppercase">
              SFF Maintenance Team
            </h1>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button
            onClick={() => setActiveTab('notifications')}
            className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-amber-500 text-slate-950 text-[11px] font-bold flex items-center justify-center shadow-md">
                {notifications.length}
              </span>
            )}
          </button>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-full py-1.5 px-3 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs border border-slate-600">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white leading-none">{userName}</div>
                <div className="text-[10px] text-slate-400 leading-tight">Maintenance Team</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#121c33] border border-slate-700 rounded-2xl shadow-2xl py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-800">
                  <p className="text-xs font-bold text-white">{userName}</p>
                  <p className="text-[10px] text-amber-400 font-semibold">Maintenance Officer</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2.5 transition"
                >
                  <User className="w-4 h-4 text-amber-400" />
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setActiveTab('notifications');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2.5 transition"
                >
                  <Bell className="w-4 h-4 text-amber-400" />
                  Notifications ({notifications.length})
                </button>
                <div className="border-t border-slate-800 my-1" />
                <button
                  onClick={onLogout}
                  className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2.5 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* BODY LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#0a101f] border-r border-slate-800/80 p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="space-y-6">
            {/* Logo Banner */}
            <div className="px-2 py-1 flex items-center gap-3">
              <img src={logoUrl} alt="SFF Logo" className="w-8 h-8 object-contain" />
              <div>
                <div className="text-sm font-black tracking-wider text-amber-400 uppercase">Self Fill Forms</div>
                <div className="text-[10px] font-semibold text-slate-400">Maintenance Portal</div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1.5">
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-[#2a210d] text-amber-300 border border-[#c0841d]/60 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                Dashboard
              </button>

              <button
                onClick={() => {
                  setActiveTab('my-jobs');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'my-jobs'
                    ? 'bg-[#2a210d] text-amber-300 border border-[#c0841d]/60 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <FileText className="w-4 h-4 text-amber-400" />
                My Jobs ({pendingOrAssignedTasks.length})
              </button>

              <button
                onClick={() => {
                  setActiveTab('search-user');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'search-user'
                    ? 'bg-[#2a210d] text-amber-300 border border-[#c0841d]/60 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Search className="w-4 h-4 text-amber-400" />
                Search User
              </button>

              <button
                onClick={() => {
                  setActiveTab('assigned-jobs');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'assigned-jobs'
                    ? 'bg-[#2a210d] text-amber-300 border border-[#c0841d]/60 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <ListTodo className="w-4 h-4 text-amber-400" />
                Assigned Jobs
              </button>

              <button
                onClick={() => {
                  setActiveTab('completed-jobs');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'completed-jobs'
                    ? 'bg-[#2a210d] text-amber-300 border border-[#c0841d]/60 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                Completed Jobs ({completedTasks.length})
              </button>

              <button
                onClick={() => {
                  setActiveTab('notifications');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-[#2a210d] text-amber-300 border border-[#c0841d]/60 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-amber-400" />
                  Notifications
                </div>
                {notifications.length > 0 && (
                  <span className="min-w-[20px] h-5 px-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('profile');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-[#2a210d] text-amber-300 border border-[#c0841d]/60 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <User className="w-4 h-4 text-amber-400" />
                Profile
              </button>

              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          </div>

          {/* Bottom Help Widget */}
          <div className="bg-[#10182b] border border-slate-800 rounded-2xl p-4 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Headset className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white">Need Help?</div>
              <div className="text-[11px] text-slate-400">Contact Admin</div>
            </div>
            <button
              onClick={() => setChatModalOpen(true)}
              className="w-full bg-[#a37424] hover:bg-[#b8832a] text-white text-xs font-bold py-2 rounded-xl transition shadow-md"
            >
              Chat with Admin
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'dashboard' || activeTab === 'search-user' || activeTab === 'my-jobs' || activeTab === 'assigned-jobs' ? (
            <>
              {/* 1. NOTIFICATIONS ALERT BANNER */}
              <section className="bg-[#121a2d] border border-[#1e2c48] rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs uppercase font-extrabold text-slate-300 tracking-wider flex items-center gap-2">
                    Latest Task Alert
                  </h2>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition"
                  >
                    View All Notifications <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {latestTaskAlert ? (
                  <div className="bg-[#152037] border border-[#233558] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shrink-0" />
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{latestTaskAlert.title}</span>
                        </div>
                        <div className="text-xs text-slate-300 space-y-0.5 mt-0.5">
                          <div>
                            Task ID: <span className="text-amber-400 font-bold font-mono">{latestTaskAlert.taskNumber}</span>
                          </div>
                          <div>
                            Applicant: <span className="text-white font-medium">{latestTaskAlert.applicantName || 'N/A'}</span>
                          </div>
                          <div>
                            Priority: <span className="text-amber-400 font-bold">{latestTaskAlert.priority || 'Medium'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <span className="text-xs text-slate-400">
                        {latestTaskAlert.createdDate ? new Date(latestTaskAlert.createdDate).toLocaleDateString('en-IN') : 'Recent'}
                      </span>
                      <button
                        onClick={() => openTaskModal(latestTaskAlert)}
                        className="bg-[#a37424] hover:bg-[#b8832a] text-white text-xs font-bold px-5 py-2 rounded-xl transition shadow-md"
                      >
                        View Job
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#152037]/60 border border-[#233558]/50 rounded-xl p-4 text-center text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-300">No active maintenance task notifications at this time.</p>
                    <p className="text-[11px]">New tasks assigned by Admin will appear here automatically.</p>
                  </div>
                )}
              </section>

              {/* 2. SEARCH USER BY ID SECTION */}
              <section className="bg-[#121a2d] border border-[#1e2c48] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
                <h2 className="text-xs uppercase font-extrabold text-slate-300 tracking-wider">
                  Search User By ID / Mobile / Email
                </h2>

                <form onSubmit={handleSearchUser} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter User ID, Name, Email, or Mobile number..."
                      className="flex-1 bg-[#0b1120] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                    />
                    <button
                      type="submit"
                      className="w-12 h-12 bg-[#a37424] hover:bg-[#b8832a] text-white rounded-xl flex items-center justify-center transition shadow-md shrink-0"
                      title="Search User"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Search registered citizens in the system to view their details and assigned form submissions.
                  </p>
                </form>
              </section>

              {/* 3. USER DETAILS SECTION */}
              <section className="bg-[#121a2d] border border-[#1e2c48] rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h2 className="text-xs uppercase font-extrabold text-slate-300 tracking-wider">
                    User Details
                  </h2>
                </div>

                {searchedUser ? (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1">
                        <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700/80 flex items-center justify-center text-slate-400 shrink-0">
                          {searchedUser.photoUrl ? (
                            <img src={searchedUser.photoUrl} alt={searchedUser.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="w-10 h-10" />
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-black text-white font-mono">{searchedUser.id}</span>
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                searchedUser.status === 'Active'
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                                  : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                              }`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {searchedUser.status || 'Verified User'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-300">
                            <div>
                              <span className="text-slate-400">Name:</span>{' '}
                              <span className="font-semibold text-white">{searchedUser.name}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Mobile:</span>{' '}
                              <span className="font-semibold text-white">{searchedUser.mobile}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Email:</span>{' '}
                              <span className="font-semibold text-white">{searchedUser.email}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">District / Address:</span>{' '}
                              <span className="font-semibold text-white">
                                {[searchedUser.district, searchedUser.state].filter(Boolean).join(', ') || searchedUser.fullAddress || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400">Registered On:</span>{' '}
                              <span className="font-semibold text-white">{searchedUser.registrationDate || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* FORMS ASSIGNED TO THIS USER */}
                    <div className="space-y-3 pt-4 border-t border-slate-800/80">
                      <h3 className="text-xs uppercase font-extrabold text-slate-300 tracking-wider">
                        Forms Submitted by This User ({searchedUserForms.length})
                      </h3>

                      {searchedUserForms.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
                          <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-[#0b1120] text-slate-400 text-[11px] uppercase font-bold tracking-wider border-b border-slate-800">
                              <tr>
                                <th className="p-3.5">Form Number</th>
                                <th className="p-3.5">Form Title</th>
                                <th className="p-3.5">Status</th>
                                <th className="p-3.5">Submission Date</th>
                                <th className="p-3.5 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 bg-[#121a2d]">
                              {searchedUserForms.map((f) => (
                                <tr key={f.id} className="hover:bg-slate-800/30 transition">
                                  <td className="p-3.5 font-mono text-amber-400 font-bold">{f.formNumber}</td>
                                  <td className="p-3.5 font-semibold text-white">{f.serviceTitle}</td>
                                  <td className="p-3.5">
                                    <span
                                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${
                                        f.status === 'Approved'
                                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                                          : f.status === 'Rejected'
                                          ? 'bg-rose-950/80 text-rose-400 border-rose-800/60'
                                          : 'bg-amber-950/80 text-amber-400 border-amber-800/60'
                                      }`}
                                    >
                                      {f.status}
                                    </span>
                                  </td>
                                  <td className="p-3.5 text-slate-400">{f.submissionDate}</td>
                                  <td className="p-3.5 text-right">
                                    <button
                                      onClick={() => {
                                        const matchingTask = realTasks.find((t) => t.sourceId === f.id || t.title.includes(f.serviceTitle));
                                        if (matchingTask) {
                                          openTaskModal(matchingTask);
                                        } else {
                                          // Create dynamic task context for this form
                                          openTaskModal({
                                            id: `TASK-F-${f.id}`,
                                            taskNumber: `MNT-${f.formNumber}`,
                                            sourceType: 'Form Submission',
                                            sourceId: f.id,
                                            title: `Form Processing: ${f.serviceTitle}`,
                                            applicantName: f.applicantName,
                                            applicantMobile: f.applicantMobile,
                                            applicantEmail: f.applicantEmail,
                                            amount: 30,
                                            status: f.status === 'Approved' ? 'Completed' : 'In Progress',
                                            adminRemarks: f.remarks || 'Citizen submitted form.',
                                            createdDate: f.submissionDate,
                                            priority: 'High'
                                          });
                                        }
                                      }}
                                      className="bg-[#a37424] hover:bg-[#b8832a] text-white text-xs font-bold px-4 py-1.5 rounded-lg transition shadow"
                                    >
                                      Process Form
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic py-2">No submitted application forms found for this user.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-2 text-slate-400">
                    <User className="w-10 h-10 mx-auto text-slate-600" />
                    <p className="text-xs font-semibold text-slate-300">
                      {searchHasRun ? `No registered user found for search "${searchQuery}".` : 'Enter a User ID, Name, Email, or Mobile to search.'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      You can search any citizen account registered on the portal.
                    </p>
                  </div>
                )}
              </section>

              {/* 4. JOB DETAILS & TASK INSTRUCTIONS (2 COLUMNS) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Column 1: JOB DETAILS */}
                <section className="bg-[#121a2d] border border-[#1e2c48] rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                  {activeTask ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xs uppercase font-extrabold text-slate-300 tracking-wider">
                          Active Job Details ({activeTask.taskNumber})
                        </h2>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            activeTask.status === 'Completed'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : 'bg-amber-950 text-amber-400 border-amber-800'
                          }`}
                        >
                          {activeTask.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-slate-300 bg-[#0b1120] p-4 rounded-xl border border-slate-800">
                        <div>
                          <span className="text-slate-400">Title / Service:</span>{' '}
                          <span className="font-semibold text-white">{activeTask.title}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Applicant Name:</span>{' '}
                          <span className="font-semibold text-white">{activeTask.applicantName || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Applicant Mobile:</span>{' '}
                          <span className="font-semibold text-white">{activeTask.applicantMobile || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Source Type:</span>{' '}
                          <span className="font-semibold text-amber-400">{activeTask.sourceType}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Priority:</span>{' '}
                          <span className="font-bold text-rose-400">{activeTask.priority || 'Medium'}</span>
                        </div>
                      </div>

                      <div className="space-y-1 pt-2">
                        <div className="text-xs font-bold text-slate-300">Admin Instructions / Remarks:</div>
                        <div className="text-xs text-slate-300 bg-[#0b1120] p-3 rounded-xl border border-slate-800">
                          {activeTask.adminRemarks || 'Process the assigned task and submit required verification details.'}
                        </div>
                      </div>

                      <button
                        onClick={() => openTaskModal(activeTask)}
                        className="w-full bg-[#a37424] hover:bg-[#b8832a] text-white py-3 rounded-xl font-bold shadow-lg text-sm transition mt-4"
                      >
                        Update Job Status & Remarks
                      </button>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                      <Briefcase className="w-10 h-10 mx-auto text-slate-600" />
                      <p className="font-semibold text-slate-300">No active job selected.</p>
                      <p className="text-[11px]">Select a task from Assigned Jobs queue or Search User to view details.</p>
                    </div>
                  )}
                </section>

                {/* Column 2: TASK INSTRUCTIONS */}
                <section className="bg-[#121a2d] border border-[#1e2c48] rounded-2xl p-5 shadow-xl space-y-4">
                  <h2 className="text-xs uppercase font-extrabold text-slate-300 tracking-wider">
                    Task Instructions & Standard Procedure
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                    {/* Numbered Steps */}
                    <div className="sm:col-span-2 space-y-2.5">
                      {[
                        'Verify user uploaded documents and credentials',
                        'Open relevant official portal (eDistrict / State Portal)',
                        'Fill application details carefully as per records',
                        'Upload required supporting certificates & photo',
                        'Preview and confirm form submission details',
                        'Update status to Completed and enter reference number'
                      ].map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-xs text-slate-200">
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/80 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>

                    {/* Green Check Box */}
                    <div className="bg-[#0b1d16] border border-emerald-900/80 rounded-2xl p-4 text-center space-y-2 flex flex-col items-center justify-center h-full">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-900/40 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-[11px] text-emerald-300 font-semibold leading-snug">
                        Complete job accurately and submit on time.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* 5. BOTTOM NOTE BANNER */}
              <div className="bg-[#0e213d] border border-[#1d4ed8]/50 rounded-2xl p-4 flex items-center gap-3 text-xs text-[#93c5fd]">
                <Info className="w-5 h-5 text-blue-400 shrink-0" />
                <p>
                  <strong className="text-white">Note:</strong> You can search any registered user by ID/Name and access their full details and all assigned jobs.
                </p>
              </div>
            </>
          ) : activeTab === 'completed-jobs' ? (
            /* COMPLETED JOBS VIEW */
            <section className="bg-[#121a2d] border border-[#1e2c48] rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Completed Jobs History ({completedTasks.length})
              </h2>

              {completedTasks.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0b1120] text-slate-400 uppercase font-bold">
                      <tr>
                        <th className="p-3.5">Task No</th>
                        <th className="p-3.5">Job Title</th>
                        <th className="p-3.5">Applicant</th>
                        <th className="p-3.5">Completed Date</th>
                        <th className="p-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {completedTasks.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-800/30">
                          <td className="p-3.5 font-mono text-amber-400 font-bold">{t.taskNumber}</td>
                          <td className="p-3.5 text-white font-medium">{t.title}</td>
                          <td className="p-3.5 text-slate-300">{t.applicantName || 'N/A'}</td>
                          <td className="p-3.5 text-slate-400">
                            {t.completedDate ? new Date(t.completedDate).toLocaleDateString('en-IN') : 'Completed'}
                          </td>
                          <td className="p-3.5">
                            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-md text-[11px] font-semibold">
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="font-semibold text-slate-300">No completed jobs yet.</p>
                  <p className="text-[11px]">Finished jobs will be archived here once marked as Completed.</p>
                </div>
              )}
            </section>
          ) : activeTab === 'notifications' ? (
            /* NOTIFICATIONS VIEW */
            <section className="bg-[#121a2d] border border-[#1e2c48] rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                Notifications ({notifications.length})
              </h2>

              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((item) => (
                    <div key={item.id} className="bg-[#0b1120] border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white">{item.title}</div>
                          <div className="text-[11px] text-slate-300 mt-0.5">{item.message}</div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            Audience: {item.targetAudience} â€¢ Sent By: {item.createdBy}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">{item.sentDate}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <Bell className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="font-semibold text-slate-300">No notifications found.</p>
                  <p className="text-[11px]">Broadcast alerts from Admin will appear here.</p>
                </div>
              )}
            </section>
          ) : (
            /* PROFILE VIEW */
            <section className="bg-[#121a2d] border border-[#1e2c48] rounded-2xl p-6 shadow-xl space-y-6 max-w-2xl">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-amber-400" />
                Maintenance Officer Profile
              </h2>
              <div className="flex items-center gap-4 bg-[#0b1120] p-4 rounded-xl border border-slate-800">
                <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{userName}</h3>
                  <p className="text-xs text-amber-400 font-medium">Maintenance Specialist</p>
                  <p className="text-[11px] text-slate-400">Department: Online Application Processing</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-[#0b1120] p-3.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Assigned Pending Jobs</div>
                  <div className="text-amber-400 font-mono font-bold text-lg mt-1">{pendingOrAssignedTasks.length}</div>
                </div>
                <div className="bg-[#0b1120] p-3.5 rounded-xl border border-slate-800">
                  <div className="text-slate-400">Completed Jobs</div>
                  <div className="text-emerald-400 font-mono font-bold text-lg mt-1">{completedTasks.length}</div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* JOB PROCESSOR MODAL */}
      {jobModalOpen && activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#121a2d] border border-[#233558] rounded-2xl max-w-md w-full p-6 space-y-5 relative shadow-2xl text-slate-100">
            <button
              onClick={() => setJobModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-400" />
                Process Job: {activeTask.taskNumber}
              </h3>
              <p className="text-xs text-slate-300 font-medium">{activeTask.title}</p>
            </div>

            {jobToast && (
              <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" />
                {jobToast}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Update Job Status</label>
                <select
                  value={jobStatus}
                  onChange={(e) => setJobStatus(e.target.value as MaintenanceTaskStatus)}
                  className="w-full bg-[#0b1120] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="In Progress">In Progress (à¤•à¤¾à¤°à¥à¤¯ à¤ªà¥à¤°à¤—à¤¤à¤¿ à¤ªà¤° à¤¹à¥ˆ)</option>
                  <option value="Completed">Completed (à¤•à¤¾à¤°à¥à¤¯ à¤ªà¥‚à¤°à¤¾ à¤¹à¥‹ à¤—à¤¯à¤¾ à¤¹à¥ˆ)</option>
                  <option value="Sent to Maintenance">Sent to Maintenance (à¤°à¤–à¤°à¤–à¤¾à¤µ à¤•à¥‡ à¤²à¤¿à¤ à¤­à¥‡à¤œà¤¾ à¤—à¤¯à¤¾)</option>
                  <option value="On Hold">On Hold (à¤°à¥‹à¤•à¤¾ à¤—à¤¯à¤¾)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Operator Remarks / Reference Notes</label>
                <textarea
                  rows={3}
                  value={jobRemarks}
                  onChange={(e) => setJobRemarks(e.target.value)}
                  placeholder="Enter notes (e.g. Form submitted on portal. Ack No: ACK-987654)..."
                  className="w-full bg-[#0b1120] border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="bg-[#0b1120] p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="font-bold text-amber-400">Admin Instructions:</div>
                <div>{activeTask.adminRemarks || 'None provided.'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setJobModalOpen(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2.5 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateJobStatus}
                className="flex-1 bg-[#a37424] hover:bg-[#b8832a] text-white text-xs font-bold py-2.5 rounded-xl transition shadow-lg"
              >
                Save & Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHAT WITH ADMIN MODAL */}
      {chatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#121a2d] border border-[#233558] rounded-2xl max-w-md w-full p-6 space-y-4 relative shadow-2xl">
            <button
              onClick={() => setChatModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                <Headset className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Chat with Admin</h3>
                <p className="text-[11px] text-slate-400">Direct message to Super Admin panel</p>
              </div>
            </div>

            {chatSentToast && (
              <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" />
                Message sent to Admin panel successfully!
              </div>
            )}

            <form onSubmit={handleSendChat} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Your Message / Query</label>
                <textarea
                  rows={4}
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full bg-[#0b1120] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setChatModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl transition font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#a37424] hover:bg-[#b8832a] text-white text-xs rounded-xl transition font-bold flex items-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </DesktopGuard>
  );
};


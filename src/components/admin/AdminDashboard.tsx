import React from 'react';
import { motion } from 'motion/react';
import {
  Users,
  FileText,
  Wrench,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  ArrowUpRight,
  TrendingUp,
  UserPlus,
  Bell,
  Sparkles,
  PlusCircle,
  ShieldCheck,
  FilePlus,
  Send,
  Download,
  Calendar,
  RotateCcw,
  Filter
} from 'lucide-react';
import { adminStore } from './adminStore';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AdminTab } from './AdminTypes';

interface AdminDashboardProps {
  darkMode: boolean;
  onNavigateTab: (tab: AdminTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  darkMode,
  onNavigateTab,
}) => {
  const [users, setUsers] = React.useState<any[]>([]);
  const [services, setServices] = React.useState(() => adminStore.getServices());
  const [forms, setForms] = React.useState<any[]>([]);
  const [notifications, setNotifications] = React.useState(() => adminStore.getNotifications());
  const [logs, setLogs] = React.useState(() => adminStore.getLogs());

  // Date-to-Date Filter State
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');
  const [activePreset, setActivePreset] = React.useState<string>('all');

  React.useEffect(() => {
  const loadDashboardData = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));

      const userMap = new Map<string, any>();

usersSnapshot.docs.forEach((doc) => {
  const data = doc.data();

  const uid = String(
    data.uid ||
    data.firebaseUid ||
    data.firebaseUserId ||
    ''
  ).trim();

  const email = String(data.email || '')
    .trim()
    .toLowerCase();

  const mobile = String(
    data.mobileNumber ||
    data.mobile ||
    ''
  ).trim();

  const sffUserId = String(
    data.sffUserId || ''
  ).trim();

  // Same person ko identify karne ke liye priority
  const uniqueKey =
    uid ||
    email ||
    mobile ||
    sffUserId ||
    doc.id;

  if (!userMap.has(uniqueKey)) {
    userMap.set(uniqueKey, {
      id: doc.id,
      ...data,
    });
  }
});

const firebaseUsers = Array.from(userMap.values());

console.log('Firestore documents:', usersSnapshot.size);
console.log('Unique users:', firebaseUsers.length);

setUsers(firebaseUsers);

      setServices(adminStore.getServices());
      setNotifications(adminStore.getNotifications());
      setLogs(adminStore.getLogs());
    } catch (error) {
      console.error('Failed to load dashboard users:', error);
      setUsers([]);
    }
  };

  loadDashboardData();
  const unsubscribeForms = onSnapshot(
  collection(db, 'service_requests'),
  (snapshot) => {
    const firestoreForms = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('Firestore service requests:', firestoreForms.length);

setForms(firestoreForms);
},
(error) => {
  console.error('Service requests Firestore Error:', error);
  setForms([]);
}
);

const unsubscribe = adminStore.subscribe(() => {
  setServices(adminStore.getServices());
  setNotifications(adminStore.getNotifications());
  setLogs(adminStore.getLogs());
});

return () => {
  unsubscribe();
  unsubscribeForms();
};
}, []);

  const handlePreset = (preset: 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth') => {
    setActivePreset(preset);
    const now = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      const today = formatDate(now);
      setStartDate(today);
      setEndDate(today);
    } else if (preset === 'yesterday') {
      const yest = new Date(now);
      yest.setDate(yest.getDate() - 1);
      const yestStr = formatDate(yest);
      setStartDate(yestStr);
      setEndDate(yestStr);
    } else if (preset === '7days') {
      const past = new Date(now);
      past.setDate(past.getDate() - 6);
      setStartDate(formatDate(past));
      setEndDate(formatDate(now));
    } else if (preset === '30days') {
      const past = new Date(now);
      past.setDate(past.getDate() - 29);
      setStartDate(formatDate(past));
      setEndDate(formatDate(now));
    } else if (preset === 'thisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(formatDate(startOfMonth));
      setEndDate(formatDate(now));
    }
  };

  const isDateInRange = (dateStr?: string) => {
    if (!startDate && !endDate) return true;
    if (!dateStr) return false;

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return true;

    if (startDate) {
      const start = new Date(`${startDate}T00:00:00`);
      if (d < start) return false;
    }
    if (endDate) {
      const end = new Date(`${endDate}T23:59:59.999`);
      if (d > end) return false;
    }
    return true;
  };

  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => isDateInRange(u.registrationDate || u.lastLogin));
  }, [users, startDate, endDate]);

  const filteredForms = React.useMemo(() => {
    return forms.filter((f) => isDateInRange(f.submissionDate));
  }, [forms, startDate, endDate]);

  const filteredServices = React.useMemo(() => {
    return services.filter((s) => isDateInRange(s.createdDate));
  }, [services, startDate, endDate]);

  const activeUsersCount = users.filter((u) => {
  const status = String(
    u.accountStatus || u.status || 'Active'
  ).trim().toLowerCase();

  return status === 'active';
}).length;
  const pendingFormsCount = filteredForms.filter((f) => f.status === 'Pending' || f.status === 'Under Review').length;
  const approvedFormsCount = filteredForms.filter((f) => f.status === 'Approved').length;
  const rejectedFormsCount = filteredForms.filter((f) => f.status === 'Rejected').length;

  // Modern Stat Cards Data
  const stats = [
    {
      title: 'Total Users',
      count: users.length,
      trend: users.length > 0 ? `${Math.round((filteredUsers.length / (users.length || 1)) * 100)}% of total` : '0%',
      icon: <Users className="w-5 h-5 text-blue-400" />,
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400',
      badgeBg: 'bg-blue-500/20 text-blue-300',
      tab: 'users' as AdminTab,
    },
    {
      title: 'Total Services',
      count: filteredServices.length,
      trend: services.length > 0 ? `${filteredServices.length} active` : '0',
      icon: <Wrench className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300',
      tab: 'services' as AdminTab,
    },
    {
      title: 'Total Forms Submitted',
      count: filteredForms.length,
      trend: forms.length > 0 ? `${filteredForms.length} applications` : '0',
      icon: <ClipboardList className="w-5 h-5 text-cyan-400" />,
      color: 'from-cyan-500/20 to-teal-500/10 border-cyan-500/30 text-cyan-400',
      badgeBg: 'bg-cyan-500/20 text-cyan-300',
      tab: 'forms' as AdminTab,
    },
    {
      title: 'Pending Requests',
      count: pendingFormsCount,
      trend: pendingFormsCount > 0 ? 'Requires Action' : 'Clear',
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300',
      tab: 'forms' as AdminTab,
    },
    {
      title: 'Approved Requests',
      count: approvedFormsCount,
      trend: filteredForms.length > 0 ? `${Math.round((approvedFormsCount / (filteredForms.length || 1)) * 100)}%` : '0%',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300',
      tab: 'forms' as AdminTab,
    },
    {
      title: 'Rejected Requests',
      count: rejectedFormsCount,
      trend: filteredForms.length > 0 ? `${Math.round((rejectedFormsCount / (filteredForms.length || 1)) * 100)}%` : '0%',
      icon: <XCircle className="w-5 h-5 text-rose-400" />,
      color: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400',
      badgeBg: 'bg-rose-500/20 text-rose-300',
      tab: 'forms' as AdminTab,
    },
    {
  title: 'Active Users',
  count: activeUsersCount,
  trend: users.length > 0
    ? `${Math.round((activeUsersCount / users.length) * 100)}%`
    : '0%',
  icon: <Activity className="w-5 h-5 text-indigo-400" />,
  color: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/30 text-indigo-400',
  badgeBg: 'bg-indigo-500/20 text-indigo-300',
  tab: 'users' as AdminTab,
},
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Top Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden shadow-xl ${
          darkMode
            ? 'bg-gradient-to-r from-[#0B132B] via-[#1C2541] to-[#0B3B8C] border-slate-800'
            : 'bg-gradient-to-r from-[#071D49] via-[#0B3B8C] to-[#1E40AF] text-white border-blue-900'
        }`}
      >
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>SELF FILL FORMS (SFF) OFFICIAL ADMINISTRATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Enterprise Government Service Portal Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed">
            Real-time control over citizen applications, verification workflows, services catalog, and system telemetry.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Date-to-Date Analytics & Document Filter Bar */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border shadow-md space-y-3 transition-colors ${
          darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-700/30">
          <div className="flex items-center gap-2 text-slate-100 font-extrabold text-xs tracking-wider uppercase">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Calendar className="w-4 h-4" />
            </div>
            <span>DATE TO DATE FILTER & AUDIT TRAIL</span>
            {(startDate || endDate) && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 animate-pulse">
                Filter Active
              </span>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handlePreset('all')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                activePreset === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => handlePreset('today')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                activePreset === 'today'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => handlePreset('yesterday')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                activePreset === 'yesterday'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => handlePreset('7days')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                activePreset === '7days'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handlePreset('30days')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                activePreset === '30days'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => handlePreset('thisMonth')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                activePreset === 'thisMonth'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Custom Start / End Date Pickers */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">From Date:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setActivePreset('custom');
              }}
              className="bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To Date:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setActivePreset('custom');
              }}
              className="bg-transparent text-slate-100 font-bold focus:outline-none cursor-pointer"
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={() => handlePreset('all')}
              className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          )}

          <div className="ml-auto text-slate-300 text-[11px] font-semibold flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700/50">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Showing <strong className="text-amber-400">{filteredForms.length}</strong> submitted form(s) & <strong className="text-blue-400">{filteredUsers.length}</strong> user(s)
            </span>
          </div>
        </div>
      </div>

      {/* Grid of 8 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            onClick={() => onNavigateTab(item.tab)}
            className={`p-5 rounded-2xl border bg-gradient-to-br ${item.color} backdrop-blur-md cursor-pointer group transition-all hover:scale-[1.02] hover:shadow-xl relative overflow-hidden ${
              darkMode ? 'bg-[#0B132B]' : 'bg-white shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/10">
                {item.icon}
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.badgeBg}`}>
                {item.trend}
              </span>
            </div>

            <div className="mt-4 space-y-1">
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100">
                {item.count}
              </div>
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>{item.title}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Bottom Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on desktop): Registrations & Recent Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Latest Registrations */}
          <div
            className={`p-6 rounded-2xl border shadow-sm ${
              darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/40 mb-4">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-100">
                  Latest Registrations
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('users')}
                className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
              >
                View All Users â†’
              </button>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2 border border-dashed border-slate-800 rounded-xl p-6">
                <Users className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="font-bold text-slate-300 text-sm">No Users Found for Selected Range</p>
                <p className="max-w-xs mx-auto text-slate-400">
                  There are no registered citizen users matching the selected date criteria. Try adjusting or clearing the date filter.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.slice(0, 5).map((u) => (
                  <div
                    key={u.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      darkMode ? 'bg-[#1C2541]/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center border border-blue-500/30">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-100">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full">
                        {u.status}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">{u.registrationDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Activity & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div
            className={`p-6 rounded-2xl border shadow-sm ${
              darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-700/40 mb-4">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-100">
                Quick Actions
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => onNavigateTab('services')}
                className="w-full p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4" />
                  <span>Add New Service</span>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab('notifications')}
                className="w-full p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast Notification</span>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab('reports')}
                className="w-full p-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>View System Analytics</span>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab('admins')}
                className="w-full p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Create Admin Operator</span>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Recent System Activity Logs */}
          <div
            className={`p-6 rounded-2xl border shadow-sm ${
              darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40 mb-4">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-100">
                  Recent Activity
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('settings')}
                className="text-[11px] text-slate-400 hover:text-slate-200 font-bold"
              >
                System Logs
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                <p className="font-semibold">No Recent Activity</p>
                <p className="text-[11px]">System activity logs will appear here in real-time.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {logs.slice(0, 6).map((log) => (
                  <div key={log.id} className="text-xs space-y-1 pb-2 border-b border-slate-800/60 last:border-none">
                    <div className="flex items-center justify-between font-bold text-slate-300">
                      <span className="text-amber-400">{log.category}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{log.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



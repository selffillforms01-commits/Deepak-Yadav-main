import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ShieldAlert,
  ChevronDown,
  User,
  Settings,
  LogOut,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Server,
  ArrowLeft
} from 'lucide-react';
import { adminStore } from './adminStore';
import { AdminNotificationRecord } from './AdminTypes';

interface AdminHeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  onNavigateTab: (tab: any) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  adminName?: string;
  adminRole?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onLogout,
  onNavigateTab,
  searchQuery,
  onSearchChange,
  adminName = 'Super Admin',
  adminRole = 'System Administrator',
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationRecord[]>(() => adminStore.getNotifications());

  React.useEffect(() => {
    const handleUpdate = () => {
      setNotifications(adminStore.getNotifications());
    };
    handleUpdate();
    const unsubscribe = adminStore.subscribe(handleUpdate);
    return () => unsubscribe();
  }, []);

  const settings = adminStore.getSettings();

  return (
    <header
      className={`sticky top-0 z-30 h-16 px-4 sm:px-6 flex items-center justify-between border-b backdrop-blur-md transition-colors duration-200 ${
        darkMode
          ? 'bg-[#0B132B]/90 border-slate-800 text-slate-100'
          : 'bg-white/90 border-slate-200 text-slate-800 shadow-2xs'
      }`}
    >
      {/* Left: Back Button & Global Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          type="button"
          onClick={() => onNavigateTab('dashboard')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs bg-[#0B3B8C] text-white hover:bg-blue-800 transition-colors cursor-pointer shrink-0"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div
          className={`relative w-full flex items-center rounded-xl border transition-all ${
            darkMode
              ? 'bg-[#1C2541] border-slate-700/80 focus-within:border-amber-500'
              : 'bg-slate-50 border-slate-200 focus-within:border-[#0B3B8C]'
          }`}
        >
          <Search
            className={`w-4 h-4 ml-3.5 shrink-0 ${
              darkMode ? 'text-slate-400' : 'text-slate-500'
            }`}
          />
          <input
            type="text"
            placeholder="Search users, forms, services..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full py-2 pl-2.5 pr-4 text-xs bg-transparent border-none outline-none font-medium placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="mr-2 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* System Health Badge */}
        <div
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
            settings.maintenanceMode
              ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>{settings.maintenanceMode ? 'Maintenance Active' : 'System Operational'}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleDarkMode}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            darkMode
              ? 'bg-[#1C2541] border-slate-700 text-amber-400 hover:bg-[#253259]'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
              darkMode
                ? 'bg-[#1C2541] border-slate-700 text-slate-300 hover:bg-[#253259]'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50 p-4 space-y-3 ${
                darkMode
                  ? 'bg-[#0B132B] border-slate-800 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/40">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-xs uppercase tracking-wider">
                    System Notifications
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-slate-500 mx-auto opacity-50" />
                    <p className="font-semibold">No System Notifications</p>
                    <p className="text-[11px] text-slate-500">
                      Notifications created in admin panel will appear here.
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border text-xs space-y-1 transition-colors ${
                        darkMode
                          ? 'bg-[#1C2541]/70 border-slate-800 hover:bg-[#1C2541]'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-amber-500">{n.title}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {n.sentDate}
                        </span>
                      </div>
                      <p className="text-slate-300 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => {
                  setShowNotifications(false);
                  onNavigateTab('notifications');
                }}
                className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center block"
              >
                Manage Notifications →
              </button>
            </div>
          )}
        </div>

        {/* Profile Badge & Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className={`flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all cursor-pointer ${
              darkMode
                ? 'bg-[#1C2541] border-slate-700/80 hover:bg-[#253259]'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B3B8C] to-amber-600 text-white font-black text-xs flex items-center justify-center border border-amber-400/30">
              {adminName.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-black tracking-tight leading-tight">{adminName}</div>
              <div className="text-[10px] text-amber-500 font-bold leading-tight">{adminRole}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div
              className={`absolute right-0 mt-2 w-56 rounded-2xl border shadow-2xl z-50 p-2 space-y-1 text-xs ${
                darkMode
                  ? 'bg-[#0B132B] border-slate-800 text-slate-100'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <div className="p-2.5 border-b border-slate-700/40">
                <p className="font-black text-sm">{adminName}</p>
                <p className="text-[11px] text-slate-400">admin@sff.gov.in</p>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onNavigateTab('admins');
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                  darkMode ? 'hover:bg-[#1C2541]' : 'hover:bg-slate-100'
                }`}
              >
                <User className="w-4 h-4 text-amber-500" />
                <span>Admin Accounts</span>
              </button>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onNavigateTab('settings');
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                  darkMode ? 'hover:bg-[#1C2541]' : 'hover:bg-slate-100'
                }`}
              >
                <Settings className="w-4 h-4 text-blue-400" />
                <span>System Settings</span>
              </button>

              <div className="h-px bg-slate-700/40 my-1" />

              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left font-bold text-red-500 hover:bg-red-500/10 cursor-pointer transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Exit Admin Portal</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

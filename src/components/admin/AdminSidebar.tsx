import React from 'react';
import { motion } from 'motion/react';
import {
  Home,
  Users,
  FileText,
  Wrench,
  Hammer,
  ClipboardList,
  Bell,
  BarChart2,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Wallet
} from 'lucide-react';
import { AdminTab } from './AdminTypes';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  darkMode: boolean;
  pendingFormsCount?: number;
}

interface MenuItem {
  id: AdminTab | 'logout';
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  onLogout,
  darkMode,
  pendingFormsCount = 0,
}) => {
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { id: 'services', label: 'Services', icon: <Wrench className="w-5 h-5" /> },
    { id: 'jobs', label: 'Jobs', icon: <FileText className="w-5 h-5" /> },
    {
      id: 'forms',
      label: 'Forms',
      icon: <ClipboardList className="w-5 h-5" />,
      badge: pendingFormsCount > 0 ? pendingFormsCount : undefined,
    },
    {
      id: 'maintenance',
      label: 'Maintenance & Work',
      icon: <Hammer className="w-5 h-5" />,
    },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'accounts', label: 'Accounts & Passbook', icon: <Wallet className="w-5 h-5" /> },
    { id: 'admins', label: 'Admin Management', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside
      className={`relative z-40 flex flex-col justify-between transition-all duration-300 border-r ${
        collapsed ? 'w-20' : 'w-64 sm:w-72'
      } ${
        darkMode
          ? 'bg-[#0B132B] border-slate-800 text-slate-100'
          : 'bg-[#071D49] border-slate-900 text-white shadow-xl'
      }`}
    >
      {/* Top Branding Section */}
      <div>
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#071D49] rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            {!collapsed && (
              <div className="transition-opacity duration-200">
                <div className="text-sm font-black tracking-tight text-white uppercase">
                  SFF Portal
                </div>
                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                  <span>ADMIN CONTROL</span>
                </div>
              </div>
            )}
          </div>

          {/* Toggle Sidebar Button */}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu Items List */}
        <nav className="p-3 space-y-1.5 mt-2">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as AdminTab)}
                className={`relative w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer group ${
                  isActive
                    ? 'text-slate-950 shadow-md shadow-amber-500/15'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {/* Active Highlight Animation Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeAdminTabBg"
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <div
                  className={`shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-slate-950 font-black' : 'text-slate-400 group-hover:text-amber-400'
                  }`}
                >
                  {item.icon}
                </div>

                {!collapsed && (
                  <span className="truncate flex-1 text-left tracking-wide">
                    {item.label}
                  </span>
                )}

                {!collapsed && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      isActive
                        ? 'bg-slate-950 text-amber-400'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Logout */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-bold text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Logout"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="truncate">Exit Admin Portal</span>}
        </button>
      </div>
    </aside>
  );
};


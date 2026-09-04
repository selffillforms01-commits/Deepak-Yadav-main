import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { AdminUsers } from './AdminUsers';
import { AdminServices } from './AdminServices';
import { AdminJobs } from './AdminJobs';
import { AdminForms } from './AdminForms';
import { AdminMaintenance } from './AdminMaintenance';
import { AdminNotifications } from './AdminNotifications';
import { AdminReports } from './AdminReports';
import { AdminAccounts } from './AdminAccounts';
import { AdminManagement } from './AdminManagement';
import { AdminSettings } from './AdminSettings';
import { AdminTab, AdminUserRecord } from './AdminTypes';
import { adminStore } from './adminStore';
import { DesktopGuard } from '../DesktopGuard';

interface AdminLayoutProps {
  onLogout: () => void;
  logoUrl: string;
  onLogoChange?: (url: string) => void;
  onImpersonateUser?: (user: AdminUserRecord) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  onLogout,
  logoUrl,
  onLogoChange,
  onImpersonateUser,
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [, setStoreTick] = useState(0);

  // Subscribe to store updates for real-time state synchronization
  useEffect(() => {
  const unsubscribe = adminStore.subscribe(() => {
    setStoreTick((prev) => prev + 1);
  });

  const refreshInterval = setInterval(() => {
    setStoreTick((prev) => prev + 1);
  }, 1000);

  return () => {
    unsubscribe();
    clearInterval(refreshInterval);
  };
}, []);

  const pendingFormsCount = adminStore
    .getForms()
    .filter((f) => f.status === 'Pending' || f.status === 'Under Review').length;

  return (
    <DesktopGuard portalName="Admin" onReturnToUser={onLogout}>
      <div
        className={`min-h-screen flex font-sans antialiased transition-colors duration-200 ${
          darkMode ? 'bg-[#040711] text-slate-100' : 'bg-slate-50 text-slate-900'
        }`}
      >
      {/* Collapsible Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={onLogout}
        darkMode={darkMode}
        pendingFormsCount={pendingFormsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        {/* Top Header */}
        <AdminHeader
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
          onLogout={onLogout}
          onNavigateTab={setCurrentTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          adminName="Super Administrator"
          adminRole="System Administrator"
        />

        {/* View Port Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentTab === 'dashboard' && (
                <AdminDashboard darkMode={darkMode} onNavigateTab={setCurrentTab} />
              )}
              {currentTab === 'users' && (
                <AdminUsers darkMode={darkMode} onImpersonateUser={onImpersonateUser} />
              )}
              {currentTab === 'services' && <AdminServices darkMode={darkMode} />}
              {currentTab === 'jobs' && <AdminJobs darkMode={darkMode} />}
              {currentTab === 'forms' && <AdminForms darkMode={darkMode} onImpersonateUser={onImpersonateUser} />}
              {currentTab === 'maintenance' && <AdminMaintenance darkMode={darkMode} />}
              {currentTab === 'notifications' && <AdminNotifications darkMode={darkMode} />}
              {currentTab === 'reports' && <AdminReports darkMode={darkMode} />}
              {currentTab === 'accounts' && <AdminAccounts darkMode={darkMode} />}
              {currentTab === 'admins' && <AdminManagement darkMode={darkMode} />}
              {currentTab === 'settings' && (
                <AdminSettings darkMode={darkMode} onLogoChange={onLogoChange} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
    </DesktopGuard>
  );
};



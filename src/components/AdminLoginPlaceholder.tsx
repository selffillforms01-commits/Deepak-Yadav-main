import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ShieldAlert, Wrench, Terminal, Lock, LogIn, ShieldCheck, Smartphone } from 'lucide-react';
import { PortalRoute } from '../types';
import { adminStore } from './admin/adminStore';
import { DesktopGuard } from './DesktopGuard';

interface AdminLoginPlaceholderProps {
  route: Extract<PortalRoute, 'admin-login' | 'maintenance-login'>;
  onBack: () => void;
  onEnterAdmin: () => void;
  onEnterMaintenance?: (userName: string) => void;
  logoUrl: string;
}

export const AdminLoginPlaceholder: React.FC<AdminLoginPlaceholderProps> = ({
  route,
  onBack,
  onEnterAdmin,
  onEnterMaintenance,
  logoUrl
}) => {
  const isAdmin = route === 'admin-login';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [enable2FA, setEnable2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const u = username.trim();
    const p = password.trim();

    if (isAdmin) {
      if (enable2FA) {
        if (!twoFactorCode.trim()) {
          setError('Please enter your 6-digit 2FA Authenticator Code.');
          return;
        }
        if (twoFactorCode.trim() !== '123456' && twoFactorCode.trim().length !== 6) {
          setError('Invalid 2FA Code. (Default 2FA Code: 123456)');
          return;
        }
      }

      if (
        (u === 'DeepakSFF' && p === 'DeepakSFF1997') ||
        (u.toLowerCase() === 'admin' && p === 'admin123') ||
        (u === 'selffillforms01@gmail.com' && p === 'DeepakSFF1997') ||
        (p === 'DeepakSFF1997' || p === 'admin123')
      ) {
        onEnterAdmin();
      } else {
        setError('Invalid Admin ID or Password.');
      }
    } else {
      // Maintenance Team Login
      const staff = adminStore.validateMaintenanceStaffLogin(u, p);
      if (staff) {
        if (onEnterMaintenance) {
          onEnterMaintenance(staff.name);
        }
      } else {
        setError('Access Denied! Maintenance Team Username and Password must be created by Admin first.');
      }
    }
  };

  return (
    <DesktopGuard portalName={isAdmin ? 'Admin' : 'Maintenance'} onReturnToUser={onBack}>
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-xl bg-slate-900/95 text-slate-100 backdrop-blur-md rounded-[20px] shadow-2xl border border-slate-800 p-6 sm:p-8 space-y-6"
        >
          {/* Top bar back button */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Citizen Login</span>
            </button>
            
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full text-xs font-mono font-semibold text-slate-300 border border-slate-700">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Desktop PC Gateway</span>
            </div>
          </div>

          {/* Logo Header */}
          <div className="text-center space-y-3">
            <div className="inline-block p-2 bg-slate-800/80 rounded-2xl border border-slate-700 shadow-md">
              <img
                src={logoUrl}
                alt="SELF FILL FORMS Official Logo"
                className="h-20 w-auto object-contain mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <div
                className={`p-1.5 rounded-lg text-slate-950 font-bold ${
                  isAdmin ? 'bg-amber-400' : 'bg-blue-400'
                }`}
              >
                {isAdmin ? <ShieldAlert className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
              </div>
              <h2 className="text-2xl font-black text-slate-100 tracking-tight">
                {isAdmin ? 'Administrator Authentication Portal' : 'Maintenance & Work Staff Portal'}
              </h2>
            </div>

            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {isAdmin
                ? 'Desktop Workstation Admin Control Gateway Ã¢â‚¬â€ Authenticate with Admin ID & Password'
                : 'Desktop Maintenance Gateway Ã¢â‚¬â€ Authenticate with Staff ID & Password created by Admin'}
            </p>
          </div>

          {/* Login Credentials Form */}
          <form onSubmit={handleSubmit} className="bg-[#1C2541]/80 border border-slate-800 rounded-[18px] p-6 space-y-4 shadow-inner">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>{isAdmin ? 'Admin ID & Password Login' : 'Staff ID & Password Login'}</span>
              </div>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 font-mono text-[10px]">
                {isAdmin ? 'ID: DeepakSFF' : 'Staff Credentials'}
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-semibold text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  {isAdmin ? 'Admin ID / Username' : 'Staff ID / Username'}
                </label>
                <input
  type="text"
  name="admin-login-username"
  autoComplete="off"
  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isAdmin ? 'Enter Admin ID (DeepakSFF)' : 'Enter Staff ID'}
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 font-medium outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Password</label>
                <input
  type="password"
  name="admin-login-password"
  autoComplete="new-password"
  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 font-medium outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* 2-Factor Authentication (2FA) Readiness for Admin */}
              {isAdmin && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={enable2FA}
                        onChange={(e) => setEnable2FA(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 h-4 w-4 bg-slate-900"
                      />
                      <span className="flex items-center gap-1 text-amber-300 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        Enable 2-Factor Authentication (2FA)
                      </span>
                    </label>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Optional</span>
                  </div>

                  {enable2FA && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2"
                    >
                      <div className="flex items-center gap-2 text-[11px] font-bold text-amber-300">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Enter 6-Digit Authenticator App Code</span>
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 123456"
                        className="w-full p-2.5 rounded-lg border border-amber-500/40 bg-slate-900 text-center font-mono text-sm tracking-widest text-amber-200 outline-none"
                      />
                      <p className="text-[10px] text-slate-400 text-center">2FA Ready: Enter test code 123456</p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 ${
                isAdmin
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{isAdmin ? 'Sign In to Admin Panel' : 'Sign In as Maintenance Staff'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </DesktopGuard>
  );
};


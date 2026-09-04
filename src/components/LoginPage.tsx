import { Capacitor } from '@capacitor/core';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  HelpCircle,
  Check,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  ShieldCheck
} from 'lucide-react';
import { LoginFormState, PortalRoute, UserProfile } from '../types';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { HelpSupportModal } from './HelpSupportModal';
import { AdminMaintenanceModal } from './AdminMaintenanceModal';
import { RegisterModal } from './RegisterModal';
import { loginUserWithFirebase, getUserProfileFromFirestore, saveUserProfileToFirestore, loginWithGoogleProvider } from '../lib/firestoreService';

interface LoginPageProps {
  onNavigate: (route: PortalRoute) => void;
  onLoginSuccess?: (username: string, registeredProfile?: UserProfile) => void;
  logoUrl: string;
  onLogoChange: (newUrl: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigate,
  onLoginSuccess,
  logoUrl,
  onLogoChange
}) => {
  // Form State
  const [form, setForm] = useState<LoginFormState>({
    usernameOrEmail: '',
    password: '',
    rememberMe: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastRegisteredUser, setLastRegisteredUser] = useState<UserProfile | null>(null);

  // Modals
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showHelpSupport, setShowHelpSupport] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.usernameOrEmail.trim()) {
      setErrorMsg('Please enter your Mobile No. or Email address.');
      return;
    }

    if (!form.password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    const inputUser = form.usernameOrEmail.trim();
    const inputPass = form.password.trim();

    // Check for Permanent Admin Credentials (DeepakSFF / DeepakSFF1997 or admin / admin123)
    if (
      (inputUser === 'DeepakSFF' && inputPass === 'DeepakSFF1997') ||
      (inputUser.toLowerCase() === 'admin' && inputPass === 'admin123')
    ) {
      setLoading(false);
      setLoginSuccess(true);
      setTimeout(() => {
        onNavigate('admin-dashboard');
      }, 400);
      return;
    }

    setLoading(true);

    try {
      const { user: fbUser, profile } = await loginUserWithFirebase(form.usernameOrEmail, form.password);

      let profileToUse = profile || lastRegisteredUser;
      if (!profileToUse) {
        profileToUse = {
          name: fbUser.displayName || form.usernameOrEmail.split('@')[0],
          email: fbUser.email || form.usernameOrEmail,
          mobile: fbUser.phoneNumber || ''
        };
        await saveUserProfileToFirestore(fbUser.uid, profileToUse);
      }

      setLoading(false);
      setLoginSuccess(true);
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(form.usernameOrEmail, profileToUse || undefined);
        } else {
          onNavigate('dashboard');
        }
      }, 500);
    } catch (err: any) {
      console.warn('Firebase login error:', err);
      setLoading(false);

      if (err.code === 'auth/user-not-found' || (err.message && err.message.includes('not found'))) {
        setErrorMsg('No registered account found with this Mobile No., Email or SFF ID. Please complete "New User Registration" first.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-password') {
        setErrorMsg('Incorrect password. Please enter the correct password you created during registration.');
      } else {
        setErrorMsg(err.message || 'Login failed. Please enter correct credentials or register your account first.');
      }
    }
  };


  return (
    <div className="relative min-h-screen flex flex-col justify-between p-3 sm:p-6 lg:p-8 z-10 w-full max-w-full overflow-x-hidden">
      {/* Main Centered Login Container */}
      <main className="w-full my-auto flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-[440px] bg-white/85 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] shadow-[0_20px_50px_rgba(11,59,140,0.08)] border border-white/80 p-7 sm:p-9 space-y-6"
        >
          {/* Top Section: Original SFF Logo */}
          <div className="text-center space-y-3.5">
            <div className="inline-block p-2 bg-white/90 rounded-2xl shadow-sm border border-slate-100">
              <img
                src={logoUrl}
                alt="SELF FILL FORMS Logo"
                className="h-28 sm:h-32 w-auto object-contain mx-auto transition-transform hover:scale-102"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Title Below Logo */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-[26px] font-bold text-[#0B3B8C] tracking-tight leading-tight">
                Welcome to Self Fill Forms
              </h1>
            </div>
          </div>

          {/* Login Form */}
          {loginSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 text-center space-y-4 bg-blue-50/70 border border-blue-100 rounded-2xl p-6"
            >
              <div className="w-12 h-12 mx-auto bg-green-500 text-white rounded-full flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Login Successful</h3>
                <p className="text-xs text-slate-600">
                  Welcome back, <span className="font-semibold text-[#0B3B8C]">{form.usernameOrEmail}</span>!
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  Redirecting to your Self Fill Forms Citizen Dashboard...
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLoginSuccess(false)}
                className="px-5 py-2 bg-[#0B3B8C] text-white font-bold text-xs rounded-xl hover:bg-[#082d6b] transition-all"
              >
                Sign Out / Return
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {/* Mobile No. / Email Field */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#0B3B8C] uppercase tracking-wider ml-0.5">
                  Mobile No. or Email
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0B3B8C] transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={form.usernameOrEmail}
                    onChange={(e) => setForm({ ...form, usernameOrEmail: e.target.value })}
                    placeholder="Enter your mobile no. or email"
                    className="w-full pl-11 pr-4 h-12 bg-slate-50/90 border border-slate-200 rounded-2xl text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3B8C]/20 focus:bg-white focus:border-[#0B3B8C] transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#0B3B8C] uppercase tracking-wider ml-0.5">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0B3B8C] transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-11 h-12 bg-slate-50/90 border border-slate-200 rounded-2xl text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3B8C]/20 focus:bg-white focus:border-[#0B3B8C] transition-all"
                  />
                  {/* Show / Hide Password Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Link */}
              <div className="flex items-center justify-between pt-0.5">
                {/* Remember Me Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={form.rememberMe}
                      onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 bg-slate-100 border border-slate-300 rounded peer-checked:bg-[#0B3B8C] peer-checked:border-[#0B3B8C] transition-all flex items-center justify-center">
                      {form.rememberMe && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Remember Me</span>
                </label>

                {/* Forgot Password Link */}
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs font-bold text-[#E5A100] hover:underline focus:outline-none transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Large Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 px-6 bg-[#0B3B8C] hover:bg-[#082d6b] active:scale-[0.99] text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2.5 transition-all disabled:opacity-75 focus:ring-2 focus:ring-offset-2 focus:ring-[#0B3B8C]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5 text-[#E5A100]" />
                    <span>Login</span>
                  </>
                )}
              </button>

              {/* New User Registration Option & Admin Access */}
              <div className="pt-2 text-center space-y-2">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">New User?</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(true)}
                  className="w-full py-3 px-4 bg-amber-50/90 hover:bg-amber-100 border-2 border-[#E5A100]/60 text-[#0B3B8C] font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm group"
                >
                  <UserPlus className="w-4 h-4 text-[#E5A100] group-hover:scale-110 transition-transform" />
                  <span>New User Registration</span>
                </button>

                {!Capacitor.isNativePlatform() && (
                  <a
                    href="https://self-fill-forms.pages.dev/update/SELF-FILL-FORMS.apk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    📱 Download SELF-FILL-FORMS App
                  </a>
                )}


              </div>
            </form>
          )}
        </motion.div>
      </main>

      {/* Footer Section */}
      <footer className="w-full max-w-5xl mx-auto pt-4 pb-2 text-center relative">
        {/* Bottom-Right Corner: Very Small Footer Text for Admin & Maintenance Access */}
        <div className="sm:absolute sm:bottom-2 sm:right-0">
          <button
            type="button"
            onClick={() => setShowAdminModal(true)}
            className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer focus:outline-none underline decoration-slate-300 underline-offset-2"
          >
            Admin & Maintenance
          </button>
        </div>
      </footer>

      {/* Modals */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />

      <HelpSupportModal
        isOpen={showHelpSupport}
        onClose={() => setShowHelpSupport(false)}
      />

      <AdminMaintenanceModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onNavigate={onNavigate}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        logoUrl={logoUrl}
        onRegisterSuccess={(regUser) => {
          setLastRegisteredUser(regUser);
          if (onLoginSuccess) {
            onLoginSuccess(regUser.email || regUser.mobile, regUser);
          }
        }}
      />
    </div>
  );
};








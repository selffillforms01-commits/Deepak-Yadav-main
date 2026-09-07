import { Capacitor } from '@capacitor/core';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  // Use the same API system as Registration
  const API_BASE_URL = Capacitor.isNativePlatform() ? 'https://self-fill-forms.pages.dev' : '';

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'success'>('email');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-password-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data: { error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to send OTP.');
      }

      setEmail(cleanEmail);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Unable to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-password-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otp.trim(),
        }),
      });

      const data: { error?: string; resetToken?: string } = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP.');
      }

      if (!data.resetToken) {
        throw new Error('Password reset token was not received. Please try again.');
      }

      setResetToken(data.resetToken);
      setStep('password');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setOtp('');
    setStep('email');
    setError('');
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-[16px] shadow-2xl border border-slate-100 overflow-hidden"
        >
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-[#0B3B8C] to-[#07265E] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-[#E5A100]" />
              </div>
              <h3 className="text-lg font-bold">Change Password</h3>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {step === 'email' && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Enter your registered email address. We will send a 6-digit OTP to your email.
                </p>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Registered Email
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter registered email"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3B8C] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 px-4 bg-[#0B3B8C] hover:bg-[#082d6b] text-white rounded-xl text-sm font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Enter the 6-digit OTP sent to <b>{email}</b>.
                </p>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg tracking-[0.4em] font-bold focus:outline-none focus:ring-2 focus:ring-[#0B3B8C]"
                />

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#0B3B8C] hover:bg-[#082d6b] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify OTP</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {step === 'password' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError('');

                  if (!resetToken) {
                    setError('Password reset session is invalid. Please start again.');
                    return;
                  }

                  if (newPassword.length < 6) {
                    setError('Password must be at least 6 characters.');
                    return;
                  }

                  if (newPassword !== confirmPassword) {
                    setError('Passwords do not match.');
                    return;
                  }

                  setLoading(true);

                  try {

                    const response = await fetch(
                      `${API_BASE_URL}/api/auth/change-password`,
                      {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          resetToken,
                          newPassword,
                        }),
                      }
                    );

                    const contentType = response.headers.get('content-type') || '';

                    if (!contentType.includes('application/json')) {
                      throw new Error(
                        'Server returned an invalid response. Please check your internet connection and try again.'
                      );
                    }

                    const data: { error?: string; success?: boolean } =
                      await response.json();

                    if (!response.ok) {
                      throw new Error(
                        data.error || 'Unable to change password.'
                      );
                    }

                    setStep('success');
                  } catch (err: any) {
                    setError(
                      err.message ||
                      'Unable to change password. Please try again.'
                    );
                  } finally {
                    setLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <p className="text-sm text-slate-600 leading-relaxed">
                  OTP verified successfully. Create your new password below.
                </p>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3B8C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3B8C]"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#0B3B8C] hover:bg-[#082d6b] text-white rounded-xl text-sm font-semibold disabled:opacity-60"
                >
                  Change Password
                </button>
              </form>
            )}

            {step === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4 space-y-4"
              >
                <div className="w-12 h-12 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <h4 className="text-base font-bold text-slate-800">
                  OTP Verified
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Your email has been verified successfully.
                </p>

                <button
                  onClick={handleClose}
                  className="w-full py-2.5 bg-[#0B3B8C] text-white rounded-xl text-sm font-semibold hover:bg-[#082d6b]"
                >
                  Continue
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};








import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  const handleReset = () => {
    setSubmitted(false);
    setEmail('');
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
          {/* Header */}
          <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-[#0B3B8C] to-[#07265E] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-[#E5A100]" />
              </div>
              <h3 className="text-lg font-bold">Reset Password</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Enter your registered username or email address below. We will send a secure password reset link to your official inbox.
                </p>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                    Registered Email / Username
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter registered email or username"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3B8C] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 px-4 bg-[#0B3B8C] hover:bg-[#082d6b] text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Instructions</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4 space-y-4"
              >
                <div className="w-12 h-12 mx-auto bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Password Reset Sent</h4>
                <p className="text-xs text-slate-600 leading-relaxed px-2">
                  A verification link has been dispatched to <span className="font-semibold text-slate-800">{email}</span>. Please check your inbox and follow the steps.
                </p>
                <button
                  onClick={handleReset}
                  className="w-full py-2.5 bg-[#0B3B8C] text-white rounded-xl text-sm font-semibold hover:bg-[#082d6b] transition-all"
                >
                  Return to Login
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

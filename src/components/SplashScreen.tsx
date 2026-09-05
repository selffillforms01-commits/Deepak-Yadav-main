import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  imageUrl?: string;
  durationSeconds?: number;
  onComplete?: () => void;
  isPreview?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  imageUrl = '/sff-logo.svg',
  durationSeconds = 3,
  onComplete,
  isPreview = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  useEffect(() => {
    const totalMs = Math.max(1, durationSeconds) * 1000;
    const intervalMs = 50;
    const steps = totalMs / intervalMs;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentProgress = Math.min(100, (currentStep / steps) * 100);
      setProgress(currentProgress);

      const remainingSecs = Math.max(0, Math.ceil((totalMs - currentStep * intervalMs) / 1000));
      setTimeLeft(remainingSecs);

      if (currentStep >= steps) {
        clearInterval(timer);
        if (onComplete) {
          setTimeout(onComplete, 200);
        }
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [durationSeconds, onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[9999] bg-[#030712] text-white flex flex-col items-center justify-between p-6 overflow-hidden select-none"
      >
        {/* Subtle background glow effect */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#0B3B8C]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="w-full max-w-md flex items-center justify-between z-10 pt-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-bold text-amber-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Digital India Approved Portal</span>
          </div>

          {isPreview && (
            <button
              onClick={onComplete}
              className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-full text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
            >
              <X className="w-4 h-4" />
              <span>Close Preview</span>
            </button>
          )}
        </div>

        {/* Main Center Section - Image & Branding */}
        <div className="w-full max-w-sm flex flex-col items-center justify-center my-auto z-10 text-center space-y-6">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500 via-blue-600 to-amber-400 opacity-60 blur-lg group-hover:opacity-100 transition duration-1000 animate-pulse" />
            
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 bg-[#0A1128] rounded-3xl border-2 border-amber-400/40 p-4 shadow-2xl flex items-center justify-center overflow-hidden">
              <img
                src={imageUrl || '/sff-logo.svg'}
                alt="Splash Screen"
                className="w-full h-full object-contain drop-shadow-xl"
                onError={(e) => {
                  e.currentTarget.src = '/sff-logo.svg';
                }}
              />
            </div>
          </motion.div>

          <div className="space-y-2">
            <motion.h1
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2"
            >
              <span>SELF FILL FORMS</span>
              <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            </motion.h1>
            <p className="text-xs font-semibold text-slate-400 max-w-xs mx-auto">
              Government Job Applications, Certificates & Citizen Services Portal
            </p>
          </div>
        </div>

        {/* Bottom Progress Bar & Footer */}
        <div className="w-full max-w-md z-10 space-y-3 pb-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>Starting Portal...</span>
            <span className="text-amber-400 font-mono">{timeLeft}s</span>
          </div>

          <div className="w-full h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-amber-400 to-amber-500 transition-all ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="text-center text-[10px] text-slate-500 font-medium">
            {isPreview ? 'Preview Mode â€¢ Settings Saved in Admin' : '100% Verified Citizen Service Network'}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};


import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, Wrench, ArrowRight, Lock, Sparkles } from 'lucide-react';
import { PortalRoute } from '../types';

interface AdminMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: PortalRoute) => void;
}

export const AdminMaintenanceModal: React.FC<AdminMaintenanceModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-[16px] shadow-2xl border border-slate-200 overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-[#07265E] to-[#0B3B8C] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/20 border border-amber-400/30 rounded-xl">
                <Lock className="w-5 h-5 text-[#E5A100]" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-wide">Privileged Access Portal</h3>
                <p className="text-xs text-slate-300">Self Fill Forms Restricted Operations</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Select an administrative role below to proceed to the designated system route.
            </p>

            {/* Role Options */}
            <div className="space-y-3">
              {/* Admin Login Option */}
              <button
                onClick={() => {
                  onClose();
                  onNavigate('admin-login');
                }}
                className="w-full p-4 bg-white hover:bg-blue-50/80 border-2 border-slate-200 hover:border-[#0B3B8C] rounded-[16px] transition-all text-left group flex items-center justify-between shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-[#0B3B8C]/10 text-[#0B3B8C] group-hover:bg-[#0B3B8C] group-hover:text-white rounded-xl transition-colors">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-[#0B3B8C] transition-colors flex items-center gap-2">
                      Admin Login
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-[#0B3B8C] rounded-full">
                        /admin-login
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">System management & form configuration</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#0B3B8C] group-hover:translate-x-1 transition-all" />
              </button>

              {/* Maintenance Login Option */}
              <button
                onClick={() => {
                  onClose();
                  onNavigate('maintenance-login');
                }}
                className="w-full p-4 bg-white hover:bg-amber-50/80 border-2 border-slate-200 hover:border-[#E5A100] rounded-[16px] transition-all text-left group flex items-center justify-between shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-[#E5A100]/10 text-[#B87D00] group-hover:bg-[#E5A100] group-hover:text-slate-950 rounded-xl transition-colors">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-[#B87D00] transition-colors flex items-center gap-2">
                      Maintenance Login
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-[#B87D00] rounded-full">
                        /maintenance-login
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">Database audits, patches & portal telemetry</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#E5A100] group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            {/* Note */}
            <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Navigation placeholders initialized for authentication integration</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

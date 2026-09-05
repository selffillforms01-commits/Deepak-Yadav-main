import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Mail,
  Bell,
  Database,
  Lock,
  Terminal,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Power,
  Trash2,
  Image as ImageIcon,
  Upload,
  QrCode,
  CreditCard,
  RotateCcw,
  Smartphone,
  Play,
  Plus,
  Minus,
  ToggleLeft,
  ToggleRight,
  Sparkles,
} from 'lucide-react';
import { adminStore } from './adminStore';
import { AdminSystemSettings } from './AdminTypes';
import { wipeAllFirestoreCollections } from '../../lib/firestoreService';
import { compressImageFile } from '../../utils/imageCompressor';
import { SplashScreen } from '../SplashScreen';

interface AdminSettingsProps {
  darkMode: boolean;
  onLogoChange?: (url: string) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ darkMode, onLogoChange }) => {
  const settings = adminStore.getSettings();
  const [formData, setFormData] = useState<AdminSystemSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [backupTriggered, setBackupTriggered] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [wipeSuccess, setWipeSuccess] = useState(false);
  const [showSplashPreview, setShowSplashPreview] = useState(false);

  const logs = adminStore.getLogs();

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    adminStore.updateSettings(formData);
    if (onLogoChange && formData.appLogoUrl) {
      onLogoChange(formData.appLogoUrl);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSplashFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const { dataUrl } = await compressImageFile(file, 1200, 0.85);
      setFormData((prev) => ({ ...prev, splashImageUrl: dataUrl }));
      e.target.value = '';
    }
  };

  const handleDurationChange = (delta: number) => {
    const current = formData.splashDurationSeconds ?? 3;
    const nextVal = Math.min(10, Math.max(1, current + delta));
    setFormData((prev) => ({ ...prev, splashDurationSeconds: nextVal }));
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const { dataUrl } = await compressImageFile(file, 1000, 0.8);
      setFormData((prev) => ({ ...prev, appLogoUrl: dataUrl }));
      e.target.value = '';
    }
  };

  const handleTriggerBackup = () => {
    setBackupTriggered(true);
    adminStore.addLog('System', 'Triggered automated full system database backup');
    adminStore.updateSettings({ lastBackupTimestamp: new Date().toISOString() });
    setTimeout(() => setBackupTriggered(false), 2000);
  };

    const handleWipeTotalDatabase = async () => {
    setShowWipeConfirm(false);
    adminStore.clearTotalDatabase();
    await wipeAllFirestoreCollections();
    setWipeSuccess(true);
    setTimeout(() => {
      setWipeSuccess(false);
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12">`n      {/* Splash Screen Image Settings */}
        <div className="p-6 rounded-2xl border bg-[#0B132B] border-amber-500/40 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/30 text-amber-300 font-bold text-sm">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-amber-400" />
              <span>Splash Screen Image Settings</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-950/80 text-amber-300 px-2.5 py-1 rounded-full border border-amber-800/80">
                Persisted in Firebase
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Left Col: Controls & Settings */}
            <div className="md:col-span-2 space-y-4">
              {/* Enable / Disable Toggle */}
              <div className="p-3.5 rounded-xl bg-[#1C2541] border border-slate-700 flex items-center justify-between">
                <div>
                  <label className="font-extrabold text-slate-100 block text-xs">Enable / Disable Splash Screen</label>
                  <p className="text-[10px] text-slate-400">Show splash screen animation with custom image when users open the portal.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, splashEnabled: !(formData.splashEnabled ?? true) })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                    formData.splashEnabled ?? true
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {formData.splashEnabled ?? true ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  <span>{formData.splashEnabled ?? true ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              {/* Upload Image Section */}
              <div>
                <label className="block font-bold text-slate-200 mb-1.5">
                  Splash Screen Image Upload & Actions
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleSplashFileUpload}
                    className="hidden"
                    id="admin-splash-file-input"
                  />
                  <label
                    htmlFor="admin-splash-file-input"
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 transition-all text-xs"
                  >
                    <Upload className="w-4 h-4" /> Choose Splash Image
                  </label>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, splashImageUrl: '/sff-logo.svg' })}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-700 text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" /> Reset Default
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, splashImageUrl: '' })}
                    className="px-3 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer border border-rose-500/30 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Remove Image
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mt-2 font-medium">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-mono">
                    Recommended Size: 1080 Ã— 1920 px
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Supported Formats: PNG, JPG, WEBP
                  </span>
                </div>
              </div>

              {/* Direct Image URL input */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Direct Image URL / Path</label>
                <input
                  type="text"
                  value={formData.splashImageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, splashImageUrl: e.target.value })}
                  placeholder="/sff-logo.svg or https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] text-slate-100 font-mono text-xs outline-none focus:border-amber-500"
                />
              </div>

              {/* Display Duration Control */}
              <div className="p-3.5 rounded-xl bg-[#1C2541] border border-slate-700 space-y-2">
                <label className="block font-extrabold text-slate-200">
                  Splash Screen Display Time (Seconds)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleDurationChange(-1)}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-black text-base flex items-center justify-center border border-slate-700 cursor-pointer active:scale-95 transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.splashDurationSeconds ?? 3}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setFormData({
                          ...formData,
                          splashDurationSeconds: Math.min(10, Math.max(1, val)),
                        });
                      }
                    }}
                    className="w-20 p-2 text-center rounded-xl border border-slate-700 bg-[#0B132B] text-amber-400 font-black text-sm outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleDurationChange(1)}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-black text-base flex items-center justify-center border border-slate-700 cursor-pointer active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-bold text-slate-400">
                    (Default: 3 Secs | Min: 1s, Max: 10s)
                  </span>
                </div>
              </div>

              {/* Action Row - Preview Button & Save Note */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowSplashPreview(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Preview Full-Screen Splash Screen</span>
                </button>

                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Save settings to apply automatically on app start.
                </span>
              </div>
            </div>

            {/* Right Col: Live Preview Portrait Frame */}
            <div className="bg-[#1C2541] p-4 rounded-2xl border border-slate-700 flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Live Splash Screen Preview
              </span>

              {/* Portrait 9:16 Mockup Frame */}
              <div className="w-36 h-64 bg-[#030712] p-2.5 rounded-2xl border-2 border-amber-400/50 flex flex-col items-center justify-between overflow-hidden shadow-2xl relative group">
                <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto" />
                <div className="w-20 h-20 bg-[#0A1128] rounded-xl border border-amber-400/30 p-2 flex items-center justify-center overflow-hidden my-auto shadow-inner">
                  <img
                    src={formData.splashImageUrl || '/sff-logo.svg'}
                    alt="Splash Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/sff-logo.svg';
                    }}
                  />
                </div>
                <div className="w-full space-y-1">
                  <div className="text-[9px] font-black text-white truncate">SELF FILL FORMS</div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 w-2/3" />
                  </div>
                </div>
              </div>

              <div className="text-xs font-black text-white uppercase tracking-wider mt-1">
                {formData.splashEnabled ?? true ? 'Splash Enabled' : 'Splash Disabled'}
              </div>
              <div className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800/80">
                Duration: {formData.splashDurationSeconds ?? 3} Seconds
              </div>
            </div>
          </div>
        </div>

        {/* General Application & Portal Logo Settings */}
        <div className="p-6 rounded-2xl border bg-[#0B132B] border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-400 font-bold text-sm">
            <ImageIcon className="w-4 h-4" /> Portal Branding & Logo Settings
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Application Name</label>
              <input
                type="text"
                value={formData.appName}
                onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] text-slate-100 font-bold outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Change Portal Logo</label>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileUpload}
                  className="hidden"
                  id="admin-logo-file-input"
                />
                <label
                  htmlFor="admin-logo-file-input"
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                >
                  <Upload className="w-3.5 h-3.5" /> Choose Logo File
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, appLogoUrl: '/sff-logo.svg' })}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Default Logo
                </button>
              </div>

              <input
                type="text"
                value={formData.appLogoUrl}
                onChange={(e) => setFormData({ ...formData, appLogoUrl: e.target.value })}
                placeholder="/sff-logo.svg or https://..."
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] text-slate-100 font-mono text-xs outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Logo asset displayed on login screens, headers, navigation bars, and PDF printouts.
              </p>
            </div>

            {/* Live Logo Preview Box */}
            <div className="p-3 bg-[#1C2541] rounded-xl border border-slate-700 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center p-1 overflow-hidden shrink-0">
                <img
                  src={formData.appLogoUrl || '/sff-logo.svg'}
                  alt="Logo Preview"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/sff-logo.svg';
                  }}
                />
              </div>
              <div className="text-[11px]">
                <p className="font-bold text-slate-200">Live Logo Preview</p>
                <p className="text-[10px] text-slate-400">Current active logo across the portal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Mode & Database Backup */}
        <div className="p-6 rounded-2xl border bg-[#0B132B] border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-rose-400 font-bold text-sm">
            <Power className="w-4 h-4" /> Maintenance & Database Operations
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-200">Maintenance Mode</p>
                <p className="text-[10px] text-slate-400">Restrict citizen portal access during system patches.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, maintenanceMode: !formData.maintenanceMode })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  formData.maintenanceMode
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {formData.maintenanceMode ? 'Maintenance ON' : 'Maintenance OFF'}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-200">Instant Database Snapshot</p>
                <p className="text-[10px] text-slate-400">
                  Last Backup: {formData.lastBackupTimestamp ? new Date(formData.lastBackupTimestamp).toLocaleString() : 'Never'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleTriggerBackup}
                disabled={backupTriggered}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5" />
                {backupTriggered ? 'Backing up...' : 'Backup Now'}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center justify-between">
              <div>
                <p className="font-bold text-rose-300 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Total Database Reset / Wipe
                </p>
                <p className="text-[10px] text-rose-200/80">
                  Wipe all stored users, forms, documents, logs, and database records.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWipeConfirm(true)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-900/40"
              >
                <Trash2 className="w-3.5 h-3.5" /> Wipe Database
              </button>
            </div>
          </div>
        </div>

        {/* SMTP Email Server Configuration */}
        <div className="p-6 rounded-2xl border bg-[#0B132B] border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-blue-400 font-bold text-sm">
            <Mail className="w-4 h-4" /> SMTP Email Server Configurations
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={formData.smtpHost}
                  onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] text-slate-100 font-medium outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Port</label>
                <input
                  type="text"
                  value={formData.smtpPort}
                  onChange={(e) => setFormData({ ...formData, smtpPort: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] text-slate-100 font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">System Notification Email</label>
              <input
                type="email"
                value={formData.smtpEmail}
                onChange={(e) => setFormData({ ...formData, smtpEmail: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] text-slate-100 font-medium outline-none"
              />
            </div>
          </div>
        </div>

        {/* System Logs */}
        <div className="p-6 rounded-2xl border bg-[#0B132B] border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-emerald-400 font-bold text-sm">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Audit Logs & Security Telemetry
            </span>
            <button
              onClick={() => adminStore.clearLogs()}
              className="text-[10px] text-slate-400 hover:text-rose-400 font-bold cursor-pointer"
            >
              Clear Logs
            </button>
          </div>

          <div className="h-44 overflow-y-auto space-y-2 pr-1 font-mono text-[11px]">
            {logs.length === 0 ? (
              <p className="text-slate-500 py-6 text-center">No audit logs recorded yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-2 rounded-lg bg-[#1C2541]/70 border border-slate-800/80 text-slate-300">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                    <span className="text-amber-400 font-bold">[{log.category}]</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-200">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      {/* Wipe Database Modal */}
      {showWipeConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B132B] border border-rose-600/50 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-8 h-8" />
              <div>
                <h3 className="text-lg font-black text-white">Delete Total Database?</h3>
                <p className="text-xs text-rose-200">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete all registered users, submitted forms, uploaded documents, activity logs, and stored system records?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowWipeConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleWipeTotalDatabase}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Yes, Wipe Total Database
              </button>
            </div>
          </div>
        </div>
      )}

      {wipeSuccess && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B132B] border border-emerald-500/50 rounded-2xl p-6 max-w-sm w-full text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-black text-white">Database Wiped Clean</h3>
            <p className="text-xs text-slate-300">All database collections and records have been completely deleted.</p>
          </div>
        </div>
      )}

      {/* Full-Screen Interactive Splash Screen Preview Modal */}
      {showSplashPreview && (
        <SplashScreen
          imageUrl={formData.splashImageUrl || '/sff-logo.svg'}
          durationSeconds={formData.splashDurationSeconds ?? 3}
          isPreview={true}
          onComplete={() => setShowSplashPreview(false)}
        />
      )}
    </div>
  );
};









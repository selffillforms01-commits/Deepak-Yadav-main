import React, { useState, useEffect } from 'react';
import {
  Key,
  ArrowLeft,
  Shield,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  Zap,
  Mail,
  Bot,
  Send,
  Cpu,
} from 'lucide-react';
import { adminStore } from './adminStore';

interface AdminMyKeysProps {
  onBack: () => void;
  darkMode?: boolean;
}

export const AdminMyKeys: React.FC<AdminMyKeysProps> = ({ onBack, darkMode }) => {
  const currentSettings = adminStore.getSettings();

  // Razorpay Gateway State
  const [razorpayEnabled, setRazorpayEnabled] = useState<boolean>(
    currentSettings.razorpayEnabled ?? true
  );
  const [razorpayMode, setRazorpayMode] = useState<'test' | 'live'>(
    currentSettings.razorpayMode || 'test'
  );
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>(
    currentSettings.razorpayKeyId || ''
  );
  const [razorpayKeySecret, setRazorpayKeySecret] = useState<string>(
    currentSettings.razorpayKeySecret || ''
  );
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState<string>(
    currentSettings.razorpayWebhookSecret || ''
  );

  // Gemini AI State
  const [geminiApiKey, setGeminiApiKey] = useState<string>(
    currentSettings.geminiApiKey || ''
  );

  // Resend Email State
  const [resendApiKey, setResendApiKey] = useState<string>(
    currentSettings.resendApiKey || ''
  );
  const [resendFromEmail, setResendFromEmail] = useState<string>(
    currentSettings.resendFromEmail || 'onboarding@resend.dev'
  );

  // Visibility Toggles
  const [showRazorpaySecret, setShowRazorpaySecret] = useState<boolean>(false);
  const [showGeminiSecret, setShowGeminiSecret] = useState<boolean>(false);
  const [showResendSecret, setShowResendSecret] = useState<boolean>(false);

  // Action States
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string>('');

  // Test Connection States
  const [isTestingRazorpay, setIsTestingRazorpay] = useState<boolean>(false);
  const [razorpayTestResult, setRazorpayTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isTestingGemini, setIsTestingGemini] = useState<boolean>(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isTestingResend, setIsTestingResend] = useState<boolean>(false);
  const [resendTestResult, setResendTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Sync state if adminStore changes
  useEffect(() => {
    const handleStoreChange = () => {
      const updated = adminStore.getSettings();
      setRazorpayEnabled(updated.razorpayEnabled ?? true);
      setRazorpayMode(updated.razorpayMode || 'test');
      setRazorpayKeyId(updated.razorpayKeyId || '');
      setRazorpayKeySecret(updated.razorpayKeySecret || '');
      setRazorpayWebhookSecret(updated.razorpayWebhookSecret || '');
      setGeminiApiKey(updated.geminiApiKey || '');
      setResendApiKey(updated.resendApiKey || '');
      setResendFromEmail(updated.resendFromEmail || 'onboarding@resend.dev');
    };
    return adminStore.subscribe(handleStoreChange);
  }, []);

  // Save All System Keys to Admin Store and Server API
  const handleSaveAllKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess('');
    setRazorpayTestResult(null);
    setGeminiTestResult(null);
    setResendTestResult(null);
    setIsSaving(true);

    const cleanRzpKeyId = razorpayKeyId.trim();
    const cleanRzpKeySecret = razorpayKeySecret.trim();
    const cleanRzpWebhook = razorpayWebhookSecret.trim();
    const cleanGeminiKey = geminiApiKey.trim();
    const cleanResendKey = resendApiKey.trim();
    const cleanResendFrom = resendFromEmail.trim();

    // 1. Save locally to adminStore & Firestore
    adminStore.updateSettings({
      razorpayEnabled,
      razorpayMode,
      razorpayKeyId: cleanRzpKeyId,
      razorpayKeySecret: cleanRzpKeySecret,
      razorpayWebhookSecret: cleanRzpWebhook,
      geminiApiKey: cleanGeminiKey,
      resendApiKey: cleanResendKey,
      resendFromEmail: cleanResendFrom,
    });

    adminStore.addLog(
      'System',
      `Updated All System Keys in Admin Settings (Razorpay, Gemini AI, Resend Email)`
    );

    // 2. Sync to Backend Server API
    try {
      const res = await fetch('/api/admin/system-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayEnabled,
          razorpayMode,
          razorpayKeyId: cleanRzpKeyId,
          razorpayKeySecret: cleanRzpKeySecret,
          razorpayWebhookSecret: cleanRzpWebhook,
          geminiApiKey: cleanGeminiKey,
          resendApiKey: cleanResendKey,
          resendFromEmail: cleanResendFrom,
        }),
      });

      if (res.ok) {
        setSaveSuccess('All API Keys (Razorpay, Gemini AI, Resend Email) saved successfully! Server runtime active.');
      } else {
        setSaveSuccess('Saved to Firestore & Admin Store successfully.');
      }
    } catch {
      setSaveSuccess('Saved to Admin Store & Firestore database successfully.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccess(''), 6000);
    }
  };

  // Test Razorpay Connection
  const handleTestRazorpay = async () => {
    setRazorpayTestResult(null);
    if (!razorpayKeyId.trim() || !razorpayKeySecret.trim()) {
      setRazorpayTestResult({
        success: false,
        message: 'Please enter both Razorpay Key ID and Key Secret before testing connection.',
      });
      return;
    }

    setIsTestingRazorpay(true);
    try {
      const res = await fetch('/api/admin/razorpay/test-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayKeyId: razorpayKeyId.trim(),
          razorpayKeySecret: razorpayKeySecret.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRazorpayTestResult({
          success: true,
          message: data.message || 'Razorpay Key ID and Secret verified successfully!',
        });
      } else {
        setRazorpayTestResult({
          success: false,
          message: data.error || 'Razorpay authentication failed. Please verify credentials.',
        });
      }
    } catch {
      setRazorpayTestResult({
        success: false,
        message: 'Unable to connect to test endpoint. Ensure keys are saved.',
      });
    } finally {
      setIsTestingRazorpay(false);
    }
  };

  // Test Gemini AI Connection
  const handleTestGemini = async () => {
    setGeminiTestResult(null);
    if (!geminiApiKey.trim()) {
      setGeminiTestResult({
        success: false,
        message: 'Please enter a Gemini API Key before testing.',
      });
      return;
    }

    setIsTestingGemini(true);
    try {
      const res = await fetch('/api/admin/gemini/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey: geminiApiKey.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGeminiTestResult({
          success: true,
          message: data.message || 'Gemini AI API Key verified! Gemini models are active and responding.',
        });
      } else {
        setGeminiTestResult({
          success: false,
          message: data.error || 'Gemini API authentication failed. Check your API Key.',
        });
      }
    } catch {
      setGeminiTestResult({
        success: false,
        message: 'Unable to verify Gemini API Key with server.',
      });
    } finally {
      setIsTestingGemini(false);
    }
  };

  // Test Resend Email Connection
  const handleTestResend = async () => {
    setResendTestResult(null);
    if (!resendApiKey.trim()) {
      setResendTestResult({
        success: false,
        message: 'Please enter a Resend API Key before testing.',
      });
      return;
    }

    setIsTestingResend(true);
    try {
      const res = await fetch('/api/admin/resend/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resendApiKey: resendApiKey.trim(),
          resendFromEmail: resendFromEmail.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResendTestResult({
          success: true,
          message: data.message || 'Resend Email API Key verified successfully!',
        });
      } else {
        setResendTestResult({
          success: false,
          message: data.error || 'Resend authentication failed. Check your API key in Resend dashboard.',
        });
      }
    } catch {
      setResendTestResult({
        success: false,
        message: 'Unable to verify Resend API key with server.',
      });
    } finally {
      setIsTestingResend(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition-all cursor-pointer border border-slate-700 flex items-center justify-center"
              title="Return to System Settings"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
                <span>My Keys</span>
                <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                  System API Keys & Gateways
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Configure Razorpay Payment Gateway, Gemini AI Engine Key, and Resend Email Service Keys directly from the admin UI without editing code or server files.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Back to Settings</span>
        </button>
      </div>

      {/* Global Success Alert */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-3 animate-fade-in shadow-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Form Wrapper */}
      <form onSubmit={handleSaveAllKeys} className="space-y-6">

        {/* ======================================================== */}
        {/* CARD 1: RAZORPAY PAYMENT GATEWAY CREDENTIALS */}
        {/* ======================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl border bg-[#0B132B] border-amber-500/30 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-100">Razorpay Payment Gateway</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      razorpayEnabled && razorpayKeyId
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {razorpayEnabled && razorpayKeyId ? 'Active & Ready' : 'Key Needed'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Manage Razorpay Key ID & Key Secret for instant citizen payment processing.
                </p>
              </div>
            </div>

            {/* Enable Gateway Toggle */}
            <div className="flex items-center gap-3 bg-[#1C2541]/80 p-3 rounded-2xl border border-slate-800 self-start md:self-auto">
              <label className="text-xs font-bold text-slate-300 cursor-pointer select-none">
                Enable Gateway:
              </label>
              <button
                type="button"
                onClick={() => setRazorpayEnabled(!razorpayEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                  razorpayEnabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
                    razorpayEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Test Feedback Banner */}
          {razorpayTestResult && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 animate-fade-in ${
                razorpayTestResult.success
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}
            >
              {razorpayTestResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span>{razorpayTestResult.message}</span>
            </div>
          )}

          {/* Environment Mode Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Environment Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              <button
                type="button"
                onClick={() => setRazorpayMode('test')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 cursor-pointer transition-all ${
                  razorpayMode === 'test'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl ${razorpayMode === 'test' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  🧪
                </div>
                <div>
                  <div className="text-xs font-black">Test Mode (Sandbox)</div>
                  <div className="text-[10px] text-slate-400">Use rzp_test_... Key ID for test orders</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRazorpayMode('live')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 cursor-pointer transition-all ${
                  razorpayMode === 'live'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl ${razorpayMode === 'live' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  🚀
                </div>
                <div>
                  <div className="text-xs font-black">Live Mode (Production)</div>
                  <div className="text-[10px] text-slate-400">Use rzp_live_... Key ID for real transactions</div>
                </div>
              </button>
            </div>
          </div>

          {/* Key ID & Key Secret Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Razorpay Key ID */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-200">
                  Razorpay Key ID <span className="text-amber-400">*</span>
                </label>
                <a
                  href="https://dashboard.razorpay.com/#/app/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <span>Dashboard</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="text"
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                placeholder={razorpayMode === 'live' ? 'rzp_live_xxxxxxxxxxxxxx' : 'rzp_test_xxxxxxxxxxxxxx'}
                className="w-full p-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Razorpay Key Secret */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-200">
                Razorpay Key Secret <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showRazorpaySecret ? 'text' : 'password'}
                  value={razorpayKeySecret}
                  onChange={(e) => setRazorpayKeySecret(e.target.value)}
                  placeholder="Enter Razorpay Key Secret"
                  className="w-full p-3.5 pr-12 bg-slate-900/90 border border-slate-700 rounded-2xl text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                  title={showRazorpaySecret ? 'Hide Secret' : 'Show Secret'}
                >
                  {showRazorpaySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Webhook Secret */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200">
              Webhook Secret <span className="text-slate-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={razorpayWebhookSecret}
              onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
              placeholder="Optional Razorpay Webhook Secret for signature verification"
              className="w-full p-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={isTestingRazorpay || !razorpayKeyId || !razorpayKeySecret}
              onClick={handleTestRazorpay}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isTestingRazorpay ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Verifying Razorpay...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Test Razorpay Connection</span>
                </>
              )}
            </button>
          </div>
        </div>


        {/* ======================================================== */}
        {/* CARD 2: GEMINI AI API KEY CONFIGURATION */}
        {/* ======================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl border bg-[#0B132B] border-cyan-500/30 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-black text-xl">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-100">Gemini AI API Key</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      geminiApiKey
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {geminiApiKey ? 'Configured' : 'Optional / Recommended'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Power AI Auto-Form Filling, OCR Document Scanning, AI Assistant, and Language Translations.
                </p>
              </div>
            </div>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-bold flex items-center gap-1.5 transition-all self-start md:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Get Key from Google AI Studio</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>

          {/* Test Feedback Banner */}
          {geminiTestResult && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 animate-fade-in ${
                geminiTestResult.success
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}
            >
              {geminiTestResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span>{geminiTestResult.message}</span>
            </div>
          )}

          {/* Gemini API Key Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-200">
              Gemini API Key (AI Studio)
            </label>
            <div className="relative">
              <input
                type={showGeminiSecret ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full p-3.5 pr-12 bg-slate-900/90 border border-slate-700 rounded-2xl text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowGeminiSecret(!showGeminiSecret)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                title={showGeminiSecret ? 'Hide Secret' : 'Show Secret'}
              >
                {showGeminiSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Key is stored securely in Firestore system settings and used on the server side for Gemini Flash models.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={isTestingGemini || !geminiApiKey}
              onClick={handleTestGemini}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isTestingGemini ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Testing Gemini AI Connection...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Test Gemini AI Connection</span>
                </>
              )}
            </button>
          </div>
        </div>


        {/* ======================================================== */}
        {/* CARD 3: RESEND EMAIL API KEY CONFIGURATION */}
        {/* ======================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl border bg-[#0B132B] border-purple-500/30 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center font-black text-xl">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-100">Resend Email API Key</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      resendApiKey
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {resendApiKey ? 'Active' : 'Optional'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Send automated email notifications, form status updates, OTPs, and citizen receipts via Resend.
                </p>
              </div>
            </div>

            <a
              href="https://resend.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-xs font-bold flex items-center gap-1.5 transition-all self-start md:self-auto"
            >
              <Send className="w-3.5 h-3.5 text-purple-400" />
              <span>Get Key from Resend Dashboard</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>

          {/* Test Feedback Banner */}
          {resendTestResult && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 animate-fade-in ${
                resendTestResult.success
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}
            >
              {resendTestResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span>{resendTestResult.message}</span>
            </div>
          )}

          {/* Resend API Key & From Email Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Resend API Key */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-200">
                Resend API Key
              </label>
              <div className="relative">
                <input
                  type={showResendSecret ? 'text' : 'password'}
                  value={resendApiKey}
                  onChange={(e) => setResendApiKey(e.target.value)}
                  placeholder="re_xxxxxxxxxxxxxx"
                  className="w-full p-3.5 pr-12 bg-slate-900/90 border border-slate-700 rounded-2xl text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowResendSecret(!showResendSecret)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                  title={showResendSecret ? 'Hide Secret' : 'Show Secret'}
                >
                  {showResendSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Resend Sender Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-200">
                Sender Email Address
              </label>
              <input
                type="email"
                value={resendFromEmail}
                onChange={(e) => setResendFromEmail(e.target.value)}
                placeholder="onboarding@resend.dev or noreply@yourdomain.com"
                className="w-full p-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={isTestingResend || !resendApiKey}
              onClick={handleTestResend}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isTestingResend ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                  <span>Testing Resend Connection...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-purple-400" />
                  <span>Test Resend Email Connection</span>
                </>
              )}
            </button>
          </div>
        </div>


        {/* ======================================================== */}
        {/* BOTTOM GLOBAL SAVE BUTTON BAR */}
        {/* ======================================================== */}
        <div className="p-6 rounded-3xl bg-[#1C2541]/90 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Apply & Save All System Keys</span>
            </h3>
            <p className="text-xs text-slate-400">
              Saves Razorpay, Gemini AI, and Resend Email keys immediately across Firestore and server runtime.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving All Keys...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All System Keys</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Information Guarantee Card */}
      <div className="p-6 rounded-3xl bg-[#1C2541]/80 border border-slate-800 space-y-3 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <span>Zero Source Code Touch Guarantee</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Whenever you change your Razorpay, Gemini AI, or Resend Email accounts in the future, simply update your keys on this page and click <strong className="text-amber-300">Save All System Keys</strong>. The entire portal will start using your new keys immediately without requiring any code edits or server restarts.
        </p>
      </div>
    </div>
  );
};

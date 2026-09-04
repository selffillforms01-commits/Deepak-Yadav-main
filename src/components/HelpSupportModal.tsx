import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, PhoneCall, Mail, Clock, Send, CheckCircle2, Headphones, Search } from 'lucide-react';
import { SupportTicketForm } from '../types';
import { adminStore } from './admin/adminStore';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'track'>('create');
  const [form, setForm] = useState<SupportTicketForm>({
    name: '',
    email: '',
    issueType: 'login-issue',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [ticketRef, setTicketRef] = useState('');
  const [loading, setLoading] = useState(false);

  // Ticket Lookup State
  const [searchTicketNo, setSearchTicketNo] = useState('');
  const [foundTicket, setFoundTicket] = useState<any>(null);
  const [searchSearched, setSearchSearched] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const generatedRef = `SFF-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketRef(generatedRef);

    // Persist as a formal record in adminStore
    setTimeout(() => {
      adminStore.saveForm({
        id: `ticket-${Date.now()}`,
        formNumber: generatedRef,
        serviceId: 'helpdesk-grievance',
        serviceTitle: `[Support Grievance] ${form.issueType}`,
        applicantId: `citizen-${Date.now()}`,
        applicantName: form.name,
        applicantEmail: form.email,
        applicantMobile: form.email,
        status: 'Pending',
        submissionDate: new Date().toISOString(),
        formData: {
          category: form.issueType,
          email: form.email,
          message: form.message,
        },
      });

      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchSearched(true);
    const forms = adminStore.getForms();
    const match = forms.find(
      (f) =>
        f.formNumber?.toLowerCase() === searchTicketNo.trim().toLowerCase() ||
        f.id?.toLowerCase() === searchTicketNo.trim().toLowerCase()
    );
    setFoundTicket(match || null);
  };

  const handleDone = () => {
    setSubmitted(false);
    setForm({ name: '', email: '', issueType: 'login-issue', message: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-[16px] shadow-2xl border border-slate-100 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-[#0B3B8C] to-[#07265E] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <Headphones className="w-5 h-5 text-[#E5A100]" />
              </div>
              <div>
                <h3 className="text-base font-bold">Helpdesk & Citizen Grievances</h3>
                <p className="text-xs text-blue-100">Self Fill Forms Administrator Assistance</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3">
            <button
              onClick={() => setActiveTab('create')}
              className={`pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'border-[#0B3B8C] text-[#0B3B8C]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Raise New Ticket
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`pb-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'track'
                  ? 'border-[#0B3B8C] text-[#0B3B8C]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Track Ticket Status
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Direct Contact Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-[#0B3B8C] text-white rounded-lg shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Toll-Free Helpline</div>
                  <div className="text-xs font-bold text-[#0B3B8C]">9692878746</div>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-[#E5A100] text-slate-900 rounded-lg shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Admin Support Email</div>
                  <div className="text-xs font-bold text-slate-800">admin@selffillforms.gov.in</div>
                </div>
              </div>
            </div>

            {/* Operating Hours Banner */}
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200">
              <Clock className="w-4 h-4 text-[#0B3B8C] shrink-0" />
              <span>
                <strong>Working Hours:</strong> Monday to Saturday, 9:00 AM – 6:00 PM IST
              </span>
            </div>

            {/* Tab 1: Raise Ticket */}
            {activeTab === 'create' && (
              <>
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#0B3B8C]" />
                      Send Quick Inquiry to Administrator
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Your Full Name</label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#0B3B8C] focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Contact Email / Phone</label>
                        <input
                          type="text"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#0B3B8C] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Issue Category</label>
                      <select
                        value={form.issueType}
                        onChange={(e) => setForm({ ...form, issueType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#0B3B8C] focus:bg-white focus:outline-none"
                      >
                        <option value="login-issue">Cannot Login / Invalid Credentials</option>
                        <option value="form-assistant">Smart Form Assistant Query</option>
                        <option value="account-locked">Account Lockout / Password Reset</option>
                        <option value="payment-issue">Payment or UTR Verification Issue</option>
                        <option value="other">General Portal Query</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Describe Issue</label>
                      <textarea
                        rows={3}
                        required
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#0B3B8C] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2 bg-[#0B3B8C] hover:bg-[#082d6b] text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition-all disabled:opacity-60 cursor-pointer"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Submit Ticket</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-6 space-y-3 bg-green-50/50 rounded-xl border border-green-100 p-4">
                    <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800">Support Ticket Submitted & Persisted</h4>
                    <p className="text-xs text-slate-600">
                      Ticket Reference <strong className="font-mono text-[#0B3B8C]">{ticketRef}</strong> generated. An administrator will review your grievance shortly.
                    </p>
                    <button
                      onClick={handleDone}
                      className="px-6 py-2 bg-[#0B3B8C] text-white text-xs font-bold rounded-lg hover:bg-[#082d6b] cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Tab 2: Track Ticket */}
            {activeTab === 'track' && (
              <div className="space-y-4">
                <form onSubmit={handleTrackSearch} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter Ticket Ref e.g. SFF-123456"
                    value={searchTicketNo}
                    onChange={(e) => setSearchTicketNo(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#0B3B8C] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0B3B8C] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer hover:bg-[#082d6b]"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </button>
                </form>

                {searchSearched && (
                  <div>
                    {foundTicket ? (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="font-mono font-bold text-[#0B3B8C]">{foundTicket.formNumber}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              foundTicket.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : foundTicket.status === 'In Progress'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {foundTicket.status}
                          </span>
                        </div>
                        <div>
                          <strong>Applicant:</strong> {foundTicket.applicantName || foundTicket.userName || 'Citizen'}
                        </div>
                        <div>
                          <strong>Subject:</strong> {foundTicket.serviceTitle}
                        </div>
                        <div>
                          <strong>Submitted On:</strong> {new Date(foundTicket.submissionDate).toLocaleString()}
                        </div>
                        {foundTicket.remarks && (
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 mt-1">
                            <strong>Admin Remark:</strong> {foundTicket.remarks}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-center">
                        No support ticket found for ref number <strong>"{searchTicketNo}"</strong>.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

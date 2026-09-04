import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Printer,
  X,
  FileCheck2,
  Calendar,
  Wrench,
  Check,
  AlertCircle,
  LogIn
} from 'lucide-react';
import { adminStore } from './adminStore';
import { AdminFormRecord, FormStatus, AdminUserRecord } from './AdminTypes';

interface AdminFormsProps {
  darkMode: boolean;
  onImpersonateUser?: (user: any) => void;
}

export const AdminForms: React.FC<AdminFormsProps> = ({ darkMode, onImpersonateUser }) => {
  const [search, setSearch] = useState('');
  // Default to 'PendingWork' so Admin immediately sees pending tasks without confusion
  const [activeTab, setActiveTab] = useState<'PendingWork' | 'Approved' | 'Rejected' | 'All'>('PendingWork');
  const [selectedForm, setSelectedForm] = useState<AdminFormRecord | null>(null);
  const [reviewModalForm, setReviewModalForm] = useState<AdminFormRecord | null>(null);
  const [reviewAction, setReviewAction] = useState<'Approve' | 'Reject'>('Approve');
  const [remarks, setRemarks] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [forms, setForms] = useState<AdminFormRecord[]>(() => adminStore.getForms());

  useEffect(() => {
    const handleUpdate = () => {
      setForms(adminStore.getForms());
    };
    handleUpdate();
    const unsubscribe = adminStore.subscribe(handleUpdate);
    return () => unsubscribe();
  }, []);

  // Format date helper
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return { date: 'N/A', time: '' };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: dateStr, time: '' };
      const date = d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const time = d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return { date, time };
    } catch {
      return { date: dateStr, time: '' };
    }
  };

  // Counts for tabs
  const pendingWorkCount = forms.filter((f) => f.status === 'Pending' || f.status === 'Under Review' || !f.status).length;
  const approvedCount = forms.filter((f) => f.status === 'Approved').length;
  const rejectedCount = forms.filter((f) => f.status === 'Rejected').length;
  const totalCount = forms.length;

  // Filtered forms based on tab & search
  const filteredForms = forms
    .filter((f) => {
      const matchesSearch =
        f.formNumber.toLowerCase().includes(search.toLowerCase()) ||
        f.applicantName.toLowerCase().includes(search.toLowerCase()) ||
        f.serviceTitle.toLowerCase().includes(search.toLowerCase());

      let matchesTab = true;
      if (activeTab === 'PendingWork') {
        matchesTab = f.status === 'Pending' || f.status === 'Under Review' || !f.status;
      } else if (activeTab === 'Approved') {
        matchesTab = f.status === 'Approved';
      } else if (activeTab === 'Rejected') {
        matchesTab = f.status === 'Rejected';
      }

      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      const timeA = new Date(a.submissionDate).getTime() || 0;
      const timeB = new Date(b.submissionDate).getTime() || 0;
      return timeB - timeA;
    });

  const handleProcessReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalForm) return;

    const newStatus: FormStatus = reviewAction === 'Approve' ? 'Approved' : 'Rejected';
    adminStore.updateFormStatus(reviewModalForm.id, newStatus, remarks, 'Super Admin');

    const appNo = reviewModalForm.formNumber;
    setReviewModalForm(null);
    setRemarks('');

    // Notice to Admin
    if (newStatus === 'Approved') {
      setActionNotice(`✅ Application #${appNo} Approved! It has been moved to the Approved Applications section.`);
    } else {
      setActionNotice(`❌ Application #${appNo} Rejected! It has been moved to the Rejected Applications section.`);
    }

    setTimeout(() => {
      setActionNotice(null);
    }, 4500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-cyan-400" />
            <span>Submitted Form Applications</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review citizen application submissions, verify applicant details & application date, approve or reject with remarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold rounded-xl flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Bacha Hua Kaam (Pending): {pendingWorkCount}
          </span>
          <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold rounded-xl">
            Total: {totalCount}
          </span>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Work Queue Navigation Tabs (Bacha Hua Kaam vs Approved vs Rejected) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('PendingWork')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'PendingWork'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>⏱️ Pending Work (Bacha Hua Kaam)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'PendingWork' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {pendingWorkCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('Approved')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'Approved'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>✅ Approved Applications</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'Approved' ? 'bg-slate-950 text-emerald-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {approvedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('Rejected')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'Rejected'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>❌ Rejected Applications</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'Rejected' ? 'bg-slate-950 text-rose-400' : 'bg-rose-500/20 text-rose-400'
          }`}>
            {rejectedCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('All')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'All'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>📂 All Applications</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'All' ? 'bg-slate-950 text-cyan-400' : 'bg-cyan-500/20 text-cyan-400'
          }`}>
            {totalCount}
          </span>
        </button>
      </div>

      {/* Helper Banner for Clarity */}
      <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
        activeTab === 'PendingWork'
          ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
          : activeTab === 'Approved'
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
          : activeTab === 'Rejected'
          ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
      }`}>
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>
          {activeTab === 'PendingWork' && 'Showing pending work waiting for Admin action. Once approved or rejected, applications automatically move out of this list to eliminate confusion!'}
          {activeTab === 'Approved' && 'Showing completed and verified applications approved by Admin.'}
          {activeTab === 'Rejected' && 'Showing applications rejected with remarks.'}
          {activeTab === 'All' && 'Showing complete history of all form submissions.'}
        </span>
      </div>

      {/* Search Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
          darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Application #, Applicant Name or Service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border outline-none font-medium ${
              darkMode
                ? 'bg-[#1C2541] border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-amber-500'
                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-600'
            }`}
          />
        </div>

        <div className="text-xs text-slate-400 font-semibold">
          Displaying <span className="text-slate-100 font-bold">{filteredForms.length}</span> application(s)
        </div>
      </div>

      {/* Applications Table / Empty State */}
      {filteredForms.length === 0 ? (
        <div
          className={`p-12 text-center rounded-2xl border ${
            darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">
            {activeTab === 'PendingWork'
              ? '🎉 Sabhi kaam poore hain! Koi pending application nahi hai.'
              : 'Is section me koi form nahi hai.'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search
              ? 'Current search query match karne wala koi form nahi mila.'
              : activeTab === 'PendingWork'
              ? 'Jab koi user naya application submit karega, wo yaha Pending Work me show hoga.'
              : 'Jab aap kisi form ko approve ya reject karenge, wo is section me dikhega.'}
          </p>
        </div>
      ) : (
        <div
          className={`rounded-2xl border overflow-hidden shadow-sm ${
            darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr
                  className={`border-b uppercase tracking-wider font-bold text-[10px] ${
                    darkMode ? 'bg-[#1C2541] border-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <th className="p-3.5 pl-5">App Number</th>
                  <th className="p-3.5">Service Title</th>
                  <th className="p-3.5">Applicant Details</th>
                  <th className="p-3.5">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Application Date & Time</span>
                    </div>
                  </th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredForms.map((f) => {
                  const dt = formatDateTime(f.submissionDate);
                  return (
                    <tr
                      key={f.id}
                      className={`transition-colors ${
                        darkMode ? 'hover:bg-[#1C2541]/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3.5 pl-5 font-bold font-mono text-amber-400">{f.formNumber}</td>
                      <td className="p-3.5 font-bold text-slate-200">{f.serviceTitle}</td>
                      <td className="p-3.5 font-medium text-slate-300">
                        <div>
                          <p className="font-bold text-slate-100">{f.applicantName}</p>
                          <p className="text-[11px] text-slate-400">{f.applicantEmail || f.applicantMobile}</p>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="inline-flex flex-col text-[11px]">
                          <span className="font-bold text-slate-200 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {dt.date}
                          </span>
                          {dt.time && (
                            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {dt.time}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                            f.status === 'Approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : f.status === 'Rejected'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : f.status === 'Under Review'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {f.status || 'Pending'}
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedForm(f)}
                            title="View Full Application Details"
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              const staffList = adminStore.getMaintenanceStaff();
                              if (staffList.length === 0) {
                                alert('No Maintenance Staff account found! Please create a Maintenance Staff member in Admin Control Panel first.');
                                return;
                              }
                              const primaryStaff = staffList[0];
                              adminStore.bulkAssignMaintenanceTasks(
                                [`TASK-F-${f.id}`],
                                primaryStaff.id,
                                primaryStaff.name,
                                'Sent to Maintenance from Forms Queue'
                              );
                              alert(`Form #${f.formNumber} assigned to ${primaryStaff.name} with remark "Sent to Maintenance"!`);
                            }}
                            title="Assign to Maintenance Staff"
                            className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 cursor-pointer"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Action Buttons for Review */}
                          {f.status !== 'Approved' && (
                            <button
                              onClick={() => {
                                setReviewModalForm(f);
                                setReviewAction('Approve');
                              }}
                              title="Approve Application (Complete Task)"
                              className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Approve</span>
                            </button>
                          )}

                          {f.status !== 'Rejected' && (
                            <button
                              onClick={() => {
                                setReviewModalForm(f);
                                setReviewAction('Reject');
                              }}
                              title="Reject Application"
                              className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {selectedForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div
            className={`w-full max-w-2xl rounded-2xl border p-6 space-y-5 shadow-2xl ${
              darkMode ? 'bg-[#0B132B] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-amber-400 flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5" /> Official Application #{selectedForm.formNumber}
                </h3>
                <p className="text-xs text-slate-400">Service: {selectedForm.serviceTitle}</p>
              </div>
              <button onClick={() => setSelectedForm(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-1">Applicant Name</span>
                  <p className="font-bold text-slate-100 text-sm">{selectedForm.applicantName}</p>
                  <p className="text-slate-400 text-[11px]">{selectedForm.applicantEmail || selectedForm.applicantMobile}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-1">Application Date & Status</span>
                  <span
                    className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full mb-1.5 ${
                      selectedForm.status === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : selectedForm.status === 'Rejected'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {selectedForm.status || 'Pending'}
                  </span>
                  <p className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    Applied on: {formatDateTime(selectedForm.submissionDate).date} {formatDateTime(selectedForm.submissionDate).time}
                  </p>
                </div>
              </div>

              {selectedForm.remarks && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  <span className="font-bold block mb-1">Review Remarks</span>
                  <p>{selectedForm.remarks}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between"><button
  onClick={() => {
    if (!selectedForm || !onImpersonateUser) return;

    const users = adminStore.getUsers();

    const applicant = users.find((u: AdminUserRecord) =>
      u.id === selectedForm.applicantId ||
      u.sffUserId === selectedForm.applicantId ||
      u.email?.toLowerCase() === selectedForm.applicantEmail?.toLowerCase() ||
      u.mobile === selectedForm.applicantMobile
    );

    if (!applicant) {
      alert('Applicant user account not found.');
      return;
    }

    setSelectedForm(null);
    onImpersonateUser(applicant);
  }}
  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
>
  <LogIn className="w-4 h-4" />
  Login as User
</button>


              <button
                onClick={handlePrint}
                className="px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Application
              </button>

              <button
                onClick={() => setSelectedForm(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve / Reject Modal */}
      {reviewModalForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleProcessReview}
            className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
              darkMode ? 'bg-[#0B132B] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">
                {reviewAction === 'Approve' ? 'Approve Application' : 'Reject Application'} #{reviewModalForm.formNumber}
              </h3>
              <button
                type="button"
                onClick={() => setReviewModalForm(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <p className="text-slate-400">
                  Applicant: <strong className="text-slate-100">{reviewModalForm.applicantName}</strong>
                </p>
                <p className="text-slate-400">
                  Service: <strong className="text-slate-100">{reviewModalForm.serviceTitle}</strong>
                </p>
                <p className="text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-800 text-[11px]">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  Applied Date: {formatDateTime(reviewModalForm.submissionDate).date} {formatDateTime(reviewModalForm.submissionDate).time}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Official Remarks / Reason {reviewAction === 'Reject' && <span className="text-rose-400">*</span>}
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    reviewAction === 'Approve'
                      ? 'Verified proof documents and applicant eligibility. Approved.'
                      : 'Provide explicit rejection reason (e.g. illegible signature or invalid Aadhaar proof).'
                  }
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium resize-none"
                  required={reviewAction === 'Reject'}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewModalForm(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 font-bold text-xs rounded-xl cursor-pointer ${
                  reviewAction === 'Approve'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                Confirm {reviewAction} & Move File
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};





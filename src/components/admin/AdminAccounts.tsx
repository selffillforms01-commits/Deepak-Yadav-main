import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  PlusCircle,
  Search,
  Download,
  Filter,
  Trash2,
  CheckCircle2,
  IndianRupee,
  Calendar,
  User,
  CreditCard,
  FileSpreadsheet,
  X,
  Building,
  RefreshCw
} from 'lucide-react';
import { adminStore } from './adminStore';
import { addNotificationToFirestore } from '../../lib/firestoreService';
import { TransactionRecord } from './AdminTypes';

interface AdminAccountsProps {
  darkMode: boolean;
}

export const AdminAccounts: React.FC<AdminAccountsProps> = ({ darkMode }) => {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Credit' | 'Debit'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [paymentStatus, setPaymentStatus] = useState<'All' | 'Pending' | 'Verified' | 'Rejected'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  // Form State for Adding Transaction
  const [newTxn, setNewTxn] = useState<Partial<TransactionRecord>>({
    type: 'Credit',
    amount: 0,
    category: 'Service Fee',
    description: '',
    applicantId: '',
    applicantName: '',
    applicantMobile: '',
    paymentMethod: 'UPI',
    utrNumber: '',
    status: 'Completed',
    remarks: '',
  });

  const loadData = () => {
    setTransactions(adminStore.getTransactions());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = adminStore.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  // Filter transactions
  const filteredTxns = transactions.filter((t) => {
    const matchesType = typeFilter === 'All' || t.type === typeFilter;
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    const matchesPaymentStatus =
      paymentStatus === 'All' ||
      (paymentStatus === 'Pending' && t.status === 'Pending') ||
      (paymentStatus === 'Verified' && t.status === 'Completed') ||
      (paymentStatus === 'Rejected' && t.status === 'Failed');
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.id.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.applicantId && t.applicantId.toLowerCase().includes(q)) ||
      (t.applicantName && t.applicantName.toLowerCase().includes(q)) ||
      (t.utrNumber && t.utrNumber.toLowerCase().includes(q));

    return matchesType && matchesCategory && matchesPaymentStatus && matchesSearch;
  });

  // Financial Calculations
  const totalCredit = transactions
    .filter((t) => t.type === 'Credit' && t.status === 'Completed')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalDebit = transactions
    .filter((t) => t.type === 'Debit' && t.status === 'Completed')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const netBalance = totalCredit - totalDebit;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayIncome = transactions
    .filter(
      (t) =>
        t.type === 'Credit' &&
        t.status === 'Completed' &&
        t.date &&
        t.date.startsWith(todayStr)
    )
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxn.amount || newTxn.amount <= 0) {
      alert('Please enter a valid Amount.');
      return;
    }
    if (!newTxn.description) {
      alert('Please enter a Description.');
      return;
    }

    const record: TransactionRecord = {
      id: `TXN-${Date.now()}`,
      type: newTxn.type || 'Credit',
      amount: Number(newTxn.amount),
      category: newTxn.category || 'Service Fee',
      description: newTxn.description || '',
      applicantId: newTxn.applicantId || 'SFF-SYSTEM',
      applicantName: newTxn.applicantName || 'Direct Payment',
      applicantMobile: newTxn.applicantMobile || '',
      paymentMethod: newTxn.paymentMethod || 'UPI',
      utrNumber: newTxn.utrNumber || `UTR${Math.floor(10000000 + Math.random() * 90000000)}`,
      date: new Date().toISOString(),
      status: 'Completed',
      remarks: newTxn.remarks || '',
    };

    adminStore.saveTransaction(record);
    setShowAddModal(false);
    setNewTxn({
      type: 'Credit',
      amount: 0,
      category: 'Service Fee',
      description: '',
      applicantId: '',
      applicantName: '',
      applicantMobile: '',
      paymentMethod: 'UPI',
      utrNumber: '',
      status: 'Completed',
      remarks: '',
    });
  };

  const handleVerifyPayment = (id: string) => {
    const txn = adminStore.getTransactions().find((t) => t.id === id);
    if (!txn || txn.status !== 'Pending') return;

    const applicant = txn.applicantName || txn.applicantId || 'Applicant';
    const amount = Number(txn.amount || 0).toLocaleString('en-IN');
    const recipient = txn.applicantId;

    if (!confirm('Verify UPI payment of Rs ' + amount + ' from ' + applicant + '?')) {
      return;
    }

    const now = new Date().toISOString();

    // 1. Mark payment as Completed.
    const completedTxn = {
      ...txn,
      status: 'Completed' as const,
      remarks: (txn.remarks || 'UPI payment') + ' Payment verified by SFF.',
    };

    adminStore.saveTransaction(completedTxn);

    // 2. Automatically create/update the user's Form after payment verification.
    //    Existing forms are reused to prevent duplicate applications.
    if (recipient) {
      const existingForm = adminStore
        .getForms()
        .find(
          (f) =>
            f.applicantId === recipient &&
            (
              f.serviceTitle === txn.description ||
              f.formData?.paymentTransactionId === txn.id
            )
        );

        const verifiedFormData = existingForm
        ? {
            ...existingForm.formData,
            paymentTransactionId: txn.id,
            paymentStatus: 'Completed',
            paymentAmount: txn.amount,
            paymentMethod: txn.paymentMethod,
            utrNumber: txn.utrNumber || '',
            paymentVerifiedAt: now,
            applicantId: recipient,
          }
        : {
            paymentTransactionId: txn.id,
            paymentStatus: 'Completed',
            paymentAmount: txn.amount,
            paymentMethod: txn.paymentMethod,
            utrNumber: txn.utrNumber || '',
            paymentVerifiedAt: now,
            applicantId: recipient,
          };

      if (existingForm) {
        adminStore.saveForm({
          ...existingForm,
          status: 'Pending',
          remarks:
            `Payment verified by SFF. Amount: Rs ${txn.amount}. ` +
            `UTR: ${txn.utrNumber || 'N/A'}. Ready for form processing.`,
          formData: verifiedFormData,
        });
      } else {
        const serviceId =
          txn.category === 'Service Fee'
            ? 'SERVICE-PAYMENT'
            : `SERVICE-${String(txn.category || 'GENERAL')
                .toUpperCase()
                .replace(/[^A-Z0-9]+/g, '-')}`;

        adminStore.saveForm({
          id: `FORM-PAY-${txn.id}`,
          formNumber: `SFF-FORM-${Date.now()}`,
          serviceId,
          serviceTitle: txn.description || txn.category || 'Service Application',
          applicantId: recipient,
          applicantName: txn.applicantName || 'Applicant',
          applicantEmail: '',
          applicantMobile: txn.applicantMobile || '',
          submissionDate: txn.date || now,
          status: 'Pending',
          remarks:
            `Payment verified by SFF. Amount: Rs ${txn.amount}. ` +
            `UTR: ${txn.utrNumber || 'N/A'}. Ready for form processing.`,
          formData: verifiedFormData,
        });
      }
    }

    // 3. Personal notification ï¿½ ONLY the payer receives it.
    if (recipient) {
      adminStore.saveNotification({
        id: `NTF-PAYMENT-${Date.now()}`,
        title: 'Payment Verified Successfully',
        message:
          `Your payment of Rs ${amount} for ${txn.description || txn.category || 'Service'} has been verified successfully by SFF.` +
          ` UTR: ${txn.utrNumber || 'N/A'}. Your application has been sent for form processing.`,
        notificationType: 'Application Status',
        targetAudience: 'Selected Users',
        targetMode: 'Single User',
        targetValue: recipient,
        priority: 'High',
        sentDate: now,
        status: 'Sent',
        createdBy: 'Admin',
      });
    }

    // 4. getMaintenanceTasks() will automatically pick the newly-created Form
    //    and place it into Maintenance & Work as Pending Assignment.
    adminStore.getMaintenanceTasks();

    setNoticeMsg(
      'Payment verified. Form sent to Maintenance & Work. UTR:' +
        (txn.utrNumber || 'N/A')
    );

    setTimeout(() => setNoticeMsg(null), 3500);
    loadData();
  };
  const handleRejectPayment = (id: string) => {
    const txn = adminStore.getTransactions().find((t) => t.id === id);
    if (!txn || txn.status !== 'Pending') return;

    const recipient = txn.applicantId;
    const reason = prompt(
      'Enter rejection reason:',
      'Payment could not be verified.'
    );

    if (reason === null) return;

    const finalReason =
      reason.trim() || 'Payment could not be verified.';

    adminStore.saveTransaction({
      ...txn,
      status: 'Failed',
      remarks:
        (txn.remarks || 'UPI payment') +
        ' Rejected by SFF. Reason: ' +
        finalReason,
    });

    if (recipient) {
      adminStore.saveNotification({
        id: `NTF-PAYMENT-${Date.now()}`,
        title: 'Payment Rejected',
        message:
          `Your payment of Rs ${Number(txn.amount || 0).toLocaleString('en-IN')} for ` +
          `${txn.description || txn.category || 'Service'} was rejected by SFF.` +
          ` UTR: ${txn.utrNumber || 'N/A'}. Reason: ${finalReason}`,
        notificationType: 'Application Status',
        targetAudience: 'Selected Users',
        targetMode: 'Single User',
        targetValue: recipient,
        priority: 'High',
        sentDate: new Date().toISOString(),
        status: 'Sent',
        createdBy: 'Admin',
      });
    }

    setNoticeMsg('Payment rejected. UTR: ' + (txn.utrNumber || 'N/A'));
    setTimeout(() => setNoticeMsg(null), 3500);
    loadData();
  };
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction record?')) {
      adminStore.deleteTransaction(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      setNoticeMsg('Transaction record deleted successfully!');
      setTimeout(() => setNoticeMsg(null), 3500);
      loadData();
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredTxns.length && filteredTxns.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTxns.map((t) => t.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected transaction(s)?`)) {
      adminStore.bulkDeleteTransactions(selectedIds);
      const count = selectedIds.length;
      setSelectedIds([]);
      setNoticeMsg(`Deleted ${count} selected transaction record(s) successfully!`);
      setTimeout(() => setNoticeMsg(null), 3500);
      loadData();
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear ALL credit & debit transactions from passbook ledger?')) {
      adminStore.clearAllTransactions();
      setSelectedIds([]);
      setNoticeMsg('All ledger transactions deleted successfully!');
      setTimeout(() => setNoticeMsg(null), 3500);
      loadData();
    }
  };

  const handleDeleteByType = (type: 'Credit' | 'Debit') => {
    if (confirm(`Are you sure you want to delete ALL ${type} entries from the ledger?`)) {
      adminStore.deleteTransactionsByType(type);
      setSelectedIds([]);
      setNoticeMsg(`All ${type} entries deleted successfully!`);
      setTimeout(() => setNoticeMsg(null), 3500);
      loadData();
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('No transaction data available for download.');
      return;
    }
    const headers = ['Txn ID', 'Type', 'Amount (INR)', 'Category', 'Description', 'Applicant ID', 'Applicant Name', 'Payment Method', 'UTR Number', 'Date', 'Status'];
    const rows = filteredTxns.map(t => [
      t.id,
      t.type,
      t.amount,
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.applicantId || '',
      `"${(t.applicantName || '').replace(/"/g, '""')}"`,
      t.paymentMethod,
      t.utrNumber || '',
      new Date(t.date).toLocaleString(),
      t.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SFF_Accounts_Passbook_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${
        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#071D49] rounded-[10px] flex items-center justify-center">
                <Wallet className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span>Accounts & Passbook</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Debit / Credit Ledger
                </span>
              </h1>
              <p className={`text-xs sm:text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Realtime passbook ledger for service charges, form fees, credits and expenses.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700/60 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => {
                setNewTxn({
                  type: 'Debit',
                  amount: 0,
                  category: 'Portal Expense',
                  description: '',
                  applicantId: 'ADMIN-EXPENSE',
                  applicantName: 'Admin Expense Entry',
                  applicantMobile: '',
                  paymentMethod: 'UPI',
                  utrNumber: '',
                  status: 'Completed',
                  remarks: 'Admin Manual Debit Expense Entry',
                });
                setShowAddModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/20 transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Debit / Expense</span>
            </button>
            <button
              onClick={() => {
                setNewTxn({
                  type: 'Credit',
                  amount: 0,
                  category: 'Service Fee',
                  description: '',
                  applicantId: '',
                  applicantName: '',
                  applicantMobile: '',
                  paymentMethod: 'UPI',
                  utrNumber: '',
                  status: 'Completed',
                  remarks: 'Manual Credit Entry',
                });
                setShowAddModal(true);
              }}
              className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer"
            >
              + Manual Credit
            </button>
          </div>
        </div>
      </div>

      {/* Notice Toast */}
      {noticeMsg && (
        <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{noticeMsg}</span>
          </div>
          <button onClick={() => setNoticeMsg(null)} className="text-rose-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Credit */}
        <div className={`p-5 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Credit
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              Rs {totalCredit.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Total amount received from service charges & fees</span>
          </p>
        </div>

        {/* Total Debit */}
        <div className={`p-5 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Debit
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-rose-400">
              Rs {totalDebit.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-rose-400 font-semibold mt-1">
            Portal expenses, challan payments and refunds
          </p>
        </div>

        {/* Net Balance */}
        <div className={`p-5 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Net Balance
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className={`text-2xl sm:text-3xl font-black ${netBalance >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
              Rs {netBalance.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">
            (Total Credit - Total Debit)
          </p>
        </div>

        {/* Today's Credit */}
        <div className={`p-5 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Today's Revenue
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-400">
              Rs {todayIncome.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">
            Total service charge collected today
          </p>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className={`p-4 rounded-2xl border ${
        darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-[340px] lg:w-[420px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by User ID, Name, UTR, Description..."
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border transition-all outline-hidden ${
                darkMode
                  ? 'bg-slate-800/80 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600'
              }`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <div className="flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
              <button
                onClick={() => setTypeFilter('All')}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                  typeFilter === 'All'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTypeFilter('Credit')}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                  typeFilter === 'Credit'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                Credit
              </button>
              <button
                onClick={() => setTypeFilter('Debit')}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
                  typeFilter === 'Debit'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-400 hover:text-rose-300'
                }`}
              >
                Debit
              </button>
            </div>

            {/* Payment Status Filter */}
            <select
              value={paymentStatus}
              onChange={(e) =>
                setPaymentStatus(
                  e.target.value as 'All' | 'Pending' | 'Verified' | 'Rejected'
                )
              }
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}
            >
              <option value="All">All Payments</option>
              <option value="Pending">?? Pending Payment</option>
              <option value="Verified">?? Verified Payment</option>
              <option value="Rejected">?? Rejected Payment</option>
            </select>
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}
            >
              <option value="All">All Categories</option>
              <option value="Service Fee">Service Fee (30)</option>
              <option value="Govt Job Application">Govt Job Application (40)</option>
              <option value="Admission Fee">Admission Fee (30)</option>
              <option value="Refund">Refund</option>
              <option value="Portal Expense">Portal Expense</option>
              <option value="Commission">Commission</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table Ledger */}
      <div className={`rounded-2xl border overflow-hidden ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="p-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black text-slate-200">
              Passbook Ledger Records ({filteredTxns.length})
            </h3>
          </div>

          {/* Quick Delete Actions Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}

            {filteredTxns.some((t) => t.type === 'Credit') && (
              <button
                onClick={() => handleDeleteByType('Credit')}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Delete all Credit entries"
              >
                <Trash2 className="w-3 h-3 text-emerald-400" />
                <span>Delete Credits</span>
              </button>
            )}

            {filteredTxns.some((t) => t.type === 'Debit') && (
              <button
                onClick={() => handleDeleteByType('Debit')}
                className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Delete all Debit entries"
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span>Delete Debits</span>
              </button>
            )}

            {transactions.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Clear all ledger transactions"
              >
                <Trash2 className="w-3 h-3 text-amber-400" />
                <span>Clear Ledger</span>
              </button>
            )}
          </div>
        </div>

        {filteredTxns.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-bold text-slate-400">No Transactions Found</p>
            <p className="text-xs text-slate-500 mt-1">When users deposit form or service fees, they will automatically be recorded here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className={`border-b text-[11px] font-extrabold uppercase tracking-wider ${
                  darkMode ? 'border-slate-800 bg-slate-800/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}>
                  <th className="p-3.5 pl-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredTxns.length && filteredTxns.length > 0}
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer w-4 h-4"
                    />
                  </th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Category & Description</th>
                  <th className="p-3.5">User / Applicant</th>
                  <th className="p-3.5">Payment Method & UTR</th>
                  <th className="p-3.5 text-right">Amount (Rs )</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs font-medium">
                {filteredTxns.map((t) => {
                  const isCredit = t.type === 'Credit';
                  const isSelected = selectedIds.includes(t.id);
                  return (
                    <tr
                      key={t.id}
                      className={`transition-colors ${
                        isSelected
                          ? darkMode ? 'bg-blue-950/40' : 'bg-blue-50/80'
                          : `hover:${darkMode ? 'bg-slate-800/30' : 'bg-slate-50'}`
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="p-3.5 pl-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(t.id)}
                          className="rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer w-4 h-4"
                        />
                      </td>

                      {/* Date & Time */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-200">
                          {new Date(t.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(t.date).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="p-3.5 whitespace-nowrap">
                        {isCredit ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            Credit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            Debit
                          </span>
                        )}
                      </td>

                      {/* Category & Description */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-200">{t.category}</div>
                        <div className="text-[11px] text-slate-400 max-w-xs truncate">
                          {t.description}
                        </div>
                      </td>

                      {/* User / Applicant */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-amber-400 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{t.applicantId || 'N/A'}</span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          {t.applicantName || 'Direct'}
                          {t.applicantMobile ? ` (${t.applicantMobile})` : ''}
                        </div>
                      </td>

                      {/* Payment Method & UTR */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-300 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-blue-400" />
                          <span>{t.paymentMethod}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          UTR: {t.utrNumber || 'N/A'}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className={`text-sm font-black ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isCredit ? '+' : '-'}Rs {t.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {t.status}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {t.status === 'Pending' && isCredit && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleVerifyPayment(t.id)}
                                title="Verify Payment"
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black border border-emerald-500/40 cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                VERIFY
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRejectPayment(t.id)}
                                title="Reject Payment"
                                className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black border border-amber-500/40 cursor-pointer flex items-center gap-1"
                              >
                                <X className="w-3.5 h-3.5" />
                                REJECT
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(t.id)}
                            title="Delete Record"
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black">Add Accounts Transaction</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTxn((prev) => ({ ...prev, type: 'Credit' }))}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      newTxn.type === 'Credit'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Credit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTxn((prev) => ({ ...prev, type: 'Debit' }))}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      newTxn.type === 'Debit'
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Debit</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Amount (Rs )</label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    value={newTxn.amount || ''}
                    onChange={(e) => setNewTxn((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                    placeholder="Enter amount (e.g. 30 or 40)"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-bold outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
                <select
                  value={newTxn.category}
                  onChange={(e) => setNewTxn((prev) => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-bold outline-hidden focus:border-emerald-500"
                >
                  <option value="Service Fee">Service Fee</option>
                  <option value="Govt Job Application">Govt Job Application (Rs 40)</option>
                  <option value="Admission Fee">Admission Fee</option>
                  <option value="Refund">Refund</option>
                  <option value="Portal Expense">Portal Expense</option>
                  <option value="Commission">Commission</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Description</label>
                <input
                  type="text"
                  value={newTxn.description || ''}
                  onChange={(e) => setNewTxn((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder={
                    newTxn.type === 'Debit'
                      ? 'e.g. Paid SSC CGL official application challan fee'
                      : 'e.g. Service fee received from user Deepak'
                  }
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Applicant ID & Name */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">User / Applicant ID</label>
                  <input
                    type="text"
                    value={newTxn.applicantId || ''}
                    onChange={(e) => setNewTxn((prev) => ({ ...prev, applicantId: e.target.value }))}
                    placeholder="e.g. SFF-884920"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Applicant Name</label>
                  <input
                    type="text"
                    value={newTxn.applicantName || ''}
                    onChange={(e) => setNewTxn((prev) => ({ ...prev, applicantName: e.target.value }))}
                    placeholder="e.g. Deepak Yadav"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-hidden"
                  />
                </div>
              </div>

              {/* Payment Method & UTR */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Payment Method</label>
                  <select
                    value={newTxn.paymentMethod}
                    onChange={(e) => setNewTxn((prev) => ({ ...prev, paymentMethod: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-bold outline-hidden"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="NetBanking">NetBanking</option>
                    <option value="Wallet">Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">UTR / Ref No.</label>
                  <input
                    type="text"
                    value={newTxn.utrNumber || ''}
                    onChange={(e) => setNewTxn((prev) => ({ ...prev, utrNumber: e.target.value }))}
                    placeholder="e.g. 402910293021"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};




















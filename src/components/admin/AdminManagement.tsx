import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  UserCheck,
  UserX,
  Trash2,
  Edit3,
  X,
  Lock,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  Wrench
} from 'lucide-react';
import { adminStore } from './adminStore';
import { AdminAccountRecord, AdminRole } from './AdminTypes';

interface AdminManagementProps {
  darkMode: boolean;
}

export const AdminManagement: React.FC<AdminManagementProps> = ({ darkMode }) => {
  const [search, setSearch] = useState('');
  const [modalAdmin, setModalAdmin] = useState<Partial<AdminAccountRecord> | null>(null);
  const [admins, setAdmins] = useState<AdminAccountRecord[]>(() => adminStore.getAdminAccounts());

  useEffect(() => {
    const updateAdmins = () => setAdmins(adminStore.getAdminAccounts());
    updateAdmins();
    return adminStore.subscribe(updateAdmins);
  }, []);

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = (admin: AdminAccountRecord) => {
    const newStatus = admin.status === 'Active' ? 'Inactive' : 'Active';
    adminStore.saveAdminAccount({ ...admin, status: newStatus });
    setAdmins(adminStore.getAdminAccounts());
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this administrative account?')) {
      adminStore.deleteAdminAccount(id);
      setAdmins(adminStore.getAdminAccounts());
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalAdmin?.name || !modalAdmin.email) return;

    const record: AdminAccountRecord = {
      id: modalAdmin.id || `ADM-${Date.now().toString().slice(-4)}`,
      name: modalAdmin.name,
      email: modalAdmin.email,
      role: modalAdmin.role || 'Operator',
      status: modalAdmin.status || 'Active',
      createdDate: modalAdmin.createdDate || new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString(),
    };

    adminStore.saveAdminAccount(record);
    setModalAdmin(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <span>Admin Management & Privileged Accounts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage administrative personnel, assign RBAC permissions (Super Admin, Admin, Operator, Maintenance).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() =>
              setModalAdmin({
                name: '',
                email: '',
                role: 'Operator',
                status: 'Active',
              })
            }
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Admin Account</span>
          </button>

          <button
            onClick={() =>
              setModalAdmin({
                name: '',
                email: '',
                role: 'Maintenance',
                status: 'Active',
              })
            }
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-cyan-300" />
            <span>Create Maintenance User</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div
        className={`p-4 rounded-2xl border flex items-center gap-3 ${
          darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search admin name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full text-xs outline-none bg-transparent font-medium ${
            darkMode ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-800 placeholder:text-slate-400'
          }`}
        />
      </div>

      {/* Admin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAdmins.map((admin) => (
          <div
            key={admin.id}
            className={`p-5 rounded-2xl border space-y-4 shadow-sm transition-all hover:border-amber-500/40 ${
              darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/30">
                {admin.name.charAt(0)}
              </div>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                  admin.status === 'Active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {admin.status}
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-slate-100">{admin.name}</h3>
              <p className="text-xs text-slate-400">{admin.email}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">Role:</span>
                <span className="font-black text-amber-400">{admin.role}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Created:</span>
                <span className="text-slate-400">{admin.createdDate}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
              <button
                onClick={() => handleToggleStatus(admin)}
                className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  admin.status === 'Active'
                    ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                }`}
              >
                {admin.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setModalAdmin(admin)}
                  className="p-1.5 text-amber-400 hover:bg-amber-500/10 rounded-lg cursor-pointer"
                  title="Edit Account"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(admin.id)}
                  className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                  title="Delete Account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
              darkMode ? 'bg-[#0B132B] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                {modalAdmin.role === 'Maintenance' ? (
                  <Wrench className="w-4 h-4 text-cyan-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                )}
                {modalAdmin.id
                  ? modalAdmin.role === 'Maintenance'
                    ? 'Edit Maintenance User Account'
                    : 'Edit Admin Account'
                  : modalAdmin.role === 'Maintenance'
                  ? 'Create Maintenance User'
                  : 'Create New Admin Account'}
              </h3>
              <button
                type="button"
                onClick={() => setModalAdmin(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Official Admin Full Name"
                  value={modalAdmin.name || ''}
                  onChange={(e) => setModalAdmin({ ...modalAdmin, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="admin@sff.gov.in"
                  value={modalAdmin.email || ''}
                  onChange={(e) => setModalAdmin({ ...modalAdmin, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Role / Privilege Level</label>
                <select
                  value={modalAdmin.role || 'Operator'}
                  onChange={(e) => setModalAdmin({ ...modalAdmin, role: e.target.value as AdminRole })}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium cursor-pointer"
                >
                  <option value="Super Admin">Super Admin (Full Root System Access)</option>
                  <option value="Admin">Admin (Services, Users & Approvals)</option>
                  <option value="Operator">Operator (Verification & View Only)</option>
                  <option value="Maintenance">Maintenance (Telemetry & Database Audits)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalAdmin(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs cursor-pointer"
              >
                Save Admin Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};



import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Trash2,
  KeyRound,
  Eye,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
  LogIn,
  UserPlus,
  Plus,
  Upload,
  FileText,
  Download,
  Save,
  FileCheck,
  Send,
  MessageSquare,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Camera,
  Fingerprint,
  FileImage,
  RefreshCw
} from 'lucide-react';
import { adminStore } from './adminStore';
import { AdminUserRecord, UserStatus, DocumentCategory } from './AdminTypes';
import { ALL_INDIAN_STATES, getDistrictsForState } from '../../data/indiaStatesDistricts';
import { compressImageFile } from '../../utils/imageCompressor';
import {
  getUserProfileFromFirestore,
  getUserDocumentsFromFirestore,
  saveUserDocumentsToFirestore,
  saveUserProfileToFirestore
} from '../../lib/firestoreService';

interface AdminUsersProps {
  darkMode: boolean;
  onImpersonateUser?: (user: AdminUserRecord) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ darkMode, onImpersonateUser }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [editUser, setEditUser] = useState<AdminUserRecord | null>(null);
  const [resetModalUser, setResetModalUser] = useState<AdminUserRecord | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Tab & Upload States for Selected User Modal
  const [profileModalTab, setProfileModalTab] = useState<'view' | 'edit' | 'documents'>('view');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('Certificates');
  const [docFileName, setDocFileName] = useState('');
  const [docFileDataUrl, setDocFileDataUrl] = useState('');
  const [docFileSize, setDocFileSize] = useState('');
  const [docUploadSuccess, setDocUploadSuccess] = useState(false);

  // Firestore Sync & Full Media Preview Modal State
  const [userFirestoreDocs, setUserFirestoreDocs] = useState<any[]>([]);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [previewMediaModal, setPreviewMediaModal] = useState<{ title: string; url: string } | null>(null);
  const [previewZoom, setPreviewZoom] = useState(100);

  // Fetch complete profile and documents from Firestore when a user is selected
  useEffect(() => {
    if (!selectedUser) {
      setUserFirestoreDocs([]);
      return;
    }

    let isMounted = true;
    setLoadingUserData(true);

    const fetchUserData = async () => {
      const candidateKeys = [
        selectedUser.email,
        selectedUser.mobile,
        selectedUser.sffUserId,
        selectedUser.id,
      ].filter(Boolean) as string[];

      // 1. Fetch full profile from Firestore
      for (const key of candidateKeys) {
        try {
          const profile = await getUserProfileFromFirestore(key);
          if (profile && isMounted) {
            setSelectedUser((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                photoUrl: profile.photoUrl || prev.photoUrl,
                signatureUrl: profile.signatureUrl || prev.signatureUrl,
                thumbImpressionUrl: profile.thumbImpressionUrl || prev.thumbImpressionUrl,
                aadhaarNumber: profile.aadhaarNumber || prev.aadhaarNumber,
                panNumber: profile.panNumber || prev.panNumber,
                district: profile.district || prev.district,
                state: profile.state || prev.state,
                qualification: profile.qualification || prev.qualification,
                gender: profile.gender || prev.gender,
                dob: profile.dob || prev.dob,
                fatherName: profile.fatherName || prev.fatherName,
                motherName: profile.motherName || prev.motherName,
                fullAddress: profile.address || prev.fullAddress,
                pincode: profile.pincode || prev.pincode,
              };
            });
            break;
          }
        } catch (e) {
          console.warn('Firestore profile fetch notice in admin:', e);
        }
      }

      // 2. Fetch full documents list from Firestore user_documents collection
      let fetchedDocs: any[] = [];
      for (const key of candidateKeys) {
        try {
          const docs = await getUserDocumentsFromFirestore(key);
          if (docs && docs.length > 0) {
            fetchedDocs = docs;
            break;
          }
        } catch (e) {
          console.warn('Firestore documents fetch notice in admin:', e);
        }
      }

      if (isMounted) {
        setUserFirestoreDocs(fetchedDocs);
        setLoadingUserData(false);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [selectedUser?.id, selectedUser?.email, selectedUser?.mobile]);

  // Send Personal Message State
  const [sendMessageUser, setSendMessageUser] = useState<AdminUserRecord | null>(null);
  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [msgPriority, setMsgPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [msgSuccess, setMsgSuccess] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [users, setUsers] = useState<AdminUserRecord[]>([]);

useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
      console.log('Firestore users found:', snapshot.size);

      const userMap = new Map<string, AdminUserRecord>();

snapshot.docs.forEach((d) => {
  const data = d.data();

  const email = String(data.email || '').trim().toLowerCase();
  const mobile = String(data.mobileNumber || data.mobile || '').trim();
  const sffUserId = String(data.sffUserId || data.userId || '').trim();

  const uid = String(data.uid || data.firebaseUid || data.userId || '').trim();

const uniqueKey = uid || email || mobile || sffUserId || d.id;

  if (!userMap.has(uniqueKey)) {
    userMap.set(uniqueKey, {
      id: d.id,
      sffUserId,
      name: data.fullName || data.name || '',
      email: data.email || '',
      mobile: data.mobileNumber || data.mobile || '',
      status: data.accountStatus || 'Active',
      registrationDate:
        data.createdAt?.toDate?.()?.toISOString() || '',
      lastLogin:
        data.updatedAt?.toDate?.()?.toISOString() || '',
      aadhaarNumber: data.aadhaarNumber || '',
      panNumber: data.panNumber || '',
      district: data.district || '',
      state: data.state || '',
      stream: data.stream || '',
    });
  }
});

const list = Array.from(userMap.values());

console.log('Firestore users found:', snapshot.size);
console.log('Unique admin users:', list.length);
console.log('Admin users loaded:', list);

setUsers(list);
    },
    (error) => {
      console.error('Admin Users Firestore Error:', error);
      setUsers([]);
    }
  );

  return () => unsubscribe();
}, []);

  // Filter & Search
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile.includes(search);
    const matchesFilter = statusFilter === 'All' || u.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleToggleBlock = (user: AdminUserRecord) => {
    const newStatus: UserStatus = user.status === 'Blocked' ? 'Active' : 'Blocked';
    adminStore.updateUserStatus(user.id, newStatus)
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      adminStore.deleteUser(userId);
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
      if (editUser?.id === userId) {
        setEditUser(null);
      }
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editUser) {
      adminStore.saveUser(editUser);
      setEditUser(null);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetModalUser && newPassword) {
      adminStore.addLog('Security', `Reset password for user ${resetModalUser.email}`);
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        setResetModalUser(null);
        setNewPassword('');
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span>Citizen User Records</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, verify, block/unblock, and manage account credentials for portal users.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setEditUser({
                id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
                name: '',
                email: '',
                mobile: '',
                status: 'Active',
                registrationDate: new Date().toISOString().split('T')[0],
                lastLogin: 'Just now',
                district: 'Khordha',
                state: 'Odisha'
              })
            }
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add New User</span>
          </button>

          <span className="px-3 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold rounded-xl hidden sm:inline-block">
            Total Users: {users.length}
          </span>
        </div>
      </div>

      {/* Controls Bar: Search & Filter */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
          darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border outline-none font-medium ${
              darkMode
                ? 'bg-[#1C2541] border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-amber-500'
                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-600'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className={`px-3 py-2 text-xs rounded-xl border outline-none font-bold cursor-pointer ${
              darkMode
                ? 'bg-[#1C2541] border-slate-700 text-slate-200'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
            <option value="Pending Verification">Pending Verification</option>
          </select>
        </div>
      </div>

      {/* Main Table or Empty State */}
      {filteredUsers.length === 0 ? (
        <div
          className={`p-12 text-center rounded-2xl border ${
            darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No Users Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== 'All'
              ? 'No users match your current search or filter criteria.'
              : 'There are no registered users in the application database yet.'}
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
                  <th className="p-3.5 pl-5">User</th>
                  <th className="p-3.5">Mobile</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Registered</th>
                  <th className="p-3.5">Last Login</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {paginatedUsers.map((u) => (
                  <tr
                    key={u.id}
                    className={`transition-colors ${
                      darkMode ? 'hover:bg-[#1C2541]/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-3.5 pl-5 cursor-pointer group" onClick={() => setSelectedUser(u)}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center border border-blue-400/30 shrink-0 group-hover:scale-105 transition-transform">
                          {u.photoUrl ? (
                            <img src={u.photoUrl} alt={u.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            u.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-100 group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                            <span>{u.name}</span>
                          </p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-300">{u.mobile || 'N/A'}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                          u.status === 'Active'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : u.status === 'Blocked'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">{u.registrationDate}</td>
                    <td className="p-3.5 text-slate-400 text-[11px]">{u.lastLogin || 'Recent'}</td>
                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                          }}
                          title="View Profile & Edit / Login"
                          className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 font-black text-[10px] cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Login & Profile</span>
                        </button>

                        <button
                          onClick={() => {
                            setSendMessageUser(u);
                            setMsgTitle('');
                            setMsgBody('');
                          }}
                          title="Send Personal Message / Notification"
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleBlock(u)}
                          title={u.status === 'Blocked' ? 'Unblock User' : 'Block User'}
                          className={`p-1.5 rounded-lg cursor-pointer ${
                            u.status === 'Blocked'
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
                          }`}
                        >
                          {u.status === 'Blocked' ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => setResetModalUser(u)}
                          title="Reset Password"
                          className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(u.id)}
                          title="Delete User"
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing Page {currentPage} of {totalPages} ({filteredUsers.length} total users)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View/Edit User & Documents Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div
            className={`w-full max-w-2xl max-h-[90vh] rounded-2xl border p-6 flex flex-col space-y-4 shadow-2xl overflow-hidden ${
              darkMode ? 'bg-[#0B132B] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-700/40 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm">Citizen Profile & Document Manager</h3>
              </div>
              <button onClick={() => { setSelectedUser(null); setProfileModalTab('view'); }} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 shrink-0">
              <button
                onClick={() => setProfileModalTab('view')}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  profileModalTab === 'view'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Profile Details</span>
              </button>

              <button
                onClick={() => setProfileModalTab('edit')}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  profileModalTab === 'edit'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setProfileModalTab('documents')}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  profileModalTab === 'documents'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload & Manage Documents</span>
              </button>
            </div>

            {/* User Info Header Banner */}
            <div className="flex items-center justify-between p-3 bg-[#1C2541]/60 rounded-xl border border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-bold text-base flex items-center justify-center shrink-0">
                  {selectedUser.photoUrl ? (
                    <img src={selectedUser.photoUrl} alt={selectedUser.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    selectedUser.name.charAt(0)
                  )}
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-100">{selectedUser.name}</h4>
                  <p className="text-slate-400 text-xs">{selectedUser.email} | Mobile: {selectedUser.mobile || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                  {selectedUser.status}
                </span>
                <span className="px-2.5 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
                  ID: {selectedUser.id}
                </span>
              </div>
            </div>

            {/* TAB 1: VIEW PROFILE */}
            {profileModalTab === 'view' && (
              <div className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
                {/* 1. Basic Information Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-blue-400" /> Mobile Number
                    </span>
                    <p className="font-bold text-slate-200">{selectedUser.mobile || 'Not provided'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" /> Reg Date / DOB
                    </span>
                    <p className="font-bold text-slate-200">
                      {selectedUser.dob ? `DOB: ${selectedUser.dob}` : selectedUser.registrationDate}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">Father's Name</span>
                    <p className="font-bold text-slate-200">{selectedUser.fatherName || 'N/A'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">Mother's Name</span>
                    <p className="font-bold text-slate-200">{selectedUser.motherName || 'N/A'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-400" /> District & State
                    </span>
                    <p className="font-bold text-slate-200">
                      {selectedUser.district ? `${selectedUser.district}, ${selectedUser.state || 'Odisha'}` : 'Odisha, India'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" /> Aadhaar / PAN
                    </span>
                    <p className="font-bold text-slate-200">
                      {selectedUser.aadhaarNumber ? `Aadhaar: ${selectedUser.aadhaarNumber}` : 'Aadhaar Verified'}
                      {selectedUser.panNumber ? ` | PAN: ${selectedUser.panNumber}` : ''}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">Gender</span>
                    <p className="font-bold text-slate-200">{selectedUser.gender || 'Male'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">Academic Stream</span>
                    <p className="font-bold text-amber-300">{selectedUser.stream || 'Arts / Science'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">Qualification</span>
                    <p className="font-bold text-cyan-300">{selectedUser.qualification || 'Graduation'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">Category / Caste</span>
                    <p className="font-bold text-purple-300">{selectedUser.casteCategory || 'General / OBC'}</p>
                  </div>

                  <div className="col-span-2 sm:col-span-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">Full Address</span>
                    <p className="font-bold text-slate-200">{selectedUser.fullAddress || 'At/PO - Khordha, Odisha'} {selectedUser.pincode ? `- ${selectedUser.pincode}` : ''}</p>
                  </div>
                </div>

                {/* 2. Photo, Signature & Thumb Impression Section */}
                <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="font-black text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Citizen Verification Media (Photo, Signature & Thumb)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Passport Photo Card */}
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col items-center justify-between text-center space-y-2">
                      <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-blue-400" /> Passport Photo
                      </span>
                      <div className="w-24 h-28 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center overflow-hidden shadow-inner relative group">
                        {selectedUser.photoUrl ? (
                          <>
                            <img src={selectedUser.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <button
                                type="button"
                                onClick={() => setPreviewMediaModal({ title: `${selectedUser.name} - Passport Photo`, url: selectedUser.photoUrl! })}
                                className="p-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow cursor-pointer"
                              >
                                <ZoomIn className="w-3 h-3" /> Zoom
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-2 text-slate-500 text-[10px]">
                            <Camera className="w-6 h-6 mx-auto mb-1 opacity-40" />
                            <span>No Photo</span>
                          </div>
                        )}
                      </div>
                      {selectedUser.photoUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewMediaModal({ title: `${selectedUser.name} - Passport Photo`, url: selectedUser.photoUrl! })}
                          className="px-2.5 py-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View Photo
                        </button>
                      )}
                    </div>

                    {/* Signature Card */}
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col items-center justify-between text-center space-y-2">
                      <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                        <FileImage className="w-3.5 h-3.5 text-emerald-400" /> Applicant Signature
                      </span>
                      <div className="w-full h-28 rounded-lg border border-slate-700 bg-white/95 flex items-center justify-center overflow-hidden p-1 shadow-inner relative group">
                        {selectedUser.signatureUrl ? (
                          <>
                            <img src={selectedUser.signatureUrl} alt="Signature" className="max-w-full max-h-full object-contain" />
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <button
                                type="button"
                                onClick={() => setPreviewMediaModal({ title: `${selectedUser.name} - Digital Signature`, url: selectedUser.signatureUrl! })}
                                className="p-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow cursor-pointer"
                              >
                                <ZoomIn className="w-3 h-3" /> Zoom
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-2 text-slate-400 text-[10px]">
                            <FileImage className="w-6 h-6 mx-auto mb-1 opacity-40 text-slate-500" />
                            <span>No Signature</span>
                          </div>
                        )}
                      </div>
                      {selectedUser.signatureUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewMediaModal({ title: `${selectedUser.name} - Digital Signature`, url: selectedUser.signatureUrl! })}
                          className="px-2.5 py-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View Signature
                        </button>
                      )}
                    </div>

                    {/* Thumb Impression Card */}
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col items-center justify-between text-center space-y-2">
                      <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                        <Fingerprint className="w-3.5 h-3.5 text-purple-400" /> Thumb Impression
                      </span>
                      <div className="w-24 h-28 rounded-lg border border-slate-700 bg-white/95 flex items-center justify-center overflow-hidden p-1 shadow-inner relative group">
                        {selectedUser.thumbImpressionUrl ? (
                          <>
                            <img src={selectedUser.thumbImpressionUrl} alt="Thumb" className="max-w-full max-h-full object-contain" />
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <button
                                type="button"
                                onClick={() => setPreviewMediaModal({ title: `${selectedUser.name} - Thumb Impression`, url: selectedUser.thumbImpressionUrl! })}
                                className="p-1.5 bg-purple-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow cursor-pointer"
                              >
                                <ZoomIn className="w-3 h-3" /> Zoom
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-2 text-slate-400 text-[10px]">
                            <Fingerprint className="w-6 h-6 mx-auto mb-1 opacity-40 text-slate-500" />
                            <span>No Thumb Record</span>
                          </div>
                        )}
                      </div>
                      {selectedUser.thumbImpressionUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewMediaModal({ title: `${selectedUser.name} - Thumb Impression`, url: selectedUser.thumbImpressionUrl! })}
                          className="px-2.5 py-1 text-[10px] font-bold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View Thumb
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Uploaded Documents & Digital Locker Vault */}
                <div className="p-4 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span>Citizen Digital Locker & Attached Documents</span>
                    </h4>
                    {loadingUserData && (
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" /> Syncing Firestore...
                      </span>
                    )}
                  </div>

                  {(() => {
                    const storeDocs = adminStore.getDocuments().filter(
                      d => d.userId === selectedUser.id || d.userEmail === selectedUser.email
                    );

                    // Combine storeDocs and userFirestoreDocs without duplicates
                    const allDocMap = new Map<string, any>();
                    storeDocs.forEach(d => allDocMap.set(d.id || d.fileName, {
                      id: d.id,
                      name: d.fileName,
                      category: d.category,
                      url: d.fileUrl,
                      status: d.status,
                      size: d.fileSize,
                      date: d.uploadDate
                    }));

                    userFirestoreDocs.forEach(d => {
                      const key = d.id || d.name || d.customFileUrl;
                      if (!allDocMap.has(key)) {
                        allDocMap.set(key, {
                          id: d.id || key,
                          name: d.name || d.title || 'Document',
                          category: d.category || 'Certificates',
                          url: d.customFileUrl || d.fileUrl || d.url,
                          status: d.status || 'Verified',
                          size: d.size || d.fileSize || '300 KB',
                          date: d.issueDate || d.uploadDate || 'Digital Vault'
                        });
                      }
                    });

                    const combinedDocs = Array.from(allDocMap.values());

                    if (combinedDocs.length === 0) {
                      return (
                        <div className="p-4 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                          <FileText className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                          <p className="text-slate-400 font-bold text-[11px]">No documents uploaded in Digital Locker for this user.</p>
                          <p className="text-slate-500 text-[10px] mt-0.5">Switch to "Upload & Manage Documents" tab above to attach Aadhaar, PAN, or Educational Marksheets.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {combinedDocs.map((docItem, idx) => (
                          <div key={docItem.id || idx} className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 flex items-center justify-between gap-2 hover:border-slate-700 transition-all">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold shrink-0 border border-emerald-500/20">
                                {docItem.url && (docItem.url.startsWith('data:image') || docItem.url.includes('photo') || docItem.url.includes('jpg') || docItem.url.includes('png')) ? (
                                  <img src={docItem.url} alt="Thumbnail" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                  <FileText className="w-4 h-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-extrabold text-slate-100 text-xs truncate max-w-[140px] sm:max-w-[160px]">{docItem.name}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    {docItem.category}
                                  </span>
                                  <span className="text-[10px] text-slate-500">{docItem.size}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {docItem.url && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewMediaModal({ title: `${selectedUser.name} - ${docItem.name}`, url: docItem.url })}
                                  className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-[10px] font-bold cursor-pointer"
                                  title="View Document"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {docItem.url && (
                                <a
                                  href={docItem.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-[10px] font-bold cursor-pointer"
                                  title="Download Document"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* TAB 2: EDIT PROFILE FORM */}
            {profileModalTab === 'edit' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  adminStore.saveUser(selectedUser);
                  setProfileModalTab('view');
                }}
                className="space-y-3 text-xs overflow-y-auto pr-1 flex-1"
              >
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Mobile Number</label>
                    <input
                      type="text"
                      value={selectedUser.mobile}
                      onChange={(e) => setSelectedUser({ ...selectedUser, mobile: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Father's Name</label>
                    <input
                      type="text"
                      value={selectedUser.fatherName || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, fatherName: e.target.value })}
                      placeholder="Father's Name"
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Mother's Name</label>
                    <input
                      type="text"
                      value={selectedUser.motherName || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, motherName: e.target.value })}
                      placeholder="Mother's Name"
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Gender</label>
                    <select
                      value={selectedUser.gender || 'Male'}
                      onChange={(e) => setSelectedUser({ ...selectedUser, gender: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={selectedUser.dob || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, dob: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">State</label>
                    <select
                      value={selectedUser.state || ''}
                      onChange={(e) => {
                        const st = e.target.value;
                        const dists = getDistrictsForState(st);
                        const currentDist = selectedUser.district || '';
                        const newDist = dists.includes(currentDist) ? currentDist : '';
                        setSelectedUser({ ...selectedUser, state: st, district: newDist });
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium cursor-pointer"
                    >
                      <option value="">-- Select State --</option>
                      {ALL_INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">District</label>
                    <select
                      value={selectedUser.district || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, district: e.target.value })}
                      disabled={!selectedUser.state}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium cursor-pointer disabled:opacity-50"
                    >
                      <option value="">
                        {selectedUser.state ? '-- Select District --' : '-- Select State First --'}
                      </option>
                      {getDistrictsForState(selectedUser.state || '').map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={selectedUser.pincode || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, pincode: e.target.value })}
                      placeholder="e.g. 751001"
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Full Address</label>
                  <textarea
                    rows={2}
                    value={selectedUser.fullAddress || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, fullAddress: e.target.value })}
                    placeholder="Village/Town, Post Office, Police Station..."
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Stream</label>
                    <input
                      type="text"
                      value={selectedUser.stream || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, stream: e.target.value })}
                      placeholder="e.g. Arts, Science"
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Qualification</label>
                    <input
                      type="text"
                      value={selectedUser.qualification || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, qualification: e.target.value })}
                      placeholder="e.g. Graduation"
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Caste Category</label>
                    <input
                      type="text"
                      value={selectedUser.casteCategory || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, casteCategory: e.target.value })}
                      placeholder="e.g. OBC, General"
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Aadhaar Number</label>
                    <input
                      type="text"
                      value={selectedUser.aadhaarNumber || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, aadhaarNumber: e.target.value })}
                      placeholder="12 digit Aadhaar"
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">PAN Number</label>
                    <input
                      type="text"
                      value={selectedUser.panNumber || ''}
                      onChange={(e) => setSelectedUser({ ...selectedUser, panNumber: e.target.value })}
                      placeholder="10 digit PAN"
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Account Status</label>
                  <select
                    value={selectedUser.status}
                    onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value as UserStatus })}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Pending Verification">Pending Verification</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: USER DOCUMENTS & UPLOAD */}
            {profileModalTab === 'documents' && (
              <div className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
                {/* Document Upload Card */}
                <div className="p-4 bg-[#1C2541]/80 rounded-2xl border border-slate-700/60 space-y-3">
                  <h4 className="font-extrabold text-sm text-slate-100 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Upload New Document for {selectedUser.name}</span>
                  </h4>

                  {docUploadSuccess && (
                    <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Document uploaded successfully for this user!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Document Category</label>
                      <select
                        value={docCategory}
                        onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
                        className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#0B132B] outline-none text-slate-100 font-medium cursor-pointer"
                      >
                        <option value="Aadhaar">Aadhaar Card</option>
                        <option value="PAN">PAN Card</option>
                        <option value="Passport Photo">Passport Photo</option>
                        <option value="Signature">Signature</option>
                        <option value="Thumb Impression">Thumb Impression</option>
                        <option value="Certificates">Certificates & Educational Marksheets</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Select File</label>
                      <input
                        type="file"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setDocFileName(file.name);
                            const { dataUrl, sizeKb } = await compressImageFile(file, 800, 0.75);
                            const formattedSize = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${sizeKb} KB`;
                            setDocFileSize(formattedSize);
                            setDocFileDataUrl(dataUrl);
                            e.target.value = '';
                          }
                        }}
                        className="w-full p-2 rounded-xl border border-slate-700 bg-[#0B132B] text-slate-300 text-xs font-medium file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                      />
                    </div>
                  </div>

                  {docFileName && (
                    <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 truncate max-w-xs">Selected: {docFileName} ({docFileSize})</span>
                      <button
                        type="button"
                        onClick={async () => {
                          const newDocId = `DOC-${Date.now()}`;
                          const uploadedFileUrl = docFileDataUrl || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80';
                          const today = new Date().toISOString().split('T')[0];

                          const newDocRecord = {
                            id: newDocId,
                            userId: selectedUser.id,
                            userName: selectedUser.name,
                            userEmail: selectedUser.email,
                            category: docCategory,
                            fileName: docFileName,
                            fileUrl: uploadedFileUrl,
                            fileSize: docFileSize || '250 KB',
                            uploadDate: today,
                            status: 'Verified' as const,
                          };

                          // 1. Add to Admin Local Store
                          adminStore.addDocument(newDocRecord);

                          // 2. Check if uploading Photo, Signature, or Thumb
                          let updatedUser = { ...selectedUser };
                          let profileUpdated = false;

                          if (docCategory === 'Passport Photo') {
                            updatedUser.photoUrl = uploadedFileUrl;
                            profileUpdated = true;
                          } else if (docCategory === 'Signature') {
                            updatedUser.signatureUrl = uploadedFileUrl;
                            profileUpdated = true;
                          } else if (docCategory === 'Thumb Impression') {
                            updatedUser.thumbImpressionUrl = uploadedFileUrl;
                            profileUpdated = true;
                          }

                          if (profileUpdated) {
                            adminStore.saveUser(updatedUser);
                            setSelectedUser(updatedUser);

                            // Save to Firestore User Profile
                            const userKey = selectedUser.email || selectedUser.mobile || selectedUser.id;
                            if (userKey) {
                              try {
                                await saveUserProfileToFirestore(userKey, {
                                  fullName: updatedUser.name,
                                  photoUrl: updatedUser.photoUrl,
                                  signatureUrl: updatedUser.signatureUrl,
                                  thumbImpressionUrl: updatedUser.thumbImpressionUrl,
                                });
                              } catch (e) {
                                console.warn('Firestore profile save notice:', e);
                              }
                            }
                          }

                          // 3. Save to Firestore user_documents collection
                          const userKey = selectedUser.email || selectedUser.mobile || selectedUser.id;
                          if (userKey) {
                            const newFirestoreDoc = {
                              id: newDocId,
                              name: docFileName,
                              category: docCategory,
                              customFileUrl: uploadedFileUrl,
                              size: docFileSize || '250 KB',
                              issueDate: today,
                              status: 'Verified',
                            };

                            const updatedFirestoreDocsList = [...userFirestoreDocs, newFirestoreDoc];
                            setUserFirestoreDocs(updatedFirestoreDocsList);

                            try {
                              await saveUserDocumentsToFirestore(userKey, updatedFirestoreDocsList);
                            } catch (e) {
                              console.warn('Firestore documents save notice:', e);
                            }
                          }

                          setDocUploadSuccess(true);
                          setDocFileName('');
                          setDocFileDataUrl('');
                          setDocFileSize('');
                          setTimeout(() => setDocUploadSuccess(false), 2500);
                        }}
                        className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Confirm & Sync to Firestore</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* List of Uploaded Documents for User */}
                <div>
                  <h4 className="font-extrabold text-xs text-slate-300 mb-2 flex items-center justify-between">
                    <span>Uploaded Documents for User ({adminStore.getDocuments().filter(d => d.userId === selectedUser.id || d.userEmail === selectedUser.email).length})</span>
                  </h4>

                  {adminStore.getDocuments().filter(d => d.userId === selectedUser.id || d.userEmail === selectedUser.email).length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-700/60 rounded-2xl bg-slate-900/20">
                      <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-400 font-bold text-xs">No documents uploaded for this user yet.</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Use the upload tool above to upload Aadhaar, PAN, Photo, Signature or Marksheets.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {adminStore.getDocuments().filter(d => d.userId === selectedUser.id || d.userEmail === selectedUser.email).map((doc) => (
                        <div key={doc.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold shrink-0 border border-blue-500/20">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-100 text-xs">{doc.fileName}</span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  {doc.category}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Uploaded on {doc.uploadDate} â€¢ Size: {doc.fileSize}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {doc.status}
                            </span>
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 cursor-pointer"
                              title="View / Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this user document?')) {
                                  adminStore.deleteDocument(doc.id);
                                  if (selectedUser) {
                                    const updatedDocs = (selectedUser.documents || []).filter((d) => d.id !== doc.id);
                                    const updatedUser = { ...selectedUser, documents: updatedDocs };
                                    adminStore.saveUser(updatedUser);
                                    setSelectedUser(updatedUser);
                                  }
                                  setUsers(adminStore.getUsers());
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                              title="Delete Document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="pt-3 border-t border-slate-700/40 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  const u = selectedUser;
                  setSelectedUser(null);
                  setProfileModalTab('view');
                  if (onImpersonateUser && u) {
                    onImpersonateUser(u);
                  }
                }}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Login as {selectedUser.name}</span>
              </button>

              <button
                onClick={() => { setSelectedUser(null); setProfileModalTab('view'); }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <form
            onSubmit={handleSaveEdit}
            className={`w-full max-w-lg max-h-[90vh] rounded-2xl border p-6 flex flex-col space-y-4 shadow-2xl overflow-hidden ${
              darkMode ? 'bg-[#0B132B] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-700/40 pb-3 shrink-0">
              <h3 className="font-bold text-sm flex items-center gap-2">
                {users.some((u) => u.id === editUser.id) ? (
                  <>
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    <span>Edit User Profile</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    <span>Add New User ID</span>
                  </>
                )}
              </h3>
              <button type="button" onClick={() => setEditUser(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                  placeholder="Citizen Full Name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={editUser.mobile}
                    onChange={(e) => setEditUser({ ...editUser, mobile: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Father's Name</label>
                  <input
                    type="text"
                    value={editUser.fatherName || ''}
                    onChange={(e) => setEditUser({ ...editUser, fatherName: e.target.value })}
                    placeholder="Father's Name"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Mother's Name</label>
                  <input
                    type="text"
                    value={editUser.motherName || ''}
                    onChange={(e) => setEditUser({ ...editUser, motherName: e.target.value })}
                    placeholder="Mother's Name"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Gender</label>
                  <select
                    value={editUser.gender || 'Male'}
                    onChange={(e) => setEditUser({ ...editUser, gender: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editUser.dob || ''}
                    onChange={(e) => setEditUser({ ...editUser, dob: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">State</label>
                  <select
                    value={editUser.state || ''}
                    onChange={(e) => {
                      const st = e.target.value;
                      const dists = getDistrictsForState(st);
                      const currentDist = editUser.district || '';
                      const newDist = dists.includes(currentDist) ? currentDist : '';
                      setEditUser({ ...editUser, state: st, district: newDist });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium cursor-pointer"
                  >
                    <option value="">-- Select State --</option>
                    {ALL_INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">District</label>
                  <select
                    value={editUser.district || ''}
                    onChange={(e) => setEditUser({ ...editUser, district: e.target.value })}
                    disabled={!editUser.state}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium cursor-pointer disabled:opacity-50"
                  >
                    <option value="">
                      {editUser.state ? '-- Select District --' : '-- Select State First --'}
                    </option>
                    {getDistrictsForState(editUser.state || '').map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={editUser.pincode || ''}
                    onChange={(e) => setEditUser({ ...editUser, pincode: e.target.value })}
                    placeholder="e.g. 751001"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Address</label>
                <textarea
                  rows={2}
                  value={editUser.fullAddress || ''}
                  onChange={(e) => setEditUser({ ...editUser, fullAddress: e.target.value })}
                  placeholder="Village/Town, Post Office, Police Station..."
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Stream</label>
                  <input
                    type="text"
                    value={editUser.stream || ''}
                    onChange={(e) => setEditUser({ ...editUser, stream: e.target.value })}
                    placeholder="e.g. Arts, Science"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={editUser.qualification || ''}
                    onChange={(e) => setEditUser({ ...editUser, qualification: e.target.value })}
                    placeholder="e.g. Graduation"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Caste Category</label>
                  <input
                    type="text"
                    value={editUser.casteCategory || ''}
                    onChange={(e) => setEditUser({ ...editUser, casteCategory: e.target.value })}
                    placeholder="e.g. OBC, General"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Aadhaar Number</label>
                  <input
                    type="text"
                    value={editUser.aadhaarNumber || ''}
                    onChange={(e) => setEditUser({ ...editUser, aadhaarNumber: e.target.value })}
                    placeholder="12 digit Aadhaar"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={editUser.panNumber || ''}
                    onChange={(e) => setEditUser({ ...editUser, panNumber: e.target.value })}
                    placeholder="10 digit PAN"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Account Status</label>
                <select
                  value={editUser.status}
                  onChange={(e) => setEditUser({ ...editUser, status: e.target.value as UserStatus })}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Pending Verification">Pending Verification</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700/40 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-xs cursor-pointer shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <form
            onSubmit={handleResetPassword}
            className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
              darkMode ? 'bg-[#0B132B] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-purple-400" /> Reset Password
              </h3>
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSuccess ? (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Password reset successfully for {resetModalUser.email}!
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-slate-400">
                  Enter a new password for <strong className="text-slate-200">{resetModalUser.email}</strong>.
                </p>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                    required
                  />
                </div>
              </div>
            )}

            {!resetSuccess && (
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  Reset Password
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Send Personal Message Modal */}
      {sendMessageUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-2xl border p-6 flex flex-col space-y-4 shadow-2xl ${
            darkMode ? 'bg-[#0B132B] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm">Send Personal Message / Notification</h3>
              </div>
              <button onClick={() => setSendMessageUser(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                {sendMessageUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-xs text-slate-200">Recipient: {sendMessageUser.name}</p>
                <p className="text-[11px] text-slate-400">{sendMessageUser.email} | Mobile: {sendMessageUser.mobile || 'N/A'}</p>
              </div>
            </div>

            {msgSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Notification & Personal message sent successfully to {sendMessageUser.name}!</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!msgTitle.trim() || !msgBody.trim()) return;

                adminStore.saveNotification({
                  id: `NTF-${Date.now().toString().slice(-6)}`,
                  title: msgTitle.trim(),
                  message: msgBody.trim(),
                  notificationType: 'Personal Message',
                  targetAudience: 'Selected Users',
                  targetMode: 'Single User',
                  targetValue: sendMessageUser.id,
                  priority: msgPriority,
                  sentDate: new Date().toISOString(),
                  status: 'Sent',
                  createdBy: 'Super Admin',
                });

                setMsgSuccess(true);
                setTimeout(() => {
                  setMsgSuccess(false);
                  setSendMessageUser(null);
                  setMsgTitle('');
                  setMsgBody('');
                }, 1500);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-300 mb-1">Message Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Document Verification Needed / Status Update"
                  value={msgTitle}
                  onChange={(e) => setMsgTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Message Body *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your personal message to this citizen..."
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Priority Level</label>
                <select
                  value={msgPriority}
                  onChange={(e) => setMsgPriority(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium cursor-pointer"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSendMessageUser(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Notification Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* High Resolution Document & Media Zoom Preview Modal */}
      {previewMediaModal && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-2 sm:p-6 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-4xl h-[90vh] bg-[#0B132B] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header Bar */}
            <div className="p-4 bg-[#1C2541] border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-sm text-slate-100 truncate max-w-xs sm:max-w-md">
                  {previewMediaModal.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((prev) => Math.max(50, prev - 25))}
                    className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="px-2 text-xs font-mono font-bold text-emerald-400">{previewZoom}%</span>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((prev) => Math.min(300, prev + 25))}
                    className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(100)}
                    className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                <a
                  href={previewMediaModal.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setPreviewMediaModal(null);
                    setPreviewZoom(100);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Display Canvas */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/60 relative">
              {previewMediaModal.url.endsWith('.pdf') ? (
                <iframe
                  src={previewMediaModal.url}
                  title="PDF Document"
                  className="w-full h-full rounded-xl border border-slate-800"
                />
              ) : (
                <div
                  className="transition-transform duration-200 ease-out max-w-full max-h-full flex items-center justify-center"
                  style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'center center' }}
                >
                  <img
                    src={previewMediaModal.url}
                    alt="Document Preview"
                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl border border-slate-800 bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



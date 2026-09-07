import React, { useState, useEffect } from 'react';
import {
  Wrench,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Send,
  Plus,
  Trash2,
  Edit3,
  Users,
  Building,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  DollarSign,
  User,
  X,
  Phone,
  Mail,
  ListTodo,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';
import { adminStore } from './adminStore';
import {
  MaintenanceTaskRecord,
  MaintenanceStaffRecord,
  MaintenanceTaskStatus
} from './AdminTypes';

interface AdminMaintenanceProps {
  darkMode: boolean;
}

export const AdminMaintenance: React.FC<AdminMaintenanceProps> = ({ darkMode }) => {
  const [tasks, setTasks] = useState<MaintenanceTaskRecord[]>([]);
  const [staffList, setStaffList] = useState<MaintenanceStaffRecord[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [staffFilter, setStaffFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');

  // Modals State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStaffForAssign, setSelectedStaffForAssign] = useState<string>('');
  const [assignRemarks, setAssignRemarks] = useState<string>('Sent to Maintenance for form processing & verification');
  const [assignPriority, setAssignPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  // Add Staff Modal
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showStaffRosterModal, setShowStaffRosterModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'Maintenance Specialist' | 'Data Entry Operator' | 'Form Verification Officer' | 'Staff Member'>('Maintenance Specialist');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Edit Task Modal
  const [editTask, setEditTask] = useState<MaintenanceTaskRecord | null>(null);
  const [editStatus, setEditStatus] = useState<MaintenanceTaskStatus>('Sent to Maintenance');
  const [editStaffRemarks, setEditStaffRemarks] = useState('');

  // Create Custom Manual Task
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customApplicant, setCustomApplicant] = useState('');
  const [customMobile, setCustomMobile] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [customRemarks, setCustomRemarks] = useState('');

  const loadData = () => {
    setTasks(adminStore.getMaintenanceTasks());
    const staff = adminStore.getMaintenanceStaff();
    setStaffList(staff);
    if (staff.length > 0 && !selectedStaffForAssign) {
      setSelectedStaffForAssign(staff[0].name);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = adminStore.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.taskNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.applicantName || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.adminRemarks || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesStaff =
      staffFilter === 'All' ||
      (staffFilter === 'Unassigned' && !t.assignedStaffName) ||
      t.assignedStaffName === staffFilter;

    const matchesSource =
      sourceFilter === 'All'
        ? true
        : sourceFilter === 'Original (Forms & Payments)'
        ? t.sourceType === 'Form Submission' || t.sourceType === 'User Payment'
        : t.sourceType === sourceFilter;

    return matchesSearch && matchesStatus && matchesStaff && matchesSource;
  });

  // Checkbox Selection
  const handleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    }
  };

  const handleToggleSelectTask = (id: string) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter((tId) => tId !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  // Quick Select 10 / 20 Tasks
  const handleQuickSelect = (count: number) => {
    const ids = filteredTasks.slice(0, count).map((t) => t.id);
    setSelectedTaskIds(ids);
  };

  // Bulk Delete Selected Tasks
  const handleBulkDelete = () => {
    if (selectedTaskIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedTaskIds.length} selected task(s)?`)) {
      adminStore.bulkDeleteMaintenanceTasks(selectedTaskIds);
      setSelectedTaskIds([]);
      loadData();
      alert(`Deleted ${selectedTaskIds.length} task(s) successfully!`);
    }
  };

  // Clear Demo Tasks (Keep Original User Submissions & Payments Only)
  const handleClearDemoTasks = () => {
    if (confirm('Are you sure you want to remove all demo/system tasks and keep only original real user form submissions and payment orders?')) {
      adminStore.clearDemoMaintenanceTasks();
      setSelectedTaskIds([]);
      alert('Demo tasks removed successfully! Only original user submissions and payment records are preserved.');
    }
  };

  // Confirm Bulk Assignment
  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTaskIds.length === 0) return;

    const chosenStaff = staffList.find((s) => s.name === selectedStaffForAssign) || {
      id: `STAFF-${Date.now()}`,
      name: selectedStaffForAssign,
    };

    adminStore.bulkAssignMaintenanceTasks(
      selectedTaskIds,
      chosenStaff.id,
      chosenStaff.name,
      assignRemarks,
      assignPriority
    );

    setShowAssignModal(false);
    setSelectedTaskIds([]);
    alert(`Successfully assigned ${selectedTaskIds.length} task(s) to ${chosenStaff.name} with status "Sent to Maintenance"!`);
  };

  // Handle Add New Staff
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;

    const generatedUser = newStaffUsername.trim() || `staff_${newStaffName.trim().toLowerCase().replace(/\s+/g, '')}`;
    const generatedPass = newStaffPassword.trim() || 'staff123';

    const newStaff: MaintenanceStaffRecord = {
      id: `STAFF-${Date.now()}`,
      name: newStaffName.trim(),
      username: generatedUser,
      password: generatedPass,
      email: newStaffEmail.trim() || `${generatedUser}@sff.gov.in`,
      phone: newStaffPhone.trim() || '+91 98765 00000',
      role: newStaffRole,
      activeTasksCount: 0,
      completedTasksCount: 0,
      status: 'Active',
    };

    adminStore.saveMaintenanceStaff(newStaff);
    setShowAddStaffModal(false);
    setNewStaffName('');
    setNewStaffUsername('');
    setNewStaffPassword('');
    setNewStaffPhone('');
    setNewStaffEmail('');
    alert(`Maintenance Staff "${newStaff.name}" created successfully!\n\nðŸ”‘ Username: ${generatedUser}\nðŸ”’ Password: ${generatedPass}`);
  };

  // Handle Create Custom Task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const newTask: MaintenanceTaskRecord = {
      id: `TASK-M-${Date.now()}`,
      taskNumber: `MNT-${Math.floor(100000 + Math.random() * 900000)}`,
      sourceType: 'System Maintenance',
      title: customTitle.trim(),
      applicantName: customApplicant.trim() || 'Portal Request',
      applicantMobile: customMobile.trim() || 'N/A',
      amount: Number(customAmount) || 0,
      status: 'Pending Assignment',
      adminRemarks: customRemarks.trim() || 'Direct maintenance request created by Super Admin.',
      createdDate: new Date().toISOString(),
      priority: 'High',
    };

    adminStore.saveMaintenanceTask(newTask);
    setShowCreateTaskModal(false);
    setCustomTitle('');
    setCustomApplicant('');
    setCustomMobile('');
    setCustomAmount('');
    setCustomRemarks('');
    alert('New maintenance task created!');
  };

  // Handle Update Task Status
  const handleSaveTaskStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTask) return;

    adminStore.updateMaintenanceTaskStatus(editTask.id, editStatus, editStaffRemarks);
    setEditTask(null);
  };

  // Stats
  const pendingCount = tasks.filter((t) => t.status === 'Pending Assignment').length;
  const sentToMntCount = tasks.filter((t) => t.status === 'Sent to Maintenance' || t.status === 'In Progress').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 rounded-3xl border border-blue-900/50 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Staff Work Assignment & Maintenance Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Maintenance & Task Dispatch Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed">
            When users make payments or submit application forms, tasks are automatically queued here. Admin can batch select (10, 20, or all) and assign tasks to specific maintenance staff members with remark <span className="text-amber-300 font-bold">"Sent to Maintenance"</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0">
          <button
            onClick={() => setShowStaffRosterModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md"
          >
            <KeyRound className="w-4 h-4 text-cyan-400" />
            <span>Staff Logins & Passwords ({staffList.length})</span>
          </button>

          <button
            onClick={() => setShowAddStaffModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Add Maintenance Staff</span>
          </button>

          <button
            onClick={() => setShowCreateTaskModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Task Order</span>
          </button>
        </div>
      </div>

      {/* Metrics Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className={`p-4 rounded-2xl border shadow-xs ${darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded-md">Pending</span>
          </div>
          <p className="text-2xl font-black text-slate-100">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 font-medium">Pending Assignment</p>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs ${darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-blue-400 mb-2">
            <Send className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase bg-blue-500/10 px-2 py-0.5 rounded-md">In Progress</span>
          </div>
          <p className="text-2xl font-black text-slate-100">{sentToMntCount}</p>
          <p className="text-[11px] text-slate-400 font-medium">Sent to Maintenance</p>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs ${darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md">Completed</span>
          </div>
          <p className="text-2xl font-black text-slate-100">{completedCount}</p>
          <p className="text-[11px] text-slate-400 font-medium">Processed & Completed</p>
        </div>

        <div className={`p-4 rounded-2xl border shadow-xs ${darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-cyan-400 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase bg-cyan-500/10 px-2 py-0.5 rounded-md">Active</span>
          </div>
          <p className="text-2xl font-black text-slate-100">{staffList.length}</p>
          <p className="text-[11px] text-slate-400 font-medium">Maintenance Staff Members</p>
        </div>
      </div>

      {/* Batch Select & Assignment Action Bar */}
      {selectedTaskIds.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 p-4 rounded-2xl text-slate-950 font-black shadow-xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-sm shadow-md">
              {selectedTaskIds.length}
            </div>
            <div>
              <p className="text-sm font-black leading-tight">
                {selectedTaskIds.length} Task(s) Selected for Bulk Assignment
              </p>
              <p className="text-xs text-slate-900/80 font-bold">
                Assign selected task orders to particular staff with remark "Sent to Maintenance"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs cursor-pointer shadow-md flex items-center gap-2 transition-transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Assign to Staff ({selectedTaskIds.length})</span>
            </button>

            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 font-black text-xs cursor-pointer shadow-md flex items-center gap-2 transition-transform active:scale-95 border border-rose-800"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Delete Selected ({selectedTaskIds.length})</span>
            </button>

            <button
              onClick={() => setSelectedTaskIds([])}
              className="px-3 py-2 rounded-xl bg-slate-900/20 hover:bg-slate-900/30 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search, Filter & Quick Select Options */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${
        darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Task #, Citizen Name, Title or UTR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border outline-none font-medium ${
              darkMode ? 'bg-[#1C2541] border-slate-700 text-slate-100 placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Source Filter (Original vs Demo) */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className={`px-3 py-2 text-xs rounded-xl border outline-none font-bold cursor-pointer ${
              darkMode ? 'bg-[#1C2541] border-slate-700 text-amber-300' : 'bg-slate-50 border-slate-200 text-amber-600'
            }`}
          >
            <option value="All">All Task Sources</option>
            <option value="Original (Forms & Payments)">âœ¨ Original (Forms & Payments Only)</option>
            <option value="Form Submission">Form Submissions</option>
            <option value="User Payment">User Payments</option>
            <option value="System Maintenance">System / Manual Tasks</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 text-xs rounded-xl border outline-none font-bold cursor-pointer ${
              darkMode ? 'bg-[#1C2541] border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="All">All Statuses</option>
            <option value="Pending Assignment">Pending Assignment</option>
            <option value="Sent to Maintenance">Sent to Maintenance</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Staff Filter */}
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className={`px-3 py-2 text-xs rounded-xl border outline-none font-bold cursor-pointer ${
              darkMode ? 'bg-[#1C2541] border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <option value="All">All Staff Members</option>
            <option value="Unassigned">Unassigned Tasks</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Quick Batch Selection Buttons */}
          <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700">
            <span className="text-[10px] font-black uppercase text-slate-400 px-1.5">Quick Select:</span>
            <button
              onClick={() => handleQuickSelect(10)}
              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold cursor-pointer"
            >
              Select 10
            </button>
            <button
              onClick={() => handleQuickSelect(20)}
              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold cursor-pointer"
            >
              Select 20
            </button>
          </div>
        </div>
      </div>

      {/* Maintenance Tasks Table */}
      {filteredTasks.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'}`}>
          <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No Maintenance Tasks Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            There are no tasks matching your search or filters. When users submit forms or make payments, work orders will appear here automatically.
          </p>
        </div>
      ) : (
        <div className={`rounded-2xl border overflow-hidden shadow-sm ${darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b uppercase tracking-wider font-bold text-[10px] ${
                  darkMode ? 'bg-[#1C2541] border-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                }`}>
                  <th className="p-3.5 pl-5 w-10">
                    <button onClick={handleSelectAll} className="cursor-pointer text-slate-400 hover:text-white">
                      {selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Task Order #</th>
                  <th className="p-3.5">Task Title / Details</th>
                  <th className="p-3.5">Citizen Details</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Assigned Staff</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Admin Remarks</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredTasks.map((t) => {
                  const isSelected = selectedTaskIds.includes(t.id);

                  return (
                    <tr
                      key={t.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-amber-500/10'
                          : darkMode
                          ? 'hover:bg-[#1C2541]/50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3.5 pl-5">
                        <button
                          onClick={() => handleToggleSelectTask(t.id)}
                          className="cursor-pointer text-slate-400 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="p-3.5 font-bold text-amber-400 whitespace-nowrap">
                        <div>{t.taskNumber}</div>
                        <div className="text-[10px] font-medium text-slate-400">{t.sourceType}</div>
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <p className="font-bold text-slate-100 truncate">{t.title}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(t.createdDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <p className="font-bold text-slate-200">{t.applicantName || 'Citizen'}</p>
                        <p className="text-[10px] text-slate-400">{t.applicantMobile || 'N/A'}</p>
                      </td>

                      <td className="p-3.5 font-black text-emerald-400 whitespace-nowrap">
                        Rs {t.amount || 30}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        {t.assignedStaffName ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold flex items-center justify-center text-[10px]">
                              {t.assignedStaffName.charAt(0)}
                            </div>
                            <span className="font-bold text-xs text-blue-300">{t.assignedStaffName}</span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          t.status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : t.status === 'Sent to Maintenance' || t.status === 'In Progress'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {t.status}
                        </span>
                      </td>

                      <td className="p-3.5 max-w-xs text-slate-300 text-[11px] truncate">
                        {t.adminRemarks || 'N/A'}
                      </td>

                      <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditTask(t);
                              setEditStatus(t.status);
                              setEditStaffRemarks(t.staffRemarks || '');
                            }}
                            title="Update Status / Staff Remarks"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete maintenance task ${t.taskNumber}?`)) {
                                adminStore.deleteMaintenanceTask(t.id);
                                loadData();
                              }
                            }}
                            title="Delete Task"
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modal 1: Assign Tasks to Maintenance Staff */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl ${
            darkMode ? 'bg-[#0B132B] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base">Assign Tasks to Maintenance Staff</h3>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-300 text-xs font-bold">
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>
                You are assigning <strong>{selectedTaskIds.length} task order(s)</strong> to maintenance staff. Their status will update to "Sent to Maintenance".
              </span>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Select Particular Staff / Maintenance Specialist *</label>
                <select
                  value={selectedStaffForAssign}
                  onChange={(e) => setSelectedStaffForAssign(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-bold cursor-pointer"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} - ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Admin Remark / Instructions *</label>
                <textarea
                  rows={3}
                  required
                  value={assignRemarks}
                  onChange={(e) => setAssignRemarks(e.target.value)}
                  placeholder="e.g. Sent to Maintenance for online application verification and document check."
                  className="w-full p-3 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Priority Level</label>
                <select
                  value={assignPriority}
                  onChange={(e) => setAssignPriority(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-bold cursor-pointer"
                >
                  <option value="High">High Priority (Urgent)</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Confirm Assignment ({selectedTaskIds.length} Tasks)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add New Staff Member */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl ${
            darkMode ? 'bg-[#0B132B] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-base">Add Maintenance Staff Member</h3>
              </div>
              <button onClick={() => setShowAddStaffModal(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staff Full Name"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
                <div>
                  <label className="block font-bold text-amber-300 mb-1 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Username / ID *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. staff_username"
                    value={newStaffUsername}
                    onChange={(e) => setNewStaffUsername(e.target.value)}
                    className="w-full p-2 rounded-xl border border-amber-500/30 bg-[#0B132B] outline-none text-amber-200 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-300 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Password *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. pass123"
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    className="w-full p-2 rounded-xl border border-amber-500/30 bg-[#0B132B] outline-none text-amber-200 font-mono font-bold"
                  />
                </div>
                <div className="col-span-2 text-[10px] text-amber-300/80">
                  âš¡ Staff member will use this exact Username and Password to log into the Maintenance Portal.
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Role / Designation</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-bold cursor-pointer"
                >
                  <option value="Maintenance Specialist">Maintenance Specialist</option>
                  <option value="Form Verification Officer">Form Verification Officer</option>
                  <option value="Data Entry Operator">Data Entry Operator</option>
                  <option value="Staff Member">Staff Member</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Mobile Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 00000"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="staff@sff.gov.in"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Create Custom Task */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl ${
            darkMode ? 'bg-[#0B132B] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base">Create Manual Task Order</h3>
              </div>
              <button onClick={() => setShowCreateTaskModal(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Task Title / Work Order *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UPSC Form Verification / Technical Repair"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Citizen / Applicant Name</label>
                <input
                  type="text"
                  placeholder="Applicant Name"
                  value={customApplicant}
                  onChange={(e) => setCustomApplicant(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Mobile Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 00000"
                  value={customMobile}
                  onChange={(e) => setCustomMobile(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Amount (Rs )</label>
                <input
                  type="number"
                  placeholder="30"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Instructions / Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Special instructions for maintenance team..."
                  value={customRemarks}
                  onChange={(e) => setCustomRemarks(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Edit Task Status */}
      {editTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border p-6 space-y-4 shadow-2xl ${
            darkMode ? 'bg-[#0B132B] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base">Update Task Status #{editTask.taskNumber}</h3>
              </div>
              <button onClick={() => setEditTask(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTaskStatus} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-bold cursor-pointer"
                >
                  <option value="Pending Assignment">Pending Assignment</option>
                  <option value="Sent to Maintenance">Sent to Maintenance</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Staff Progress Remarks</label>
                <textarea
                  rows={3}
                  placeholder="Write completion details or status update..."
                  value={editStaffRemarks}
                  onChange={(e) => setEditStaffRemarks(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditTask(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl cursor-pointer"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Staff Logins & Password Roster */}
      {showStaffRosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`w-full max-w-3xl rounded-3xl border p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto ${
            darkMode ? 'bg-[#0B132B] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base">Maintenance Team Credentials & Passwords</h3>
              </div>
              <button onClick={() => setShowStaffRosterModal(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 shrink-0 text-amber-400" />
              <span>
                Maintenance staff can only log into the Maintenance Portal using the Username & Password generated here by SFF.
              </span>
            </div>

            <div className="space-y-3">
              {staffList.map((staff) => {
                const showPass = showPasswordMap[staff.id] || false;
                return (
                  <div
                    key={staff.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white">{staff.name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {staff.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-3">
                        <span>{staff.phone}</span>
                        <span>{staff.email}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 shrink-0">
                      <div className="text-xs">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Staff Login ID</div>
                        <div className="font-mono font-black text-amber-400 text-xs">{staff.username || staff.id}</div>
                      </div>

                      <div className="h-6 w-px bg-slate-800" />

                      <div className="text-xs">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Password</div>
                        <div className="font-mono font-black text-emerald-400 text-xs">
                          {showPass ? staff.password || 'staff123' : '*******************'}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setShowPasswordMap((prev) => ({ ...prev, [staff.id]: !prev[staff.id] }))
                        }
                        title={showPass ? 'Hide Password' : 'Show Password'}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => {
                          const userStr = staff.username || staff.id;
                          const passStr = staff.password || 'staff123';
                          navigator.clipboard.writeText(`ID: ${userStr} | Password: ${passStr}`);
                          alert(`Copied credentials for ${staff.name}:\nID: ${userStr}\nPassword: ${passStr}`);
                        }}
                        title="Copy Login Credentials"
                        className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Remove maintenance staff member ${staff.name}?`)) {
                            adminStore.deleteMaintenanceStaff(staff.id);
                            loadData();
                          }
                        }}
                        title="Delete Staff"
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowStaffRosterModal(false);
                  setShowAddStaffModal(true);
                }}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Staff Member</span>
              </button>

              <button
                onClick={() => setShowStaffRosterModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




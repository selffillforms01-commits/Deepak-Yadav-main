import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Edit3,
  Trash2,
  Clock,
  IndianRupee,
  X,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Tag,
  Check,
} from 'lucide-react';
import { adminStore } from './adminStore';
import { AdminServiceRecord } from './AdminTypes';

interface AdminServicesProps {
  darkMode: boolean;
}

// Preset service templates to help admin add services quickly without coding
const SERVICE_PRESETS: Array<{
  title: string;
  category: string;
  fee: string;
  processingDays: number;
  description: string;
  iconName: string;
}> = [
  {
    title: 'Income Certificate',
    category: 'Revenue & Certificates',
    fee: '30',
    processingDays: 7,
    description: 'Official Tehsil / Revenue income verification certificate for scholarship & welfare schemes.',
    iconName: 'FileText',
  },
  {
    title: 'Caste Certificate',
    category: 'Revenue & Certificates',
    fee: '30',
    processingDays: 7,
    description: 'Official community category verification certificate (SC/ST/OBC/SEBC/General).',
    iconName: 'FileCheck',
  },
  {
    title: 'Residence Certificate',
    category: 'Revenue & Certificates',
    fee: '30',
    processingDays: 7,
    description: 'Official domicile & permanent resident certificate issued by District Revenue Office.',
    iconName: 'Home',
  },
  {
    title: 'Pan Card',
    category: 'Tax & Identity',
    fee: '150',
    processingDays: 10,
    description: 'New NSDL / UTITSL Permanent Account Number (PAN) Card application and correction.',
    iconName: 'CreditCard',
  },
  {
    title: 'Driving License',
    category: 'Transport & Driving',
    fee: '30',
    processingDays: 15,
    description: 'Learner & Permanent RTO Driving License online application filing and slot booking.',
    iconName: 'Car',
  },
  {
    title: 'Character Certificate',
    category: 'Police & Verification',
    fee: '100',
    processingDays: 10,
    description: 'District Police Verification & Good Conduct Character Certificate.',
    iconName: 'ShieldCheck',
  },
  {
    title: 'Employment Exchange',
    category: 'Employment',
    fee: '50',
    processingDays: 5,
    description: 'State Employment Exchange Registration & Renewal for Job Seekers.',
    iconName: 'Briefcase',
  },
  {
    title: 'Birth Certificate',
    category: 'Civil Registration',
    fee: '50',
    processingDays: 5,
    description: 'Municipal Corporation / Gram Panchayat official Birth registration & certificate.',
    iconName: 'Baby',
  },
  {
    title: 'EWS Certificate',
    category: 'Revenue & Certificates',
    fee: '50',
    processingDays: 7,
    description: 'Economically Weaker Section reservation eligibility certificate for 10% quota.',
    iconName: 'Award',
  },
  {
    title: 'Labour Card',
    category: 'Social Welfare',
    fee: '30',
    processingDays: 7,
    description: 'Construction & Unorganized Workers Welfare Board Registration & renewal.',
    iconName: 'HardHat',
  },
  {
    title: 'Passport Application',
    category: 'Travel & Identity',
    fee: '100',
    processingDays: 15,
    description: 'Official Ministry of External Affairs Passport appointment slot booking & form filling.',
    iconName: 'Globe',
  },
];

export const AdminServices: React.FC<AdminServicesProps> = ({ darkMode }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [services, setServices] = useState<AdminServiceRecord[]>(() => adminStore.getServices());
  const [modalService, setModalService] = useState<Partial<AdminServiceRecord> | null>(null);

  useEffect(() => {
    const updateServices = () => {
      setServices(adminStore.getServices());
    };
    updateServices();
    const unsubscribe = adminStore.subscribe(updateServices);
    return () => unsubscribe();
  }, []);

  const categories = ['All', ...Array.from(new Set(services.map((s) => s.category)))];

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.fee.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleStatus = (id: string) => {
    adminStore.toggleServiceStatus(id);
    setServices(adminStore.getServices());
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      adminStore.deleteService(id);
      setServices(adminStore.getServices());
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Do you want to restore all default services and standard fee amounts?')) {
      adminStore.resetDefaultServices();
      setServices(adminStore.getServices());
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalService?.title || !modalService.category) {
      alert('Please fill in Service Title and Category.');
      return;
    }

    // Format Fee string nicely if user just entered numbers like "30" or "150"
    let formattedFee = (modalService.fee || 'Rs 0').trim();
    if (formattedFee && !formattedFee.includes('Rs ') && !isNaN(Number(formattedFee))) {
      formattedFee = `Rs ${formattedFee}`;
    }

    const record: AdminServiceRecord = {
      id: modalService.id || `SRV-${Date.now().toString().slice(-4)}`,
      title: modalService.title.trim(),
      category: modalService.category.trim(),
      description: modalService.description || '',
      iconName: modalService.iconName || 'Wrench',
      processingDays: Number(modalService.processingDays) || 3,
      fee: formattedFee,
      enabled: modalService.enabled ?? true,
      totalSubmissions: modalService.totalSubmissions || 0,
      createdDate: modalService.createdDate || new Date().toISOString().split('T')[0],
    };

    adminStore.saveService(record);
    setServices(adminStore.getServices());
    setModalService(null);
  };

  const applyPreset = (preset: typeof SERVICE_PRESETS[0]) => {
    setModalService((prev) => ({
      ...prev,
      title: preset.title,
      category: preset.category,
      fee: preset.fee,
      processingDays: preset.processingDays,
      description: preset.description,
      iconName: preset.iconName,
      enabled: true,
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-400" />
            <span>Government Services & Pricing Catalog</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Add or edit any user service, set application fee/amount in Rs , processing SLA, and enable/disable services without code changes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleResetDefaults}
            title="Restore default user services and standard rates"
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Load Default Services</span>
          </button>

          <button
            onClick={() =>
              setModalService({
                title: '',
                category: 'Revenue & Certificates',
                description: '',
                processingDays: 7,
                fee: '30',
                enabled: true,
              })
            }
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Service</span>
          </button>
        </div>
      </div>

      {/* Category Filter & Search Bar */}
      <div className="space-y-3">
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
            darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search service by title, category, or fee (e.g. Income, Pan Card, 30)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full text-xs outline-none bg-transparent font-medium ${
              darkMode ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-800 placeholder:text-slate-400'
            }`}
          />
          {search && (
            <button onClick={() => setSearch('')} className="p-1 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : darkMode
                  ? 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div
          className={`p-12 text-center rounded-2xl border ${
            darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-slate-200">No Services Found</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto mb-4">
            No matching services found for &quot;{search}&quot;. Click below to add a custom service or restore default services.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleResetDefaults}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
            >
              Restore Default Catalog
            </button>
            <button
              onClick={() =>
                setModalService({
                  title: '',
                  category: 'Revenue & Certificates',
                  description: '',
                  processingDays: 7,
                  fee: '30',
                  enabled: true,
                })
              }
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
            >
              + Add Custom Service
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 shadow-sm transition-all hover:border-amber-500/50 ${
                darkMode ? 'bg-[#0B132B] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30 truncate">
                    {service.category}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(service.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors shrink-0 ${
                      service.enabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {service.enabled ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                    <span>{service.enabled ? 'Active' : 'Disabled'}</span>
                  </button>
                </div>

                <div>
                  <h3 className="font-black text-sm text-slate-100 flex items-center justify-between">
                    <span>{service.title}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{service.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{service.processingDays} Days SLA</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 flex items-center gap-1.5 font-bold">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Amount: {service.fee}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-[10px] font-semibold text-slate-500">
                  Submissions: <strong className="text-slate-300">{service.totalSubmissions}</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setModalService(service)}
                    className="px-2.5 py-1 text-amber-400 hover:bg-amber-500/10 rounded-lg cursor-pointer font-bold text-[11px] flex items-center gap-1"
                    title="Edit Service Amount & Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Amount</span>
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleSave}
            className={`w-full max-w-xl rounded-2xl border p-6 space-y-4 shadow-2xl my-8 ${
              darkMode ? 'bg-[#0B132B] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-base text-amber-400">
                  {modalService.id ? `Edit ${modalService.title || 'Service'}` : 'Add New User Service & Set Amount'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalService(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Templates Selector */}
            {!modalService.id && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Quick Presets (Click to autofill title, category & amount):</span>
                </span>
                <div className="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto pr-1">
                  {SERVICE_PRESETS.map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>{preset.title}</span>
                      <span className="text-amber-400 hover:text-slate-950 font-black">({preset.fee})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-300 mb-1">Service Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Income Certificate, Pan Card, Passport"
                    value={modalService.title || ''}
                    onChange={(e) => setModalService({ ...modalService, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-300 mb-1">Category *</label>
                  <input
                    type="text"
                    placeholder="e.g. Revenue & Certificates, Tax & Identity, Transport"
                    value={modalService.category || ''}
                    onChange={(e) => setModalService({ ...modalService, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-emerald-400 mb-1 flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>Service Amount / Processing Charge (Rs ) *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 30, 50, 150, or Free"
                    value={modalService.fee || ''}
                    onChange={(e) => setModalService({ ...modalService, fee: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-emerald-600/60 bg-[#1C2541] outline-none text-slate-100 font-bold text-sm"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Enter amount in Rs  (e.g. 30, 50, 150)</p>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-300 mb-1">Processing SLA (Days)</label>
                  <input
                    type="number"
                    min={1}
                    value={modalService.processingDays || 7}
                    onChange={(e) => setModalService({ ...modalService, processingDays: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-300 mb-1">Service Description & Eligibility</label>
                <textarea
                  rows={3}
                  placeholder="Describe guidelines, required document list, and service output..."
                  value={modalService.description || ''}
                  onChange={(e) => setModalService({ ...modalService, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-[#1C2541] outline-none text-slate-100 font-medium resize-none"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <input
                  type="checkbox"
                  id="enabledCheck"
                  checked={modalService.enabled ?? true}
                  onChange={(e) => setModalService({ ...modalService, enabled: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
                <label htmlFor="enabledCheck" className="text-xs font-bold text-slate-300 cursor-pointer">
                  Enable Service for Users (Active in User Dashboard catalog)
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalService(null)}
                className="px-4 py-2.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-extrabold text-xs cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Service & Amount</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};




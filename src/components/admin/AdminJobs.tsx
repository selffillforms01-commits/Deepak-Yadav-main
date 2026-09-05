import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Briefcase,
  X,
  Calendar,
  IndianRupee,
  ExternalLink,
} from 'lucide-react';
import { adminStore } from './adminStore';
import { AdminJobCategory, AdminJobRecord } from './AdminTypes';

interface AdminJobsProps {
  darkMode: boolean;
}

const emptyJob: Partial<AdminJobRecord> = {
  title: '',
  organization: '',
  category: 'Odisha Govt',
  description: '',
  qualification: '',
  ageLimit: '',
  salary: '',
  applicationFee: '',
  applyLink: '',
  startDate: '',
  lastDate: '',
  requiredDocuments: [],
  status: 'Active',
};

export const AdminJobs: React.FC<AdminJobsProps> = ({ darkMode }) => {
  const [jobs, setJobs] = useState<AdminJobRecord[]>(() => adminStore.getJobs());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | AdminJobCategory>('All');
  const [modalJob, setModalJob] = useState<Partial<AdminJobRecord> | null>(null);

  const refresh = () => setJobs(adminStore.getJobs());

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.organization.toLowerCase().includes(q) ||
        job.qualification.toLowerCase().includes(q);

      const matchesCategory =
        category === 'All' || job.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [jobs, search, category]);

  const saveJob = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !modalJob?.title?.trim() ||
      !modalJob?.organization?.trim() ||
      !modalJob?.qualification?.trim() ||
      !modalJob?.startDate ||
      !modalJob?.lastDate
    ) {
      alert('Please fill Title, Organization, Qualification, Start Date and Last Date.');
      return;
    }

    const job: AdminJobRecord = {
      id:
        modalJob.id ||
        `JOB-${Date.now().toString().slice(-6)}`,
      title: modalJob.title.trim(),
      organization: modalJob.organization.trim(),
      category:
        (modalJob.category as AdminJobCategory) ||
        'Odisha Govt',
      description: modalJob.description?.trim() || '',
      qualification: modalJob.qualification.trim(),
      ageLimit: modalJob.ageLimit?.trim() || '',
      salary: modalJob.salary?.trim() || '',
      applicationFee: modalJob.applicationFee?.trim() || '',
      applyLink: modalJob.applyLink?.trim() || '',
      startDate: modalJob.startDate || '',
      lastDate: modalJob.lastDate,
      requiredDocuments: modalJob.requiredDocuments || [],
      status: modalJob.status || 'Active',
      createdDate:
        modalJob.createdDate ||
        new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };

    adminStore.saveJob(job);
    refresh();
    setModalJob(null);
  };

  const deleteJob = (id: string) => {
    const job = jobs.find((j) => j.id === id);

    if (
      job &&
      confirm(`Are you sure you want to delete "${job.title}"?`)
    ) {
      adminStore.deleteJob(id);
      refresh();
    }
  };

  const toggleStatus = (id: string) => {
    adminStore.toggleJobStatus(id);
    refresh();
  };

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-amber-400" />
            Job Alerts Management
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Add, edit, activate or deactivate government and private job alerts.
          </p>
        </div>

        <button
          onClick={() =>
            setModalJob({
              ...emptyJob,
              createdDate: new Date().toISOString(),
            })
          }
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Job
        </button>
      </div>

      {/* Search + Filter */}
      <div className="p-3.5 rounded-2xl border border-slate-800 bg-[#0B132B] flex flex-col sm:flex-row gap-3">

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search job, organization or qualification..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={category}
          onChange={(e) =>
            setCategory(
              e.target.value as 'All' | AdminJobCategory
            )
          }
          className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 outline-none"
        >
          <option value="All">All Categories</option>
          <option value="Odisha Govt">Odisha Govt</option>
          <option value="Central Govt">Central Govt</option>
          <option value="Private">Private</option>
        </select>
      </div>

      {/* Jobs */}
      {filteredJobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-[#0B132B] p-10 text-center">
          <Briefcase className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-300 font-bold">
            No jobs found
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Click "Add New Job" to create a job alert.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">

          {filteredJobs.map((job) => {
            const expired =
              new Date(job.lastDate).getTime() <
              new Date().setHours(0, 0, 0, 0);

            return (
              <div
                key={job.id}
                className="rounded-2xl border border-slate-800 bg-[#0B132B] p-4 sm:p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-black text-base sm:text-lg text-slate-100">
                        {job.title}
                      </h2>

                      <span className="px-2 py-1 rounded-lg text-[10px] font-black bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {job.category}
                      </span>

                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-black border ${
                          job.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-300 border-red-500/20'
                        }`}
                      >
                        {job.status}
                      </span>

                      {expired && (
                        <span className="px-2 py-1 rounded-lg text-[10px] font-black bg-red-500/10 text-red-300 border border-red-500/20">
                          Expired
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-bold text-slate-300 mt-2">
                      {job.organization}
                    </p>

                    <p className="text-xs text-slate-400 mt-2">
                      {job.description || 'No description added.'}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4 text-[11px]">

                      <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                        Qualification: {job.qualification}
                      </span>

                      {job.ageLimit && (
                        <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                          Age: {job.ageLimit}
                        </span>
                      )}

                      {job.salary && (
                        <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                          Salary: {job.salary}
                        </span>
                      )}

                      {job.applicationFee && (
                        <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                          <IndianRupee className="inline w-3 h-3" />
                          Fee: {job.applicationFee}
                        </span>
                      )}

                      {job.startDate && (
                        <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                          <Calendar className="inline w-3 h-3 mr-1" />
                          Start Date: {job.startDate ? new Date(job.startDate + 'T00:00:00').toLocaleDateString('en-GB') : ''}
                        </span>
                      )}

                      <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
                        <Calendar className="inline w-3 h-3 mr-1" />
                        Last Date: {job.lastDate ? new Date(job.lastDate + 'T00:00:00').toLocaleDateString('en-GB') : ''}
                      </span>

                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">

                    <button
                      onClick={() => toggleStatus(job.id)}
                      title="Toggle status"
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-emerald-400"
                    >
                      {job.status === 'Active' ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>

                    <button
                      onClick={() => setModalJob(job)}
                      title="Edit job"
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-400"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteJob(job.id)}
                      title="Delete job"
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {job.applyLink && (
                      <a
                        href={job.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400"
                        title="Open apply link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    {job.requiredDocuments && job.requiredDocuments.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[11px] font-black text-slate-300 mb-1">
                          Required Documents:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.requiredDocuments.map((doc) => (
                            <span
                              key={doc}
                              className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold"
                            >
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalJob && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0B132B] border border-slate-700 shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between p-5 bg-[#0B132B] border-b border-slate-800">

              <div>
                <h2 className="text-lg font-black text-slate-100">
                  {modalJob.id ? 'Edit Job' : 'Add New Job'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Job details shown in the user Job Alerts section.
                </p>
              </div>

              <button
                onClick={() => setModalJob(null)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            <form onSubmit={saveJob} className="p-5 space-y-4">

              <div className="grid sm:grid-cols-2 gap-4">

                <div>
                  <label className="text-xs font-bold text-slate-400">
                    Job Title *
                  </label>
                  <input
                    value={modalJob.title || ''}
                    onChange={(e) =>
                      setModalJob({
                        ...modalJob,
                        title: e.target.value,
                      })
                    }
                    className="admin-job-input"
                    placeholder="e.g. OSSC Junior Assistant"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400">
                    Organization *
                  </label>
                  <input
                    value={modalJob.organization || ''}
                    onChange={(e) =>
                      setModalJob({
                        ...modalJob,
                        organization: e.target.value,
                      })
                    }
                    className="admin-job-input"
                    placeholder="e.g. OSSC"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400">
                    Category *
                  </label>
                  <select
                    value={modalJob.category || 'Odisha Govt'}
                    onChange={(e) =>
                      setModalJob({
                        ...modalJob,
                        category: e.target.value as AdminJobCategory,
                      })
                    }
                    className="admin-job-input"
                  >
                    <option value="Odisha Govt">Odisha Govt</option>
                    <option value="Central Govt">Central Govt</option>
                    <option value="Private">Private</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400">
                    Qualification *
                  </label>
                  <input
                    value={modalJob.qualification || ''}
                    onChange={(e) =>
                      setModalJob({
                        ...modalJob,
                        qualification: e.target.value,
                      })
                    }
                    className="admin-job-input"
                    placeholder="e.g. 10th / 12th / Graduate"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400">
                    Age Limit
                  </label>
                  <input
                    value={modalJob.ageLimit || ''}
                    onChange={(e) =>
                      setModalJob({
                        ...modalJob,
                        ageLimit: e.target.value,
                      })
                    }
                    className="admin-job-input"
                    placeholder="e.g. 18-32 Years"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400">
                    Salary
                  </label>
                  <input
                    value={modalJob.salary || ''}
                    onChange={(e) =>
                      setModalJob({
                        ...modalJob,
                        salary: e.target.value,
                      })
                    }
                    className="admin-job-input"
                    placeholder="e.g. ?19,900 - ?63,200"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400">
                    Application Fee
                  </label>
                  <input
                    value={modalJob.applicationFee || ''}
                    onChange={(e) =>
                      setModalJob({
                        ...modalJob,
                        applicationFee: e.target.value,
                      })
                    }
                    className="admin-job-input"
                    placeholder="e.g. Rs 200"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400">
                    Application Start Date *
                  </label>
                  <input
                    type="date"
                    value={modalJob.startDate || ''}
                    onChange={(e) =>
                      setModalJob({
                        ...modalJob,
                        startDate: e.target.value,
                      })
                    }
                    className="admin-job-input"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400">
                    Last Date *
                  </label>
                  <input
                    type="date"
                    value={modalJob.lastDate || ''}
                    onChange={(e) =>
                      setModalJob({
                        ...modalJob,
                        lastDate: e.target.value,
                      })
                    }
                    className="admin-job-input"
                  />
                </div>

              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-2 block">
                  Required Documents
                </label>

                <div className="grid sm:grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900 border border-slate-700">
                  {[
                    'Aadhaar Card',
                    '10th Marksheet',
                    '12th Marksheet',
                    'Graduation Certificate',
                    'Caste Certificate',
                    'Income Certificate',
                    'Residence Certificate',
                    'Passport Photo',
                    'Signature',
                    'Computer Certificate',
                    'Experience Certificate',
                    'Driving License',
                  ].map((doc) => (
                    <label
                      key={doc}
                      className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(modalJob.requiredDocuments || []).includes(doc)}
                        onChange={(e) => {
                          const current = modalJob.requiredDocuments || [];
                          setModalJob({
                            ...modalJob,
                            requiredDocuments: e.target.checked
                              ? [...current, doc]
                              : current.filter((d) => d !== doc),
                          });
                        }}
                        className="accent-amber-500"
                      />
                      {doc}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400">
                  Apply Link
                </label>
                <input
                  type="url"
                  value={modalJob.applyLink || ''}
                  onChange={(e) =>
                    setModalJob({
                      ...modalJob,
                      applyLink: e.target.value,
                    })
                  }
                  className="admin-job-input"
                  placeholder="https://official-website.gov.in/..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400">
                  Job Description
                </label>
                <textarea
                  value={modalJob.description || ''}
                  onChange={(e) =>
                    setModalJob({
                      ...modalJob,
                      description: e.target.value,
                    })
                  }
                  rows={5}
                  className="admin-job-input resize-none"
                  placeholder="Enter complete job details..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setModalJob(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs"
                >
                  {modalJob.id ? 'Update Job' : 'Save Job'}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-job-input {
          width: 100%;
          margin-top: 6px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgb(51 65 85);
          background: rgb(15 23 42);
          color: rgb(241 245 249);
          outline: none;
          font-size: 13px;
        }

        .admin-job-input:focus {
          border-color: rgb(245 158 11);
        }
      `}</style>

    </div>
  );
};






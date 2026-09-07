import React, { useEffect, useState } from 'react';
import { CheckCircle2, Edit3, GraduationCap, Power, Save, X } from 'lucide-react';
import { adminStore } from './adminStore';
import { AdminServiceRecord } from './AdminTypes';

interface AdminEducationServicesProps {
  type: 'admission' | 'scholarship';
  darkMode?: boolean;
}

const SERVICE_CONFIG = {
  admission: [
    {
      title: '+2 Admission',
      fee: 'Rs 230',
      description: '+2 admission application assistance',
    },
    {
      title: '+3 Admission',
      fee: 'Rs 330',
      description: '+3 admission application assistance',
    },
    {
      title: 'Nursing Admission',
      fee: 'Rs 30',
      description: 'Nursing admission processing assistance',
    },
    {
      title: 'Computer Courses',
      fee: 'Rs 30',
      description: 'Computer course admission processing assistance',
    },
  ],
  scholarship: [
    {
      title: 'Scholarship',
      fee: 'Rs 30',
      description: 'Scholarship application processing assistance',
    },
  ],
} as const;

export const AdminEducationServices: React.FC<AdminEducationServicesProps> = ({
  type,
  darkMode = true,
}) => {
  const [services, setServices] = useState<AdminServiceRecord[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [fee, setFee] = useState('');

  const config = SERVICE_CONFIG[type];

  const loadServices = () => {
    const all = adminStore.getServices();

    const result = config.map((item, index) => {
      const existing = all.find(
        (s) => s.title.trim().toLowerCase() === item.title.trim().toLowerCase()
      );

      if (existing) return existing;

      const newService: AdminServiceRecord = {
        id: `SVC-${type.toUpperCase()}-${index + 1}`,
        title: item.title,
        category: type === 'admission' ? 'Admission' : 'Scholarship',
        description: item.description,
        iconName: 'GraduationCap',
        processingDays: 1,
        fee: item.fee,
        enabled: true,
        totalSubmissions: 0,
        createdDate: new Date().toISOString(),
      };

      adminStore.saveService(newService);
      return newService;
    });

    setServices(result);
  };

  useEffect(() => {
    loadServices();
  }, [type]);

  const toggleStatus = (service: AdminServiceRecord) => {
    adminStore.toggleServiceStatus(service.id);
    loadServices();
  };

  const startEdit = (service: AdminServiceRecord) => {
    setEditing(service.id);
    setFee(service.fee.replace('Rs ', '').trim());
  };

  const saveFee = (service: AdminServiceRecord) => {
    const cleanFee = fee.trim();

    if (!cleanFee) return;

    adminStore.saveService({
      ...service,
      fee: cleanFee.startsWith('Rs ') ? cleanFee : `Rs ${cleanFee}`,
    });

    setEditing(null);
    setFee('');
    loadServices();
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-600/10 text-blue-500">
            <GraduationCap size={28} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              {type === 'admission' ? 'Admission Services' : 'Scholarship Services'}
            </h1>
            <p className="text-sm opacity-60 mt-1">
              Manage {type === 'admission' ? 'admission' : 'scholarship'} services and processing charges.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className={`rounded-2xl border p-5 ${
              darkMode
                ? 'bg-slate-900/70 border-slate-800'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{service.title}</h3>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      service.enabled
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}
                  >
                    {service.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <p className="text-sm opacity-60 mt-1">
                  {service.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {editing === service.id ? (
                  <>
                    <div className="flex items-center">
                      <span className="px-3 py-2 border border-r-0 rounded-l-lg opacity-70">
                        Rs 
                      </span>
                      <input
                        value={fee.replace('Rs ', '')}
                        onChange={(e) => setFee(e.target.value)}
                        className="w-24 px-3 py-2 rounded-r-lg border bg-transparent outline-none"
                        inputMode="numeric"
                      />
                    </div>

                    <button
                      onClick={() => saveFee(service)}
                      className="p-2 rounded-lg bg-emerald-600 text-white"
                      title="Save"
                    >
                      <Save size={18} />
                    </button>

                    <button
                      onClick={() => {
                        setEditing(null);
                        setFee('');
                      }}
                      className="p-2 rounded-lg bg-slate-600 text-white"
                      title="Cancel"
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-xl font-bold">
                      {service.fee}
                    </div>

                    <button
                      onClick={() => startEdit(service)}
                      className="p-2 rounded-lg border opacity-80 hover:opacity-100"
                      title="Edit Fee"
                    >
                      <Edit3 size={18} />
                    </button>

                    <button
                      onClick={() => toggleStatus(service)}
                      className={`p-2 rounded-lg ${
                        service.enabled
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}
                      title={service.enabled ? 'Disable' : 'Enable'}
                    >
                      <Power size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-current/10 flex items-center gap-2 text-xs opacity-60">
              <CheckCircle2 size={15} />
              Processing charge: {service.fee}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


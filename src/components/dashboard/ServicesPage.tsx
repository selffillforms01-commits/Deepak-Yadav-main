import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Award,
  FileCheck,
  Briefcase,
  ArrowLeft,
  Lock,
  ShieldAlert,
  UserCheck,
  ArrowRight,
  X,
  User,
  Users,
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Building2,
  MapPin,
  Filter,
  Check,
  Plus,
  Trash2,
  Building,
  CheckSquare,
  Info,
  PhoneCall,
  FileText
} from 'lucide-react';
import { DashboardTab, UserProfile } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { calculateOverallProfileCompletion } from '../../utils/profileChecker';
import { adminStore } from '../admin/adminStore';
import { addServiceRequestToFirestore } from '../../lib/firestoreService';
import { ResumeBuilder } from './ResumeBuilder';

export type ServicesMainView =
  | 'main'
  | 'admission'
  | 'scholarship'
  | 'certificates'
  | 'jobs'
    | 'resume';
  

interface ServicesPageProps {
  user?: UserProfile;
  currentView?: ServicesMainView;
  onViewChange?: (view: ServicesMainView) => void;
  onBack?: () => void;
  onNavigateTab?: (tab: DashboardTab) => void;
}

const isSffServiceEnabled = (title: string): boolean => {
  const service = adminStore.getServices().find(
    (s) => s.title.trim().toLowerCase() === title.trim().toLowerCase()
  );
  return service?.enabled !== false;
};
export const ServicesPage: React.FC<ServicesPageProps> = ({ 
  user, 
  currentView, 
  onViewChange,
  onBack,
  onNavigateTab
}) => {
  const { t } = useLanguage();
  const [internalView, setInternalView] = useState<ServicesMainView>('main');
  const [showLockModal, setShowLockModal] = useState(false);
  const [adminServices, setAdminServices] = useState(() => adminStore.getServices());
  const [adminJobs, setAdminJobs] = useState(() => adminStore.getJobs());
const [serviceUnavailableMessage, setServiceUnavailableMessage] = useState<string | null>(null);


  useEffect(() => {
    const updateServices = () => {
      setAdminServices(adminStore.getServices());
      setAdminJobs(adminStore.getJobs());
    };
    updateServices();
    const unsubscribe = adminStore.subscribe(updateServices);
    return () => unsubscribe();
  }, []);

  // Modal State for Admission Flow (+2 & +3 Admission)
  const [admissionModal, setAdmissionModal] = useState<{
    isOpen: boolean;
    title: '+2 Admission' | '+3 Admission' | '';
    fee: number;
    step: 'select_applicant' | 'declaration' | 'payment_self' | 'coming_soon_other' | 'payment_success';
    applicantType?: 'Self' | 'Other';
    otherApplicantName?: string;
    otherApplicantMobile?: string;
    gender?: 'Male' | 'Female';
    caste?: 'General' | 'OBC' | 'SC' | 'ST';
    isSelfDeclared?: boolean;
    utrNumber?: string;
    isPaying?: boolean;
  }>({
    isOpen: false,
    title: '',
    fee: 0,
    step: 'select_applicant',
    applicantType: 'Self',
    otherApplicantName: '',
    otherApplicantMobile: '',
    isSelfDeclared: false,
    utrNumber: '',
    isPaying: false,
  });

  // Modal State for 30 Min SFF Team Callback Message (Nursing, Computer Courses, ITI, Certificates, Jobs, etc)
  const [jobCategory, setJobCategory] = useState<'govt' | 'private'>('govt');

  const [sffCallModal, setSffCallModal] = useState<{
    isOpen: boolean;
    serviceName: string;
    amount?: number;
    step: 'select_applicant' | 'job_details' | 'declaration' | 'payment' | 'success';
    applicantType?: 'Self' | 'Other';
    otherApplicantName?: string;
    otherApplicantMobile?: string;
    gender?: 'Male' | 'Female';
    caste?: 'General' | 'OBC' | 'SC' | 'ST';
    isSelfDeclared?: boolean;
    utrNumber?: string;
    isPaying?: boolean;
  }>({
    isOpen: false,
    serviceName: '',
    amount: 30,
    step: 'select_applicant',
    applicantType: 'Self',
    otherApplicantName: '',
    otherApplicantMobile: '',
    isSelfDeclared: false,
    utrNumber: '',
    isPaying: false,
  });

  const profileCompletion = calculateOverallProfileCompletion(user);
  const isUnlocked = profileCompletion.isServicesUnlocked;
  const completionPercentage = profileCompletion.totalPercentage;

  const activeView = currentView !== undefined ? currentView : internalView;

  const changeView = (v: ServicesMainView) => {
    if (onViewChange) {
      onViewChange(v);
    } else {
      setInternalView(v);
    }
  };

  const handleBackAction = () => {
    if (onBack) {
      onBack();
    } else {
      changeView('main');
    }
  };

  // CATEGORY CLICK HANDLER
  const handleCategoryClick = (catId: string) => {
    if (catId === 'admission') {
      changeView('admission');
    } else if (catId === 'scholarship') {
      changeView('scholarship');
    } else if (catId === 'certificates') {
      changeView('certificates');
    } else if (catId === 'jobs') {
      changeView('jobs');
    } else if (catId === 'resume') {
      changeView('resume');
    }
  };

  const goToProfile = () => {
    setShowLockModal(false);
    if (onNavigateTab) {
      onNavigateTab('profile');
    }
  };

  return (
    <>
      <AnimatePresence>
        {serviceUnavailableMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={() => setServiceUnavailableMessage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-600 text-2xl">
                !
              </div>

              <h2 className="text-xl font-black text-slate-900">
                Service Not Available Today
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                This service is currently unavailable. Please try again later.
              </p>

              <button
                type="button"
                onClick={() => setServiceUnavailableMessage(null)}
                className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6 pb-20 w-full max-w-4xl mx-auto">
      {/* SERVICE ACCESS & PROFILE COMPLETION ADVISORY BANNER (NON-BLOCKING) */}
      {completionPercentage < 80 ? (
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/5 to-amber-500/10 border border-amber-400/80 dark:border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  Profile Recommendation ({completionPercentage}% / 80% Target)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/90 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[10px] font-black border border-amber-300 dark:border-amber-700">
                  Services Active & Unlocked
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                Please complete 80%+ of your profile for faster auto-fill and instant document verification. You can still access and use all services anytime!
              </p>
            </div>
          </div>
          <button
            onClick={goToProfile}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer self-stretch sm:self-auto justify-center"
          >
            <span>Complete Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className={activeView === 'main' ? "bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl p-4 px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200 text-xs font-bold shadow-xs" : "hidden"}>
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="font-extrabold text-sm block">Profile Ready & All Services Active</span>
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-normal">
                Profile is {completionPercentage}% complete! Auto-fill and instant service application work seamlessly.
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-[11px] font-black border border-emerald-300 dark:border-emerald-700 shrink-0">
            100% READY
          </span>
        </div>
      )}

      {/* SUB-VIEW HEADER TITLE */}
      {activeView !== 'main' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl"></span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 capitalize">
                {t(`services.${activeView}`, activeView)}
              </h2>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {t('services.listSubtitle', 'List of available services')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MAIN VIEW: EXACTLY 5 CATEGORIES IN SPECIFIED 3-ROW LAYOUT    */}
      {/* ------------------------------------------------------------- */}
      {activeView === 'main' && (
        <div className="space-y-4 sm:space-y-6 pt-2">
          {/* ROW 1: [ Admission ] [ Scholarship ] */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* 1. Admission */}
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategoryClick('admission')}
              className="bg-white border border-slate-200 hover:border-[#0B3B8C] rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex flex-row items-center h-22 group relative overflow-hidden"
            >
              <div className="flex items-center justify-center shrink-0">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-[#0B3B8C] group-hover:text-white transition-colors">
                  <GraduationCap className="w-6 h-6" />
                </div>
                
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0B3B8C] transition-colors">
                  {t('services.admission', 'Admission')}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  {t('services.admissionSub', 'School & College Admission')}
                </p>
              </div>
            </motion.button>

            {/* 2. Scholarship */}
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategoryClick('scholarship')}
              className="bg-white border border-slate-200 hover:border-[#0B3B8C] rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex flex-row items-center h-22 group relative overflow-hidden"
            >
              <div className="flex items-center justify-center shrink-0">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Award className="w-6 h-6" />
                </div>
                
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                  {t('services.scholarship', 'Scholarship')}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  {t('services.scholarshipSub', 'Scholarship & Stipend Portal')}
                </p>
              </div>
            </motion.button>
          </div>

          {/* ROW 2: [ Certificates ] [ Jobs ] */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* 3. Certificates */}
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategoryClick('certificates')}
              className="bg-white border border-slate-200 hover:border-[#0B3B8C] rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex flex-row items-center h-22 group relative overflow-hidden"
            >
              <div className="flex items-center justify-center shrink-0">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <FileCheck className="w-6 h-6" />
                </div>
                
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {t('services.certificates', 'Certificates')}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  {t('services.certificatesSub', 'Income, Caste, Residence & Birth')}
                </p>
              </div>
            </motion.button>

            {/* 4. Jobs */}
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategoryClick('jobs')}
              className="bg-white border border-slate-200 hover:border-[#0B3B8C] rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex flex-row items-center h-22 group relative overflow-hidden"
            >
              <div className="flex items-center justify-center shrink-0">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Briefcase className="w-6 h-6" />
                </div>
                
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                  {t('services.jobs', 'Jobs')}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  {t('services.jobsSub', 'Govt & Private Recruitment')}
                </p>
              </div>
            </motion.button>

            {/* 5. My Resume */}
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategoryClick('resume')}
              className="bg-white border border-slate-200 hover:border-[#0B3B8C] rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex flex-row items-center h-22 group relative overflow-hidden"
            >
              <div className="flex items-center justify-center shrink-0">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B3B8C] flex items-center justify-center group-hover:bg-[#0B3B8C] group-hover:text-white transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0B3B8C] transition-colors">
                  My Resume
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  Create your resume automatically from your profile
                </p>
              </div>
            </motion.button>
          </div>
        </div>
      )}
      
      {/* ------------------------------------------------------------- */}
      {/* CERTIFICATES SUB-PAGE: DYNAMIC SERVICES MANAGED BY ADMIN      */}
      {/* ------------------------------------------------------------- */}
      {activeView === 'certificates' && (
        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {adminServices
              .filter((s) => s.enabled !== false && s.title.trim().toLowerCase() !== 'computer courses')
              .map((service, index) => {
                const numMatch = service.fee ? service.fee.match(/\d+/) : null;
                const numericAmount = numMatch ? parseInt(numMatch[0], 10) : 30;
                const displayFee = service.fee
                  ? service.fee.startsWith('?')
                    ? service.fee
                    : `Rs ${service.fee}`
                  : 'Rs 30';

                // Pick friendly emoji icon based on title/category
                let icon = '';
                const lowerTitle = service.title.toLowerCase();
                if (lowerTitle.includes('pan')) icon = '';
                else if (lowerTitle.includes('driving') || lowerTitle.includes('license')) icon = '';
                else if (lowerTitle.includes('character') || lowerTitle.includes('police')) icon = '';
                else if (lowerTitle.includes('employment') || lowerTitle.includes('job')) icon = '';
                else if (lowerTitle.includes('birth') || lowerTitle.includes('baby')) icon = '';
                else if (lowerTitle.includes('passport')) icon = '';
                else if (lowerTitle.includes('labour') || lowerTitle.includes('worker')) icon = '';
                else if (lowerTitle.includes('ews') || lowerTitle.includes('caste')) icon = '';

                return (
                  <motion.div
                    key={service.id || index}
                    whileHover={{ y: -2 }}
                    onClick={() =>
                      setSffCallModal({
                        isOpen: true,
                        serviceName: service.title,
                        amount: numericAmount,
                        step: 'select_applicant',
                        applicantType: 'Self',
                        otherApplicantName: '',
                        otherApplicantMobile: '',
                        isSelfDeclared: false,
                        utrNumber: '',
                        isPaying: false,
                      })
                    }
                    className={`bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs transition-all flex items-center justify-between group hover:border-emerald-600 hover:shadow-md cursor-pointer`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                          {service.title}
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                          Processing Charge: {displayFee}/-
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold text-[10px] border border-emerald-200 shrink-0">
                      Pay {displayFee}
                    </span>
                  </motion.div>
                );
              })}
          </div>
        </div>
      )}
      {/* ------------------------------------------------------------- */}
      {/* ADMISSION SUB-PAGE: EXACTLY THREE ADMISSION OPTIONS      */}
      {/* ------------------------------------------------------------- */}
      {activeView === 'admission' && (
        <div className="space-y-6 pt-2">
          {/* EXACTLY 5 admission */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Option 1: +2 Admission */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => { if (!isSffServiceEnabled('+2 Admission')) { setServiceUnavailableMessage('Service Not Available Today'); return; } setAdmissionModal({ isOpen: true, title: '+2 Admission', fee: 230, step: 'select_applicant', applicantType: 'Self', otherApplicantName: '', otherApplicantMobile: '', isSelfDeclared: false, utrNumber: '', isPaying: false })}}
              className={`bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs transition-all flex items-center justify-between group hover:border-emerald-600 hover:shadow-md cursor-pointer`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                  <span className="text-xs font-black">12</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    +2 Admission
                  </h3>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                    Fee: Rs 230/-
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-extrabold text-[10px] border border-amber-200 shrink-0">
                Apply Rs 230
              </span>
            </motion.div>

            {/* Option 2: +3 Admission */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => { if (!isSffServiceEnabled('+3 Admission')) { setServiceUnavailableMessage('Service Not Available Today'); return; } setAdmissionModal({ isOpen: true, title: '+3 Admission', fee: 330, step: 'select_applicant', applicantType: 'Self', otherApplicantName: '', otherApplicantMobile: '', isSelfDeclared: false, utrNumber: '', isPaying: false })}}
              className={`bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs transition-all flex items-center justify-between group hover:border-emerald-600 hover:shadow-md cursor-pointer`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                  <span className="text-xs font-black">13</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    +3 Admission
                  </h3>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                    Fee: Rs 330/-
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-extrabold text-[10px] border border-blue-200 shrink-0">
                Apply Rs 330
              </span>
            </motion.div>

            {/* Option 3: Nursing Admission */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => { if (!isSffServiceEnabled('Nursing Admission')) { setServiceUnavailableMessage('Service Not Available Today'); return; } setSffCallModal({ isOpen: true, serviceName: 'Nursing Admission', amount: 30, step: 'select_applicant', applicantType: 'Self', otherApplicantName: '', otherApplicantMobile: '', isSelfDeclared: false, utrNumber: '', isPaying: false })}}
              className={`bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs transition-all flex items-center justify-between group hover:border-emerald-600 hover:shadow-md cursor-pointer`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                  <span className="text-xs font-black">N</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    Nursing Admission
                  </h3>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                    Processing Charge: Rs 30/-
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold text-[10px] border border-emerald-200 shrink-0">
                Pay Rs 30
              </span>
            </motion.div>

            {/* Option 4: Computer Courses */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => { if (!isSffServiceEnabled('Computer Courses')) { setServiceUnavailableMessage('Service Not Available Today'); return; } setSffCallModal({ isOpen: true, serviceName: 'Computer Courses', amount: 30, step: 'select_applicant', applicantType: 'Self', otherApplicantName: '', otherApplicantMobile: '', isSelfDeclared: false, utrNumber: '', isPaying: false })}}
              className={`bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs transition-all flex items-center justify-between group hover:border-emerald-600 hover:shadow-md cursor-pointer`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                  <span className="text-xs font-black">CC</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    Computer Courses
                  </h3>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                    Processing Charge: Rs 30/-
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-extrabold text-[10px] border border-blue-200 shrink-0">
                Pay Rs 30
              </span>
            </motion.div>

            {/* Option 5: ITI  */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => { if (!isSffServiceEnabled('ITI')) { setServiceUnavailableMessage('Service Not Available Today'); return; } setSffCallModal({ isOpen: true, serviceName: 'ITI', amount: 30, step: 'select_applicant', applicantType: 'Self', otherApplicantName: '', otherApplicantMobile: '', isSelfDeclared: false, utrNumber: '', isPaying: false })}}
              className={`bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs transition-all flex items-center justify-between group hover:border-emerald-600 hover:shadow-md cursor-pointer`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                  <span className="text-xs font-black">ITI</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    ITI
                  </h3>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                    Processing Charge: Rs 30/-
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold text-[10px] border border-emerald-200 shrink-0">
                Pay Rs 30
              </span>
            </motion.div>
          </div>
        </div>
      )}
      {/* ------------------------------------------------------------- */}
      {/* SCHOARSHIP SUB-PAGE: EXACTLY ONE SCHOLARSHIP OPTIONS      */}
      {/* ------------------------------------------------------------- */}
      {activeView === 'scholarship' && (
        <div className="space-y-6 pt-2">
          {/* EXACTLY 1 scholarship */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Option 1: Scholarship */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => {
  if (!isSffServiceEnabled('Scholarship')) {
    setServiceUnavailableMessage('Service Not Available Today');
    return;
  }

  setSffCallModal({
    isOpen: true,
    serviceName: 'Scholarship',
    amount: 30,
    step: 'select_applicant',
    applicantType: 'Self',
    otherApplicantName: '',
    otherApplicantMobile: '',
    isSelfDeclared: false,
    utrNumber: '',
    isPaying: false
  });
}}
              className={`bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs transition-all flex items-center justify-between group hover:border-emerald-600 hover:shadow-md cursor-pointer`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                  
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    Scholarship
                  </h3>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                    Processing Charge: Rs 30/-
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold text-[10px] border border-emerald-200 shrink-0">
                Pay Rs 30
              </span>
            </motion.div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* JOB & RECRUITMENT SUB-PAGE: GOVT & PRIVATE JOBS             */}
      {/* ------------------------------------------------------------- */}
      {/* RESUME SUB-PAGE */}
      {activeView === 'resume' && (
        <ResumeBuilder user={user} />
      )}

      {activeView === 'jobs' && (
        <div className="space-y-5 pt-2">
          {/* Top 2 Category Switcher: Govt Jobs & Private Jobs */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setJobCategory('govt')}
              className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                jobCategory === 'govt'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span></span>
              <span>Govt Jobs (Government Jobs)</span>
            </button>

            <button
              onClick={() => setJobCategory('private')}
              className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                jobCategory === 'private'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span></span>
              <span>Private Jobs (Private Jobs)</span>
            </button>
          </div>

          {/* GOVT JOBS SECTION */}
          {jobCategory === 'govt' && (
            <div className="space-y-6">

              {/* ADMIN MANAGED CURRENT GOVERNMENT JOBS ONLY */}
              <div className="space-y-4">

                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span className="text-lg"></span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Current Government Jobs
                  </h3>
                </div>

                {adminJobs
                  .filter((job) => job.status === 'Active')
                  .filter(
                    (job) =>
                      job.category === 'Odisha Govt' ||
                      job.category === 'Central Govt'
                  )
                  .length === 0 ? (

                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center">
                    <FileText className="w-10 h-10 mx-auto text-slate-400 mb-3" />

                    <h4 className="text-sm font-black text-slate-700 dark:text-slate-200">
                      No Current Government Jobs
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      New job notifications will appear here when added by SFF.
                    </p>
                  </div>

                ) : (

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {adminJobs
                      .filter((job) => job.status === 'Active')
                      .filter(
                        (job) =>
                          job.category === 'Odisha Govt' ||
                          job.category === 'Central Govt'
                      )
                      .sort(
                        (a, b) =>
                          new Date(b.updatedDate || b.createdDate).getTime() -
                          new Date(a.updatedDate || a.createdDate).getTime()
                      )
                      .map((job) => (

                        <motion.div
                          key={job.id}
                          whileHover={{ y: -2 }}
                          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 rounded-2xl p-4 shadow-sm transition-all"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">
                              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                {job.title}
                              </h4>

                              <p className="text-[11px] font-bold text-purple-600 dark:text-purple-400 mt-1">
                                {job.organization}
                              </p>
                            </div>

                            <span className="px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[9px] font-black shrink-0">
                              {job.category}
                            </span>

                          </div>

                          <div className="mt-3 space-y-1.5 text-[11px]">

                            <p className="text-slate-600 dark:text-slate-300">
                              <strong>Qualification:</strong>{' '}
                              {job.qualification}
                            </p>

                            {job.ageLimit && (
                              <p className="text-slate-600 dark:text-slate-300">
                                <strong>Age Limit:</strong>{' '}
                                {job.ageLimit}
                              </p>
                            )}

                            {job.salary && (
                              <p className="text-slate-600 dark:text-slate-300">
                                <strong>Salary:</strong>{' '}
                                {job.salary}
                              </p>
                            )}

                            {job.applicationFee && (
                              <p className="text-slate-600 dark:text-slate-300">
                                <strong>Application Fee:</strong>{' '}
                                {job.applicationFee}
                              </p>
                            )}

                            {job.startDate && (
                              <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                                <strong>Application Start Date:</strong>{' '}
                                {job.startDate ? new Date(job.startDate + 'T00:00:00').toLocaleDateString('en-GB') : ''}
                              </p>
                            )}

                            <p className="text-red-600 dark:text-red-400 font-bold">
                              <strong>Last Date:</strong>{' '}
                              {job.lastDate ? new Date(job.lastDate + 'T00:00:00').toLocaleDateString('en-GB') : ''}
                            </p>

                          </div>

                          {job.requiredDocuments && job.requiredDocuments.length > 0 && (
                            <div className="mt-3">
                              <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 mb-1">
                                Required Documents:
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {job.requiredDocuments.map((doc) => (
                                  <span
                                    key={doc}
                                    className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700"
                                  >
                                    {doc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {job.description && (
                            <p className="mt-3 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                              {job.description}
                            </p>
                          )}

                          <div className="mt-4 flex gap-2">

                            {job.applyLink && (
                              <a
                                href={job.applyLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-center px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-black transition-all"
                              >
                                Official Apply
                              </a>
                            )}

                            <button
                              onClick={() =>
                                setSffCallModal({
                                  isOpen: true,
                                  serviceName: `${job.title} Application`,
                                  amount: 40,
                                  step: 'job_details',
                                  applicantType: 'Self',
                                  otherApplicantName: '',
                                  otherApplicantMobile: '',
                                  isSelfDeclared: false,
                                  utrNumber: '',
                                  isPaying: false
                                })
                              }
                              className="flex-1 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-black transition-all"
                            >
                              Apply by SFF 40
                            </button>

                          </div>

                        </motion.div>

                      ))}

                  </div>

                )}

              </div>

            </div>
          )}

          {/* PRIVATE JOBS SECTION */}
          {jobCategory === 'private' && (
            <div className="space-y-4">
              {/* Admin Notice Banner */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0 font-bold">
                  
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-amber-950 dark:text-amber-200">
                    Private Jobs Managed Manually by SFF Menmber
                  </h4>
                  <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed font-medium">
                    Private job listings are managed and updated manually by SFF. 
                  </p>
                </div>
              </div>

              {/* Clean Empty / Admin Pending State */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center space-y-4 shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto text-2xl font-bold border border-purple-200 dark:border-purple-800">
                  
                </div>

                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    No Private Jobs Listed Currently
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">

                  </p>
                </div>

                <button
                  onClick={() => setSffCallModal({ isOpen: true, serviceName: 'Private Job Enquiry', amount: 40, step: 'select_applicant', applicantType: 'Self', otherApplicantName: '', otherApplicantMobile: '', isSelfDeclared: false, utrNumber: '', isPaying: false })}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Enquire for Private Jobs (40 Service Charge)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LOCK MODAL DIALOG */}
      <AnimatePresence>
        {showLockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-white space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">Service Access Locked</h3>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">80% Profile Completion Required</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLockModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold block text-amber-900 dark:text-amber-200 text-xs">Current Completion Status</span>
                    <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300">
                      Completed: {profileCompletion.completedSectionsCount} / 5 Sections ({completionPercentage}%)
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-900 font-mono font-black text-xs">
                    {completionPercentage}%
                  </span>
                </div>

                <p>
                  To prevent incomplete government application submissions, Self Fill Forms requires at least <strong>80% profile completion</strong> (4 out of 5 profile sections: Personal, Address, Education, Bank, Other Details) before services become accessible.
                </p>

                {/* 5-Section Checklist Status */}
                <div className="space-y-1.5 pt-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">Required Sections Progress:</div>
                  <div className="grid grid-cols-1 gap-1 text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                      <span>1. Personal Information (20%)</span>
                      <span>{profileCompletion.sections.personal.isComplete ? '? Done' : '? Missing'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                      <span>2. Address Information (20%)</span>
                      <span>{profileCompletion.sections.address.isComplete ? '? Done' : '? Missing'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                      <span>3. Education Details (20%)</span>
                      <span>{profileCompletion.sections.education.isComplete ? '? Done' : '? Missing'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                      <span>4. Bank Details (20%)</span>
                      <span>{profileCompletion.sections.bank.isComplete ? '? Done' : '? Missing'}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                      <span>5. Other Details (20%)</span>
                      <span>{profileCompletion.sections.certificates.isComplete ? '? Done' : '? Missing'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowLockModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={goToProfile}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#0B3B8C] hover:bg-blue-800 text-white font-extrabold text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Complete Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ADMISSION APPLICATION DIALOGUE & PAYMENT MODAL (+2 & +3 ADMISSION) */}
      <AnimatePresence>
        {admissionModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs select-none overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md my-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-white space-y-5 max-h-[88vh] overflow-y-auto"
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0B3B8C] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {admissionModal.title} Portal
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Application Fee: <span className="text-emerald-600 dark:text-emerald-400 font-bold">Rs {admissionModal.fee}/-</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAdmissionModal(prev => ({ ...prev, isOpen: false }))}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* STEP 1: APPLICANT TYPE SELECTION (Self / Other) */}
              {admissionModal.step === 'select_applicant' && (
                <div className="space-y-4">
                  <div className="space-y-1 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#0B3B8C] dark:text-blue-300 font-extrabold text-[10px] uppercase tracking-wider">
                      Step 1/3: Select Applicant
                    </span>
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 pt-1">
                      Choose Applicant Category
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Whose admission formorm would you like to apply today?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-1">
                    {/* OPTION 1: SELF */}
                    <button
                      onClick={() => setAdmissionModal(prev => ({ ...prev, applicantType: 'Self', isSelfDeclared: false, step: 'declaration' }))}
                      className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-[#0B3B8C] dark:border-slate-700 dark:hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 dark:bg-slate-700/50 dark:hover:bg-blue-950/30 transition-all text-left flex items-center justify-between group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-[#0B3B8C] dark:text-blue-300 flex items-center justify-center font-bold shrink-0 group-hover:bg-[#0B3B8C] group-hover:text-white transition-colors">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-black text-sm text-slate-900 dark:text-white group-hover:text-[#0B3B8C] dark:group-hover:text-blue-400 transition-colors">
                            1. Self
                          </div>
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            Apply using stored profile. Fee: <strong className="text-emerald-600 dark:text-emerald-400">Rs {admissionModal.fee}/-</strong>
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-[#0B3B8C] text-white font-extrabold text-xs shadow-xs shrink-0">
                        Select
                      </span>
                    </button>

                    {/* OPTION 2: OTHER */}
                    <button
                      onClick={() => setAdmissionModal(prev => ({ ...prev, applicantType: 'Other', isSelfDeclared: false, step: 'declaration' }))}
                      className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-amber-500 dark:border-slate-700 dark:hover:border-amber-500 bg-slate-50 hover:bg-amber-50/50 dark:bg-slate-700/50 dark:hover:bg-amber-950/30 transition-all text-left flex items-center justify-between group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold shrink-0 group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-black text-sm text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                            2. Other Candidate
                          </div>
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            Apply for family, friend or other candidate
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-extrabold text-xs border border-amber-300 dark:border-amber-700 shrink-0">
                        Select
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* JOB DETAILS: GENDER + CASTE */}
              {sffCallModal.step === 'job_details' && (
                <div className="space-y-5 text-left pt-2">

                  <div className="text-center space-y-2">
                    <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 font-extrabold text-[10px] uppercase tracking-wider">
                      Candidate Details
                    </span>

                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {sffCallModal.serviceName}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Please select your gender and caste
                    </p>
                  </div>

                  {/* GENDER */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                      Gender?
                    </label>

                    <select
                      value={sffCallModal.gender || ''}
                      onChange={(e) => {
                        const gender = e.target.value as 'Male' | 'Female';
                        const caste = sffCallModal.caste;

                        setSffCallModal(prev => ({
                          ...prev,
                          gender,
                          amount:
                            gender === 'Male' &&
                            (caste === 'General' || caste === 'OBC')
                              ? 140
                              : 40
                        }));
                      }}
                      className="w-full px-3.5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="" disabled>Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  {/* CASTE */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                      Caste?
                    </label>

                    <select
                      value={sffCallModal.caste || ''}
                      onChange={(e) => {
                        const caste = e.target.value as 'General' | 'OBC' | 'SC' | 'ST';
                        const gender = sffCallModal.gender;

                        setSffCallModal(prev => ({
                          ...prev,
                          caste,
                          amount:
                            gender === 'Male' &&
                            (caste === 'General' || caste === 'OBC')
                              ? 140
                              : 40
                        }));
                      }}
                      className="w-full px-3.5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="" disabled>Select Caste</option>
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                    </select>
                  </div>

                  {/* FEE */}
                  {sffCallModal.gender && sffCallModal.caste && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        SFF Processing Charge
                      </p>

                      <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                        Rs {sffCallModal.amount || 40}/-
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() =>
                        setSffCallModal(prev => ({
                          ...prev,
                          step: 'select_applicant'
                        }))
                      }
                      className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs"
                    >
                      Back
                    </button>

                    <button
                      disabled={!sffCallModal.gender || !sffCallModal.caste}
                      onClick={() =>
                        setSffCallModal(prev => ({
                          ...prev,
                          step: 'declaration'
                        }))
                      }
                      className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  </div>

                </div>
              )}
              {/* STEP 2: DECLARATION CHECKBOX */}
              {admissionModal.step === 'declaration' && (
                <div className="space-y-4">
                  <div className="space-y-1 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] uppercase tracking-wider border border-amber-300 dark:border-amber-800">
                      Step 2/3: Self Declaration
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white pt-1">
                      Self Declaration Checkbox
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Please accept the declaration before proceeding
                    </p>
                  </div>

                  {/* IF SELF APPLICANT */}
                  {admissionModal.applicantType === 'Self' ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 rounded-2xl space-y-3 shadow-2xs">
                      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                        <FileCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Applicant Declaration (Self)</span>
                      </div>
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={admissionModal.isSelfDeclared || false}
                          onChange={(e) => setAdmissionModal(prev => ({ ...prev, isSelfDeclared: e.target.checked }))}
                          className="w-5 h-5 mt-0.5 rounded-lg text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                        />
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 leading-relaxed">
                          "I am voluntarily getting my online form filled through SFF (Self Fill Forms)."
                        </span>
                      </label>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-t border-amber-200 dark:border-amber-800/80 pt-2">
                         This {admissionModal.title} form will be filled using your stored profile details.
                      </p>
                    </div>
                  ) : (
                    /* IF OTHER APPLICANT */
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                          Candidate Full Name *
                        </label>
                        <input
                          type="text"
                          placeholder="Enter candidate's full name"
                          value={admissionModal.otherApplicantName || ''}
                          onChange={(e) => setAdmissionModal(prev => ({ ...prev, otherApplicantName: e.target.value }))}
                          className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3B8C] font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                          Candidate Mobile Number
                        </label>
                        <input
                          type="text"
                          placeholder="10-digit mobile number"
                          value={admissionModal.otherApplicantMobile || ''}
                          onChange={(e) => setAdmissionModal(prev => ({ ...prev, otherApplicantMobile: e.target.value }))}
                          className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3B8C] font-semibold"
                        />
                      </div>
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 rounded-2xl space-y-2">
                        <label className="flex items-start gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={admissionModal.isSelfDeclared || false}
                            onChange={(e) => setAdmissionModal(prev => ({ ...prev, isSelfDeclared: e.target.checked }))}
                            className="w-5 h-5 mt-0.5 rounded-lg text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                          />
                          <span className="text-xs font-black text-slate-900 dark:text-slate-100 leading-relaxed">
                            "I declare that I am getting this online form filled through SFF (Self Fill Forms) with the permission and consent of the candidate."
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* NAVIGATION BUTTONS */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setAdmissionModal(prev => ({ ...prev, step: 'select_applicant' }))}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                       Back
                    </button>
                    <button
                      disabled={!admissionModal.isSelfDeclared || (admissionModal.applicantType === 'Other' && !admissionModal.otherApplicantName?.trim())}
                      onClick={() => setAdmissionModal(prev => ({ ...prev, step: 'payment_self' }))}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT MODAL */}
              {admissionModal.step === 'payment_self' && (
                <div className="space-y-4">
                  {/* APPLICANT TYPE BADGE */}
                  <div className="flex items-center justify-between p-2.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>Applicant Category:</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#0B3B8C] text-white font-extrabold text-[11px]">
                      {admissionModal.applicantType === 'Self' ? 'Self' : `Other (${admissionModal.otherApplicantName})`}
                    </span>
                  </div>

                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-center shrink-0">
                      <span className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-300">
                        {admissionModal.title} Fee Breakdown
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 font-mono font-black text-xs">
                        Rs {admissionModal.fee}/-
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1 border-t border-emerald-200/80 dark:border-emerald-800/80 pt-2 font-medium">
                      <div className="flex justify-between">
                        <span>Admission Form Charge ({admissionModal.title}):</span>
                        <span className="font-bold">?{admissionModal.fee - 30}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service & Auto-Fill Processing:</span>
                        <span className="font-bold">Rs 30</span>
                      </div>
                      <div className="flex justify-between font-black text-slate-900 dark:text-white pt-1 border-t border-emerald-200 dark:border-emerald-800 text-sm">
                        <span>Total Payable Amount:</span>
                        <span className="text-emerald-700 dark:text-emerald-400">Rs {admissionModal.fee}/-</span>
                      </div>
                    </div>
                  </div>

                  {/* UPI QR PAYMENT - ADMISSION */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-emerald-500/5 border border-emerald-500/40 space-y-4">
                    <div className="flex items-center justify-center shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">[Info]</span>
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                          UPI QR Payment
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-mono text-[10px] font-bold rounded-full border border-emerald-500/30">
                        UPI
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                      QR scan karke payment karein. Payment ke baad UTR / Transaction ID enter karke submit karein.
                    </p>

                    <div className="flex justify-center">
                      <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-200">
                        <img
                          src="/payment/upi-qr.png"
                          alt="UPI Payment QR Code"
                          className="w-52 h-auto object-contain"
                        />
                      </div>
                    </div>

                    <div className="text-center text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Scan QR ? Pay Rs {admissionModal.fee}/- ? Enter UTR
                    </div>

                    <input
                      type="text"
                      value={admissionModal.utrNumber || ''}
                      onChange={(e) =>
                        setAdmissionModal(prev => ({
                          ...prev,
                          utrNumber: e.target.value.trim()
                        }))
                      }
                      placeholder="Enter UTR / Transaction ID"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <button
                      type="button"
                      disabled={admissionModal.isPaying || !(admissionModal.utrNumber || '').trim()}
                      onClick={async () => {
                        const utr = (admissionModal.utrNumber || '').trim();

                        if (!utr) {
                          alert('Please enter UTR / Transaction ID.');
                          return;
                        }

                        setAdmissionModal(prev => ({ ...prev, isPaying: true }));

                        try {
                          const userRecord = user || JSON.parse(localStorage.getItem('sff_user') || '{}');
                          const uId = userRecord.id || userRecord.userId || 'SFF-USER';
                          const uName =
                            admissionModal.applicantType === 'Other' && admissionModal.otherApplicantName
                              ? admissionModal.otherApplicantName
                              : (userRecord.fullName || userRecord.name || 'SFF User');
                          const uEmail = userRecord.email || 'user@selffillforms.in';
                          const uMobile =
                            admissionModal.applicantType === 'Other' && admissionModal.otherApplicantMobile
                              ? admissionModal.otherApplicantMobile
                              : (userRecord.mobileNumber || userRecord.phone || userRecord.mobile || '');

                          const fbUid = userRecord.uid || user?.uid || '';
                          const sffUid = userRecord.sffUserId || userRecord.userId || uId || '';
                          const amt = admissionModal.fee || 30;
                          const sTitle = admissionModal.title || 'College Admission (+2/+3)';

                          const formId = `FORM-${Date.now()}`;
                          const formNumber = `SFF-${Math.floor(100000 + Math.random() * 900000)}`;

                          adminStore.saveForm({
                            id: formId,
                            formNumber,
                            serviceId: 'admission-01',
                            serviceTitle: sTitle,
                            applicantId: uId,
                            applicantName: uName,
                            applicantEmail: uEmail,
                            applicantMobile: uMobile,
                            submissionDate: new Date().toISOString(),
                            status: 'Pending',
                            remarks: `UPI QR Payment submitted for verification. UTR: ${utr}. Category: ${admissionModal.applicantType}.`,
                            formData: {
                              applicantType: admissionModal.applicantType,
                              otherName: admissionModal.otherApplicantName,
                              feePaid: amt,
                              paymentMethod: 'UPI QR',
                              utrNumber: utr,
                              isSelfDeclared: true,
                            },
                          });

                          adminStore.saveTransaction({
                            id: `TXN-${Date.now()}`,
                            type: 'Credit',
                            amount: Number(amt),
                            category: 'Admission Fee',
                            description: `UPI QR Payment for "${sTitle}" from ${uName} (${uId})`,
                            applicantId: uId,
                            applicantName: uName,
                            applicantMobile: uMobile,
                            paymentMethod: 'UPI',
                            utrNumber: utr,
                            date: new Date().toISOString(),
                            status: 'Pending',
                            remarks: `UPI QR payment submitted for SFF verification. UTR: ${utr}`,
                          });

                          adminStore.saveNotification({
                            id: `NOTIF-PAY-${Date.now()}`,
                            title: `Payment Submitted: ${sTitle}`,
                            message: `Your UPI payment of ${amt}/- has been submitted with UTR ${utr}. Payment verification is pending.`,
                            notificationType: 'Application Status',
                            targetAudience: 'Selected Users',
                            targetMode: 'Single User',
                            targetValue: sffUid || uId,
                            priority: 'High',
                            sentDate: new Date().toISOString(),
                            status: 'Sent',
                            createdBy: 'UPI QR Payment',
                          });

                          adminStore.addLog(
                            'Form',
                            `UPI QR Payment ?${amt} submitted for ${sTitle}. UTR: ${utr}`
                          );

                          setAdmissionModal(prev => ({
                            ...prev,
                            isPaying: false,
                            step: 'payment_success'
                          }));
                        } catch (error) {
                          console.error('UPI QR payment submission error:', error);
                          setAdmissionModal(prev => ({ ...prev, isPaying: false }));
                          alert('Payment submission failed. Please try again.');
                        }
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {admissionModal.isPaying ? (
                        <span>Submitting Payment...</span>
                      ) : (
                        <span>Submit UTR & Payment</span>
                      )}
                    </button>
                  </div>

                    <button
                      onClick={() => setAdmissionModal(prev => ({ ...prev, step: 'declaration' }))}
                      className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                       Back
                       Back
                    </button>
                </div>
              )}

              {/* STEP 2B: SERVICE COMING SOON FOR OTHER */}
              {admissionModal.step === 'coming_soon_other' && (
                <div className="space-y-4 text-center py-2">
                  <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                    <Sparkles className="w-8 h-8 animate-bounce" />
                  </div>

                  <div className="space-y-1">
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 rounded-full text-[11px] font-black uppercase tracking-wider inline-block">
                      Coming Soon
                    </span>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white pt-1">
                      Service Coming Soon
                    </h4>
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                      Please enter the required details [Jobs]?
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-2xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    Applying for other candidates (+2 / +3 Admission) is currently under development. Please select the <strong>'Self ([Jobs] [Info] [Jobs])'</strong> option to complete your own admission application.
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setAdmissionModal(prev => ({ ...prev, step: 'select_applicant' }))}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#0B3B8C] hover:bg-blue-800 text-white font-extrabold text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
                    >
                      Back to Selection ([Jobs] [Info] [Jobs])
                    </button>
                    <button
                      onClick={() => setAdmissionModal(prev => ({ ...prev, isOpen: false }))}
                      className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2C: PAYMENT SUCCESSFUL */}
              {admissionModal.step === 'payment_success' && (
                <div className="space-y-4 text-center py-2">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">
                      Payment Successful!
                    </h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      Rs {admissionModal.fee}/- Payment Received for {admissionModal.title}
                    </p>
                  </div>

                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Your application request for <strong>{admissionModal.title}</strong> has been successfully registered. The automated form submission engine will process your details automatically.
                  </div>

                  <button
                    onClick={() => setAdmissionModal(prev => ({ ...prev, isOpen: false }))}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    Done & Close
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SFF TEAM 30 MIN CALLBACK NOTIFICATION MODAL (For All Services & Enquiries) */}
      <AnimatePresence>
        {sffCallModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs select-none overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md my-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-900 dark:text-white space-y-4 relative max-h-[88vh] overflow-y-auto text-center"
            >
              {/* Close Button */}
              <button
                onClick={() => setSffCallModal({ isOpen: false, serviceName: '', amount: 30, step: 'select_applicant', applicantType: 'Self', isSelfDeclared: false, utrNumber: '', isPaying: false })}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* STEP 1: APPLICANT SELECTION (1. Self, 2. Other) */}
              {sffCallModal.step === 'select_applicant' && (
                <div className="space-y-4 text-left pt-1">
                  <div className="text-center space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider">
                      Step 1/3: Choose Applicant
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white pt-1">
                      {sffCallModal.serviceName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Whose form are you applying for?u filling today?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-1">
                    {/* OPTION 1: SELF */}
                    <button
                      onClick={() => setSffCallModal(prev => ({ ...prev, applicantType: 'Self', isSelfDeclared: false, step: 'declaration' }))}
                      className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-emerald-600 dark:border-slate-700 dark:hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 dark:bg-slate-700/50 dark:hover:bg-emerald-950/30 transition-all text-left flex items-center justify-between group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-black text-sm text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            1. Self
                          </div>
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            Apply for yourself using stored profile
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-xs shrink-0">
                        Select
                      </span>
                    </button>

                    {/* OPTION 2: OTHER */}
                    <button
                      onClick={() => setSffCallModal(prev => ({ ...prev, applicantType: 'Other', isSelfDeclared: false, step: 'declaration' }))}
                      className="w-full p-4 rounded-2xl border-2 border-slate-200 hover:border-amber-500 dark:border-slate-700 dark:hover:border-amber-500 bg-slate-50 hover:bg-amber-50/50 dark:bg-slate-700/50 dark:hover:bg-amber-950/30 transition-all text-left flex items-center justify-between group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold shrink-0 group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-black text-sm text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                            2. Other Candidate
                          </div>
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            Apply for family, friend or other candidate
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-extrabold text-xs border border-amber-300 dark:border-amber-700 shrink-0">
                        Select
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* JOB DETAILS: GENDER + CASTE */}
              {sffCallModal.step === 'job_details' && (
                <div className="space-y-5 text-left pt-2">

                  <div className="text-center space-y-2">
                    <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 font-extrabold text-[10px] uppercase tracking-wider">
                      Candidate Details
                    </span>

                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {sffCallModal.serviceName}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Please select your gender and caste
                    </p>
                  </div>

                  {/* GENDER */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                      Gender?
                    </label>

                    <select
                      value={sffCallModal.gender || ''}
                      onChange={(e) => {
                        const gender = e.target.value as 'Male' | 'Female';
                        const caste = sffCallModal.caste;

                        setSffCallModal(prev => ({
                          ...prev,
                          gender,
                          amount:
                            gender === 'Male' &&
                            (caste === 'General' || caste === 'OBC')
                              ? 140
                              : 40
                        }));
                      }}
                      className="w-full px-3.5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="" disabled>Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  {/* CASTE */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                      Caste?
                    </label>

                    <select
                      value={sffCallModal.caste || ''}
                      onChange={(e) => {
                        const caste = e.target.value as 'General' | 'OBC' | 'SC' | 'ST';
                        const gender = sffCallModal.gender;

                        setSffCallModal(prev => ({
                          ...prev,
                          caste,
                          amount:
                            gender === 'Male' &&
                            (caste === 'General' || caste === 'OBC')
                              ? 140
                              : 40
                        }));
                      }}
                      className="w-full px-3.5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="" disabled>Select Caste</option>
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                    </select>
                  </div>

                  {/* FEE */}
                  {sffCallModal.gender && sffCallModal.caste && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        SFF Processing Charge
                      </p>

                      <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                        Rs {sffCallModal.amount || 40}/-
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() =>
                        setSffCallModal(prev => ({
                          ...prev,
                          step: 'select_applicant'
                        }))
                      }
                      className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs"
                    >
                      Back
                    </button>

                    <button
                      disabled={!sffCallModal.gender || !sffCallModal.caste}
                      onClick={() =>
                        setSffCallModal(prev => ({
                          ...prev,
                          step: 'declaration'
                        }))
                      }
                      className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  </div>

                </div>
              )}
              {/* STEP 2: DECLARATION CHECKBOX */}
              {sffCallModal.step === 'declaration' && (
                <div className="space-y-4 text-left pt-1">
                  <div className="text-center space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] uppercase tracking-wider border border-amber-300 dark:border-amber-800">
                      Step 2/3: Self Declaration
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white pt-1">
                      {sffCallModal.serviceName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Please accept the declaration before proceeding
                    </p>
                  </div>

                  {/* IF SELF APPLICANT */}
                  {sffCallModal.applicantType === 'Self' ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 rounded-2xl space-y-3 shadow-2xs">
                      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                        <FileCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Self Declaration</span>
                      </div>
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={sffCallModal.isSelfDeclared || false}
                          onChange={(e) => setSffCallModal(prev => ({ ...prev, isSelfDeclared: e.target.checked }))}
                          className="w-5 h-5 mt-0.5 rounded-lg text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                        />
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 leading-relaxed">
                          "I am voluntarily getting my online form filled through SFF (Self Fill Forms)."
                        </span>
                      </label>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-t border-amber-200 dark:border-amber-800/80 pt-2">
                         This form will be auto-filled using your stored profile details.
                      </p>
                    </div>
                  ) : (
                    /* IF OTHER APPLICANT */
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                          Candidate Full Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Deepak Yadav"
                          value={sffCallModal.otherApplicantName || ''}
                          onChange={(e) => setSffCallModal(prev => ({ ...prev, otherApplicantName: e.target.value }))}
                          className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                          Candidate Mobile Number
                        </label>
                        <input
                          type="text"
                          placeholder="10-digit mobile number"
                          value={sffCallModal.otherApplicantMobile || ''}
                          onChange={(e) => setSffCallModal(prev => ({ ...prev, otherApplicantMobile: e.target.value }))}
                          className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                        />
                      </div>
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 rounded-2xl space-y-2">
                        <label className="flex items-start gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={sffCallModal.isSelfDeclared || false}
                            onChange={(e) => setSffCallModal(prev => ({ ...prev, isSelfDeclared: e.target.checked }))}
                            className="w-5 h-5 mt-0.5 rounded-lg text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                          />
                          <span className="text-xs font-black text-slate-900 dark:text-slate-100 leading-relaxed">
                            "I declare that I am getting this online form filled through SFF (Self Fill Forms) with the permission and consent of the candidate."
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* NAVIGATION BUTTONS */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => setSffCallModal(prev => ({ ...prev, step: 'select_applicant' }))}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                       Back
                    </button>
                    <button
                      disabled={!sffCallModal.isSelfDeclared || (sffCallModal.applicantType === 'Other' && !sffCallModal.otherApplicantName?.trim())}
                      onClick={() => setSffCallModal(prev => ({ ...prev, step: 'payment' }))}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT (PAYMENT CHARGE) */}
              {sffCallModal.step === 'payment' && (
                <div className="space-y-4 text-left pt-1">
                  {/* APPLICANT TYPE BADGE */}
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>Applicant Category:</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-extrabold text-[11px]">
                      {sffCallModal.applicantType === 'Self' ? 'Self' : `Other (${sffCallModal.otherApplicantName})`}
                    </span>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
                      
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {sffCallModal.serviceName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Pay Rs {sffCallModal.amount || 40}/- processing charge for instant form submission & 30-min callback
                    </p>
                  </div>

                  {/* Fee Breakdown Card */}
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Service Charge Fee:</span>
                      <span className="font-mono text-slate-900 dark:text-white">Rs {sffCallModal.amount || 40}/-</span>
                    </div>
                    <div className="flex items-center justify-between font-black text-emerald-900 dark:text-emerald-300 text-sm border-t border-emerald-200 dark:border-emerald-800/80 pt-1.5">
                      <span>Total Payable:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-mono">Rs {sffCallModal.amount || 40}/-</span>
                    </div>
                  </div>

                  {/* UPI QR PAYMENT - OTHER SERVICES */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-emerald-500/5 border border-emerald-500/40 space-y-4">
                    <div className="flex items-center justify-center shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">[Info]</span>
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                          UPI QR Payment
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-mono text-[10px] font-bold rounded-full border border-emerald-500/30">
                        UPI
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                      QR scan karke payment karein. Payment ke baad UTR / Transaction ID enter karke submit karein.
                    </p>

                    <div className="flex justify-center">
                      <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-200">
                        <img
                          src="/payment/upi-qr.png"
                          alt="UPI Payment QR Code"
                          className="w-52 h-auto object-contain"
                        />
                      </div>
                    </div>

                    <div className="text-center text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Scan QR → Pay Rs {sffCallModal.amount || 40}/- → Enter UTR
                    </div>

                    <input
                      type="text"
                      value={sffCallModal.utrNumber || ''}
                      onChange={(e) =>
                        setSffCallModal(prev => ({
                          ...prev,
                          utrNumber: e.target.value.trim()
                        }))
                      }
                      placeholder="Enter UTR / Transaction ID"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <button
                      type="button"
                      disabled={sffCallModal.isPaying || !(sffCallModal.utrNumber || '').trim()}
                      onClick={async () => {
                        const utr = (sffCallModal.utrNumber || '').trim();

                        if (!utr) {
                          alert('Please enter UTR / Transaction ID.');
                          return;
                        }

                        setSffCallModal(prev => ({ ...prev, isPaying: true }));

                        try {
                          const userRecord = user || JSON.parse(localStorage.getItem('sff_user') || '{}');
                          const uId = userRecord.id || userRecord.userId || 'SFF-USER';
                          const uName =
                            sffCallModal.applicantType === 'Other' && sffCallModal.otherApplicantName
                              ? sffCallModal.otherApplicantName
                              : (userRecord.fullName || userRecord.name || 'SFF User');
                          const uEmail = userRecord.email || 'user@selffillforms.in';
                          const uMobile =
                            sffCallModal.applicantType === 'Other' && sffCallModal.otherApplicantMobile
                              ? sffCallModal.otherApplicantMobile
                              : (userRecord.mobileNumber || userRecord.phone || userRecord.mobile || '');

                          const fbUid = userRecord.uid || user?.uid || '';
                          const sffUid = userRecord.sffUserId || userRecord.userId || uId || '';
                          const sTitle = sffCallModal.serviceName || 'Service Request';
                          const amt = sffCallModal.amount || 40;
                          const trackingId = `SFF-${Math.floor(100000 + Math.random() * 900000)}`;

                          await addServiceRequestToFirestore({
                            userId: fbUid || sffUid || uId,
                            userEmail: uEmail,
                            userName: uName,
                            userMobile: uMobile,
                            serviceTitle: sTitle,
                            category: 'Other',
                            appliedDate: new Date().toISOString(),
                            status: 'Pending',
                            trackingId,
                            amount: String(amt),
                            details: {
                              applicantType: sffCallModal.applicantType,
                              otherApplicantName: sffCallModal.otherApplicantName,
                              otherApplicantMobile: sffCallModal.otherApplicantMobile,
                              feePaid: amt,
                              paymentMethod: 'UPI QR',
                              utrNumber: utr,
                            },
                          });

                          adminStore.saveTransaction({
                            id: `TXN-${Date.now()}`,
                            type: 'Credit',
                            amount: Number(amt),
                            category: 'Service Fee',
                            description: `UPI QR Payment for "${sTitle}" from ${uName} (${uId})`,
                            applicantId: uId,
                            applicantName: uName,
                            applicantMobile: uMobile,
                            paymentMethod: 'UPI',
                            utrNumber: utr,
                            date: new Date().toISOString(),
                            status: 'Pending',
                            remarks: `UPI QR payment submitted for SFF verification. UTR: ${utr}`,
                          });

                          adminStore.saveNotification({
                            id: `NOTIF-PAY-${Date.now()}`,
                            title: `Payment Submitted: ${sTitle}`,
                            message: `Your UPI payment of ${amt}/- has been submitted with UTR ${utr}. Payment verification is pending.`,
                            notificationType: 'Application Status',
                            targetAudience: 'Selected Users',
                            targetMode: 'Single User',
                            targetValue: sffUid || uId,
                            priority: 'High',
                            sentDate: new Date().toISOString(),
                            status: 'Sent',
                            createdBy: 'UPI QR Payment',
                          });

                          adminStore.addLog(
                            'Form',
                            `UPI QR Payment ${amt} submitted for ${sTitle}. UTR: ${utr}`
                          );

                          setSffCallModal(prev => ({
                            ...prev,
                            isPaying: false,
                            step: 'success'
                          }));
                        } catch (error) {
                          console.error('UPI QR service payment submission error:', error);
                          setSffCallModal(prev => ({ ...prev, isPaying: false }));
                          alert('Payment submission failed. Please try again.');
                        }
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sffCallModal.isPaying ? (
                        <span>Submitting Payment...</span>
                      ) : (
                        <span>Submit UTR & Payment</span>
                      )}
                    </button>
                  </div>

                    <button
                      onClick={() => setSffCallModal(prev => ({ ...prev, step: 'declaration' }))}
                      className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    >
                       Back
                       Back
                    </button>
                </div>
              )}

              {/* STEP 4: SUCCESS MESSAGE */}
              {sffCallModal.step === 'success' && (
                <div className="space-y-4 pt-1">
                  {/* Pulsing Call Icon */}
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center pt-2">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 relative z-10">
                      <PhoneCall className="w-8 h-8 animate-bounce" />
                    </div>
                  </div>

                  {/* Title & Badge */}
                  <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-300 dark:border-emerald-700">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      30 MIN CALLBACK ASSURED
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {sffCallModal.serviceName}
                    </h3>
                    <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] border border-emerald-200 dark:border-emerald-800">
                      Rs {sffCallModal.amount || 40}/- Processing Charge Paid ✓
                    </div>
                  </div>

                  {/* Highlighting Message */}
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-700 rounded-2xl space-y-2">
                    <p className="text-base sm:text-lg font-black text-emerald-950 dark:text-emerald-200 leading-snug">
                      For more information, you will receive a call from the SFF team within 30 minutes.
                    </p>
                  </div>

                  {/* Info Details */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-left text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                    <div className="flex justify-between font-medium">
                      <span>Service Name:</span>
                      <strong className="text-slate-900 dark:text-white font-extrabold">{sffCallModal.serviceName}</strong>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Category:</span>
                      <strong className="text-slate-900 dark:text-white font-extrabold">{sffCallModal.applicantType === 'Self' ? 'Self' : `Other (${sffCallModal.otherApplicantName})`}</strong>
                    </div>
                    {user?.fullName && (
                      <div className="flex justify-between font-medium">
                        <span>User Account:</span>
                        <strong className="text-slate-900 dark:text-white font-bold">{user.fullName}</strong>
                      </div>
                    )}
                    <div className="flex justify-between font-medium">
                      <span>Payment Status:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">Rs {sffCallModal.amount || 40}/- Received</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => setSffCallModal({ isOpen: false, serviceName: '', amount: 30, step: 'select_applicant', applicantType: 'Self', isSelfDeclared: false, utrNumber: '', isPaying: false })}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    OK, Got It
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </div>
    </>
  );
};













































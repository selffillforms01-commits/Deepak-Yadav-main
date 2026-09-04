import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  MapPin,
  GraduationCap,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  Save,
  ChevronDown,
  ChevronUp,
  Upload,
  Trash2,
  Plus,
  Camera,
  Fingerprint,
  PenTool,
  X,
  Sparkles,
  FileText,
  MoreVertical,
  RotateCw,
  Maximize2,
  Award,
  LogOut,
  RefreshCw,
  Copy,
  Check,
  Sun,
  Globe,
  Crown,
  ArrowLeft,
  Search,
  Download,
  Eye,
  ChevronRight,
  Shield
} from 'lucide-react';
import { UserProfile, OtherCertificate } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { calculateOverallProfileCompletion } from '../../utils/profileChecker';
import { DocumentsPage } from './DocumentsPage';
import { uploadDocumentToStorage, saveUserProfileToFirestore } from '../../lib/firestoreService';
import { ALL_INDIAN_STATES, getDistrictsForState } from '../../data/indiaStatesDistricts';
import { compressImageFile } from '../../utils/imageCompressor';
import { SmartImage } from '../common/SmartImage';

const calcAutoPercentage = (totalStr?: string, securedStr?: string): string => {
  if (!totalStr || !securedStr) return '';
  const total = parseFloat(totalStr.toString().trim());
  const secured = parseFloat(securedStr.toString().trim());
  if (isNaN(total) || isNaN(secured) || total <= 0) return '';
  const pct = (secured / total) * 100;
  if (pct < 0 || pct > 100) return '';
  const formatted = Number.isInteger(pct) ? pct.toString() : pct.toFixed(2).replace(/\.?0+$/, '');
  return `${formatted}%`;
};

const getSelectedEducationDetails = (p: UserProfile) => {
  const qual = (p.qualification || '10th').toLowerCase();

  if (qual.includes('below') || qual.includes('under') || qual.includes('8th') || qual.includes('7th') || qual.includes('5th')) {
    return (
      <p className="text-xs text-slate-600 italic">
        Qualification level selected is Below 10th. High school marksheets or degree certificates are not required.
      </p>
    );
  }

  if (qual.includes('12th') || qual.includes('plus two') || qual.includes('+2')) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Council / Board</span>
          <p className="font-semibold text-slate-800">{p.twelfthCouncilBoard || p.twelfthBoard || '----'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Stream</span>
          <p className="font-semibold text-slate-800">{p.twelfthStream || '----'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Roll / Reg Number</span>
          <p className="font-mono font-bold text-slate-800">{p.twelfthRollNumber || p.twelfthRegNumber || '----'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">12th Certificate No.</span>
          <p className="font-mono font-bold text-slate-800">{p.twelfthCertNumber || '----'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Secured Percentage</span>
          <p className="font-bold text-emerald-700">{p.twelfthPercentage || p.twelfthObtainedMarks || '----'}</p>
        </div>
      </div>
    );
  }

  if (qual.includes('degree') || qual.includes('graduation') || qual.includes('bachelor') || qual.includes('b.tech') || qual.includes('b.sc') || qual.includes('b.a') || qual.includes('b.com')) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Degree / Course</span>
          <p className="font-semibold text-slate-800">{p.degreeCourseName || p.graduationDegree || '----'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">University / College</span>
          <p className="font-semibold text-slate-800">{p.degreeUniversityName || p.degreeCollegeName || p.university || '----'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Roll / Reg Number</span>
          <p className="font-mono font-bold text-slate-800">{p.degreeRollNumber || p.degreeRegNumber || '----'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Degree Certificate No.</span>
          <p className="font-mono font-bold text-slate-800">{p.degreeCertNumber || '----'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">SGPA / CGPA / Percentage</span>
          <p className="font-bold text-emerald-700">{p.degreeSgpaCgpa || p.graduationPercentage || '----'}</p>
        </div>
      </div>
    );
  }

  if (qual.includes('diploma') || qual.includes('iti')) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Course Name</span>
          <p className="font-semibold text-slate-800">{p.diplomaCourseName || '----'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Board / Institute</span>
          <p className="font-semibold text-slate-800">{p.diplomaBoardUniversity || p.diplomaCollegeName || '----'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Roll Number</span>
          <p className="font-mono font-bold text-slate-800">{p.diplomaRollNumber || '----'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Diploma Certificate No.</span>
          <p className="font-mono font-bold text-slate-800">{p.diplomaCertNumber || '----'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Percentage</span>
          <p className="font-bold text-emerald-700">{p.diplomaPercentage || '----'}</p>
        </div>
      </div>
    );
  }

  if (qual.includes('post') || qual.includes('pg') || qual.includes('master') || qual.includes('m.sc') || qual.includes('m.a') || qual.includes('m.tech')) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Master's Degree</span>
          <p className="font-semibold text-slate-800">{p.pgDegreeName || '----'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">University</span>
          <p className="font-semibold text-slate-800">{p.pgUniversityName || p.pgCollegeName || '----'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Roll Number</span>
          <p className="font-mono font-bold text-slate-800">{p.pgRollNumber || '----'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">PG Certificate No.</span>
          <p className="font-mono font-bold text-slate-800">{p.pgCertNumber || '----'}</p>
        </div>
      </div>
    );
  }

  if (qual.includes('phd') || qual.includes('doctorate')) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Specialization</span>
          <p className="font-semibold text-slate-800">{p.phdSpecialization || '----'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">University</span>
          <p className="font-semibold text-slate-800">{p.phdUniversity || '----'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Registration No.</span>
          <p className="font-mono font-bold text-slate-800">{p.phdRegNumber || '----'}</p>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">PhD Certificate No.</span>
          <p className="font-mono font-bold text-slate-800">{p.phdCertNumber || '----'}</p>
        </div>
      </div>
    );
  }

  // Default fallback: 10th Standard
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase">Board Name</span>
        <p className="font-semibold text-slate-800">{p.tenthBoardName || p.tenthBoard || '----'}</p>
      </div>
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase">Roll Number</span>
        <p className="font-mono font-bold text-slate-800">{p.tenthRollNumber || '----'}</p>
      </div>
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase">10th Certificate No.</span>
        <p className="font-mono font-bold text-slate-800">{p.tenthCertNumber || '----'}</p>
      </div>
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase">Secured Marks / %</span>
        <p className="font-bold text-emerald-700">{p.tenthPercentage || p.tenthSecuredMarks || '----'}</p>
      </div>
    </div>
  );
};

const getSelectedEducationCertNo = (p: UserProfile) => {
  const qual = (p.qualification || '10th').trim();
  const lower = qual.toLowerCase();

  if (lower.includes('below') || lower.includes('under') || lower.includes('8th') || lower.includes('7th') || lower.includes('5th')) {
    return { name: 'QUALIFICATION LEVEL', certNo: 'Below 10th (N/A)' };
  }
  if (qual === '12th' || lower === '12th pass' || lower === 'intermediate' || lower.includes('12')) {
    return { name: '12TH CERTIFICATE NO.', certNo: p.twelfthCertNumber || p.twelfthRollNumber || '----' };
  }
  if (lower.includes('diploma') || lower.includes('iti')) {
    return { name: 'DIPLOMA CERTIFICATE NO.', certNo: p.diplomaCertNumber || p.diplomaRollNumber || '----' };
  }
  if (qual === 'Graduation' || lower.includes('graduat') || lower.includes('bachelor') || lower.includes('degree') || lower.includes('b.tech') || lower.includes('b.sc') || lower.includes('b.a') || lower.includes('b.com')) {
    return { name: 'DEGREE CERTIFICATE NO.', certNo: p.degreeCertNumber || p.degreeRollNumber || '----' };
  }
  if (qual === 'Post Graduation' || lower.includes('post') || lower.includes('master') || lower.includes('m.tech') || lower.includes('m.sc') || lower.includes('m.a') || lower.includes('m.com') || lower.includes('mba')) {
    return { name: 'PG CERTIFICATE NO.', certNo: p.pgCertNumber || p.pgRollNumber || '----' };
  }
  if (qual === 'Ph.D.' || lower.includes('phd') || lower.includes('ph.d') || lower.includes('doctor') || lower.includes('research')) {
    return { name: 'PHD CERTIFICATE NO.', certNo: p.phdCertNumber || p.phdRegNumber || '----' };
  }
  return { name: '10TH CERTIFICATE NO.', certNo: p.tenthCertNumber || p.tenthRollNumber || '----' };
};

interface ProfilePageProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateUser: (updated: UserProfile) => void;
}

type SectionKey =
  | 'personal'
  | 'address'
  | 'education'
  | 'bank'
  | 'otherCertificates'
  | 'myDocuments';

const getEducationLevels = (qualification?: string) => {
  const qual = (qualification || '10th').trim();
  const lower = qual.toLowerCase();

  const isBelow10th = lower.includes('below') || lower.includes('under') || lower.includes('8th') || lower.includes('7th') || lower.includes('5th');
  const is10thOnly = qual === '10th' || lower === '10th pass' || lower === 'matric';
  const is12th = qual === '12th' || lower === '12th pass' || lower === 'intermediate' || lower.includes('12');
  const isDiploma = lower.includes('diploma') || lower.includes('iti');
  const isGraduation = qual === 'Graduation' || lower.includes('graduat') || lower.includes('bachelor') || lower.includes('degree') || lower.includes('b.tech') || lower.includes('b.sc') || lower.includes('b.a') || lower.includes('b.com');
  const isPG = qual === 'Post Graduation' || lower.includes('post') || lower.includes('master') || lower.includes('m.tech') || lower.includes('m.sc') || lower.includes('m.a') || lower.includes('m.com') || lower.includes('mba');
  const isPhD = qual === 'Ph.D.' || lower.includes('phd') || lower.includes('ph.d') || lower.includes('doctor') || lower.includes('research');

  const show10th = !isBelow10th;
  const show12th = is12th || isGraduation || isPG || isPhD;
  const showDiploma = isDiploma;
  const showGraduation = isGraduation || isPG || isPhD;
  const showPG = isPG || isPhD;
  const showPhD = isPhD;

  return { show10th, show12th, showDiploma, showGraduation, showPG, showPhD, isBelow10th, qualLabel: qual || '10th' };
};

const getEducationSubtitle = (qual?: string) => {
  const { show10th, show12th, showDiploma, showGraduation, showPG, showPhD, isBelow10th } = getEducationLevels(qual);
  if (isBelow10th) return 'Qualification: Below 10th (High school marksheets not required)';
  const levels = [];
  if (show10th) levels.push('10th Standard');
  if (show12th) levels.push('12th Standard');
  if (showDiploma) levels.push('ITI / Diploma');
  if (showGraduation) levels.push('Graduation');
  if (showPG) levels.push('Post Graduation');
  if (showPhD) levels.push('Ph.D.');
  return `Academic records for: ${levels.join(', ')}`;
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout, onUpdateUser }) => {
  const { t } = useLanguage();
  // Master profile state with default fallback values
  // Master profile state with default fallback values
const [profileData, setProfileData] = useState<UserProfile>(() => {
  const { name, ...restUser } = user;

  return {
    ...restUser,
    name: name || user.fullName || '',
    email: user.email || '',
    mobile: user.mobile || '',
    qualification: user.qualification || '10th',
    areaType: user.areaType || 'Rural',
    addressAt: user.addressAt || '',
    urbanLocality: user.urbanLocality || '',
    urbanLandmark: user.urbanLandmark || '',
    urbanWardNo: user.urbanWardNo || '',
    urbanCity: user.urbanCity || '',
    maritalStatus: user.maritalStatus || 'Single',
    nationality: user.nationality || 'Indian',
    religion: user.religion || 'Hinduism',
    category: user.category || 'General',
    disabilityStatus: user.disabilityStatus || 'No',
    sameAsPermanent: user.sameAsPermanent ?? true,
  };
});

  useEffect(() => {
    setProfileData((prev) => ({ ...prev, ...user }));
  }, [user]);

  // Section Accordion Toggle State
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    personal: false,
    address: false,
    education: false,
    bank: false,
    otherCertificates: false,
    myDocuments: false,
  });

  // Editing state per section
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);

  // Buffer state while editing a section
  const [editBuffer, setEditBuffer] = useState<UserProfile>({ ...profileData });

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // IFSC Auto Lookup State
  const [ifscLoading, setIfscLoading] = useState(false);
  const [ifscStatus, setIfscStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Fallback Bank Map for major Indian Banks
  const BANK_CODE_MAP: Record<string, string> = {
    SBIN: 'State Bank of India',
    HDFC: 'HDFC Bank',
    ICIC: 'ICICI Bank',
    PUNB: 'Punjab National Bank',
    CNRB: 'Canara Bank',
    BARB: 'Bank of Baroda',
    BKID: 'Bank of India',
    UBIN: 'Union Bank of India',
    MAHB: 'Bank of Maharashtra',
    IDIB: 'Indian Bank',
    IOBA: 'Indian Overseas Bank',
    UTIB: 'Axis Bank',
    KKBK: 'Kotak Mahindra Bank',
    YESB: 'Yes Bank',
    INDB: 'IndusInd Bank',
    PSIB: 'Punjab & Sind Bank',
    UCOB: 'UCO Bank',
    BDBL: 'Bandhan Bank',
    AUBL: 'AU Small Finance Bank',
    IPPB: 'India Post Payments Bank',
    FINO: 'Fino Payments Bank',
    PYTM: 'Paytm Payments Bank',
    AIRP: 'Airtel Payments Bank',
    IDFB: 'IDFC FIRST Bank',
    JAKA: 'Jammu & Kashmir Bank',
    KARB: 'Karnataka Bank',
    KVBL: 'Karur Vysya Bank',
    SIBL: 'South Indian Bank',
    TMBL: 'Tamilnad Mercantile Bank',
    DCBL: 'DCB Bank',
    FEDB: 'Federal Bank',
    ESFB: 'Equitas Small Finance Bank',
    UJVN: 'Ujjivan Small Finance Bank',
  };

  const handleIfscLookup = async (ifscCode: string) => {
    const cleanIfsc = ifscCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleanIfsc.length !== 11) {
      setIfscStatus(null);
      return;
    }

    setIfscLoading(true);
    setIfscStatus({ success: true, message: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Fetching Bank & Branch details...' });

    try {
      const res = await fetch(`https://ifsc.razorpay.com/${cleanIfsc}`);
      if (res.ok) {
        const data = await res.json();
        const bankName = data.BANK || BANK_CODE_MAP[cleanIfsc.substring(0, 4)] || '';
        const rawBranch = data.BRANCH || '';
        const cityOrDistrict = data.DISTRICT || data.CITY || data.CENTRE || '';
        const branchName = rawBranch
          ? `${rawBranch}${cityOrDistrict ? ` (${cityOrDistrict})` : ''}`
          : '';

        setEditBuffer((prev) => ({
          ...prev,
          bankIfsc: cleanIfsc,
          bankName: bankName || prev.bankName || '',
          bankBranch: branchName || prev.bankBranch || '',
        }));

        setIfscStatus({
          success: true,
          message: `ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ Auto-filled: ${bankName}${branchName ? ` - ${branchName}` : ''}`,
        });
      } else {
        // Fallback to local map
        const prefix = cleanIfsc.substring(0, 4);
        const fallbackBank = BANK_CODE_MAP[prefix];
        if (fallbackBank) {
          setEditBuffer((prev) => ({
            ...prev,
            bankIfsc: cleanIfsc,
            bankName: fallbackBank || prev.bankName || '',
          }));
          setIfscStatus({
            success: true,
            message: `ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ Auto-filled Bank: ${fallbackBank} (Enter Branch manually)`,
          });
        } else {
          setIfscStatus({
            success: false,
            message: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Invalid IFSC or details not found. Please enter Bank & Branch manually.',
          });
        }
      }
    } catch (err) {
      console.warn('IFSC lookup error:', err);
      const prefix = cleanIfsc.substring(0, 4);
      const fallbackBank = BANK_CODE_MAP[prefix];
      if (fallbackBank) {
        setEditBuffer((prev) => ({
          ...prev,
          bankIfsc: cleanIfsc,
          bankName: fallbackBank || prev.bankName || '',
        }));
        setIfscStatus({
          success: true,
          message: `ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ Auto-filled Bank: ${fallbackBank}`,
        });
      } else {
        setIfscStatus({
          success: false,
          message: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Network issue. Please enter Bank Name & Branch manually.',
        });
      }
    } finally {
      setIfscLoading(false);
    }
  };

  // Top Card 3-dot dropdown menu
  const [showTopMenu, setShowTopMenu] = useState(false);

  // Modal for manual certificate addition
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [showMyDocumentsModal, setShowMyDocumentsModal] = useState(false);
  const [newCert, setNewCert] = useState<Partial<OtherCertificate>>({
    name: '',
    number: '',
    issuingAuthority: '',
    issueDate: '',
  });

  // Hidden file input refs
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const signatureInputRef = useRef<HTMLInputElement | null>(null);
  const thumbInputRef = useRef<HTMLInputElement | null>(null);

  // Rotation states for media previews
  const [photoRotation, setPhotoRotation] = useState<number>(0);
  const [signatureRotation, setSignatureRotation] = useState<number>(0);
  const [thumbRotation, setThumbRotation] = useState<number>(0);

  // Full Screen Preview Modal State
  const [previewMediaModal, setPreviewMediaModal] = useState<{
    title: string;
    url: string;
    rotation: number;
    field: 'photoUrl' | 'signatureUrl' | 'thumbImpressionUrl';
  } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const startEditing = (section: SectionKey, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditBuffer({ ...profileData });
    setEditingSection(section);
    setOpenSections((prev) => ({ ...prev, [section]: true }));
  };

  const saveSection = async (section: SectionKey, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateUser(editBuffer);
    setProfileData(editBuffer);
    setEditingSection(null);
    const userId = editBuffer.email || editBuffer.mobile || 'citizen_user';
    await saveUserProfileToFirestore(userId, editBuffer);
    triggerToast('Profile saved to Cloud Firestore!');
  };

  const cancelEditing = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditBuffer({ ...profileData });
    setEditingSection(null);
  };

  const handleRotateMedia = (
    field: 'photoUrl' | 'signatureUrl' | 'thumbImpressionUrl',
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    if (field === 'photoUrl') setPhotoRotation((prev) => (prev + 90) % 360);
    if (field === 'signatureUrl') setSignatureRotation((prev) => (prev + 90) % 360);
    if (field === 'thumbImpressionUrl') setThumbRotation((prev) => (prev + 90) % 360);
    triggerToast('Image rotated 90ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°', 'info');
  };

  // Completion percentage using unified 5-section rule (20% each)
  const overallCompletion = calculateOverallProfileCompletion(profileData);
  const completionPercentage = overallCompletion.totalPercentage;

  // File Upload Handler with Auto Compression & Dual Storage
  const handleFileUpload = async (
    field: 'photoUrl' | 'signatureUrl' | 'thumbImpressionUrl',
    file: File
  ) => {
    if (!file) return;
    const labelMap = {
      photoUrl: 'Passport Photo',
      signatureUrl: 'Digital Signature',
      thumbImpressionUrl: 'Left Thumb Impression',
    };
    const fieldLabel = labelMap[field];
    triggerToast(`Compressing & processing ${fieldLabel}...`, 'info');

    try {
      const { compressedFile, dataUrl } = await compressImageFile(file, 1600, 0.90);
      const userId = profileData.email || profileData.mobile || 'citizen_user';

      let finalUrl = dataUrl;
      let storageSuccess = false;

      try {
        const { downloadUrl } = await uploadDocumentToStorage(userId, compressedFile, 'profile');
        if (downloadUrl) {
          finalUrl = downloadUrl;
          storageSuccess = downloadUrl.startsWith('https://');
        }
      } catch (storageErr) {
        console.warn('Firebase Storage upload notice, using compressed dataUrl fallback:', storageErr);
      }

      const updated = { ...profileData, [field]: finalUrl };
      setProfileData(updated);
      onUpdateUser(updated);
      await saveUserProfileToFirestore(userId, updated);

      if (storageSuccess) {
        triggerToast(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ ${fieldLabel} uploaded to Firebase Storage!`);
      } else {
        triggerToast(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ ${fieldLabel} saved successfully!`);
      }
    } catch (err) {
      console.error(`Error processing ${fieldLabel}:`, err);
      triggerToast(`ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Failed to process ${fieldLabel}. Please try another image.`, 'info');
    }
  };

  // Certificate Handler
  const handleAddCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.name || !newCert.number) return;

    const certItem: OtherCertificate = {
      id: `CERT-${Date.now()}`,
      name: newCert.name.trim(),
      number: newCert.number.trim(),
      issuingAuthority: newCert.issuingAuthority?.trim() || '',
      issueDate: newCert.issueDate?.trim() || '',
    };

    const existing = profileData.otherCertificates || [];
    const updated = { ...profileData, otherCertificates: [certItem, ...existing] };
    setProfileData(updated);
    onUpdateUser(updated);
    setShowAddCertModal(false);
    setNewCert({ name: '', number: '', issuingAuthority: '', issueDate: '' });
    triggerToast('New certificate added');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 pb-20 text-slate-800 font-sans select-none">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={photoInputRef}
        accept="image/*,.jpg,.jpeg,.png,.webp,.heic,application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileUpload('photoUrl', e.target.files[0]);
            e.target.value = '';
          }
        }}
      />
      <input
        type="file"
        ref={signatureInputRef}
        accept="image/*,.jpg,.jpeg,.png,.webp,.heic,application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileUpload('signatureUrl', e.target.files[0]);
            e.target.value = '';
          }
        }}
      />
      <input
        type="file"
        ref={thumbInputRef}
        accept="image/*,.jpg,.jpeg,.png,.webp,.heic,application/pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileUpload('thumbImpressionUrl', e.target.files[0]);
            e.target.value = '';
          }
        }}
      />
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-16 right-4 z-50 px-4 py-2.5 rounded-xl shadow-xl border text-xs font-bold flex items-center gap-2 backdrop-blur-md ${
              toastMessage.type === 'success'
                ? 'bg-white text-emerald-800 border-emerald-200'
                : 'bg-white text-blue-800 border-blue-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN PROFILE TOP CARD (LIGHT MODE) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 relative">
        <div className="flex items-start justify-between">
          {/* Avatar and User Info */}
          <div className="flex items-center gap-4">
            {/* Circular Profile Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#0B3B8C] border border-blue-200 flex items-center justify-center text-2xl font-black text-white overflow-hidden shadow-xs">
                {profileData.photoUrl ? (
                  <SmartImage
                    src={profileData.photoUrl}
                    alt={profileData.name}
                    className="w-full h-full object-cover rounded-full"
                    style={{ transform: `rotate(${photoRotation}deg)` }}
                  />
                ) : (
                  <span>{profileData.name ? profileData.name.charAt(0).toUpperCase() : 'D'}</span>
                )}
              </div>
              {/* Camera icon overlay badge */}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#0B3B8C] hover:bg-blue-700 text-white rounded-full flex items-center justify-center border-2 border-white transition-transform active:scale-95 cursor-pointer shadow-sm"
                title="Update Photo"
              >
                <Camera className="w-3 h-3 text-white" />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-0.5">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">{profileData.name || 'Deepak Yadav'}</h2>
              <p className="text-xs text-slate-500 font-medium">{profileData.email || 'dy398166@gmail.com'}</p>
              <p className="text-xs text-slate-500 font-medium">{profileData.mobile || '9692878746'}</p>
            </div>
          </div>
        </div>

        {/* AI AUTO FILL PROFILE COMPLETION */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              PROFILE COMPLETION STATUS
            </span>
            <span className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-xs border ${
              completionPercentage >= 80 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              {completionPercentage}% {completionPercentage >= 80 ? '(UNLOCKED)' : '(LOCKED)'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                completionPercentage >= 80
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  : 'bg-gradient-to-r from-amber-500 to-amber-400'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            {completionPercentage >= 80 
              ? 'All services unlocked! Minimum 80% completion reached.' 
              : 'Complete Your Profile 80% to unlock all services.'}
          </p>
        </div>
      </div>

      {/* ACCORDION SECTIONS */}
      <div className="space-y-3">
        {/* SECTION 1: PERSONAL INFORMATION */}
        <AccordionCard
          isOpen={openSections.personal}
          onToggle={() => toggleSection('personal')}
          icon={<User className="w-5 h-5 text-[#0B3B8C]" />}
          iconBg="bg-blue-50 border-blue-200 text-[#0B3B8C]"
          title="1. PERSONAL INFORMATION"
          subtitle="Full name, parent details, DOB, and identity certificates"
        >
          {/* MEDIA UPLOAD CARDS CONTAINER (STRICT 2-COLUMN GRID MATCHING REFERENCE EXACTLY) */}
          <div className="p-4 sm:p-5 bg-[#090e1d] border border-slate-800 rounded-2xl">
            <div className="grid grid-cols-2 gap-3 sm:gap-5 items-stretch">
              {/* PASSPORT PHOTO (LEFT COLUMN) */}
              <div className="flex flex-col h-full">
                <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest block text-center mb-1.5">
                  PASSPORT PHOTO
                </span>
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="flex-1 min-h-[130px] border border-slate-800 hover:border-slate-700 rounded-xl bg-[#040711] flex flex-col items-center justify-center cursor-pointer transition-colors p-2 sm:p-3 relative group shadow-inner"
                >
                  {profileData.photoUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <SmartImage
                        src={profileData.photoUrl}
                        alt="Passport Photo"
                        className="max-h-full max-w-full object-cover rounded-lg"
                        style={{ transform: `rotate(${photoRotation}deg)` }}
                      />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleRotateMedia('photoUrl', e)}
                          className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 cursor-pointer shadow-xs"
                          title="Rotate 90ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewMediaModal({
                              title: 'Passport Photo',
                              url: profileData.photoUrl!,
                              rotation: photoRotation,
                              field: 'photoUrl',
                            });
                          }}
                          className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 cursor-pointer shadow-xs"
                          title="Preview"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center my-auto p-1.5">
                      <User className="w-6 h-6 sm:w-7 sm:h-7 text-slate-300 stroke-[1.5] mb-1" />
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-300">Click to Upload</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SIGNATURE & LEFT THUMB IMPRESSION (RIGHT COLUMN STACKED) */}
              <div className="flex flex-col justify-between space-y-2 sm:space-y-3 h-full">
                {/* SIGNATURE */}
                <div className="flex flex-col flex-1">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest block text-center mb-1">
                    SIGNATURE
                  </span>
                  <div
                    onClick={() => signatureInputRef.current?.click()}
                    className="flex-1 min-h-[55px] border border-slate-800 hover:border-slate-700 rounded-xl bg-[#040711] flex flex-col items-center justify-center cursor-pointer transition-colors p-1.5 sm:p-2 relative group shadow-inner"
                  >
                    {profileData.signatureUrl ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <SmartImage
                          src={profileData.signatureUrl}
                          alt="Signature"
                          className="max-h-full max-w-full object-contain p-0.5 filter invert"
                          style={{ transform: `rotate(${signatureRotation}deg)` }}
                        />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleRotateMedia('signatureUrl', e)}
                            className="p-1 bg-slate-800 text-white rounded-lg hover:bg-slate-700 cursor-pointer shadow-xs"
                            title="Rotate 90ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°"
                          >
                            <RotateCw className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewMediaModal({
                                title: 'Digital Signature',
                                url: profileData.signatureUrl!,
                                rotation: signatureRotation,
                                field: 'signatureUrl',
                              });
                            }}
                            className="p-1 bg-slate-800 text-white rounded-lg hover:bg-slate-700 cursor-pointer shadow-xs"
                            title="Preview"
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center my-auto p-1">
                        <PenTool className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 stroke-[1.5] mb-0.5" />
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-300">Click to Upload</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* LEFT THUMB IMPRESSION */}
                <div className="flex flex-col flex-1">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest block text-center mb-1">
                    LEFT THUMB IMPRESSION
                  </span>
                  <div
                    onClick={() => thumbInputRef.current?.click()}
                    className="flex-1 min-h-[55px] border border-slate-800 hover:border-slate-700 rounded-xl bg-[#040711] flex flex-col items-center justify-center cursor-pointer transition-colors p-1.5 sm:p-2 relative group shadow-inner"
                  >
                    {profileData.thumbImpressionUrl ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <SmartImage
                          src={profileData.thumbImpressionUrl}
                          alt="Thumb Impression"
                          className="max-h-full max-w-full object-contain p-0.5 filter invert"
                          style={{ transform: `rotate(${thumbRotation}deg)` }}
                        />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleRotateMedia('thumbImpressionUrl', e)}
                            className="p-1 bg-slate-800 text-white rounded-lg hover:bg-slate-700 cursor-pointer shadow-xs"
                            title="Rotate 90ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°"
                          >
                            <RotateCw className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewMediaModal({
                                title: 'Left Thumb Impression',
                                url: profileData.thumbImpressionUrl!,
                                rotation: thumbRotation,
                                field: 'thumbImpressionUrl',
                              });
                            }}
                            className="p-1 bg-slate-800 text-white rounded-lg hover:bg-slate-700 cursor-pointer shadow-xs"
                            title="Preview"
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center my-auto p-1">
                        <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 stroke-[1.5] mb-0.5" />
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-300">Click to Upload</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FORM EDITOR HEADER */}
          <div className="flex items-center justify-between pt-2 pb-1 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">FORM EDITOR</span>
            {!editingSection ? (
              <button
                type="button"
                onClick={(e) => startEditing('personal', e)}
                className="flex items-center gap-1 text-[#0B3B8C] hover:text-blue-700 font-bold text-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>EDIT</span>
              </button>
            ) : null}
          </div>

          {/* FIELDS DISPLAY OR FORM */}
          {editingSection === 'personal' ? (
            <form onSubmit={(e) => saveSection('personal', e)} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
                <InputField label="FULL NAME" value={editBuffer.name || ''} onChange={(val) => setEditBuffer({ ...editBuffer, name: val })} />
                <SelectField label="QUALIFICATION" options={['Below 10th', '10th', '12th', 'ITI / Diploma', 'Graduation', 'Post Graduation', 'Ph.D.']} value={editBuffer.qualification || '10th'} onChange={(val) => setEditBuffer({ ...editBuffer, qualification: val })} />
                <InputField label="MOBILE NUMBER" value={editBuffer.mobile || ''} onChange={(val) => setEditBuffer({ ...editBuffer, mobile: val })} />
                <InputField label="EMAIL ADDRESS" value={editBuffer.email || ''} onChange={(val) => setEditBuffer({ ...editBuffer, email: val })} />
                <InputField label="FATHER'S NAME" value={editBuffer.fatherName || ''} onChange={(val) => setEditBuffer({ ...editBuffer, fatherName: val })} />
                <SelectField
                  label="FATHER'S OCCUPATION"
                  options={['Farmer / Agriculture', 'Government Employee', 'Private Employee', 'Business / Self-Employed', 'Professional (Doctor/Engineer/Lawyer)', 'Teacher / Academic', 'Homemaker / Housewife', 'Retired', 'Daily Wage / Labour', 'Defense / Police / Armed Forces', 'Unemployed', 'Other', 'Late']}
                  value={editBuffer.fatherOccupation || ''}
                  onChange={(val) => setEditBuffer({ ...editBuffer, fatherOccupation: val })}
                />
                <InputField label="MOTHER'S NAME" value={editBuffer.motherName || ''} onChange={(val) => setEditBuffer({ ...editBuffer, motherName: val })} />
                <SelectField
                  label="MOTHER'S OCCUPATION"
                  options={['Homemaker / Housewife', 'Farmer / Agriculture', 'Government Employee', 'Private Employee', 'Business / Self-Employed', 'Professional (Doctor/Engineer/Lawyer)', 'Teacher / Academic', 'Retired', 'Daily Wage / Labour', 'Defense / Police / Armed Forces', 'Unemployed', 'Other', 'Late']}
                  value={editBuffer.motherOccupation || ''}
                  onChange={(val) => setEditBuffer({ ...editBuffer, motherOccupation: val })}
                />
                <InputField label="DATE OF BIRTH" placeholder="DD/MM/YYYY" value={editBuffer.dob || ''} onChange={(val) => setEditBuffer({ ...editBuffer, dob: val })} />
                <SelectField label="GENDER" options={['Male', 'Female', 'Other']} value={editBuffer.gender || ''} onChange={(val) => setEditBuffer({ ...editBuffer, gender: val })} />
                <InputField label="ALTERNATE MOBILE" value={editBuffer.alternateMobile || ''} onChange={(val) => setEditBuffer({ ...editBuffer, alternateMobile: val })} />
                <SelectField label="MARITAL STATUS" options={['Single', 'Married', 'Unmarried', 'Divorced']} value={editBuffer.maritalStatus || 'Single'} onChange={(val) => setEditBuffer({ ...editBuffer, maritalStatus: val })} />
                <InputField label="NATIONALITY" value={editBuffer.nationality || 'Indian'} onChange={(val) => setEditBuffer({ ...editBuffer, nationality: val })} />
                <SelectField label="RELIGION" options={['Hinduism', 'Islam', 'Christianity', 'Sikhism', 'Buddhism', 'Jainism', 'Zoroastrianism', 'Other']} value={editBuffer.religion || 'Hinduism'} onChange={(val) => setEditBuffer({ ...editBuffer, religion: val })} />
                <SelectField label="CATEGORY" options={['General', 'OBC', 'SC', 'ST', 'EWS']} value={editBuffer.category || 'General'} onChange={(val) => setEditBuffer({ ...editBuffer, category: val })} />
                <SelectField label="BLOOD GROUP" options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} value={editBuffer.bloodGroup || ''} onChange={(val) => setEditBuffer({ ...editBuffer, bloodGroup: val })} />
                <SelectField label="DISABILITY STATUS" options={['No', 'Yes']} value={editBuffer.disabilityStatus || 'No'} onChange={(val) => setEditBuffer({ ...editBuffer, disabilityStatus: val })} />
                <InputField label="CAREER OBJECTIVE" value={editBuffer.careerObjective || ''} onChange={(val) => setEditBuffer({ ...editBuffer, careerObjective: val })} />
                {/* WORK EXPERIENCE */}
                <div className="col-span-2">
                  <div className="text-xs font-semibold mb-2">
                    WORK EXPERIENCE
                  </div>

                  <div className="space-y-2">
                    {(Array.isArray(editBuffer.workExperience) ? editBuffer.workExperience : (editBuffer.workExperience ? [editBuffer.workExperience] : [''])).map((experience, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={experience}
                          onChange={(e) => {
                            const updated = Array.isArray(editBuffer.workExperience) ? [...editBuffer.workExperience] : (editBuffer.workExperience ? [editBuffer.workExperience] : ['']);
                            updated[index] = e.target.value;
                            setEditBuffer({
                              ...editBuffer,
                              workExperience: updated
                            });
                          }}
                          placeholder={`Work Experience ${index + 1}`}
                          className="flex-1 rounded-lg border px-3 py-2 text-sm"
                        />

                        {(Array.isArray(editBuffer.workExperience) ? editBuffer.workExperience : (editBuffer.workExperience ? [editBuffer.workExperience] : [''])).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = Array.isArray(editBuffer.workExperience) ? [...editBuffer.workExperience] : (editBuffer.workExperience ? [editBuffer.workExperience] : ['']);
                              updated.splice(index, 1);
                              setEditBuffer({
                                ...editBuffer,
                                workExperience: updated
                              });
                            }}
                            className="px-3 py-2 rounded-lg border text-sm"
                          >
                            ÃƒÆ’Ã‚Â¢Ãƒâ€¹Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {(Array.isArray(editBuffer.workExperience) ? editBuffer.workExperience : (editBuffer.workExperience ? [editBuffer.workExperience] : [''])).length < 3 && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditBuffer({
                          ...editBuffer,
                          workExperience: [
                            ...(editBuffer.workExperience || ['']),
                            ''
                          ]
                        });
                      }}
                      className="mt-2 px-4 py-2 rounded-lg border text-sm font-medium"
                    >
                      + Add Work Experience
                    </button>
                  )}
                </div>

           {/* WORK EXPERIENCE EXAMPLE */}
           <div className="col-span-2 -mt-1 mb-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2">
             <div className="text-xs font-semibold text-gray-700 mb-1">
               Example:
             </div>
             <div className="text-xs leading-5 text-gray-600">
               Worked at ABC Company Pvt. Ltd. as a Computer Operator from
               01/04/2023 to 31/03/2025. My main responsibilities included
               data entry, online form filling, document management, and office work.
             </div>
             <div className="text-[11px] leading-4 text-gray-500 mt-1">
               Please mention: Company Name + Designation + Start Date + End Date + Main Responsibilities.
             </div>
           </div>

           {/* OTHER QUALIFICATION */}
                <div className="col-span-2">
                  <div className="text-xs font-semibold mb-2">
                    OTHER QUALIFICATION
                  </div>

                  <div className="space-y-2">
                    {(Array.isArray(editBuffer.otherQualification) ? editBuffer.otherQualification : (editBuffer.otherQualification ? [editBuffer.otherQualification] : [''])).map((qualification, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={qualification}
                          onChange={(e) => {
                            const updated = Array.isArray(editBuffer.otherQualification) ? [...editBuffer.otherQualification] : (editBuffer.otherQualification ? [editBuffer.otherQualification] : ['']);
                            updated[index] = e.target.value;
                            setEditBuffer({
                              ...editBuffer,
                              otherQualification: updated
                            });
                          }}
                          placeholder={`Other Qualification ${index + 1}`}
                          className="flex-1 rounded-lg border px-3 py-2 text-sm"
                        />

                        {(Array.isArray(editBuffer.otherQualification) ? editBuffer.otherQualification : (editBuffer.otherQualification ? [editBuffer.otherQualification] : [''])).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = Array.isArray(editBuffer.otherQualification) ? [...editBuffer.otherQualification] : (editBuffer.otherQualification ? [editBuffer.otherQualification] : ['']);
                              updated.splice(index, 1);
                              setEditBuffer({
                                ...editBuffer,
                                otherQualification: updated
                              });
                            }}
                            className="px-3 py-2 rounded-lg border text-sm"
                          >
                            ÃƒÆ’Ã‚Â¢Ãƒâ€¹Ã¢â‚¬Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {(Array.isArray(editBuffer.otherQualification) ? editBuffer.otherQualification : (editBuffer.otherQualification ? [editBuffer.otherQualification] : [''])).length < 3 && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditBuffer({
                          ...editBuffer,
                          otherQualification: [
                            ...(editBuffer.otherQualification || ['']),
                            ''
                          ]
                        });
                      }}
                      className="mt-2 px-4 py-2 rounded-lg border text-sm font-medium"
                    >
                      + Add Other Qualification
                    </button>
                  )}
                </div>
                {/* LANGUAGES KNOWN */}
                <MultiSelectField
                  label="LANGUAGES KNOWN"
                  options={["Hindi", "English", "Odia", "Bengali", "Telugu", "Urdu", "Tamil", "Marathi"]}
                  value={Array.isArray(editBuffer.languagesKnown) ? editBuffer.languagesKnown : []}
                  maxSelections={5}
                  onChange={(val) => setEditBuffer({ ...editBuffer, languagesKnown: val })}
                />

                {/* HOBBIES / INTERESTS */}
                <MultiSelectField
                  label="HOBBIES / INTERESTS"
                  options={["Reading", "Writing", "Dancing", "Singing", "Music", "Bollywood", "Movies", "Cricket", "Football", "Badminton", "Sports", "Travelling", "Photography", "Cooking", "Gardening", "Drawing", "Painting", "Gaming", "Blogging", "Volunteering", "Fitness", "Yoga", "Fashion", "Watching TV", "Social Media", "Listening to Music"]}
                  value={Array.isArray(editBuffer.hobbies) ? editBuffer.hobbies : []}
                  maxSelections={5}
                  onChange={(val) => setEditBuffer({ ...editBuffer, hobbies: val })}
                />
                <InputField label="DECLARATION" value={editBuffer.declaration || 'I hereby declare that the information provided in this resume is true, complete, and accurate to the best of my knowledge and belief. I confirm that all the details furnished herein are genuine and correct.'} onChange={(val) => setEditBuffer({ ...editBuffer, declaration: val })} />
                <InputField label="AADHAAR NUMBER" value={editBuffer.aadhaarNumber || ''} onChange={(val) => setEditBuffer({ ...editBuffer, aadhaarNumber: val })} />
              </div>
              <FormButtons onCancel={cancelEditing} />
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs pt-1">
              <DisplayField label="FULL NAME" value={profileData.name} />
              <DisplayField label="HIGHEST QUALIFICATION" value={profileData.qualification || '10th'} />
              <DisplayField label="MOBILE NUMBER" value={profileData.mobile} />
              <DisplayField label="EMAIL ADDRESS" value={profileData.email} />
              <DisplayField label="FATHER'S NAME" value={profileData.fatherName} />
              <DisplayField label="FATHER'S OCCUPATION" value={profileData.fatherOccupation} />
              <DisplayField label="MOTHER'S NAME" value={profileData.motherName} />
              <DisplayField label="MOTHER'S OCCUPATION" value={profileData.motherOccupation} />
              <DisplayField label="DATE OF BIRTH" value={profileData.dob} />
              <DisplayField label="GENDER" value={profileData.gender} />
              <DisplayField label="ALTERNATE MOBILE" value={profileData.alternateMobile} />
              <DisplayField label="MARITAL STATUS" value={profileData.maritalStatus || 'Single'} />
              <DisplayField label="NATIONALITY" value={profileData.nationality || 'Indian'} />
              <DisplayField label="RELIGION" value={profileData.religion || 'Hinduism'} />
              <DisplayField label="CATEGORY" value={profileData.category || 'General'} />
              <DisplayField label="BLOOD GROUP" value={profileData.bloodGroup} />
              <DisplayField label="DISABILITY STATUS" value={profileData.disabilityStatus || 'No'} />
              <DisplayField label="AADHAAR NUMBER" value={profileData.aadhaarNumber || profileData.aadhaarLast4} />
              <DisplayField label="CAREER OBJECTIVE" value={profileData.careerObjective} />
              <DisplayField label="WORK EXPERIENCE" value={Array.isArray(profileData.workExperience) ? profileData.workExperience.join(", ") : profileData.workExperience} />
              <DisplayField label="OTHER QUALIFICATION" value={Array.isArray(profileData.otherQualification) ? profileData.otherQualification.join(", ") : profileData.otherQualification} />
              <DisplayField label="LANGUAGES KNOWN" value={Array.isArray(profileData.languagesKnown) ? profileData.languagesKnown.join(", ") : profileData.languagesKnown} />
              <DisplayField label="HOBBIES / INTERESTS" value={Array.isArray(profileData.hobbies) ? profileData.hobbies.join(", ") : profileData.hobbies} />
              <DisplayField label="DECLARATION" value={profileData.declaration} />
            </div>
          )}
        </AccordionCard>

        {/* SECTION 2: ADDRESS INFORMATION */}
        <AccordionCard
          isOpen={openSections.address}
          onToggle={() => toggleSection('address')}
          icon={<MapPin className="w-5 h-5 text-emerald-700" />}
          iconBg="bg-emerald-50 border-emerald-200 text-emerald-700"
          title="2. ADDRESS INFORMATION"
          subtitle="Permanent and present mailing addresses synced securely"
        >
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">ADDRESS FIELDS</span>
            {!editingSection ? (
              <button
                type="button"
                onClick={(e) => startEditing('address', e)}
                className="flex items-center gap-1 text-[#0B3B8C] hover:text-blue-700 font-bold text-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>EDIT</span>
              </button>
            ) : null}
          </div>

          {editingSection === 'address' ? (
            <form onSubmit={(e) => saveSection('address', e)} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="font-bold text-slate-800 block text-xs">A. PERMANENT ADDRESS</span>
                <SelectField
                  label="AREA TYPE"
                  options={['Rural', 'Urban']}
                  value={editBuffer.areaType || 'Rural'}
                  onChange={(val) => setEditBuffer({ ...editBuffer, areaType: val as 'Rural' | 'Urban' })}
                />

                {editBuffer.areaType === 'Urban' ? (
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <InputField label="AREA / LOCALITY / COLONY *" value={editBuffer.urbanLocality || ''} onChange={(val) => setEditBuffer({ ...editBuffer, urbanLocality: val })} />
                    <InputField label="LANDMARK (OPTIONAL)" value={editBuffer.urbanLandmark || editBuffer.permanentLandmark || ''} onChange={(val) => setEditBuffer({ ...editBuffer, urbanLandmark: val, permanentLandmark: val })} />
                    <InputField label="WARD NO (OPTIONAL)" value={editBuffer.urbanWardNo || ''} onChange={(val) => setEditBuffer({ ...editBuffer, urbanWardNo: val })} />
                    <InputField label="CITY / TOWN *" value={editBuffer.urbanCity || ''} onChange={(val) => setEditBuffer({ ...editBuffer, urbanCity: val })} />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <InputField label="AT (VILLAGE / WARD / HOUSE NO) *" value={editBuffer.addressAt || ''} onChange={(val) => setEditBuffer({ ...editBuffer, addressAt: val })} />
                    <InputField label="GRAM PANCHAYAT" value={editBuffer.permanentPanchayat || editBuffer.panchayat || ''} onChange={(val) => setEditBuffer({ ...editBuffer, permanentPanchayat: val, panchayat: val })} />
                    <InputField label="POST OFFICE" value={editBuffer.permanentPostOffice || editBuffer.postOffice || ''} onChange={(val) => setEditBuffer({ ...editBuffer, permanentPostOffice: val, postOffice: val })} />
                    <InputField label="POLICE STATION" value={editBuffer.permanentPoliceStation || editBuffer.policeStation || ''} onChange={(val) => setEditBuffer({ ...editBuffer, permanentPoliceStation: val, policeStation: val })} />
                    <InputField label="BLOCK" value={editBuffer.permanentBlockUlb || editBuffer.blockUlb || ''} onChange={(val) => setEditBuffer({ ...editBuffer, permanentBlockUlb: val, blockUlb: val })} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 sm:gap-3 border-t border-slate-200/80 pt-3">
                  <SelectField
                    label="STATE *"
                    options={ALL_INDIAN_STATES}
                    value={editBuffer.permanentState || editBuffer.state || ''}
                    onChange={(val) => {
                      const availDists = getDistrictsForState(val);
                      const currentDist = editBuffer.permanentDistrict || editBuffer.district || '';
                      const newDist = availDists.includes(currentDist) ? currentDist : '';
                      setEditBuffer({
                        ...editBuffer,
                        permanentState: val,
                        state: val,
                        permanentDistrict: newDist,
                        district: newDist
                      });
                    }}
                  />
                  <SelectField
                    label="DISTRICT *"
                    options={getDistrictsForState(editBuffer.permanentState || editBuffer.state || '')}
                    value={editBuffer.permanentDistrict || editBuffer.district || ''}
                    onChange={(val) => setEditBuffer({ ...editBuffer, permanentDistrict: val, district: val })}
                  />
                  <InputField label="PIN CODE *" value={editBuffer.permanentPincode || editBuffer.pincode || ''} onChange={(val) => setEditBuffer({ ...editBuffer, permanentPincode: val, pincode: val })} />
                  <InputField label="COUNTRY" value={editBuffer.permanentCountry || editBuffer.country || 'India'} onChange={(val) => setEditBuffer({ ...editBuffer, permanentCountry: val, country: val })} />
                </div>
              </div>

              {/* Present Address Edit */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="font-bold text-slate-800 block text-xs">B. PRESENT ADDRESS</span>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editBuffer.sameAsPermanent ?? true}
                    onChange={(e) => setEditBuffer({ ...editBuffer, sameAsPermanent: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 accent-[#0B3B8C]"
                  />
                  <span>Same as Permanent Address</span>
                </label>

                {!editBuffer.sameAsPermanent && (
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    {editBuffer.areaType === 'Urban' ? (
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <InputField label="PRESENT LOCALITY / COLONY *" value={editBuffer.presentUrbanLocality || ''} onChange={(val) => setEditBuffer({ ...editBuffer, presentUrbanLocality: val })} />
                        <InputField label="PRESENT LANDMARK" value={editBuffer.presentUrbanLandmark || ''} onChange={(val) => setEditBuffer({ ...editBuffer, presentUrbanLandmark: val })} />
                        <InputField label="PRESENT WARD NO" value={editBuffer.presentUrbanWardNo || ''} onChange={(val) => setEditBuffer({ ...editBuffer, presentUrbanWardNo: val })} />
                        <InputField label="PRESENT CITY / TOWN *" value={editBuffer.presentUrbanCity || ''} onChange={(val) => setEditBuffer({ ...editBuffer, presentUrbanCity: val })} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <InputField label="PRESENT AT (VILLAGE / WARD) *" value={editBuffer.presentAddressAt || ''} onChange={(val) => setEditBuffer({ ...editBuffer, presentAddressAt: val })} />
                        <InputField label="PRESENT GRAM PANCHAYAT" value={editBuffer.presentGramPanchayat || ''} onChange={(val) => setEditBuffer({ ...editBuffer, presentGramPanchayat: val })} />
                        <InputField label="PRESENT POST OFFICE" value={editBuffer.presentPostOffice || ''} onChange={(val) => setEditBuffer({ ...editBuffer, presentPostOffice: val })} />
                        <InputField label="PRESENT POLICE STATION" value={editBuffer.presentPoliceStation || ''} onChange={(val) => setEditBuffer({ ...editBuffer, presentPoliceStation: val })} />
                        <InputField label="PRESENT BLOCK" value={editBuffer.presentBlock || ''} onChange={(val) => setEditBuffer({ ...editBuffer, presentBlock: val })} />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 border-t border-slate-200/80 pt-3">
                      <SelectField
                        label="PRESENT STATE *"
                        options={ALL_INDIAN_STATES}
                        value={editBuffer.presentState || ''}
                        onChange={(val) => {
                          const availDists = getDistrictsForState(val);
                          const currentDist = editBuffer.presentDistrict || '';
                          const newDist = availDists.includes(currentDist) ? currentDist : '';
                          setEditBuffer({ ...editBuffer, presentState: val, presentDistrict: newDist });
                        }}
                      />
                      <SelectField
                        label="PRESENT DISTRICT *"
                        options={getDistrictsForState(editBuffer.presentState || '')}
                        value={editBuffer.presentDistrict || ''}
                        onChange={(val) => setEditBuffer({ ...editBuffer, presentDistrict: val })}
                      />
                      <InputField label="PRESENT PIN CODE *" value={editBuffer.presentPincode || ''} onChange={(val) => setEditBuffer({ ...editBuffer, presentPincode: val })} />
                      <InputField label="PRESENT COUNTRY" value={editBuffer.presentCountry || 'India'} onChange={(val) => setEditBuffer({ ...editBuffer, presentCountry: val })} />
                    </div>
                  </div>
                )}
              </div>

              <FormButtons onCancel={cancelEditing} />
            </form>
          ) : (
            <div className="space-y-4 text-xs pt-1">
              {/* PERMANENT ADDRESS DISPLAY */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 block text-[11px]">A. PERMANENT ADDRESS</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0B3B8C] border border-blue-200 text-[10px] font-bold">
                    Area: {profileData.areaType || 'Rural'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {profileData.areaType === 'Urban' ? (
                    <>
                      <DisplayField label="LOCALITY / COLONY" value={profileData.urbanLocality || profileData.addressAt} />
                      <DisplayField label="LANDMARK" value={profileData.urbanLandmark || profileData.permanentLandmark || profileData.landmark} />
                      <DisplayField label="WARD NO" value={profileData.urbanWardNo} />
                      <DisplayField label="CITY / TOWN" value={profileData.urbanCity} />
                    </>
                  ) : (
                    <>
                      <DisplayField label="AT (VILLAGE / WARD)" value={profileData.addressAt} />
                      <DisplayField label="GRAM PANCHAYAT" value={profileData.permanentPanchayat || profileData.panchayat} />
                      <DisplayField label="POST OFFICE" value={profileData.permanentPostOffice || profileData.postOffice} />
                      <DisplayField label="POLICE STATION" value={profileData.permanentPoliceStation || profileData.policeStation} />
                      <DisplayField label="BLOCK" value={profileData.permanentBlockUlb || profileData.blockUlb} />
                    </>
                  )}
                  <DisplayField label="DISTRICT" value={profileData.permanentDistrict || profileData.district} />
                  <DisplayField label="STATE" value={profileData.permanentState || profileData.state} />
                  <DisplayField label="PIN CODE" value={profileData.permanentPincode || profileData.pincode} />
                  <DisplayField label="COUNTRY" value={profileData.permanentCountry || profileData.country || 'India'} />
                </div>
              </div>

              {/* Same as Permanent Indicator */}
              {profileData.sameAsPermanent ? (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-[11px] font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Present Address is same as Permanent Address</span>
                </div>
              ) : (
                /* PRESENT ADDRESS DISPLAY */
                <div className="space-y-2.5 pt-1 border-t border-slate-200">
                  <span className="font-bold text-slate-800 block text-[11px]">B. PRESENT ADDRESS</span>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    {profileData.areaType === 'Urban' ? (
                      <>
                        <DisplayField label="LOCALITY / COLONY" value={profileData.presentUrbanLocality} />
                        <DisplayField label="LANDMARK" value={profileData.presentUrbanLandmark} />
                        <DisplayField label="WARD NO" value={profileData.presentUrbanWardNo} />
                        <DisplayField label="CITY / TOWN" value={profileData.presentUrbanCity} />
                      </>
                    ) : (
                      <>
                        <DisplayField label="AT (VILLAGE / WARD)" value={profileData.presentAddressAt} />
                        <DisplayField label="GRAM PANCHAYAT" value={profileData.presentGramPanchayat} />
                        <DisplayField label="POST OFFICE" value={profileData.presentPostOffice} />
                        <DisplayField label="POLICE STATION" value={profileData.presentPoliceStation} />
                        <DisplayField label="BLOCK" value={profileData.presentBlock} />
                      </>
                    )}
                    <DisplayField label="DISTRICT" value={profileData.presentDistrict} />
                    <DisplayField label="STATE" value={profileData.presentState} />
                    <DisplayField label="PIN CODE" value={profileData.presentPincode} />
                    <DisplayField label="COUNTRY" value={profileData.presentCountry || 'India'} />
                  </div>
                </div>
              )}
            </div>
          )}
        </AccordionCard>

        {/* SECTION 3: EDUCATION DETAILS */}
        <AccordionCard
          isOpen={openSections.education}
          onToggle={() => toggleSection('education')}
          icon={<GraduationCap className="w-5 h-5 text-purple-700" />}
          iconBg="bg-purple-50 border-purple-200 text-purple-700"
          title="3. EDUCATION DETAILS"
          subtitle={getEducationSubtitle(profileData.qualification)}
        >
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">ACADEMIC RECORDS</span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-200">
                Level: {profileData.qualification || '10th'}
              </span>
            </div>
            {!editingSection ? (
              <button
                type="button"
                onClick={(e) => startEditing('education', e)}
                className="flex items-center gap-1 text-[#0B3B8C] hover:text-blue-700 font-bold text-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>EDIT</span>
              </button>
            ) : null}
          </div>

          {editingSection === 'education' ? (
            <form onSubmit={(e) => saveSection('education', e)} className="space-y-4 text-xs pt-1">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                <SelectField
                  label="HIGHEST QUALIFICATION"
                  options={['Below 10th', '10th', '12th', 'ITI / Diploma', 'Graduation', 'Post Graduation', 'Ph.D.']}
                  value={editBuffer.qualification || '10th'}
                  onChange={(val) => setEditBuffer({ ...editBuffer, qualification: val })}
                />
                <p className="text-[11px] text-purple-700 font-medium">
                  Educational record forms below adjust dynamically according to the selected qualification level (<strong>{editBuffer.qualification || '10th'}</strong>).
                </p>
              </div>

              {(() => {
                const ed = getEducationLevels(editBuffer.qualification);
                return (
                  <div className="space-y-4">
                    {ed.isBelow10th && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          <span>Qualification set to Below 10th</span>
                        </div>
                        <p className="text-[11px] text-amber-700 font-normal">
                          No 10th, 12th, or higher educational marksheets are required for this qualification level.
                        </p>
                      </div>
                    )}

                    {ed.show10th && (
                      <>
                        {/* 10TH MARKSHEET EDIT */}
                        <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                          <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wide">
                            <div className="w-2 h-2 rounded-full bg-purple-600" />
                            <span>10TH STANDARD MARKSHEET</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <InputField label="ROLL NUMBER" value={editBuffer.tenthRollNumber || ''} onChange={(val) => setEditBuffer({ ...editBuffer, tenthRollNumber: val })} />
                            <InputField label="BOARD NAME" value={editBuffer.tenthBoardName || ''} onChange={(val) => setEditBuffer({ ...editBuffer, tenthBoardName: val })} />
                            <InputField label="SCHOOL NAME" value={editBuffer.tenthSchoolName || ''} onChange={(val) => setEditBuffer({ ...editBuffer, tenthSchoolName: val })} />
                            <InputField label="YEAR OF PASSING" value={editBuffer.tenthPassingYear || ''} onChange={(val) => setEditBuffer({ ...editBuffer, tenthPassingYear: val })} />
                            <InputField
                              label="TOTAL MARKS"
                              value={editBuffer.tenthTotalMarks || ''}
                              onChange={(val) => {
                                const autoPct = calcAutoPercentage(val, editBuffer.tenthSecuredMarks);
                                setEditBuffer({
                                  ...editBuffer,
                                  tenthTotalMarks: val,
                                  tenthPercentage: autoPct || editBuffer.tenthPercentage || '',
                                });
                              }}
                            />
                            <InputField
                              label="SECURED MARKS"
                              value={editBuffer.tenthSecuredMarks || ''}
                              onChange={(val) => {
                                const autoPct = calcAutoPercentage(editBuffer.tenthTotalMarks, val);
                                setEditBuffer({
                                  ...editBuffer,
                                  tenthSecuredMarks: val,
                                  tenthPercentage: autoPct || editBuffer.tenthPercentage || '',
                                });
                              }}
                            />
                            <InputField label="PERCENTAGE (%)" value={editBuffer.tenthPercentage || ''} onChange={(val) => setEditBuffer({ ...editBuffer, tenthPercentage: val })} />
                          </div>
                        </div>

                        {/* 10TH CERTIFICATE EDIT */}
                        <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                          <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wide">
                            <div className="w-2 h-2 rounded-full bg-purple-600" />
                            <span>10TH STANDARD PASSING CERTIFICATE</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <InputField label="CERTIFICATE NUMBER" value={editBuffer.tenthCertNumber || ''} onChange={(val) => setEditBuffer({ ...editBuffer, tenthCertNumber: val })} />
                          </div>
                        </div>
                      </>
                    )}

                    {ed.show12th && (
                      <>
                        {/* 12TH MARKSHEET EDIT */}
                        <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                          <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wide">
                            <div className="w-2 h-2 rounded-full bg-purple-600" />
                            <span>12TH STANDARD MARKSHEET</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <InputField label="ROLL NUMBER" value={editBuffer.twelfthRollNumber || ''} onChange={(val) => setEditBuffer({ ...editBuffer, twelfthRollNumber: val })} />
                            <InputField label="REGISTRATION NUMBER" value={editBuffer.twelfthRegNumber || ''} onChange={(val) => setEditBuffer({ ...editBuffer, twelfthRegNumber: val })} />
                            <InputField label="COUNCIL / BOARD NAME" value={editBuffer.twelfthCouncilBoard || ''} onChange={(val) => setEditBuffer({ ...editBuffer, twelfthCouncilBoard: val })} />
                            <InputField label="SCHOOL / COLLEGE NAME" value={editBuffer.twelfthSchoolCollegeName || ''} onChange={(val) => setEditBuffer({ ...editBuffer, twelfthSchoolCollegeName: val })} />
                            <SelectField label="STREAM" options={['Arts', 'Science', 'Commerce', 'Vocational']} value={editBuffer.twelfthStream || 'Science'} onChange={(val) => setEditBuffer({ ...editBuffer, twelfthStream: val })} />
                            <InputField label="YEAR OF PASSING" value={editBuffer.twelfthPassingYear || ''} onChange={(val) => setEditBuffer({ ...editBuffer, twelfthPassingYear: val })} />
                            <InputField
                              label="TOTAL MARKS"
                              value={editBuffer.twelfthTotalMarks || ''}
                              onChange={(val) => {
                                const autoPct = calcAutoPercentage(val, editBuffer.twelfthSecuredMarks);
                                setEditBuffer({
                                  ...editBuffer,
                                  twelfthTotalMarks: val,
                                  twelfthPercentage: autoPct || editBuffer.twelfthPercentage || '',
                                });
                              }}
                            />
                            <InputField
                              label="SECURED MARKS"
                              value={editBuffer.twelfthSecuredMarks || ''}
                              onChange={(val) => {
                                const autoPct = calcAutoPercentage(editBuffer.twelfthTotalMarks, val);
                                setEditBuffer({
                                  ...editBuffer,
                                  twelfthSecuredMarks: val,
                                  twelfthPercentage: autoPct || editBuffer.twelfthPercentage || '',
                                });
                              }}
                            />
                            <InputField label="PERCENTAGE (%)" value={editBuffer.twelfthPercentage || ''} onChange={(val) => setEditBuffer({ ...editBuffer, twelfthPercentage: val })} />
                          </div>
                        </div>

                        {/* 12TH CERTIFICATE EDIT */}
                        <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                          <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wide">
                            <div className="w-2 h-2 rounded-full bg-purple-600" />
                            <span>12TH STANDARD PASSING CERTIFICATE</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <InputField label="CERTIFICATE NUMBER" value={editBuffer.twelfthCertNumber || ''} onChange={(val) => setEditBuffer({ ...editBuffer, twelfthCertNumber: val })} />
                          </div>
                        </div>
                      </>
                    )}

                    {ed.showDiploma && (
                      <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                        <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wide">
                          <div className="w-2 h-2 rounded-full bg-purple-600" />
                          <span>ITI / DIPLOMA DETAILS</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <InputField label="COURSE / TRADE NAME" value={editBuffer.diplomaCourseName || ''} onChange={(val) => setEditBuffer({ ...editBuffer, diplomaCourseName: val })} />
                          <InputField label="INSTITUTE / COLLEGE NAME" value={editBuffer.diplomaCollegeName || ''} onChange={(val) => setEditBuffer({ ...editBuffer, diplomaCollegeName: val })} />
                          <InputField label="BOARD / UNIVERSITY" value={editBuffer.diplomaBoardUniversity || ''} onChange={(val) => setEditBuffer({ ...editBuffer, diplomaBoardUniversity: val })} />
                          <InputField label="ROLL NUMBER" value={editBuffer.diplomaRollNumber || ''} onChange={(val) => setEditBuffer({ ...editBuffer, diplomaRollNumber: val })} />
                          <InputField label="YEAR OF PASSING" value={editBuffer.diplomaPassingYear || ''} onChange={(val) => setEditBuffer({ ...editBuffer, diplomaPassingYear: val })} />
                          <InputField
                            label="TOTAL MARKS"
                            value={editBuffer.diplomaTotalMarks || ''}
                            onChange={(val) => {
                              const autoPct = calcAutoPercentage(val, editBuffer.diplomaSecuredMarks);
                              setEditBuffer({
                                ...editBuffer,
                                diplomaTotalMarks: val,
                                diplomaPercentage: autoPct || editBuffer.diplomaPercentage || '',
                              });
                            }}
                          />
                          <InputField
                            label="SECURED MARKS"
                            value={editBuffer.diplomaSecuredMarks || ''}
                            onChange={(val) => {
                              const autoPct = calcAutoPercentage(editBuffer.diplomaTotalMarks, val);
                              setEditBuffer({
                                ...editBuffer,
                                diplomaSecuredMarks: val,
                                diplomaPercentage: autoPct || editBuffer.diplomaPercentage || '',
                              });
                            }}
                          />
                          <InputField label="PERCENTAGE (%)" value={editBuffer.diplomaPercentage || ''} onChange={(val) => setEditBuffer({ ...editBuffer, diplomaPercentage: val })} />
                          <InputField label="CERTIFICATE NUMBER" value={editBuffer.diplomaCertNumber || ''} onChange={(val) => setEditBuffer({ ...editBuffer, diplomaCertNumber: val })} />
                        </div>
                      </div>
                    )}

                    {ed.showGraduation && (
                      <>
                        {/* DEGREE MARKSHEET EDIT */}
                        <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                          <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wide">
                            <div className="w-2 h-2 rounded-full bg-purple-600" />
                            <span>+3 SEMESTER / DEGREE MARKSHEET</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <InputField label="COLLEGE NAME" value={editBuffer.degreeCollegeName || ''} onChange={(val) => setEditBuffer({ ...editBuffer, degreeCollegeName: val })} />
                            <InputField label="UNIVERSITY NAME" value={editBuffer.degreeUniversityName || ''} onChange={(val) => setEditBuffer({ ...editBuffer, degreeUniversityName: val })} />
                            <InputField label="COURSE / DEGREE NAME" value={editBuffer.degreeCourseName || ''} onChange={(val) => setEditBuffer({ ...editBuffer, degreeCourseName: val })} />
                            <InputField label="SEMESTER NUMBER" value={editBuffer.degreeSemesterNumber || ''} onChange={(val) => setEditBuffer({ ...editBuffer, degreeSemesterNumber: val })} />
                            <InputField label="ROLL NUMBER" value={editBuffer.degreeRollNumber || ''} onChange={(val) => setEditBuffer({ ...editBuffer, degreeRollNumber: val })} />
                            <InputField label="REGISTRATION NUMBER" value={editBuffer.degreeRegNumber || ''} onChange={(val) => setEditBuffer({ ...editBuffer, degreeRegNumber: val })} />
                            <InputField
                              label="TOTAL MARKS"
                              value={editBuffer.degreeTotalMarks || ''}
                              onChange={(val) => {
                                const autoPct = calcAutoPercentage(val, editBuffer.degreeSecuredMarks);
                                setEditBuffer({
                                  ...editBuffer,
                                  degreeTotalMarks: val,
                                  degreeEquivalentPercentage: autoPct || editBuffer.degreeEquivalentPercentage || '',
                                });
                              }}
                            />
                            <InputField
                              label="SECURED MARKS"
                              value={editBuffer.degreeSecuredMarks || ''}
                              onChange={(val) => {
                                const autoPct = calcAutoPercentage(editBuffer.degreeTotalMarks, val);
                                setEditBuffer({
                                  ...editBuffer,
                                  degreeSecuredMarks: val,
                                  degreeEquivalentPercentage: autoPct || editBuffer.degreeEquivalentPercentage || '',
                                });
                              }}
                            />
                            <InputField label="SGPA / CGPA OBTAINED" value={editBuffer.degreeSgpaCgpa || ''} onChange={(val) => setEditBuffer({ ...editBuffer, degreeSgpaCgpa: val })} />
                            <InputField label="EQUIVALENT PERCENTAGE (%)" value={editBuffer.degreeEquivalentPercentage || ''} onChange={(val) => setEditBuffer({ ...editBuffer, degreeEquivalentPercentage: val })} />
                            <InputField label="YEAR OF PASSING" value={editBuffer.degreePassingYear || ''} onChange={(val) => setEditBuffer({ ...editBuffer, degreePassingYear: val })} />
                          </div>
                        </div>

                        {/* DEGREE CERTIFICATE EDIT */}
                        <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                          <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wide">
                            <div className="w-2 h-2 rounded-full bg-purple-600" />
                            <span>GRADUATION / DEGREE CERTIFICATE</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <InputField label="CERTIFICATE NUMBER" value={editBuffer.degreeCertNumber || ''} onChange={(val) => setEditBuffer({ ...editBuffer, degreeCertNumber: val })} />
                          </div>
                        </div>
                      </>
                    )}

                    {ed.showPG && (
                      <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                        <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wide">
                          <div className="w-2 h-2 rounded-full bg-purple-600" />
                          <span>POST GRADUATION (PG) DETAILS</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <InputField label="PG DEGREE NAME" value={editBuffer.pgDegreeName || ''} onChange={(val) => setEditBuffer({ ...editBuffer, pgDegreeName: val })} />
                          <InputField label="COLLEGE NAME" value={editBuffer.pgCollegeName || ''} onChange={(val) => setEditBuffer({ ...editBuffer, pgCollegeName: val })} />
                          <InputField label="UNIVERSITY NAME" value={editBuffer.pgUniversityName || ''} onChange={(val) => setEditBuffer({ ...editBuffer, pgUniversityName: val })} />
                          <InputField label="ROLL NUMBER" value={editBuffer.pgRollNumber || ''} onChange={(val) => setEditBuffer({ ...editBuffer, pgRollNumber: val })} />
                          <InputField label="YEAR OF PASSING" value={editBuffer.pgPassingYear || ''} onChange={(val) => setEditBuffer({ ...editBuffer, pgPassingYear: val })} />
                          <InputField
                            label="TOTAL MARKS"
                            value={editBuffer.pgTotalMarks || ''}
                            onChange={(val) => {
                              const autoPct = calcAutoPercentage(val, editBuffer.pgSecuredMarks);
                              setEditBuffer({
                                ...editBuffer,
                                pgTotalMarks: val,
                                pgPercentage: autoPct || editBuffer.pgPercentage || '',
                              });
                            }}
                          />
                          <InputField
                            label="SECURED MARKS"
                            value={editBuffer.pgSecuredMarks || ''}
                            onChange={(val) => {
                              const autoPct = calcAutoPercentage(editBuffer.pgTotalMarks, val);
                              setEditBuffer({
                                ...editBuffer,
                                pgSecuredMarks: val,
                                pgPercentage: autoPct || editBuffer.pgPercentage || '',
                              });
                            }}
                          />
                          <InputField label="PERCENTAGE / CGPA" value={editBuffer.pgPercentage || ''} onChange={(val) => setEditBuffer({ ...editBuffer, pgPercentage: val })} />
                          <InputField label="CERTIFICATE NUMBER" value={editBuffer.pgCertNumber || ''} onChange={(val) => setEditBuffer({ ...editBuffer, pgCertNumber: val })} />
                        </div>
                      </div>
                    )}

                    {ed.showPhD && (
                      <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                        <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wide">
                          <div className="w-2 h-2 rounded-full bg-purple-600" />
                          <span>PH.D. / DOCTORATE DETAILS</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <InputField label="SPECIALIZATION / TOPIC" value={editBuffer.phdSpecialization || ''} onChange={(val) => setEditBuffer({ ...editBuffer, phdSpecialization: val })} />
                          <InputField label="UNIVERSITY / INSTITUTE" value={editBuffer.phdUniversity || ''} onChange={(val) => setEditBuffer({ ...editBuffer, phdUniversity: val })} />
                          <InputField label="REGISTRATION NO" value={editBuffer.phdRegNumber || ''} onChange={(val) => setEditBuffer({ ...editBuffer, phdRegNumber: val })} />
                          <InputField label="AWARD / COMPLETION YEAR" value={editBuffer.phdPassingYear || ''} onChange={(val) => setEditBuffer({ ...editBuffer, phdPassingYear: val })} />
                          <InputField label="CERTIFICATE NUMBER" value={editBuffer.phdCertNumber || ''} onChange={(val) => setEditBuffer({ ...editBuffer, phdCertNumber: val })} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <FormButtons onCancel={cancelEditing} />
            </form>
          ) : (
            /* DISPLAY MODE */
            <div className="space-y-4 text-xs pt-1">
              {(() => {
                const ed = getEducationLevels(profileData.qualification);
                return (
                  <>
                    {ed.isBelow10th && (
                      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1">
                        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          <span>Qualification: Below 10th</span>
                        </div>
                        <p className="text-[11px] text-amber-800 font-medium">
                          The candidate's qualification level is Below 10th. High school marksheets or degree certificates are not required.
                        </p>
                      </div>
                    )}

                    {ed.show10th && (
                      <>
                        {/* 10TH STANDARD MARKSHEET */}
                        <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-600" />
                            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">10TH STANDARD MARKSHEET</span>
                          </div>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                            <DisplayField label="ROLL NUMBER" value={profileData.tenthRollNumber} />
                            <DisplayField label="BOARD NAME (E.G. BSE, CBSE)" value={profileData.tenthBoardName} />
                            <DisplayField label="SCHOOL NAME" value={profileData.tenthSchoolName} />
                            <DisplayField label="YEAR OF PASSING" value={profileData.tenthPassingYear} />
                            <DisplayField label="TOTAL MARKS" value={profileData.tenthTotalMarks} />
                            <DisplayField label="SECURED MARKS" value={profileData.tenthSecuredMarks} />
                            <DisplayField label="PERCENTAGE (%)" value={profileData.tenthPercentage} />
                          </div>
                        </div>

                        {/* 10TH STANDARD PASSING CERTIFICATE */}
                        <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-600" />
                            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">10TH STANDARD PASSING CERTIFICATE</span>
                          </div>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                            <DisplayField label="CERTIFICATE NUMBER" value={profileData.tenthCertNumber} />
                          </div>
                        </div>
                      </>
                    )}

                    {ed.show12th && (
                      <>
                        {/* 12TH STANDARD MARKSHEET */}
                        <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-600" />
                            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">12TH STANDARD MARKSHEET</span>
                          </div>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                            <DisplayField label="ROLL NUMBER" value={profileData.twelfthRollNumber} />
                            <DisplayField label="REGISTRATION NUMBER" value={profileData.twelfthRegNumber} />
                            <DisplayField label="COUNCIL / BOARD NAME (E.G. CHSE, CBSE)" value={profileData.twelfthCouncilBoard} />
                            <DisplayField label="SCHOOL / COLLEGE NAME" value={profileData.twelfthSchoolCollegeName} />
                            <DisplayField label="STREAM" value={profileData.twelfthStream || 'Science'} />
                            <DisplayField label="YEAR OF PASSING" value={profileData.twelfthPassingYear} />
                            <DisplayField label="TOTAL MARKS" value={profileData.twelfthTotalMarks} />
                            <DisplayField label="SECURED MARKS" value={profileData.twelfthSecuredMarks} />
                            <DisplayField label="PERCENTAGE (%)" value={profileData.twelfthPercentage} />
                          </div>
                        </div>

                        {/* 12TH STANDARD PASSING CERTIFICATE */}
                        <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-600" />
                            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">12TH STANDARD PASSING CERTIFICATE</span>
                          </div>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                            <DisplayField label="CERTIFICATE NUMBER" value={profileData.twelfthCertNumber} />
                          </div>
                        </div>
                      </>
                    )}

                    {ed.showDiploma && (
                      <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-600" />
                          <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">ITI / DIPLOMA DETAILS</span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                          <DisplayField label="COURSE / TRADE NAME" value={profileData.diplomaCourseName} />
                          <DisplayField label="INSTITUTE / COLLEGE NAME" value={profileData.diplomaCollegeName} />
                          <DisplayField label="BOARD / UNIVERSITY" value={profileData.diplomaBoardUniversity} />
                          <DisplayField label="ROLL NUMBER" value={profileData.diplomaRollNumber} />
                          <DisplayField label="YEAR OF PASSING" value={profileData.diplomaPassingYear} />
                          {profileData.diplomaTotalMarks && <DisplayField label="TOTAL MARKS" value={profileData.diplomaTotalMarks} />}
                          {profileData.diplomaSecuredMarks && <DisplayField label="SECURED MARKS" value={profileData.diplomaSecuredMarks} />}
                          <DisplayField label="PERCENTAGE (%)" value={profileData.diplomaPercentage} />
                          <DisplayField label="CERTIFICATE NUMBER" value={profileData.diplomaCertNumber} />
                        </div>
                      </div>
                    )}

                    {ed.showGraduation && (
                      <>
                        {/* DEGREE / SEMESTER MARKSHEET */}
                        <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-600" />
                            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">+3 SEMESTER MARKSHEET / DEGREE MARKSHEET</span>
                          </div>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                            <DisplayField label="COLLEGE NAME" value={profileData.degreeCollegeName} />
                            <DisplayField label="UNIVERSITY NAME" value={profileData.degreeUniversityName} />
                            <DisplayField label="COURSE / DEGREE NAME (E.G. B.TECH, B.SC)" value={profileData.degreeCourseName} />
                            <DisplayField label="SEMESTER NUMBER" value={profileData.degreeSemesterNumber} />
                            <DisplayField label="ROLL NUMBER" value={profileData.degreeRollNumber} />
                            <DisplayField label="REGISTRATION NUMBER" value={profileData.degreeRegNumber} />
                            {profileData.degreeTotalMarks && <DisplayField label="TOTAL MARKS" value={profileData.degreeTotalMarks} />}
                            {profileData.degreeSecuredMarks && <DisplayField label="SECURED MARKS" value={profileData.degreeSecuredMarks} />}
                            <DisplayField label="SGPA / CGPA OBTAINED" value={profileData.degreeSgpaCgpa} />
                            <DisplayField label="EQUIVALENT PERCENTAGE (%)" value={profileData.degreeEquivalentPercentage} />
                            <DisplayField label="YEAR OF PASSING" value={profileData.degreePassingYear} />
                          </div>
                        </div>

                        {/* GRADUATION / DEGREE CERTIFICATE */}
                        <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-600" />
                            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">GRADUATION / DEGREE CERTIFICATE</span>
                          </div>
                          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                            <DisplayField label="CERTIFICATE NUMBER" value={profileData.degreeCertNumber} />
                          </div>
                        </div>
                      </>
                    )}

                    {ed.showPG && (
                      <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-600" />
                          <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">POST GRADUATION (PG) DETAILS</span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                          <DisplayField label="PG DEGREE NAME" value={profileData.pgDegreeName} />
                          <DisplayField label="COLLEGE NAME" value={profileData.pgCollegeName} />
                          <DisplayField label="UNIVERSITY NAME" value={profileData.pgUniversityName} />
                          <DisplayField label="ROLL NUMBER" value={profileData.pgRollNumber} />
                          <DisplayField label="YEAR OF PASSING" value={profileData.pgPassingYear} />
                          {profileData.pgTotalMarks && <DisplayField label="TOTAL MARKS" value={profileData.pgTotalMarks} />}
                          {profileData.pgSecuredMarks && <DisplayField label="SECURED MARKS" value={profileData.pgSecuredMarks} />}
                          <DisplayField label="PERCENTAGE / CGPA" value={profileData.pgPercentage} />
                          <DisplayField label="CERTIFICATE NUMBER" value={profileData.pgCertNumber} />
                        </div>
                      </div>
                    )}

                    {ed.showPhD && (
                      <div className="p-3.5 sm:p-4 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-600" />
                          <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">PH.D. / DOCTORATE DETAILS</span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                          <DisplayField label="SPECIALIZATION / TOPIC" value={profileData.phdSpecialization} />
                          <DisplayField label="UNIVERSITY / INSTITUTE" value={profileData.phdUniversity} />
                          <DisplayField label="REGISTRATION NO" value={profileData.phdRegNumber} />
                          <DisplayField label="AWARD / COMPLETION YEAR" value={profileData.phdPassingYear} />
                          <DisplayField label="CERTIFICATE NUMBER" value={profileData.phdCertNumber} />
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </AccordionCard>

        {/* SECTION 4: BANK DETAILS */}
        <AccordionCard
          isOpen={openSections.bank}
          onToggle={() => toggleSection('bank')}
          icon={<Building2 className="w-5 h-5 text-amber-700" />}
          iconBg="bg-amber-50 border-amber-200 text-amber-700"
          title="4. BANK DETAILS"
          subtitle="Verified bank accounts, IFSC auto branch codes, and UPI aliases"
        >
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">ACCOUNT LOCKER</span>
            {!editingSection ? (
              <button
                type="button"
                onClick={(e) => startEditing('bank', e)}
                className="flex items-center gap-1 text-[#0B3B8C] hover:text-blue-700 font-bold text-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>EDIT</span>
              </button>
            ) : null}
          </div>

          {/* FIELDS DISPLAY OR FORM */}
          {editingSection === 'bank' ? (
            <form onSubmit={(e) => saveSection('bank', e)} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider flex items-center justify-between">
                    <span>IFSC CODE (11 ALPHANUMERIC CHARACTERS) *</span>
                    {ifscLoading && (
                      <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1 animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Fetching Branch...
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={11}
                      value={editBuffer.bankIfsc || ''}
                      onChange={(e) => {
                        const uppercaseIfsc = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                        setEditBuffer((prev) => ({ ...prev, bankIfsc: uppercaseIfsc }));
                        if (uppercaseIfsc.length === 11) {
                          handleIfscLookup(uppercaseIfsc);
                        } else {
                          setIfscStatus(null);
                        }
                      }}
                      placeholder="e.g. SBIN0001234"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-[#0B3B8C]/20 focus:border-[#0B3B8C] pr-20"
                    />
                    {editBuffer.bankIfsc && editBuffer.bankIfsc.length === 11 && !ifscLoading && (
                      <button
                        type="button"
                        onClick={() => handleIfscLookup(editBuffer.bankIfsc!)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-[#0B3B8C] hover:bg-blue-800 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Auto-Fill</span>
                      </button>
                    )}
                  </div>
                  {ifscStatus && (
                    <div
                      className={`text-[11px] font-bold mt-1.5 p-2 rounded-lg flex items-center gap-1.5 border ${
                        ifscStatus.success
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {ifscStatus.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      )}
                      <span>{ifscStatus.message}</span>
                    </div>
                  )}
                </div>
                <InputField
                  label="ACCOUNT HOLDER NAME *"
                  value={editBuffer.bankAccountHolderName || ''}
                  onChange={(val) => setEditBuffer({ ...editBuffer, bankAccountHolderName: val })}
                  placeholder="e.g. Inter Holder Name"
                />
                <InputField
                  label="BANK NAME *"
                  value={editBuffer.bankName || ''}
                  onChange={(val) => setEditBuffer({ ...editBuffer, bankName: val })}
                  placeholder="e.g. State Bank of India"
                />
                <InputField
                  label="BRANCH NAME *"
                  value={editBuffer.bankBranch || ''}
                  onChange={(val) => setEditBuffer({ ...editBuffer, bankBranch: val })}
                  placeholder="e.g. Khordha Main Branch"
                />
                <InputField
                  label="ACCOUNT NUMBER *"
                  value={editBuffer.bankAccountNumber || ''}
                  onChange={(val) => setEditBuffer({ ...editBuffer, bankAccountNumber: val })}
                  placeholder="e.g. 30123456789"
                />
                <InputField
                  label="CONFIRM ACCOUNT NUMBER *"
                  value={editBuffer.confirmBankAccountNumber || ''}
                  onChange={(val) => setEditBuffer({ ...editBuffer, confirmBankAccountNumber: val })}
                  placeholder="Re-enter account number"
                />
              </div>
              {editBuffer.bankAccountNumber && editBuffer.confirmBankAccountNumber && editBuffer.bankAccountNumber !== editBuffer.confirmBankAccountNumber && (
                <p className="text-[11px] font-bold text-red-500">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Account number and Confirm account number do not match!</p>
              )}
              <FormButtons onCancel={cancelEditing} />
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs pt-1">
              <DisplayField label="IFSC CODE (11 ALPHANUMERIC CHARACTERS)" value={profileData.bankIfsc} />
              <DisplayField label="ACCOUNT HOLDER NAME" value={profileData.bankAccountHolderName} />
              <DisplayField label="BANK NAME" value={profileData.bankName} />
              <DisplayField label="BRANCH NAME" value={profileData.bankBranch} />
              <DisplayField label="ACCOUNT NUMBER" value={profileData.bankAccountNumber} />
              <DisplayField label="CONFIRM ACCOUNT NUMBER" value={profileData.confirmBankAccountNumber} />
            </div>
          )}
        </AccordionCard>

        {/* SECTION 5: OTHER CERTIFICATES */}
        <AccordionCard
          isOpen={openSections.otherCertificates}
          onToggle={() => toggleSection('otherCertificates')}
          icon={<Award className="w-5 h-5 text-[#0B3B8C]" />}
          iconBg="bg-blue-50 border-blue-200 text-[#0B3B8C]"
          title="5. OTHER CERTIFICATES"
          subtitle="Manage and extract official government certificates and credentials"
        >
          {/* CERTIFICATE CARDS */}
          <div className="space-y-3 pt-1">
            {[
              { id: 'income', title: 'INCOME CERTIFICATE', icon: FileText },
              { id: 'caste', title: 'CASTE CERTIFICATE', icon: ShieldCheck },
              { id: 'residence', title: 'RESIDENCE CERTIFICATE', icon: MapPin },
              { id: 'handicap', title: 'HANDICAP CERTIFICATE (PWD)', icon: Award },
            ]
              .filter((cert) => {
                if (cert.id === 'handicap') {
                  const currentStatus = (editingSection === 'personal' ? editBuffer.disabilityStatus : profileData.disabilityStatus) || 'No';
                  return currentStatus.toLowerCase() === 'yes';
                }
                return true;
              })
              .map((cert) => (
              <div key={cert.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wide">
                  <cert.icon className="w-4 h-4 text-[#0B3B8C]" />
                  <span>{cert.title}</span>
                </div>

                <div className="p-4 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center space-y-1 bg-slate-50/70">
                  <FileText className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">----</span>
                  <p className="text-[10px] text-slate-500">Edit fields manually or upload document for AI scanner auto-fill</p>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAddCertModal(true)}
                    className="px-4 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>EDIT MANUALLY</span>
                  </button>
                </div>
              </div>
            ))}

            {/* ADD CUSTOM CERTIFICATE BUTTON */}
            <button
              type="button"
              onClick={() => setShowAddCertModal(true)}
              className="w-full py-3 border border-dashed border-slate-300 hover:border-[#0B3B8C] rounded-2xl bg-white text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer hover:text-[#0B3B8C]"
            >
              <Plus className="w-4 h-4 text-[#0B3B8C]" />
              <span>ADD CUSTOM CERTIFICATE TYPE</span>
            </button>
          </div>
        </AccordionCard>

        {/* SECTION 6: MY VERIFIED DOCUMENTS */}
        <AccordionCard
          isOpen={openSections.myDocuments}
          onToggle={() => toggleSection('myDocuments')}
          icon={<FileText className="w-5 h-5 text-emerald-700" />}
          iconBg="bg-emerald-50 border-emerald-200 text-emerald-700"
          title="6. MY VERIFIED DOCUMENTS"
          subtitle="Digital Document Locker: Preview, download, and manage verified identity, educational & government certificates"
        >
          <div className="pt-2">
            <DocumentsPage user={profileData} onUpdateUser={onUpdateUser} />
          </div>
        </AccordionCard>
      </div>

      {/* MODAL: MY DOCUMENTS */}
      {showMyDocumentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-5 text-slate-800 my-auto max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-[#0B3B8C] border border-blue-200">
                  <FileText className="w-5 h-5 text-[#0B3B8C]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {t('profile.myDocumentsTitle', 'My Verified Documents')}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500">
                    {t('profile.myDocumentsSub', 'Aadhaar, selected education marksheet & certificate, income, caste & residence')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMyDocumentsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - 5 Requested Documents */}
            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {/* 1. AADHAR CARD */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wide">
                  <Fingerprint className="w-4 h-4 text-[#0B3B8C]" />
                  <span>1. AADHAR CARD</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">AADHAAR NUMBER</span>
                    <span className="font-mono font-extrabold text-slate-900 text-xs">
                      {profileData.aadhaarNumber || (profileData.aadhaarLast4 ? `XXXX-XXXX-${profileData.aadhaarLast4}` : 'Aadhaar Verified')}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
              </div>

              {/* 2. SELECTED EDUCATION CERTIFICATE */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wide">
                  <GraduationCap className="w-4 h-4 text-[#0B3B8C]" />
                  <span>2. EDUCATION CERTIFICATE ({profileData.qualification || '10TH'})</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      {getSelectedEducationCertNo(profileData).name}
                    </span>
                    <span className="font-mono font-extrabold text-slate-900 text-xs">
                      {getSelectedEducationCertNo(profileData).certNo}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
              </div>

              {/* 3. INCOME CERTIFICATE */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wide">
                  <FileText className="w-4 h-4 text-[#0B3B8C]" />
                  <span>3. INCOME CERTIFICATE</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">CERTIFICATE NUMBER</span>
                    <span className="font-mono font-extrabold text-slate-900 text-xs">
                      {profileData.otherCertificates?.find(c => c.name.toLowerCase().includes('income'))?.number || '----'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {profileData.otherCertificates?.find(c => c.name.toLowerCase().includes('income')) ? 'VALID' : 'NOT UPLOADED'}
                  </span>
                </div>
              </div>

              {/* 4. CASTE CERTIFICATE */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-[#0B3B8C]" />
                  <span>4. CASTE CERTIFICATE</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">CERTIFICATE NUMBER</span>
                    <span className="font-mono font-extrabold text-slate-900 text-xs">
                      {profileData.otherCertificates?.find(c => c.name.toLowerCase().includes('caste'))?.number || '----'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {profileData.otherCertificates?.find(c => c.name.toLowerCase().includes('caste')) ? 'VALID' : 'NOT UPLOADED'}
                  </span>
                </div>
              </div>

              {/* 5. RESIDENCE CERTIFICATE */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wide">
                  <MapPin className="w-4 h-4 text-[#0B3B8C]" />
                  <span>5. RESIDENCE CERTIFICATE</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">CERTIFICATE NUMBER</span>
                    <span className="font-mono font-extrabold text-slate-900 text-xs">
                      {profileData.domicileCertNumber || profileData.otherCertificates?.find(c => c.name.toLowerCase().includes('residence') || c.name.toLowerCase().includes('domicile'))?.number || '----'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {(profileData.domicileCertNumber || profileData.otherCertificates?.find(c => c.name.toLowerCase().includes('residence') || c.name.toLowerCase().includes('domicile'))) ? 'VALID' : 'NOT UPLOADED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowMyDocumentsModal(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL: ADD MANUAL CERTIFICATE */}
      {showAddCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl space-y-4 text-slate-800"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Add Certificate Details</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCertModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCertificate} className="space-y-3 text-xs">
              <InputField
                label="Certificate Name *"
                placeholder="e.g. Income Certificate"
                value={newCert.name || ''}
                onChange={(val) => setNewCert({ ...newCert, name: val })}
              />
              <InputField
                label="Certificate Number *"
                placeholder="e.g. INC/2024/8812"
                value={newCert.number || ''}
                onChange={(val) => setNewCert({ ...newCert, number: val })}
              />
              <InputField
                label="Issuing Authority"
                placeholder="e.g. Tehsildar"
                value={newCert.issuingAuthority || ''}
                onChange={(val) => setNewCert({ ...newCert, issuingAuthority: val })}
              />
              <InputField
                label="Issue Date"
                placeholder="DD/MM/YYYY"
                value={newCert.issueDate || ''}
                onChange={(val) => setNewCert({ ...newCert, issueDate: val })}
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCertModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B3B8C] hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Certificate
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* FULL SCREEN PREVIEW MEDIA MODAL */}
      {previewMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl space-y-4 text-slate-800"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-[#0B3B8C]" />
                <span>{previewMediaModal.title}</span>
              </h3>
              <button
                type="button"
                onClick={() => setPreviewMediaModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full h-72 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center p-2 overflow-hidden relative">
              <SmartImage
                src={previewMediaModal.url}
                alt={previewMediaModal.title}
                className="max-h-full max-w-full object-contain"
                style={{ transform: `rotate(${previewMediaModal.rotation}deg)` }}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleRotateMedia(previewMediaModal.field, e)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#0B3B8C]" />
                  <span>Rotate 90ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const field = previewMediaModal.field;
                    setPreviewMediaModal(null);
                    if (field === 'photoUrl') photoInputRef.current?.click();
                    if (field === 'signatureUrl') signatureInputRef.current?.click();
                    if (field === 'thumbImpressionUrl') thumbInputRef.current?.click();
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Change Image</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMediaModal(null)}
                className="px-4 py-1.5 bg-[#0B3B8C] hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

/* REUSABLE ACCORDION CARD */
interface AccordionCardProps {
  isOpen: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const AccordionCard: React.FC<AccordionCardProps> = ({
  isOpen,
  onToggle,
  icon,
  iconBg,
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs transition-all">
      <div
        onClick={onToggle}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${iconBg} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-wide">{title}</h3>
            <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>
          </div>
        </div>

        <div className="p-1 text-slate-400">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="p-4 border-t border-slate-200/80 bg-slate-50/40 space-y-3.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* MULTI SELECT FIELD */
const MultiSelectField: React.FC<{
  label: string;
  options: string[];
  value: string[];
  maxSelections?: number;
  onChange: (val: string[]) => void;
}> = ({ label, options, value, maxSelections = 5, onChange }) => {
  const [open, setOpen] = React.useState(false);

  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
      return;
    }

    if (value.length >= maxSelections) return;

    onChange([...value, option]);
  };

  return (
    <div className="col-span-2 relative">
      <div className="text-xs font-semibold mb-2">{label}</div>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full min-h-[42px] rounded-lg border px-3 py-2 text-left text-sm bg-white"
      >
        {value.length > 0 ? (
          <span>{value.join(", ")}</span>
        ) : (
          <span className="text-gray-400">
            Select up to {maxSelections}
          </span>
        )}

        <span className="float-right">
          {open ? "ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“Ãƒâ€šÃ‚Â²" : "ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“Ãƒâ€šÃ‚Â¼"}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border bg-white shadow-lg p-2">
          <div className="text-[11px] text-gray-500 px-2 pb-2">
            Select up to {maxSelections} options
          </div>

          {options.map((option) => {
            const selected = value.includes(option);
            const disabled =
              !selected && value.length >= maxSelections;

            return (
              <label
                key={option}
                className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm ${
                  disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer hover:bg-gray-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  disabled={disabled}
                  onChange={() => toggleOption(option)}
                />
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};
/* REUSABLE INPUT & DISPLAY FIELD HELPERS */
const InputField: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">{label}</label>
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#0B3B8C] focus:ring-2 focus:ring-blue-100 rounded-xl text-slate-900 font-medium focus:outline-hidden text-xs transition-all shadow-2xs"
    />
  </div>
);

const SelectField: React.FC<{
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}> = ({ label, options, value, onChange }) => (
  <div>
    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 focus:border-[#0B3B8C] focus:ring-2 focus:ring-blue-100 rounded-xl text-slate-900 font-medium focus:outline-hidden text-xs transition-all shadow-2xs"
    >
      <option value="">Select Option</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const DisplayField: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div>
    <span className="text-slate-500 dark:text-slate-400 font-semibold block text-[10px] tracking-wider uppercase">{label}</span>
    <span className="font-bold text-slate-800 dark:text-slate-100 block mt-0.5 text-xs">
      {value && String(value).trim() ? value : '---'}
    </span>
  </div>
);

const FormButtons: React.FC<{ onCancel: () => void }> = ({ onCancel }) => (
  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
    <button
      type="button"
      onClick={onCancel}
      className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="px-4 py-1.5 bg-[#0B3B8C] hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
    >
      <Save className="w-3.5 h-3.5" />
      <span>Save Changes</span>
    </button>
  </div>
);























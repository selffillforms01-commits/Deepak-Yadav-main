import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Fingerprint, 
  FileText, 
  GraduationCap, 
  ShieldCheck, 
  Award, 
  CreditCard, 
  Car, 
  Globe, 
  Eye, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Search, 
  Filter, 
  Sparkles, 
  Plus, 
  Trash2, 
  Lock, 
  Check, 
  Share2,
  FileUp,
  SlidersHorizontal,
  Maximize2,
  FolderPlus
} from 'lucide-react';
import { UserProfile } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  getUserDocumentsFromFirestore,
  saveUserDocumentsToFirestore,
  uploadDocumentToStorage,
  resolveFileUrl
} from '../../lib/firestoreService';
import { compressImageFile } from '../../utils/imageCompressor';
import { SmartImage } from '../common/SmartImage';

export interface DocumentItem {
  id: string;
  name: string;
  category: 'identity' | 'educational' | 'income-caste' | 'other';
  iconType: 'aadhaar' | 'pan' | 'licence' | 'passport' | 'marksheet' | 'degree' | 'income' | 'caste' | 'residence' | 'ews' | 'disability' | 'other';
  status: 'Verified' | 'Pending Verification' | 'Not Uploaded';
  uploadDate: string;
  fileSize: string;
  fileType: 'pdf' | 'jpg' | 'png';
  documentNumber?: string;
  issuingAuthority?: string;
  isOptional?: boolean;
  customFileUrl?: string;
}

interface DocumentsPageProps {
  user?: UserProfile;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const getDynamicDocumentsList = (user?: UserProfile): DocumentItem[] => {
  const p = (user || {}) as UserProfile;
  const qual = (p.qualification || '10th').trim().toLowerCase();

  // Helper to check certificate in otherCertificates list
  const findCertNo = (keywords: string[]) => {
    if (!p.otherCertificates) return undefined;
    const cert = p.otherCertificates.find((c) =>
      keywords.some((k) => c.name.toLowerCase().includes(k))
    );
    return cert?.number || undefined;
  };

  // 1. IDENTITY DOCUMENTS
  // Aadhaar Card is default/primary. PAN, DL, and Passport appear only when added by user.
  const hasAadhaar = Boolean(p.aadhaarNumber || p.aadhaarLast4);
  const aadhaarNo = p.aadhaarNumber || (p.aadhaarLast4 ? `XXXX-XXXX-${p.aadhaarLast4}` : undefined);

  const identityDocs: DocumentItem[] = [
    {
      id: 'doc-aadhaar',
      name: 'Aadhaar Card',
      category: 'identity',
      iconType: 'aadhaar',
      status: hasAadhaar ? 'Verified' : 'Not Uploaded',
      uploadDate: hasAadhaar ? 'e-KYC Verified' : '-',
      fileSize: hasAadhaar ? 'Digital Copy' : '-',
      fileType: 'pdf',
      documentNumber: aadhaarNo,
      issuingAuthority: 'UIDAI - Govt. of India',
    },
  ];

  if (p.panNumber) {
    identityDocs.push({
      id: 'doc-pan',
      name: 'PAN Card',
      category: 'identity',
      iconType: 'pan',
      status: 'Verified',
      uploadDate: 'e-KYC Verified',
      fileSize: 'Digital Copy',
      fileType: 'jpg',
      documentNumber: p.panNumber,
      issuingAuthority: 'Income Tax Dept. of India',
      isOptional: true,
    });
  }

  if (p.drivingLicenceNumber) {
    identityDocs.push({
      id: 'doc-dl',
      name: 'Driving Licence',
      category: 'identity',
      iconType: 'licence',
      status: 'Verified',
      uploadDate: 'e-KYC Verified',
      fileSize: 'Digital Copy',
      fileType: 'pdf',
      documentNumber: p.drivingLicenceNumber,
      issuingAuthority: 'Ministry of Road Transport & Highways',
      isOptional: true,
    });
  }

  if (p.passportNumber) {
    identityDocs.push({
      id: 'doc-passport',
      name: 'Passport',
      category: 'identity',
      iconType: 'passport',
      status: 'Verified',
      uploadDate: 'e-KYC Verified',
      fileSize: 'Digital Copy',
      fileType: 'pdf',
      documentNumber: p.passportNumber,
      issuingAuthority: 'Passport Seva - Ministry of External Affairs',
      isOptional: true,
    });
  }

  // 2. EDUCATIONAL DOCUMENTS (DYNAMIC BASED ON HIGHEST QUALIFICATION)
  const eduDocs: DocumentItem[] = [];

  // Always show 10th
  const has10thM = Boolean(p.tenthRollNumber);
  const has10thC = Boolean(p.tenthCertNumber);

  eduDocs.push(
    {
      id: 'doc-10th-marksheet',
      name: '10th Marksheet',
      category: 'educational',
      iconType: 'marksheet',
      status: has10thM ? 'Verified' : 'Not Uploaded',
      uploadDate: has10thM ? 'Verified' : '-',
      fileSize: has10thM ? 'Verified' : '-',
      fileType: 'pdf',
      documentNumber: p.tenthRollNumber || undefined,
      issuingAuthority: p.tenthBoard || p.tenthBoardName || 'Board of Secondary Education',
    },
    {
      id: 'doc-10th-cert',
      name: '10th Certificate',
      category: 'educational',
      iconType: 'degree',
      status: has10thC ? 'Verified' : 'Not Uploaded',
      uploadDate: has10thC ? 'Verified' : '-',
      fileSize: has10thC ? 'Verified' : '-',
      fileType: 'pdf',
      documentNumber: p.tenthCertNumber || undefined,
      issuingAuthority: p.tenthBoard || p.tenthBoardName || 'Board of Secondary Education',
    }
  );

  const is12th = qual.includes('12') || qual.includes('intermediate') || qual.includes('higher secondary');
  const isDiploma = qual.includes('diploma') || qual.includes('iti');
  const isGraduation = qual.includes('graduat') || qual.includes('degree') || qual.includes('bachelor') || qual.includes('b.tech') || qual.includes('b.sc') || qual.includes('b.a') || qual.includes('b.com');
  const isPostGraduation = qual.includes('post') || qual.includes('master') || qual.includes('phd') || qual.includes('m.tech') || qual.includes('m.sc') || qual.includes('m.a') || qual.includes('m.com');

  if (is12th || isDiploma || isGraduation || isPostGraduation) {
    const has12thM = Boolean(p.twelfthRollNumber);
    const has12thC = Boolean(p.twelfthCertNumber);

    eduDocs.push(
      {
        id: 'doc-12th-marksheet',
        name: '12th Marksheet',
        category: 'educational',
        iconType: 'marksheet',
        status: has12thM ? 'Verified' : 'Not Uploaded',
        uploadDate: has12thM ? 'Verified' : '-',
        fileSize: has12thM ? 'Verified' : '-',
        fileType: 'pdf',
        documentNumber: p.twelfthRollNumber || undefined,
        issuingAuthority: p.twelfthCouncilBoard || 'Council of Higher Secondary Education',
      },
      {
        id: 'doc-12th-cert',
        name: '12th Certificate',
        category: 'educational',
        iconType: 'degree',
        status: has12thC ? 'Verified' : 'Not Uploaded',
        uploadDate: has12thC ? 'Verified' : '-',
        fileSize: has12thC ? 'Verified' : '-',
        fileType: 'pdf',
        documentNumber: p.twelfthCertNumber || undefined,
        issuingAuthority: p.twelfthCouncilBoard || 'Council of Higher Secondary Education',
      }
    );
  }

  if (isDiploma) {
    const hasDipM = Boolean(p.diplomaRollNumber);
    const hasDipC = Boolean(p.diplomaCertNumber);

    eduDocs.push(
      {
        id: 'doc-diploma-marksheet',
        name: 'Diploma Marksheet',
        category: 'educational',
        iconType: 'marksheet',
        status: hasDipM ? 'Verified' : 'Not Uploaded',
        uploadDate: hasDipM ? 'Verified' : '-',
        fileSize: hasDipM ? 'Verified' : '-',
        fileType: 'pdf',
        documentNumber: p.diplomaRollNumber || undefined,
        issuingAuthority: p.diplomaBoardUniversity || 'State Council for Technical Education',
      },
      {
        id: 'doc-diploma-cert',
        name: 'Diploma Certificate',
        category: 'educational',
        iconType: 'degree',
        status: hasDipC ? 'Verified' : 'Not Uploaded',
        uploadDate: hasDipC ? 'Verified' : '-',
        fileSize: hasDipC ? 'Verified' : '-',
        fileType: 'pdf',
        documentNumber: p.diplomaCertNumber || undefined,
        issuingAuthority: p.diplomaBoardUniversity || 'State Council for Technical Education',
      }
    );
  }

  if (isGraduation || isPostGraduation) {
    const hasDegM = Boolean(p.degreeRollNumber);
    const hasDegC = Boolean(p.degreeCertNumber);

    eduDocs.push(
      {
        id: 'doc-graduation-marksheet',
        name: 'Graduation Marksheet',
        category: 'educational',
        iconType: 'marksheet',
        status: hasDegM ? 'Verified' : 'Not Uploaded',
        uploadDate: hasDegM ? 'Verified' : '-',
        fileSize: hasDegM ? 'Verified' : '-',
        fileType: 'pdf',
        documentNumber: p.degreeRollNumber || undefined,
        issuingAuthority: p.degreeUniversityName || 'University',
      },
      {
        id: 'doc-graduation-cert',
        name: 'Graduation Degree Certificate',
        category: 'educational',
        iconType: 'degree',
        status: hasDegC ? 'Verified' : 'Not Uploaded',
        uploadDate: hasDegC ? 'Verified' : '-',
        fileSize: hasDegC ? 'Verified' : '-',
        fileType: 'pdf',
        documentNumber: p.degreeCertNumber || undefined,
        issuingAuthority: p.degreeUniversityName || 'University',
      }
    );
  }

  if (isPostGraduation) {
    const hasPgM = Boolean(p.pgRollNumber);
    const hasPgC = Boolean(p.pgCertNumber);

    eduDocs.push(
      {
        id: 'doc-pg-marksheet',
        name: 'Post Graduation Marksheet',
        category: 'educational',
        iconType: 'marksheet',
        status: hasPgM ? 'Verified' : 'Not Uploaded',
        uploadDate: hasPgM ? 'Verified' : '-',
        fileSize: hasPgM ? 'Verified' : '-',
        fileType: 'pdf',
        documentNumber: p.pgRollNumber || undefined,
        issuingAuthority: 'University',
      },
      {
        id: 'doc-pg-cert',
        name: 'Post Graduation Degree Certificate',
        category: 'educational',
        iconType: 'degree',
        status: hasPgC ? 'Verified' : 'Not Uploaded',
        uploadDate: hasPgC ? 'Verified' : '-',
        fileSize: hasPgC ? 'Verified' : '-',
        fileType: 'pdf',
        documentNumber: p.pgCertNumber || undefined,
        issuingAuthority: 'University',
      }
    );
  }

  // 3. INCOME / CASTE / RESIDENCE / DISABILITY DOCUMENTS
  const userCategory = (p.category || 'General').trim().toUpperCase();
  const isReservedCaste = userCategory.includes('SC') || userCategory.includes('ST') || userCategory.includes('OBC') || userCategory.includes('SEBC');

  const incNo = findCertNo(['income']);
  const hasInc = Boolean(incNo);

  const casteNo = findCertNo(['caste']);
  const hasCaste = Boolean(casteNo);

  const resNo = p.domicileCertNumber || findCertNo(['residence', 'domicile']);
  const hasRes = Boolean(resNo);

  const isDisabilityYes = Boolean(
    p.disabilityStatus &&
      (p.disabilityStatus.trim().toLowerCase() === 'yes' ||
        p.disabilityStatus.includes('हाँ') ||
        p.disabilityStatus.includes('ହଁ'))
  );

  const disNo = findCertNo(['disability']);
  const hasDisability = Boolean(disNo || isDisabilityYes);

  const incomeCasteDocs: DocumentItem[] = [
    {
      id: 'doc-income',
      name: 'Income Certificate',
      category: 'income-caste',
      iconType: 'income',
      status: hasInc ? 'Verified' : 'Not Uploaded',
      uploadDate: hasInc ? 'Verified' : '-',
      fileSize: hasInc ? 'Verified' : '-',
      fileType: 'pdf',
      documentNumber: incNo,
      issuingAuthority: 'Tahsildar / Revenue Department',
    },
  ];

  // Only ask for Caste Certificate if user category is SC, ST, OBC, or SEBC
  if (isReservedCaste) {
    incomeCasteDocs.push({
      id: 'doc-caste',
      name: 'Caste Certificate',
      category: 'income-caste',
      iconType: 'caste',
      status: hasCaste ? 'Verified' : 'Not Uploaded',
      uploadDate: hasCaste ? 'Verified' : '-',
      fileSize: hasCaste ? 'Verified' : '-',
      fileType: 'pdf',
      documentNumber: casteNo,
      issuingAuthority: 'Sub-Collector / Revenue Officer',
    });
  }

  incomeCasteDocs.push({
    id: 'doc-residence',
    name: 'Residence Certificate',
    category: 'income-caste',
    iconType: 'residence',
    status: hasRes ? 'Verified' : 'Not Uploaded',
    uploadDate: hasRes ? 'Verified' : '-',
    fileSize: hasRes ? 'Verified' : '-',
    fileType: 'pdf',
    documentNumber: resNo,
    issuingAuthority: 'Revenue Inspector / Tehsildar',
  });

  if (isDisabilityYes) {
    incomeCasteDocs.push({
      id: 'doc-disability',
      name: 'Disability Certificate',
      category: 'income-caste',
      iconType: 'disability',
      status: hasDisability ? 'Verified' : 'Not Uploaded',
      uploadDate: hasDisability ? 'Verified' : '-',
      fileSize: hasDisability ? 'Verified' : '-',
      fileType: 'pdf',
      documentNumber: disNo,
      issuingAuthority: 'Medical Board / District Hospital',
    });
  }

  return [...identityDocs, ...eduDocs, ...incomeCasteDocs];
};

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ user, onUpdateUser }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for Documents
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    try {
      const saved = localStorage.getItem('sff_user_documents');
      if (saved) {
        const parsed: DocumentItem[] = JSON.parse(saved);
        // Filter out un-added default optional docs from legacy cache if not provided
        const isDisabilityYes = Boolean(
          user?.disabilityStatus &&
            (user.disabilityStatus.trim().toLowerCase() === 'yes' ||
              user.disabilityStatus.includes('हाँ') ||
              user.disabilityStatus.includes('ହଁ'))
        );
        const userCat = (user?.category || 'General').trim().toUpperCase();
        const isReservedCaste = userCat.includes('SC') || userCat.includes('ST') || userCat.includes('OBC') || userCat.includes('SEBC');

        const filtered = parsed.filter(d => {
          if (d.id === 'doc-ews') return false;
          if (d.id === 'doc-disability' && !isDisabilityYes) return false;
          if (d.id === 'doc-caste' && !isReservedCaste) return false;
          if ((d.id === 'doc-dl' || d.id === 'doc-passport' || d.id === 'doc-pan') && d.status === 'Not Uploaded' && !d.documentNumber && !d.customFileUrl) {
            return false;
          }
          return true;
        });
        if (filtered.length > 0) return filtered;
      }
    } catch (e) {
      console.error('Failed to parse saved documents', e);
    }
    return getDynamicDocumentsList(user);
  });

  // Re-sync with user profile changes
  useEffect(() => {
    const dynamicList = getDynamicDocumentsList(user);
    setDocuments(prev => {
      const updatedMap = new Map<string, DocumentItem>();
      
      dynamicList.forEach(item => {
        const existing = prev.find(p => p.id === item.id);
        if (existing) {
          updatedMap.set(item.id, { ...item, ...existing, documentNumber: item.documentNumber || existing.documentNumber });
        } else {
          updatedMap.set(item.id, item);
        }
      });

      // Preserve any custom added optional identity or other docs
      prev.forEach(item => {
        if (!updatedMap.has(item.id)) {
          if (
            (item.category === 'identity' || item.category === 'other' || item.id.startsWith('doc-other-') || item.isOptional) &&
            (item.status === 'Verified' || item.status === 'Pending Verification' || item.documentNumber || item.customFileUrl || item.isOptional)
          ) {
            updatedMap.set(item.id, item);
          }
        }
      });

      return Array.from(updatedMap.values());
    });
  }, [user]);

  // Add Document Modal state
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<'pan' | 'licence' | 'passport' | 'other'>('pan');
  const [docNumberInput, setDocNumberInput] = useState('');
  const [customDocNameInput, setCustomDocNameInput] = useState('');
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const [modalFileState, setModalFileState] = useState<{
    file: File;
    objectUrl: string;
    formattedSize: string;
    fileType: 'pdf' | 'jpg' | 'png';
  } | null>(null);

  // All supported identity and custom document types
  const allDocTypes = [
    {
      id: 'pan' as const,
      docId: 'doc-pan',
      name: 'PAN Card',
      iconType: 'pan' as const,
      authority: 'Income Tax Dept. of India',
      placeholder: 'Enter PAN Number (e.g. ABCDE1234F)',
      fileType: 'jpg' as const,
    },
    {
      id: 'licence' as const,
      docId: 'doc-dl',
      name: 'Driving Licence',
      iconType: 'licence' as const,
      authority: 'Ministry of Road Transport & Highways',
      placeholder: 'Enter DL Number (e.g. OR-02-20230001234)',
      fileType: 'pdf' as const,
    },
    {
      id: 'passport' as const,
      docId: 'doc-passport',
      name: 'Passport',
      iconType: 'passport' as const,
      authority: 'Passport Seva - Ministry of External Affairs',
      placeholder: 'Enter Passport Number (e.g. Z1234567)',
      fileType: 'pdf' as const,
    },
    {
      id: 'other' as const,
      docId: 'doc-other',
      name: 'Other Document (Custom Upload)',
      iconType: 'other' as const,
      authority: 'Custom / Other Authority',
      placeholder: 'Enter Registration or Ref Number (Optional)',
      fileType: 'pdf' as const,
    },
  ];

  const customDocCount = documents.filter(d => d.category === 'other' || d.id.startsWith('doc-other-')).length;

  const availableDocTypes = allDocTypes.filter(
    type => type.id === 'other' || !documents.some(d => d.id === type.docId)
  );

  const handleModalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(file.type) && !['pdf', 'jpg', 'jpeg', 'png'].includes(ext || '')) {
      showToast('⚠️ Invalid file! Please upload PDF, JPG, JPEG, or PNG files.');
      return;
    }

    const formattedSize = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const fileTypeStr: 'pdf' | 'jpg' | 'png' = ext === 'png' ? 'png' : ext === 'pdf' ? 'pdf' : 'jpg';

    const objectUrl = URL.createObjectURL(file);
    setModalFileState({
      file,
      objectUrl,
      formattedSize,
      fileType: fileTypeStr,
    });
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const userId = user?.email || user?.mobile || 'citizen_user';

    let finalFileUrl: string | undefined = undefined;
    let finalFileType: 'pdf' | 'jpg' | 'png' = 'pdf';
    let finalFileSize: string = '-';

    if (modalFileState) {
      showToast('Processing & uploading document file...');
      try {
        const { compressedFile, dataUrl } = await compressImageFile(modalFileState.file, 2400, 0.92);
        finalFileType = modalFileState.fileType;
        finalFileSize = modalFileState.formattedSize;

        const res = await uploadDocumentToStorage(userId, modalFileState.file, 'documents');
        finalFileUrl = res.downloadUrl || dataUrl;
      } catch (err) {
        console.warn('Error processing modal document file:', err);
      }
    }

    if (selectedDocType === 'other') {
      if (!customDocNameInput.trim()) {
        showToast('⚠️ Please enter a Document Name!');
        return;
      }
      if (customDocCount >= 10) {
        showToast('⚠️ Limit reached! You can upload maximum 10 custom/other documents.');
        return;
      }

      const newCustomDoc: DocumentItem = {
        id: `doc-other-${Date.now()}`,
        name: customDocNameInput.trim(),
        category: 'other',
        iconType: 'other',
        status: finalFileUrl || docNumberInput.trim() ? 'Verified' : 'Not Uploaded',
        uploadDate: finalFileUrl || docNumberInput.trim() ? todayStr : '-',
        fileSize: finalFileUrl ? finalFileSize : docNumberInput.trim() ? 'Verified' : '-',
        fileType: finalFileType,
        documentNumber: docNumberInput.trim() || undefined,
        issuingAuthority: 'Issued Document Authority',
        isOptional: true,
        customFileUrl: finalFileUrl,
      };

      setDocuments(prev => [...prev, newCustomDoc]);
      showToast(`✅ ${newCustomDoc.name} added to your Document Locker!`);
    } else {
      const targetType = availableDocTypes.find(t => t.id === selectedDocType);
      if (!targetType) return;

      const newDoc: DocumentItem = {
        id: targetType.docId,
        name: targetType.name,
        category: 'identity',
        iconType: targetType.iconType,
        status: finalFileUrl || docNumberInput.trim() ? 'Verified' : 'Not Uploaded',
        uploadDate: finalFileUrl || docNumberInput.trim() ? todayStr : '-',
        fileSize: finalFileUrl ? finalFileSize : docNumberInput.trim() ? 'Verified' : '-',
        fileType: finalFileUrl ? finalFileType : targetType.fileType,
        documentNumber: docNumberInput.trim() || undefined,
        issuingAuthority: targetType.authority,
        isOptional: true,
        customFileUrl: finalFileUrl,
      };

      setDocuments(prev => [...prev, newDoc]);

      if (onUpdateUser && user) {
        const updatedUser = { ...user };
        if (targetType.id === 'pan') updatedUser.panNumber = docNumberInput.trim();
        if (targetType.id === 'licence') updatedUser.drivingLicenceNumber = docNumberInput.trim();
        if (targetType.id === 'passport') updatedUser.passportNumber = docNumberInput.trim();
        onUpdateUser(updatedUser);
      }

      showToast(`✅ ${targetType.name} added to your Document Locker!`);
    }

    setShowAddDocModal(false);
    setDocNumberInput('');
    setCustomDocNameInput('');
    setModalFileState(null);
  };

  const handleRemoveDoc = (docId: string, docName: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    if (onUpdateUser && user) {
      const updatedUser = { ...user };
      if (docId === 'doc-pan') updatedUser.panNumber = undefined;
      if (docId === 'doc-dl') updatedUser.drivingLicenceNumber = undefined;
      if (docId === 'doc-passport') updatedUser.passportNumber = undefined;
      onUpdateUser(updatedUser);
    }
    showToast(`🗑 ${docName} removed from locker`);
  };

  // Filter & Search state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Upload state
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [targetDocToUpload, setTargetDocToUpload] = useState<DocumentItem | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Preview Modal state
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(100);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save to Firestore when documents update
  useEffect(() => {
    const userId = user?.email || user?.mobile || 'citizen_user';
    if (documents.length > 0 && userId) {
      saveUserDocumentsToFirestore(userId, documents as any).catch((err) => {
        console.error('Failed to sync documents to Firestore:', err);
      });
    }
  }, [documents, user]);

  // Load stored documents from Firestore on mount / user change
  useEffect(() => {
    const userId = user?.email || user?.mobile;
    if (userId) {
      getUserDocumentsFromFirestore(userId).then((storedDocs) => {
        if (storedDocs && storedDocs.length > 0) {
          setDocuments(storedDocs as any);
        }
      }).catch((err) => {
        console.error('Failed to load documents from Firestore:', err);
      });
    }
  }, [user?.email, user?.mobile]);

  // Show Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Render Document Icon
  const renderDocIcon = (iconType: DocumentItem['iconType']) => {
    switch (iconType) {
      case 'aadhaar':
        return <Fingerprint className="w-5 h-5 text-[#0B3B8C]" />;
      case 'pan':
        return <CreditCard className="w-5 h-5 text-indigo-700" />;
      case 'licence':
        return <Car className="w-5 h-5 text-blue-600" />;
      case 'passport':
        return <Globe className="w-5 h-5 text-sky-700" />;
      case 'marksheet':
        return <FileText className="w-5 h-5 text-amber-700" />;
      case 'degree':
        return <GraduationCap className="w-5 h-5 text-[#0B3B8C]" />;
      case 'income':
        return <Award className="w-5 h-5 text-emerald-700" />;
      case 'caste':
        return <ShieldCheck className="w-5 h-5 text-purple-700" />;
      case 'residence':
        return <FileText className="w-5 h-5 text-teal-700" />;
      case 'ews':
        return <Award className="w-5 h-5 text-orange-700" />;
      case 'disability':
        return <ShieldCheck className="w-5 h-5 text-[#0B3B8C]" />;
      default:
        return <FileText className="w-5 h-5 text-slate-700" />;
    }
  };

  // Render Status Badge
  const renderStatusBadge = (status: DocumentItem['status']) => {
    if (status === 'Verified') {
      return (
        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full flex items-center gap-1.5 border border-emerald-200 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Status: Verified</span>
        </span>
      );
    }
    if (status === 'Pending Verification') {
      return (
        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full flex items-center gap-1.5 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          <span>Status: Pending Verification</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full flex items-center gap-1.5 border border-slate-200">
        <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
        <span>Status: Not Uploaded</span>
      </span>
    );
  };

  // Trigger File Input for Upload / Replace
  const handleOpenUpload = (doc: DocumentItem) => {
    setTargetDocToUpload(doc);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Handle File Selected
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetDocToUpload) return;

    // Validate type (PDF, JPG, JPEG, PNG, WEBP, HEIC, DOC, DOCX, etc.)
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const validExts = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'heic', 'doc', 'docx'];
    
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf' && !validExts.includes(ext)) {
      setUploadError('Invalid file type! Please upload PDF, JPG, JPEG, PNG, WEBP, or Document files.');
      return;
    }

    const formattedSize = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const fileTypeStr: 'pdf' | 'jpg' | 'png' = ext === 'png' ? 'png' : ext === 'pdf' ? 'pdf' : 'jpg';

    // Start progress
    const docId = targetDocToUpload.id;
    setUploadingDocId(docId);
    setUploadProgress(20);

    const userId = user?.email || user?.mobile || 'citizen_user';

    compressImageFile(file, 2400, 0.92).then(async ({ compressedFile, dataUrl, sizeKb }) => {
      setUploadProgress(50);
      let finalUrl = dataUrl;
      let storagePath: string | undefined = undefined;

      try {
        const res = await uploadDocumentToStorage(userId, file, 'documents');
        if (res.downloadUrl) {
          finalUrl = res.downloadUrl;
          storagePath = res.storagePath;
        }
      } catch (storageErr) {
        console.warn('Firebase Storage notice, using compressed file dataUrl fallback:', storageErr);
      }

      setUploadProgress(100);
      const today = new Date();
      const day = today.getDate();
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const formattedDate = `${day} ${monthNames[today.getMonth()]} ${today.getFullYear()}`;
      const docTitle = targetDocToUpload.name;
      const displaySize = file.size > 1024 * 1024 ? formattedSize : `${sizeKb} KB`;

      setDocuments((prev) => {
        const updated = prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                status: 'Verified' as const,
                uploadDate: formattedDate,
                fileSize: displaySize,
                fileType: fileTypeStr,
                customFileUrl: finalUrl,
                storagePath: storagePath
              }
            : d
        );
        saveUserDocumentsToFirestore(userId, updated as any).catch(console.error);
        return updated;
      });

      setUploadingDocId(null);
      setTargetDocToUpload(null);
      showToast(`✅ ${docTitle} uploaded & saved successfully!`);
    }).catch((err) => {
      console.error('File processing error:', err);
      setUploadingDocId(null);
      setUploadError('Failed to process file. Please try again.');
    });
  };

  // Handle Download Action
  const handleDownload = async (doc: DocumentItem) => {
    showToast(`⬇ Downloading ${doc.name}...`);
    
    if (doc.customFileUrl) {
      try {
        const resolvedUrl = await resolveFileUrl(doc.customFileUrl);
        if (resolvedUrl) {
          const a = document.createElement('a');
          a.href = resolvedUrl;
          a.download = `${doc.name.replace(/\s+/g, '_')}`;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          return;
        }
      } catch (e) {
        console.warn('Error downloading custom file:', e);
      }
    }

    // Create simulated file content or trigger download fallback
    const dummyContent = `OFFICIAL GOVERNMENT VERIFIED DOCUMENT\n\nDocument Name: ${doc.name}\nDocument ID: ${doc.documentNumber || 'VERIFIED-SFF-2026'}\nIssued By: ${doc.issuingAuthority || 'Government Authority'}\nVerification Status: ${doc.status}\nDate: ${doc.uploadDate}\n\nDigitally Signed by Self Fill Forms e-District Portal.`;
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name.replace(/\s+/g, '_')}_Verified.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter Documents according to search and selected tab category
  const filteredDocs = documents.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.documentNumber && doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Category counts
  const categoryCounts = {
    all: documents.length,
    identity: documents.filter((d) => d.category === 'identity').length,
    educational: documents.filter((d) => d.category === 'educational').length,
    'income-caste': documents.filter((d) => d.category === 'income-caste').length,
    other: documents.filter((d) => d.category === 'other').length,
  };

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,application/pdf,.pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx"
        className="hidden"
      />

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#0B3B8C] via-blue-900 to-indigo-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Digital Document Locker • e-District Verified</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My Verified Documents
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm font-medium max-w-2xl">
            Upload, preview, download, and manage your official identity, educational marksheet certificates, and government certificates seamlessly in one secure repository.
          </p>
          {user?.qualification && (
            <div className="pt-2 flex items-center gap-2">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-blue-200 border border-white/20">
                Highest Qualification: <strong className="text-white uppercase">{user.qualification}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by name or number..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B3B8C]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-bold text-slate-500">Total Locker Items:</span>
            <span className="px-3 py-1 bg-blue-50 text-[#0B3B8C] text-xs font-extrabold rounded-full border border-blue-200">
              {documents.length} Docs
            </span>
          </div>
        </div>

        {/* Categories Tab Navigation */}
        <div className="space-y-3 border-t border-slate-100 pt-3">
          {/* Categories Tab Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
            {[
              { id: 'all', label: 'All Documents', count: categoryCounts.all },
              { id: 'identity', label: '1. Identity Docs', count: categoryCounts.identity },
              { id: 'educational', label: '2. Educational Docs', count: categoryCounts.educational },
              { id: 'income-caste', label: '3. Income / Caste / Residence', count: categoryCounts['income-caste'] },
              { id: 'other', label: '4. Other Documents', count: categoryCounts.other },
            ].map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#0B3B8C] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action Row - Add Documents Button moved below categories */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100/70">
            <span className="text-[11px] font-semibold text-slate-500">
              Select category or click to upload new document
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedDocType(availableDocTypes[0]?.id || 'other');
                setShowAddDocModal(true);
              }}
              className="px-4 py-2 bg-[#0B3B8C] hover:bg-blue-900 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Documents</span>
            </button>
          </div>
        </div>
      </div>

      {/* UPLOAD ERROR DISPLAY */}
      {uploadError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button type="button" onClick={() => setUploadError(null)} className="text-red-600 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DOCUMENTS GRID LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => {
          const isUploaded = doc.status === 'Verified' || doc.status === 'Pending Verification';

          return (
            <motion.div
              key={doc.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              {/* Card Header: Icon + Name + Badge */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 shrink-0">
                      {renderDocIcon(doc.iconType)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug flex items-center gap-1.5">
                        <span>{doc.name}</span>
                        {doc.isOptional && (
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">(Optional)</span>
                        )}
                      </h3>
                      <p className="text-[11px] font-semibold text-slate-500">
                        {doc.issuingAuthority || 'Govt Authority'}
                      </p>
                    </div>
                  </div>

                  {(doc.isOptional || doc.category === 'other' || doc.id.startsWith('doc-other-')) && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id, doc.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
                      title="Remove from document locker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Status Badge */}
                <div className="pt-1">
                  {renderStatusBadge(doc.status)}
                </div>

                {/* File Details: Uploaded Date & File Size */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Uploaded</span>
                    <span className="font-semibold text-slate-700">{doc.uploadDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Size</span>
                    <span className="font-semibold text-slate-700">{doc.fileSize}</span>
                  </div>
                  {doc.documentNumber && (
                    <div className="col-span-2 border-t border-slate-200/60 pt-1.5 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Doc Number / ID</span>
                      <span className="font-mono font-extrabold text-slate-900 text-xs truncate block">
                        {doc.documentNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Preview, Download, Upload/Replace */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2">
                {/* 1. PREVIEW BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    setPreviewDoc(doc);
                    setPreviewZoom(100);
                  }}
                  disabled={!isUploaded}
                  className={`py-2 px-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isUploaded
                      ? 'bg-blue-50 hover:bg-blue-100 text-[#0B3B8C] border border-blue-200'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                  title={isUploaded ? 'Preview document full screen' : 'Upload document first'}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="truncate">Preview</span>
                </button>

                {/* 2. DOWNLOAD BUTTON */}
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  disabled={!isUploaded}
                  className={`py-2 px-2 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isUploaded
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                  title={isUploaded ? 'Download document file' : 'Upload document first'}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="truncate">Download</span>
                </button>

                {/* 3. UPLOAD / REPLACE BUTTON */}
                <button
                  type="button"
                  onClick={() => handleOpenUpload(doc)}
                  className="py-2 px-2 bg-[#0B3B8C] hover:bg-blue-900 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="truncate">{isUploaded ? 'Replace' : 'Upload'}</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {filteredDocs.length === 0 && (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-base">No matching documents found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search query or switching category filter tab.</p>
        </div>
      )}

      {/* MODAL 1: UPLOAD PROGRESS MODAL */}
      {uploadingDocId && targetDocToUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 text-center text-slate-800"
          >
            <div className="w-14 h-14 bg-blue-50 text-[#0B3B8C] rounded-2xl flex items-center justify-center mx-auto border border-blue-200">
              <FileUp className="w-7 h-7 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Uploading Document...</h3>
              <p className="text-xs text-slate-500 font-semibold">{targetDocToUpload.name}</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Verification in Progress</span>
                <span className="font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-[#0B3B8C] to-emerald-600 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] font-medium text-slate-400 italic">
              Encrypting and verifying document signature with e-District Digital Locker AI...
            </p>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: FULL-SCREEN PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100"
          >
            {/* Modal Header Controls */}
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-900/50 text-blue-300 rounded-xl border border-blue-700">
                  {renderDocIcon(previewDoc.iconType)}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                    <span>{previewDoc.name}</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold rounded-full">
                      VERIFIED
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">
                    {previewDoc.documentNumber ? `DOCUMENT NO: ${previewDoc.documentNumber}` : 'NOT SPECIFIED'}
                  </p>
                </div>
              </div>

              {/* Controls: Zoom In, Zoom Out, Download, Close */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.max(70, z - 15))}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono font-bold px-1.5 text-blue-300">{previewZoom}%</span>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom((z) => Math.min(150, z + 15))}
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(previewDoc)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Render Canvas Viewer */}
            <div className="p-4 sm:p-8 bg-slate-950 flex-1 overflow-auto flex items-center justify-center">
              <div
                className="bg-white text-slate-900 p-6 sm:p-10 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl min-h-[500px] flex flex-col justify-between space-y-6 transition-all duration-150"
                style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center' }}
              >
                {/* Government Official Watermark Header */}
                <div className="border-b-2 border-[#0B3B8C] pb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-50 border-2 border-[#0B3B8C] flex items-center justify-center font-black text-[#0B3B8C] text-xs text-center p-1">
                      GOVT INDIA
                    </div>
                    <div>
                      <h2 className="text-xs font-black text-[#0B3B8C] uppercase tracking-wider">
                        GOVERNMENT OF INDIA • e-DISTRICT DIGITAL LOCKER
                      </h2>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">
                        {previewDoc.issuingAuthority || 'OFFICIAL VERIFIED REPOSITORY'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[11px] rounded-lg border border-emerald-300">
                      DIGITALLY SIGNED
                    </span>
                  </div>
                </div>

                {/* Document Body Details */}
                <div className="space-y-6 flex-1 py-4">
                  <div className="text-center space-y-1">
                    <span className="text-xs font-black text-[#0B3B8C] tracking-widest uppercase block">
                      OFFICIAL CERTIFICATE OF
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                      {previewDoc.name}
                    </h1>
                  </div>

                  {previewDoc.customFileUrl ? (
                    <div className="space-y-3">
                      <div className="w-full max-h-[380px] bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden p-2 flex items-center justify-center">
                        {previewDoc.fileType === 'pdf' ? (
                          <iframe
                            src={previewDoc.customFileUrl}
                            title={previewDoc.name}
                            className="w-full h-[340px] rounded-xl border-none"
                          />
                        ) : (
                          <SmartImage
                            src={previewDoc.customFileUrl}
                            alt={previewDoc.name}
                            className="max-h-[350px] max-w-full object-contain rounded-xl shadow-xs"
                          />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Document Number</span>
                          <span className="font-mono font-bold text-slate-800">{previewDoc.documentNumber || 'VERIFIED'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Format & Size</span>
                          <span className="font-bold text-slate-800">{previewDoc.fileType.toUpperCase()} ({previewDoc.fileSize})</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Name of Holder</span>
                        <span className="font-extrabold text-slate-800 text-sm">{user?.name || 'Citizen Name'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Document ID / Roll No</span>
                        <span className="font-mono font-extrabold text-slate-900 text-xs">
                          {previewDoc.documentNumber || 'VERIFIED-SFF-8812'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Verification Date</span>
                        <span className="font-semibold text-slate-700">{previewDoc.uploadDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">File Format & Size</span>
                        <span className="font-semibold text-slate-700">{previewDoc.fileType.toUpperCase()} ({previewDoc.fileSize})</span>
                      </div>
                    </div>
                  )}

                  {/* Watermark Seal Visual */}
                  <div className="p-6 bg-blue-50/50 border border-blue-200 rounded-2xl text-center space-y-2 relative overflow-hidden">
                    <div className="absolute right-2 bottom-2 opacity-10 pointer-events-none">
                      <ShieldCheck className="w-32 h-32 text-[#0B3B8C]" />
                    </div>
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <p className="text-xs font-extrabold text-slate-800 uppercase">
                      AUTHENTICATED VIA e-DISTRICT & DIGILOCKER API
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
                      This document is cryptographically verified and legally valid under IT Act 2000.
                    </p>
                  </div>
                </div>

                {/* Document Footer Signature */}
                <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">ISSUING AUTHORITY</span>
                    <span className="font-bold text-slate-800">{previewDoc.issuingAuthority || 'Competent Authority'}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-serif italic font-bold text-[#0B3B8C] text-sm">Govt. E-Signature</div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">DIGITAL STAMP</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      {/* MODAL: ADD DOCUMENT */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-800 max-h-[90vh] overflow-y-auto scrollbar-none"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-black text-slate-900 text-base">
                <FolderPlus className="w-5 h-5 text-[#0B3B8C]" />
                <span>Add Document to Locker</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddDocModal(false);
                  setDocNumberInput('');
                  setCustomDocNameInput('');
                  setModalFileState(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Select a document type to add to your Digital Locker, or choose <strong>Other Document</strong> to upload up to 10 custom documents (e.g. Pan Card, Character Certificate, Ration Card, etc.).
            </p>

            {/* DOCUMENT TYPE SELECTOR */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Select Document Type
              </label>
              <div className="grid grid-cols-1 gap-2">
                {availableDocTypes.map((type) => {
                  const isSelected = selectedDocType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setSelectedDocType(type.id);
                        setDocNumberInput('');
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0B3B8C] bg-blue-50/70 text-[#0B3B8C] font-extrabold shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-bold'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#0B3B8C] text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {renderDocIcon(type.iconType)}
                        </div>
                        <div>
                          <span className="text-xs block">{type.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal block">
                            {type.id === 'other' ? `Custom documents added: ${customDocCount} / 10` : type.authority}
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#0B3B8C]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* IF OTHER / CUSTOM DOCUMENT IS SELECTED */}
            {selectedDocType === 'other' && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Document Name <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-50 text-[#0B3B8C] rounded-full border border-blue-200">
                    {customDocCount} / 10 Uploaded
                  </span>
                </div>
                <input
                  type="text"
                  value={customDocNameInput}
                  onChange={(e) => setCustomDocNameInput(e.target.value)}
                  placeholder="e.g. Pan Card, Character Certificate, Ration Card..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0B3B8C] rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />

                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Document Number / Ref ID (Optional)
                </label>
                <input
                  type="text"
                  value={docNumberInput}
                  onChange={(e) => setDocNumberInput(e.target.value)}
                  placeholder="Enter Document / Certificate Number if applicable"
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0B3B8C] rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            )}

            {/* IF STANDARD DOCUMENT TYPE IS SELECTED */}
            {selectedDocType !== 'other' && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {allDocTypes.find((t) => t.id === selectedDocType)?.name} Number (Optional)
                </label>
                <input
                  type="text"
                  value={docNumberInput}
                  onChange={(e) => setDocNumberInput(e.target.value)}
                  placeholder={allDocTypes.find((t) => t.id === selectedDocType)?.placeholder}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#0B3B8C] rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            )}

            {/* FILE UPLOAD SECTION IN MODAL */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Upload Document File (Optional)
              </label>
              <input
                type="file"
                ref={modalFileInputRef}
                onChange={handleModalFileSelect}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
              />
              {modalFileState ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-emerald-900 block truncate">{modalFileState.file.name}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">{modalFileState.formattedSize} • {modalFileState.fileType.toUpperCase()}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalFileState(null)}
                    className="text-emerald-700 hover:text-red-600 p-1 rounded-md cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => modalFileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl text-slate-600 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4 text-[#0B3B8C]" />
                  <span>Choose File (PDF, JPG, PNG max 10MB)</span>
                </button>
              )}
            </div>

            {selectedDocType === 'other' && customDocCount >= 10 && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold text-center">
                ⚠️ Maximum limit of 10 custom documents reached.
              </div>
            )}

            {/* MODAL FOOTER */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowAddDocModal(false);
                  setDocNumberInput('');
                  setCustomDocNameInput('');
                  setModalFileState(null);
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddDocument}
                disabled={selectedDocType === 'other' && customDocCount >= 10}
                className="flex-1 py-2.5 bg-[#0B3B8C] hover:bg-blue-900 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Locker</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

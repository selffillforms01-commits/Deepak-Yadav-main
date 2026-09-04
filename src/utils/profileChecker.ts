import { UserProfile } from '../types';
import { AdminUserRecord } from '../components/admin/AdminTypes';

export function mapAdminUserToUserProfile(adminUser: AdminUserRecord): UserProfile {
  return {
    uid: adminUser.id || adminUser.sffUserId || `SFF-${Date.now()}`,
    sffUserId: adminUser.sffUserId || adminUser.id || `SFF-${Math.floor(100000 + Math.random() * 900000)}`,
    name: adminUser.name || 'Citizen User',
    email: adminUser.email || '',
    mobile: adminUser.mobile || '',
    role: 'citizen',
    accountStatus: adminUser.status || 'Active',
    photoUrl: adminUser.photoUrl || '',
    signatureUrl: adminUser.signatureUrl || '',
    thumbImpressionUrl: adminUser.thumbImpressionUrl || '',
    aadhaarNumber: adminUser.aadhaarNumber || '',
    panNumber: adminUser.panNumber || '',
    district: adminUser.district || '',
    state: adminUser.state || '',
    qualification: adminUser.qualification || '',
    gender: adminUser.gender || '',
    dob: adminUser.dob || '',
    fatherName: adminUser.fatherName || '',
    motherName: adminUser.motherName || '',
    address: adminUser.fullAddress || '',
    pincode: adminUser.pincode || '',
  };
}

export interface FieldCheck {
  key: string;
  labelEn: string;
  labelHi: string;
  labelOr: string;
  value?: string;
  isMissing: boolean;
}

export interface SectionCheckResult {
  sectionKey: 'personal' | 'address' | 'education' | 'bank' | 'certificates';
  sectionTitleEn: string;
  sectionTitleHi: string;
  isComplete: boolean;
  score: number; // 20 or 0
  totalFieldsCount: number;
  completedFieldsCount: number;
  missingFields: FieldCheck[];
  completedFields: FieldCheck[];
  statusMessageHi: string;
  formattedResponseHi: string;
}

export interface OverallProfileCompletion {
  totalPercentage: number; // 0, 20, 40, 60, 80, 100
  isServicesUnlocked: boolean; // totalPercentage >= 80
  completedSectionsCount: number; // 0 to 5
  sections: {
    personal: SectionCheckResult;
    address: SectionCheckResult;
    education: SectionCheckResult;
    bank: SectionCheckResult;
    certificates: SectionCheckResult;
  };
}

// 1. Personal Information Section (20%)
export const checkPersonalInformationProfile = (user?: UserProfile): SectionCheckResult => {
  const p = user || ({} as UserProfile);

  const aadhaarVal = p.aadhaarNumber || p.aadhaarLast4 || '';

  const fields: FieldCheck[] = [
    {
      key: 'name',
      labelEn: 'Full Name',
      labelHi: 'Full Name',
      labelOr: 'ପୁରା ନାମ',
      value: p.name,
      isMissing: !p.name || p.name.trim() === '',
    },
    {
      key: 'fatherName',
      labelEn: "Father's Name",
      labelHi: "Father's Name",
      labelOr: 'ପିତାଙ୍କ ନାମ',
      value: p.fatherName,
      isMissing: !p.fatherName || p.fatherName.trim() === '',
    },
    {
      key: 'motherName',
      labelEn: "Mother's Name",
      labelHi: "Mother's Name",
      labelOr: 'ମାତାଙ୍କ ନାମ',
      value: p.motherName,
      isMissing: !p.motherName || p.motherName.trim() === '',
    },
    {
      key: 'dob',
      labelEn: 'Date of Birth',
      labelHi: 'Date of Birth',
      labelOr: 'ଜନ୍ମ ତାରିଖ',
      value: p.dob,
      isMissing: !p.dob || p.dob.trim() === '',
    },
    {
      key: 'gender',
      labelEn: 'Gender',
      labelHi: 'Gender',
      labelOr: 'ଲିଙ୍ଗ',
      value: p.gender,
      isMissing: !p.gender || p.gender.trim() === '',
    },
    {
      key: 'mobile',
      labelEn: 'Mobile Number',
      labelHi: 'Mobile Number',
      labelOr: 'ମୋବାଇଲ ନମ୍ବର',
      value: p.mobile,
      isMissing: !p.mobile || p.mobile.trim() === '',
    },
    {
      key: 'aadhaar',
      labelEn: 'Aadhaar Number',
      labelHi: 'Aadhaar Number',
      labelOr: 'ଆଧାର ନମ୍ବର',
      value: aadhaarVal,
      isMissing: !aadhaarVal || aadhaarVal.trim() === '',
    },
  ];

  const missingFields = fields.filter((f) => f.isMissing);
  const completedFields = fields.filter((f) => !f.isMissing);
  const isComplete = missingFields.length === 0;

  return {
    sectionKey: 'personal',
    sectionTitleEn: 'Personal Information',
    sectionTitleHi: 'Personal Information',
    isComplete,
    score: isComplete ? 20 : 0,
    totalFieldsCount: fields.length,
    completedFieldsCount: completedFields.length,
    missingFields,
    completedFields,
    statusMessageHi: isComplete
      ? 'आपका Personal Information पूरा हो चुका है।'
      : 'आपका Personal Information पूरा नहीं है।',
    formattedResponseHi: '',
  };
};

// 2. Address Information Section (20%)
export const checkAddressInformationProfile = (user?: UserProfile): SectionCheckResult => {
  const p = user || ({} as UserProfile);

  const villageAt = p.addressAt || p.address || p.presentAddressAt || p.urbanLocality || '';
  const postOffice = p.postOffice || p.presentPostOffice || p.permanentPostOffice || '';
  const policeStation = p.policeStation || p.presentPoliceStation || p.permanentPoliceStation || '';
  const district = p.district || p.presentDistrict || p.permanentDistrict || p.urbanCity || p.presentUrbanCity || '';
  const state = p.state || p.presentState || p.permanentState || '';
  const pincode = p.pincode || p.presentPincode || p.permanentPincode || '';

  const fields: FieldCheck[] = [
    {
      key: 'villageAt',
      labelEn: 'Village / At / Locality',
      labelHi: 'Village / At / Locality',
      labelOr: 'ଗ୍ରାମ / ସାହି',
      value: villageAt,
      isMissing: !villageAt || villageAt.trim() === '',
    },
    {
      key: 'postOffice',
      labelEn: 'Post Office',
      labelHi: 'Post Office',
      labelOr: 'ଡାକଘର',
      value: postOffice,
      isMissing: !postOffice || postOffice.trim() === '',
    },
    {
      key: 'policeStation',
      labelEn: 'Police Station',
      labelHi: 'Police Station',
      labelOr: 'ଥାନା',
      value: policeStation,
      isMissing: !policeStation || policeStation.trim() === '',
    },
    {
      key: 'district',
      labelEn: 'District',
      labelHi: 'District',
      labelOr: 'ଜିଲ୍ଲା',
      value: district,
      isMissing: !district || district.trim() === '',
    },
    {
      key: 'state',
      labelEn: 'State',
      labelHi: 'State',
      labelOr: 'ରାଜ୍ୟ',
      value: state,
      isMissing: !state || state.trim() === '',
    },
    {
      key: 'pincode',
      labelEn: 'PIN Code',
      labelHi: 'PIN Code',
      labelOr: 'ପିନ୍ କୋଡ୍',
      value: pincode,
      isMissing: !pincode || pincode.trim() === '',
    },
  ];

  const missingFields = fields.filter((f) => f.isMissing);
  const completedFields = fields.filter((f) => !f.isMissing);
  const isComplete = missingFields.length === 0;

  return {
    sectionKey: 'address',
    sectionTitleEn: 'Address Information',
    sectionTitleHi: 'Address Information',
    isComplete,
    score: isComplete ? 20 : 0,
    totalFieldsCount: fields.length,
    completedFieldsCount: completedFields.length,
    missingFields,
    completedFields,
    statusMessageHi: isComplete
      ? 'आपका Address Information पूरा हो चुका है।'
      : 'आपका Address Information पूरा नहीं है।',
    formattedResponseHi: '',
  };
};

// 3. Education Details Section (20%)
export const checkEducationProfile = (user?: UserProfile): SectionCheckResult => {
  const p = user || ({} as UserProfile);

  const qual = p.qualification || '';
  const isBelow10th = qual.toLowerCase().includes('below') || qual.toLowerCase().includes('under') || qual.toLowerCase().includes('8th') || qual.toLowerCase().includes('5th');

  const course = p.degreeCourseName || p.graduationDegree || p.twelfthStream || p.diplomaCourseName || p.pgDegreeName || p.phdSpecialization || qual || '';
  const schoolCollege = p.tenthSchoolName || p.twelfthSchoolCollegeName || p.degreeCollegeName || p.diplomaCollegeName || p.pgCollegeName || p.university || '';
  const boardUniversity = p.tenthBoardName || p.tenthBoard || p.twelfthCouncilBoard || p.degreeUniversityName || p.diplomaBoardUniversity || p.pgUniversityName || p.phdUniversity || p.university || '';
  const passingYear = p.tenthPassingYear || p.twelfthPassingYear || p.degreePassingYear || p.diplomaPassingYear || p.pgPassingYear || p.phdPassingYear || p.passingYear || '';
  const rollNumber = p.tenthRollNumber || p.twelfthRollNumber || p.degreeRollNumber || p.diplomaRollNumber || p.pgRollNumber || p.phdRegNumber || '';
  const percentage = p.tenthPercentage || p.twelfthPercentage || p.graduationPercentage || p.degreeSgpaCgpa || p.diplomaPercentage || p.pgPercentage || p.tenthSecuredMarks || '';

  const fields: FieldCheck[] = [
    {
      key: 'qualification',
      labelEn: 'Highest Qualification',
      labelHi: 'Highest Qualification',
      labelOr: 'ଉଚ୍ଚତମ ଯୋଗ୍ୟତା',
      value: qual,
      isMissing: !qual || qual.trim() === '',
    },
    {
      key: 'courseName',
      labelEn: 'Course / Stream Name',
      labelHi: 'Course / Stream Name',
      labelOr: 'କୋର୍ସ ନାମ',
      value: course,
      isMissing: !isBelow10th && (!course || course.trim() === ''),
    },
    {
      key: 'schoolCollegeName',
      labelEn: 'School / College Name',
      labelHi: 'School / College Name',
      labelOr: 'ବିଦ୍ୟାଳୟ ନାମ',
      value: schoolCollege,
      isMissing: !isBelow10th && (!schoolCollege || schoolCollege.trim() === ''),
    },
    {
      key: 'boardUniversity',
      labelEn: 'Board / University Name',
      labelHi: 'Board / University Name',
      labelOr: 'ବୋର୍ଡ ନାମ',
      value: boardUniversity,
      isMissing: !isBelow10th && (!boardUniversity || boardUniversity.trim() === ''),
    },
    {
      key: 'passingYear',
      labelEn: 'Passing Year',
      labelHi: 'Passing Year',
      labelOr: 'ଉତ୍ତୀର୍ଣ୍ଣ ବର୍ଷ',
      value: passingYear,
      isMissing: !isBelow10th && (!passingYear || passingYear.trim() === ''),
    },
    {
      key: 'rollNumber',
      labelEn: 'Roll Number',
      labelHi: 'Roll Number',
      labelOr: 'ରୋଲ୍ ନମ୍ବର',
      value: rollNumber,
      isMissing: !isBelow10th && (!rollNumber || rollNumber.trim() === ''),
    },
    {
      key: 'percentage',
      labelEn: 'Marks / Percentage',
      labelHi: 'Marks / Percentage',
      labelOr: 'ମାର୍କ / ପ୍ରତିଶତ',
      value: percentage,
      isMissing: !isBelow10th && (!percentage || percentage.trim() === ''),
    },
  ];

  const missingFields = fields.filter((f) => f.isMissing);
  const completedFields = fields.filter((f) => !f.isMissing);
  const isComplete = missingFields.length === 0;

  return {
    sectionKey: 'education',
    sectionTitleEn: 'Education Details',
    sectionTitleHi: 'Education Details',
    isComplete,
    score: isComplete ? 20 : 0,
    totalFieldsCount: fields.length,
    completedFieldsCount: completedFields.length,
    missingFields,
    completedFields,
    statusMessageHi: isComplete
      ? 'आपकी Education Details पूरी हो चुकी है।'
      : 'आपकी Education Details पूरी नहीं है।',
    formattedResponseHi: '',
  };
};

// 4. Bank Details Section (20%)
export const checkBankProfile = (user?: UserProfile): SectionCheckResult => {
  const p = user || ({} as UserProfile);

  const accountHolder = p.bankAccountHolderName || p.name || '';
  const bankName = p.bankName || '';
  const accNumber = p.bankAccountNumber || '';
  const ifsc = p.bankIfsc || '';
  const branch = p.bankBranch || '';

  const fields: FieldCheck[] = [
    {
      key: 'bankAccountHolderName',
      labelEn: 'Account Holder Name',
      labelHi: 'Account Holder Name',
      labelOr: 'ଖାତାଧାରୀଙ୍କ ନାମ',
      value: accountHolder,
      isMissing: !accountHolder || accountHolder.trim() === '',
    },
    {
      key: 'bankName',
      labelEn: 'Bank Name',
      labelHi: 'Bank Name',
      labelOr: 'ବ୍ୟାଙ୍କ ନାମ',
      value: bankName,
      isMissing: !bankName || bankName.trim() === '',
    },
    {
      key: 'bankAccountNumber',
      labelEn: 'Account Number',
      labelHi: 'Account Number',
      labelOr: 'ଖାତା ନମ୍ବର',
      value: accNumber,
      isMissing: !accNumber || accNumber.trim() === '',
    },
    {
      key: 'bankIfsc',
      labelEn: 'IFSC Code',
      labelHi: 'IFSC Code',
      labelOr: 'IFSC କୋଡ୍',
      value: ifsc,
      isMissing: !ifsc || ifsc.trim() === '',
    },
    {
      key: 'bankBranch',
      labelEn: 'Branch Name',
      labelHi: 'Branch Name',
      labelOr: 'ଶାଖା ନାମ',
      value: branch,
      isMissing: !branch || branch.trim() === '',
    },
  ];

  const missingFields = fields.filter((f) => f.isMissing);
  const completedFields = fields.filter((f) => !f.isMissing);
  const isComplete = missingFields.length === 0;

  return {
    sectionKey: 'bank',
    sectionTitleEn: 'Bank Details',
    sectionTitleHi: 'Bank Details',
    isComplete,
    score: isComplete ? 20 : 0,
    totalFieldsCount: fields.length,
    completedFieldsCount: completedFields.length,
    missingFields,
    completedFields,
    statusMessageHi: isComplete
      ? 'आपकी Bank Details पूरी हो चुकी है।'
      : 'आपकी Bank Details पूरी नहीं है।',
    formattedResponseHi: '',
  };
};

// Helper to check if a document/certificate exists in localStorage digital locker
const isDocAvailableInStorage = (docId: string, keyword: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem('sff_user_documents');
    if (!stored) return false;
    const docs = JSON.parse(stored);
    if (!Array.isArray(docs)) return false;
    const found = docs.find((d: any) => d.id === docId || (d.name && d.name.toLowerCase().includes(keyword.toLowerCase())));
    if (found && (found.status === 'Verified' || (found.documentNumber && found.documentNumber.trim() !== '') || found.customFileUrl)) {
      return true;
    }
  } catch (e) {}
  return false;
};

// 5. Other Details Section (Certificates & Documents) (20%)
export const checkCertificatesProfile = (user?: UserProfile): SectionCheckResult => {
  const p = user || ({} as UserProfile);

  const otherCerts = p.otherCertificates || [];
  
  const incomeCert = otherCerts.find(c => c.name.toLowerCase().includes('income'))?.number 
    || p.declaredFamilyIncome 
    || p.annualIncome 
    || (isDocAvailableInStorage('doc-income', 'income') ? 'Verified Document' : '');

  const userCat = (p.category || 'General').trim().toUpperCase();
  const isReservedCategory = userCat.includes('SC') || userCat.includes('ST') || userCat.includes('OBC') || userCat.includes('SEBC');

  const residenceCert = p.domicileCertNumber 
    || otherCerts.find(c => c.name.toLowerCase().includes('residence') || c.name.toLowerCase().includes('domicile'))?.number 
    || (isDocAvailableInStorage('doc-residence', 'residence') ? 'Verified Document' : '');

  const fields: FieldCheck[] = [
    {
      key: 'incomeCertificate',
      labelEn: 'Income Certificate',
      labelHi: 'Income Certificate',
      labelOr: 'ଆୟ ପ୍ରମାଣପତ୍ର',
      value: incomeCert,
      isMissing: !incomeCert || incomeCert.trim() === '',
    },
    {
      key: 'residenceCertificate',
      labelEn: 'Residence Certificate / Domicile',
      labelHi: 'Residence Certificate / Domicile',
      labelOr: 'ବାସସ୍ଥାନ ପ୍ରମାଣପତ୍ର',
      value: residenceCert,
      isMissing: !residenceCert || residenceCert.trim() === '',
    },
  ];

  if (isReservedCategory) {
    const casteCert = otherCerts.find(c => c.name.toLowerCase().includes('caste'))?.number 
      || (isDocAvailableInStorage('doc-caste', 'caste') ? 'Verified Document' : '');

    fields.push({
      key: 'casteCertificate',
      labelEn: 'Caste Certificate',
      labelHi: 'Caste Certificate',
      labelOr: 'ଜାତି ପ୍ରମାଣପତ୍ର',
      value: casteCert,
      isMissing: !casteCert || casteCert.trim() === '',
    });
  }

  const isDisabilityYes = Boolean(
    p.disabilityStatus &&
      (p.disabilityStatus.trim().toLowerCase() === 'yes' ||
        p.disabilityStatus.includes('हाँ') ||
        p.disabilityStatus.includes('ହଁ'))
  );

  if (isDisabilityYes) {
    const disCert = otherCerts.find(c => c.name.toLowerCase().includes('disability'))?.number 
      || (isDocAvailableInStorage('doc-disability', 'disability') ? 'Verified Document' : '');
    fields.push({
      key: 'disabilityCertificate',
      labelEn: 'Disability Certificate',
      labelHi: 'Disability Certificate',
      labelOr: 'ଦିବ୍ୟାଙ୍ଗ ପ୍ରମାଣପତ୍ର',
      value: disCert,
      isMissing: !disCert || disCert.trim() === '',
    });
  }

  const missingFields = fields.filter((f) => f.isMissing);
  const completedFields = fields.filter((f) => !f.isMissing);
  const isComplete = missingFields.length === 0;

  return {
    sectionKey: 'certificates',
    sectionTitleEn: 'Other Details',
    sectionTitleHi: 'Other Details',
    isComplete,
    score: isComplete ? 20 : 0,
    totalFieldsCount: fields.length,
    completedFieldsCount: completedFields.length,
    missingFields,
    completedFields,
    statusMessageHi: isComplete
      ? 'आपकी Other Details जानकारी पूरी हो चुकी है।'
      : 'आपकी Other Details जानकारी पूरी नहीं है।',
    formattedResponseHi: '',
  };
};

// Master overall calculation function (Single Source of Truth)
export const calculateOverallProfileCompletion = (user?: UserProfile): OverallProfileCompletion => {
  const personal = checkPersonalInformationProfile(user);
  const address = checkAddressInformationProfile(user);
  const education = checkEducationProfile(user);
  const bank = checkBankProfile(user);
  const certificates = checkCertificatesProfile(user);

  const totalPercentage = personal.score + address.score + education.score + bank.score + certificates.score;
  const isServicesUnlocked = true; // Always unlocked - profile completion does not block user service tasks
  
  let completedSectionsCount = 0;
  if (personal.isComplete) completedSectionsCount++;
  if (address.isComplete) completedSectionsCount++;
  if (education.isComplete) completedSectionsCount++;
  if (bank.isComplete) completedSectionsCount++;
  if (certificates.isComplete) completedSectionsCount++;

  return {
    totalPercentage,
    isServicesUnlocked,
    completedSectionsCount,
    sections: {
      personal,
      address,
      education,
      bank,
      certificates,
    },
  };
};

export const checkFullStep2Profile = (user?: UserProfile) => {
  const overall = calculateOverallProfileCompletion(user);
  const { personal, education, bank, certificates } = overall.sections;

  const allComplete = overall.totalPercentage === 100;

  let formattedMasterResponseHi = '';

  if (allComplete) {
    formattedMasterResponseHi = `🎉 **आपकी संपूर्ण Profile (Personal, Address, Education, Bank, Other Details) 100% पूरी हो चुकी है!**\n\n` +
      `✅ **Personal Information:** 20%\n` +
      `✅ **Address Information:** 20%\n` +
      `✅ **Education Details:** 20%\n` +
      `✅ **Bank Details:** 20%\n` +
      `✅ **Other Details:** 20%\n\n` +
      `💡 सभी 5 सेक्शन पूर्ण हैं। सभी सेवाएं पूरी तरह अनलॉक हैं।`;
  } else {
    formattedMasterResponseHi = `📋 **Profile Status Checklist (Overall: ${overall.totalPercentage}%)**\n\n` +
      `1️⃣ **Personal Information (20%):** ${personal.isComplete ? '✅ Complete (20%)' : '⚠️ Incomplete (0%)'}\n` +
      `2️⃣ **Address Information (20%):** ${overall.sections.address.isComplete ? '✅ Complete (20%)' : '⚠️ Incomplete (0%)'}\n` +
      `3️⃣ **Education Details (20%):** ${education.isComplete ? '✅ Complete (20%)' : '⚠️ Incomplete (0%)'}\n` +
      `4️⃣ **Bank Details (20%):** ${bank.isComplete ? '✅ Complete (20%)' : '⚠️ Incomplete (0%)'}\n` +
      `5️⃣ **Other Details (20%):** ${certificates.isComplete ? '✅ Complete (20%)' : '⚠️ Incomplete (0%)'}\n\n` +
      `💡 Note: Services require at least 80% completion (4 out of 5 sections) to unlock.`;
  }

  return {
    personal,
    education,
    bank,
    certificates,
    allComplete,
    formattedMasterResponseHi,
  };
};

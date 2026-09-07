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
      labelOr: 'à¬ªà­à¬°à¬¾ à¬¨à¬¾à¬®',
      value: p.name,
      isMissing: !p.name || p.name.trim() === '',
    },
    {
      key: 'fatherName',
      labelEn: "Father's Name",
      labelHi: "Father's Name",
      labelOr: 'à¬ªà¬¿à¬¤à¬¾à¬™à­à¬• à¬¨à¬¾à¬®',
      value: p.fatherName,
      isMissing: !p.fatherName || p.fatherName.trim() === '',
    },
    {
      key: 'motherName',
      labelEn: "Mother's Name",
      labelHi: "Mother's Name",
      labelOr: 'à¬®à¬¾à¬¤à¬¾à¬™à­à¬• à¬¨à¬¾à¬®',
      value: p.motherName,
      isMissing: !p.motherName || p.motherName.trim() === '',
    },
    {
      key: 'dob',
      labelEn: 'Date of Birth',
      labelHi: 'Date of Birth',
      labelOr: 'à¬œà¬¨à­à¬® à¬¤à¬¾à¬°à¬¿à¬–',
      value: p.dob,
      isMissing: !p.dob || p.dob.trim() === '',
    },
    {
      key: 'gender',
      labelEn: 'Gender',
      labelHi: 'Gender',
      labelOr: 'à¬²à¬¿à¬™à­à¬—',
      value: p.gender,
      isMissing: !p.gender || p.gender.trim() === '',
    },
    {
      key: 'mobile',
      labelEn: 'Mobile Number',
      labelHi: 'Mobile Number',
      labelOr: 'à¬®à­‹à¬¬à¬¾à¬‡à¬² à¬¨à¬®à­à¬¬à¬°',
      value: p.mobile,
      isMissing: !p.mobile || p.mobile.trim() === '',
    },
    {
      key: 'aadhaar',
      labelEn: 'Aadhaar Number',
      labelHi: 'Aadhaar Number',
      labelOr: 'à¬†à¬§à¬¾à¬° à¬¨à¬®à­à¬¬à¬°',
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
      ? 'à¤†à¤ªà¤•à¤¾ Personal Information à¤ªà¥‚à¤°à¤¾ à¤¹à¥‹ à¤šà¥à¤•à¤¾ à¤¹à¥ˆà¥¤'
      : 'à¤†à¤ªà¤•à¤¾ Personal Information à¤ªà¥‚à¤°à¤¾ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤',
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
      labelOr: 'à¬—à­à¬°à¬¾à¬® / à¬¸à¬¾à¬¹à¬¿',
      value: villageAt,
      isMissing: !villageAt || villageAt.trim() === '',
    },
    {
      key: 'postOffice',
      labelEn: 'Post Office',
      labelHi: 'Post Office',
      labelOr: 'à¬¡à¬¾à¬•à¬˜à¬°',
      value: postOffice,
      isMissing: !postOffice || postOffice.trim() === '',
    },
    {
      key: 'policeStation',
      labelEn: 'Police Station',
      labelHi: 'Police Station',
      labelOr: 'à¬¥à¬¾à¬¨à¬¾',
      value: policeStation,
      isMissing: !policeStation || policeStation.trim() === '',
    },
    {
      key: 'district',
      labelEn: 'District',
      labelHi: 'District',
      labelOr: 'à¬œà¬¿à¬²à­à¬²à¬¾',
      value: district,
      isMissing: !district || district.trim() === '',
    },
    {
      key: 'state',
      labelEn: 'State',
      labelHi: 'State',
      labelOr: 'à¬°à¬¾à¬œà­à­Ÿ',
      value: state,
      isMissing: !state || state.trim() === '',
    },
    {
      key: 'pincode',
      labelEn: 'PIN Code',
      labelHi: 'PIN Code',
      labelOr: 'à¬ªà¬¿à¬¨à­ à¬•à­‹à¬¡à­',
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
      ? 'à¤†à¤ªà¤•à¤¾ Address Information à¤ªà¥‚à¤°à¤¾ à¤¹à¥‹ à¤šà¥à¤•à¤¾ à¤¹à¥ˆà¥¤'
      : 'à¤†à¤ªà¤•à¤¾ Address Information à¤ªà¥‚à¤°à¤¾ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤',
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
      labelOr: 'à¬‰à¬šà­à¬šà¬¤à¬® à¬¯à­‹à¬—à­à­Ÿà¬¤à¬¾',
      value: qual,
      isMissing: !qual || qual.trim() === '',
    },
    {
      key: 'courseName',
      labelEn: 'Course / Stream Name',
      labelHi: 'Course / Stream Name',
      labelOr: 'à¬•à­‹à¬°à­à¬¸ à¬¨à¬¾à¬®',
      value: course,
      isMissing: !isBelow10th && (!course || course.trim() === ''),
    },
    {
      key: 'schoolCollegeName',
      labelEn: 'School / College Name',
      labelHi: 'School / College Name',
      labelOr: 'à¬¬à¬¿à¬¦à­à­Ÿà¬¾à¬³à­Ÿ à¬¨à¬¾à¬®',
      value: schoolCollege,
      isMissing: !isBelow10th && (!schoolCollege || schoolCollege.trim() === ''),
    },
    {
      key: 'boardUniversity',
      labelEn: 'Board / University Name',
      labelHi: 'Board / University Name',
      labelOr: 'à¬¬à­‹à¬°à­à¬¡ à¬¨à¬¾à¬®',
      value: boardUniversity,
      isMissing: !isBelow10th && (!boardUniversity || boardUniversity.trim() === ''),
    },
    {
      key: 'passingYear',
      labelEn: 'Passing Year',
      labelHi: 'Passing Year',
      labelOr: 'à¬‰à¬¤à­à¬¤à­€à¬°à­à¬£à­à¬£ à¬¬à¬°à­à¬·',
      value: passingYear,
      isMissing: !isBelow10th && (!passingYear || passingYear.trim() === ''),
    },
    {
      key: 'rollNumber',
      labelEn: 'Roll Number',
      labelHi: 'Roll Number',
      labelOr: 'à¬°à­‹à¬²à­ à¬¨à¬®à­à¬¬à¬°',
      value: rollNumber,
      isMissing: !isBelow10th && (!rollNumber || rollNumber.trim() === ''),
    },
    {
      key: 'percentage',
      labelEn: 'Marks / Percentage',
      labelHi: 'Marks / Percentage',
      labelOr: 'à¬®à¬¾à¬°à­à¬• / à¬ªà­à¬°à¬¤à¬¿à¬¶à¬¤',
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
      ? 'à¤†à¤ªà¤•à¥€ Education Details à¤ªà¥‚à¤°à¥€ à¤¹à¥‹ à¤šà¥à¤•à¥€ à¤¹à¥ˆà¥¤'
      : 'à¤†à¤ªà¤•à¥€ Education Details à¤ªà¥‚à¤°à¥€ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤',
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
      labelOr: 'à¬–à¬¾à¬¤à¬¾à¬§à¬¾à¬°à­€à¬™à­à¬• à¬¨à¬¾à¬®',
      value: accountHolder,
      isMissing: !accountHolder || accountHolder.trim() === '',
    },
    {
      key: 'bankName',
      labelEn: 'Bank Name',
      labelHi: 'Bank Name',
      labelOr: 'à¬¬à­à­Ÿà¬¾à¬™à­à¬• à¬¨à¬¾à¬®',
      value: bankName,
      isMissing: !bankName || bankName.trim() === '',
    },
    {
      key: 'bankAccountNumber',
      labelEn: 'Account Number',
      labelHi: 'Account Number',
      labelOr: 'à¬–à¬¾à¬¤à¬¾ à¬¨à¬®à­à¬¬à¬°',
      value: accNumber,
      isMissing: !accNumber || accNumber.trim() === '',
    },
    {
      key: 'bankIfsc',
      labelEn: 'IFSC Code',
      labelHi: 'IFSC Code',
      labelOr: 'IFSC à¬•à­‹à¬¡à­',
      value: ifsc,
      isMissing: !ifsc || ifsc.trim() === '',
    },
    {
      key: 'bankBranch',
      labelEn: 'Branch Name',
      labelHi: 'Branch Name',
      labelOr: 'à¬¶à¬¾à¬–à¬¾ à¬¨à¬¾à¬®',
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
      ? 'à¤†à¤ªà¤•à¥€ Bank Details à¤ªà¥‚à¤°à¥€ à¤¹à¥‹ à¤šà¥à¤•à¥€ à¤¹à¥ˆà¥¤'
      : 'à¤†à¤ªà¤•à¥€ Bank Details à¤ªà¥‚à¤°à¥€ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤',
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
    if (found && found.customFileUrl && found.customFileUrl.trim() !== '') {
      return true;
    }
  } catch (e) {}
  return false;
};

// 5. Other Details Section (Certificates & Documents) (20%)
export const checkCertificatesProfile = (user?: UserProfile): SectionCheckResult => {
  const p = user || ({} as UserProfile);

  const otherCerts = p.otherCertificates || [];
  
  const incomeCert =
    otherCerts.find(c => c.name.toLowerCase().includes('income'))?.number
    || (isDocAvailableInStorage('doc-income', 'income') ? 'Verified Document' : '');

  const userCat = (p.category || 'General').trim().toUpperCase();
  const isReservedCategory = userCat.includes('SC') || userCat.includes('ST') || userCat.includes('OBC') || userCat.includes('SEBC');

  const residenceCert =
    otherCerts.find(c =>
      c.name.toLowerCase().includes('residence') ||
      c.name.toLowerCase().includes('domicile')
    )?.number
    || (isDocAvailableInStorage('doc-residence', 'residence') ? 'Verified Document' : '');

  const fields: FieldCheck[] = [
    {
      key: 'incomeCertificate',
      labelEn: 'Income Certificate',
      labelHi: 'Income Certificate',
      labelOr: 'à¬†à­Ÿ à¬ªà­à¬°à¬®à¬¾à¬£à¬ªà¬¤à­à¬°',
      value: incomeCert,
      isMissing: !incomeCert || incomeCert.trim() === '',
    },
    {
      key: 'residenceCertificate',
      labelEn: 'Residence Certificate / Domicile',
      labelHi: 'Residence Certificate / Domicile',
      labelOr: 'à¬¬à¬¾à¬¸à¬¸à­à¬¥à¬¾à¬¨ à¬ªà­à¬°à¬®à¬¾à¬£à¬ªà¬¤à­à¬°',
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
      labelOr: 'à¬œà¬¾à¬¤à¬¿ à¬ªà­à¬°à¬®à¬¾à¬£à¬ªà¬¤à­à¬°',
      value: casteCert,
      isMissing: !casteCert || casteCert.trim() === '',
    });
  }

  const isDisabilityYes = Boolean(
    p.disabilityStatus &&
      (p.disabilityStatus.trim().toLowerCase() === 'yes' ||
        p.disabilityStatus.includes('à¤¹à¤¾à¤') ||
        p.disabilityStatus.includes('à¬¹à¬'))
  );

  if (isDisabilityYes) {
    const disCert = otherCerts.find(c => c.name.toLowerCase().includes('disability'))?.number 
      || (isDocAvailableInStorage('doc-disability', 'disability') ? 'Verified Document' : '');
    fields.push({
      key: 'disabilityCertificate',
      labelEn: 'Disability Certificate',
      labelHi: 'Disability Certificate',
      labelOr: 'à¬¦à¬¿à¬¬à­à­Ÿà¬¾à¬™à­à¬— à¬ªà­à¬°à¬®à¬¾à¬£à¬ªà¬¤à­à¬°',
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
      ? 'à¤†à¤ªà¤•à¥€ Other Details à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€ à¤ªà¥‚à¤°à¥€ à¤¹à¥‹ à¤šà¥à¤•à¥€ à¤¹à¥ˆà¥¤'
      : 'à¤†à¤ªà¤•à¥€ Other Details à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€ à¤ªà¥‚à¤°à¥€ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤',
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
    formattedMasterResponseHi = `ðŸŽ‰ **à¤†à¤ªà¤•à¥€ à¤¸à¤‚à¤ªà¥‚à¤°à¥à¤£ Profile (Personal, Address, Education, Bank, Other Details) 100% à¤ªà¥‚à¤°à¥€ à¤¹à¥‹ à¤šà¥à¤•à¥€ à¤¹à¥ˆ!**\n\n` +
      `âœ… **Personal Information:** 20%\n` +
      `âœ… **Address Information:** 20%\n` +
      `âœ… **Education Details:** 20%\n` +
      `âœ… **Bank Details:** 20%\n` +
      `âœ… **Other Details:** 20%\n\n` +
      `ðŸ’¡ à¤¸à¤­à¥€ 5 à¤¸à¥‡à¤•à¥à¤¶à¤¨ à¤ªà¥‚à¤°à¥à¤£ à¤¹à¥ˆà¤‚à¥¤ à¤¸à¤­à¥€ à¤¸à¥‡à¤µà¤¾à¤à¤‚ à¤ªà¥‚à¤°à¥€ à¤¤à¤°à¤¹ à¤…à¤¨à¤²à¥‰à¤• à¤¹à¥ˆà¤‚à¥¤`;
  } else {
    formattedMasterResponseHi = `ðŸ“‹ **Profile Status Checklist (Overall: ${overall.totalPercentage}%)**\n\n` +
      `1ï¸âƒ£ **Personal Information (20%):** ${personal.isComplete ? 'âœ… Complete (20%)' : 'âš ï¸ Incomplete (0%)'}\n` +
      `2ï¸âƒ£ **Address Information (20%):** ${overall.sections.address.isComplete ? 'âœ… Complete (20%)' : 'âš ï¸ Incomplete (0%)'}\n` +
      `3ï¸âƒ£ **Education Details (20%):** ${education.isComplete ? 'âœ… Complete (20%)' : 'âš ï¸ Incomplete (0%)'}\n` +
      `4ï¸âƒ£ **Bank Details (20%):** ${bank.isComplete ? 'âœ… Complete (20%)' : 'âš ï¸ Incomplete (0%)'}\n` +
      `5ï¸âƒ£ **Other Details (20%):** ${certificates.isComplete ? 'âœ… Complete (20%)' : 'âš ï¸ Incomplete (0%)'}\n\n` +
      `ðŸ’¡ Note: Services require at least 80% completion (4 out of 5 sections) to unlock.`;
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


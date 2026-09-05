export type PortalRoute = 'citizen-login' | 'admin-login' | 'maintenance-login' | 'dashboard' | 'admin-dashboard' | 'maintenance-dashboard';

export type UserRole = 'citizen' | 'admin' | 'maintenance';

export type DashboardTab = 'home' | 'documents' | 'services' | 'notifications' | 'profile' | 'ai';

export interface OtherCertificate {
  id: string;
  name: string;
  number: string;
  issuingAuthority?: string;
  issueDate?: string;
}

export interface UserProfile {
  uid?: string;
  sffUserId?: string;
  userId?: string;
  fullName?: string;
  name: string;
  email: string;
  mobileNumber?: string;
  mobile: string;
  role?: string;
  accountStatus?: string;
  emailVerified?: boolean;
  mobileVerified?: boolean;
  phoneVerified?: boolean;
  profileCompletion?: number;
  profileCompleted?: boolean;
  createdAt?: any;
  updatedAt?: any;
  aadhaarLast4?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  drivingLicenceNumber?: string;
  passportNumber?: string;
  gender?: string;
  dob?: string;
  category?: string;
  maritalStatus?: string;

  // Extended Personal
  bloodGroup?: string;
  nationality?: string;
  religion?: string;
  alternateMobile?: string;
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  disabilityStatus?: string;

  // Registration & Address Details
  areaType?: 'Rural' | 'Urban';
  addressAt?: string;
  urbanLocality?: string;
  urbanLandmark?: string;
  urbanWardNo?: string;
  urbanCity?: string;

  // Present Address Fields
  presentAddressAt?: string;
  presentGramPanchayat?: string;
  presentPostOffice?: string;
  presentPoliceStation?: string;
  presentBlock?: string;
  presentUrbanLocality?: string;
  presentUrbanLandmark?: string;
  presentUrbanWardNo?: string;
  presentUrbanCity?: string;
  presentDistrict?: string;
  presentState?: string;
  presentPincode?: string;
  presentCountry?: string;

  // Present Address
  address?: string;
  landmark?: string;
  panchayat?: string;
  postOffice?: string;
  policeStation?: string;
  blockUlb?: string;
  tehsil?: string;
  district?: string;
  state?: string;
  pincode?: string;
  country?: string;

  // Permanent Address
  permanentAddress?: string;
  permanentLandmark?: string;
  permanentPanchayat?: string;
  permanentPostOffice?: string;
  permanentPoliceStation?: string;
  permanentBlockUlb?: string;
  permanentTehsil?: string;
  permanentDistrict?: string;
  permanentState?: string;
  permanentPincode?: string;
  permanentCountry?: string;
  sameAsPermanent?: boolean;

  // Education Details
  qualification?: string;
  otherQualification?: string[];
  university?: string;
  passingYear?: string;
  tenthBoard?: string;
  tenthPercentage?: string;
  twelfthBoard?: string;
  twelfthPercentage?: string;
  graduationDegree?: string;
  graduationPercentage?: string;

  // 10th Standard Marksheet & Cert
  tenthStudentName?: string;
  tenthFatherName?: string;
  tenthMotherName?: string;
  tenthDob?: string;
  tenthRollNumber?: string;
  tenthBoardName?: string;
  tenthSchoolName?: string;
  tenthPassingYear?: string;
  tenthTotalMarks?: string;
  tenthObtainedMarks?: string;
  tenthSecuredMarks?: string;
  tenthCertNumber?: string;

  // 12th Standard Marksheet & Cert
  twelfthRollNumber?: string;
  twelfthRegNumber?: string;
  twelfthCouncilBoard?: string;
  twelfthSchoolCollegeName?: string;
  twelfthStream?: string;
  twelfthPassingYear?: string;
  twelfthTotalMarks?: string;
  twelfthObtainedMarks?: string;
  twelfthSecuredMarks?: string;
  twelfthCertNumber?: string;

  // Degree / Semester Marksheet & Cert
  degreeCollegeName?: string;
  degreeUniversityName?: string;
  degreeCourseName?: string;
  degreeSemesterNumber?: string;
  degreeRollNumber?: string;
  degreeRegNumber?: string;
  degreeTotalMarks?: string;
  degreeSecuredMarks?: string;
  degreeSgpaCgpa?: string;
  degreeEquivalentPercentage?: string;
  degreePassingYear?: string;
  degreeCertNumber?: string;

  // ITI / Diploma Details
  diplomaCourseName?: string;
  diplomaCollegeName?: string;
  diplomaBoardUniversity?: string;
  diplomaRollNumber?: string;
  diplomaPassingYear?: string;
  diplomaTotalMarks?: string;
  diplomaSecuredMarks?: string;
  diplomaPercentage?: string;
  diplomaCertNumber?: string;

  // Post Graduation Details
  pgDegreeName?: string;
  pgCollegeName?: string;
  pgUniversityName?: string;
  pgRollNumber?: string;
  pgPassingYear?: string;
  pgTotalMarks?: string;
  pgSecuredMarks?: string;
  pgPercentage?: string;
  pgCertNumber?: string;

  // Ph.D. / Doctorate Details
  phdSpecialization?: string;
  phdUniversity?: string;
  phdRegNumber?: string;
  phdPassingYear?: string;
  phdCertNumber?: string;

  // Resume Details
  careerObjective?: string;
  skills?: string | string[];
  computerSkills?: string | string[];
  technicalSkills?: string | string[];
  workExperience?: string[];
  professionalExperience?: string | string[];
  keyResponsibilities?: string | string[];
  responsibilities?: string | string[];
  technicalExpertise?: string | string[];
  projects?: string | string[];
  projectExecuted?: string | string[];
  professionalTraining?: string | string[];
  training?: string | string[];
  achievements?: string | string[];
  languagesKnown?: string | string[];
  hobbies?: string | string[];
  certifications?: string | string[];
  declaration?: string;

  // Bank Details
  bankIfsc?: string;
  bankAccountHolderName?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountNumber?: string;
  confirmBankAccountNumber?: string;

  // Family
  guardianName?: string;
  familyOccupation?: string;
  spouseName?: string;
  annualIncome?: string;
  numberOfChildren?: string;
  declaredFamilyIncome?: string;

  // Government Records
  rationCardNumber?: string;
  domicileCertNumber?: string;
  laborCardNumber?: string;
  drivingLicenseNumber?: string;
  voterIdNumber?: string;

  // Media / Documents
  photoUrl?: string;
  signatureUrl?: string;
  thumbImpressionUrl?: string;

  // Manual Certificates
  otherCertificates?: OtherCertificate[];
}

export interface LoginFormState {
  usernameOrEmail: string;
  password: string;
  rememberMe: boolean;
}

export interface SupportTicketForm {
  name: string;
  email: string;
  issueType: string;
  message: string;
}








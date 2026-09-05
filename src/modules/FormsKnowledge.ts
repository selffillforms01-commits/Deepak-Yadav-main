export interface FormKnowledge {
  id: string;
  name: string;
  description?: string;
  steps: Array<{
    id: string;
    title: string;
    fields: string[];
  }>;
}

export const FORMS_DATABASE: FormKnowledge[] = [
  {
    id: "income-certificate",
    name: "Income Certificate",
    description: "Income certificate application assistance",
    steps: [
      { id: "personal", title: "Personal Details", fields: ["fullName", "fatherName", "motherName", "dateOfBirth", "gender"] },
      { id: "address", title: "Address Details", fields: ["district", "block", "village", "address", "pinCode"] },
      { id: "income", title: "Income Details", fields: ["occupation", "annualIncome", "incomeSource"] },
      { id: "documents", title: "Documents", fields: ["identityProof", "addressProof", "incomeProof"] }
    ]
  },
  {
    id: "caste-certificate",
    name: "Caste Certificate",
    description: "Caste certificate application assistance",
    steps: [
      { id: "personal", title: "Personal Details", fields: ["fullName", "fatherName", "dateOfBirth", "gender"] },
      { id: "address", title: "Address Details", fields: ["district", "block", "village", "address", "pinCode"] },
      { id: "caste", title: "Caste Details", fields: ["caste", "category", "subCaste"] },
      { id: "documents", title: "Documents", fields: ["identityProof", "addressProof", "casteProof"] }
    ]
  },
  {
    id: "residence-certificate",
    name: "Residence Certificate",
    description: "Residence certificate application assistance",
    steps: [
      { id: "personal", title: "Personal Details", fields: ["fullName", "fatherName", "dateOfBirth"] },
      { id: "address", title: "Residence Details", fields: ["district", "block", "village", "address", "pinCode"] },
      { id: "documents", title: "Documents", fields: ["identityProof", "addressProof", "residenceProof"] }
    ]
  },
  {
    id: "pan-card",
    name: "Pan Card",
    description: "PAN card application assistance",
    steps: [
      { id: "personal", title: "Personal Details", fields: ["fullName", "fatherName", "dateOfBirth", "gender"] },
      { id: "contact", title: "Contact Details", fields: ["mobile", "email", "address"] },
      { id: "documents", title: "Documents", fields: ["identityProof", "addressProof", "dateOfBirthProof"] }
    ]
  },
  {
    id: "driving-license",
    name: "Driving License",
    description: "Driving licence application assistance",
    steps: [
      { id: "personal", title: "Personal Details", fields: ["fullName", "fatherName", "dateOfBirth", "gender"] },
      { id: "address", title: "Address Details", fields: ["district", "address", "pinCode"] },
      { id: "license", title: "License Details", fields: ["licenseType", "vehicleClass"] },
      { id: "documents", title: "Documents", fields: ["identityProof", "addressProof", "ageProof"] }
    ]
  },
  {
    id: "character-certificate",
    name: "Character Certificate",
    description: "Character certificate assistance",
    steps: [
      { id: "personal", title: "Personal Details", fields: ["fullName", "fatherName", "dateOfBirth"] },
      { id: "address", title: "Address Details", fields: ["district", "block", "village", "address"] },
      { id: "purpose", title: "Application Purpose", fields: ["purpose", "organization"] },
      { id: "documents", title: "Documents", fields: ["identityProof", "addressProof"] }
    ]
  },
  {
    id: "employment-exchange",
    name: "Employment Exchange",
    description: "Employment exchange registration assistance",
    steps: [
      { id: "personal", title: "Personal Details", fields: ["fullName", "fatherName", "dateOfBirth", "gender"] },
      { id: "education", title: "Education Details", fields: ["qualification", "board", "passingYear", "percentage"] },
      { id: "address", title: "Address Details", fields: ["district", "block", "address", "pinCode"] },
      { id: "documents", title: "Documents", fields: ["identityProof", "educationProof", "addressProof"] }
    ]
  },
  {
    id: "birth-certificate",
    name: "Birth Certificate",
    description: "Birth certificate application assistance",
    steps: [
      { id: "birth", title: "Birth Details", fields: ["childName", "dateOfBirth", "placeOfBirth", "gender"] },
      { id: "parents", title: "Parent Details", fields: ["fatherName", "motherName"] },
      { id: "address", title: "Address Details", fields: ["district", "block", "village", "address"] },
      { id: "documents", title: "Documents", fields: ["parentIdentityProof", "birthProof", "addressProof"] }
    ]
  },
  {
    id: "ews-certificate",
    name: "EWS Certificate",
    description: "EWS certificate assistance",
    steps: [
      { id: "personal", title: "Personal Details", fields: ["fullName", "fatherName", "dateOfBirth", "gender"] },
      { id: "address", title: "Address Details", fields: ["district", "block", "village", "address"] },
      { id: "income", title: "Income & Asset Details", fields: ["annualIncome", "familyIncome", "assetDetails"] },
      { id: "documents", title: "Documents", fields: ["identityProof", "incomeProof", "addressProof", "assetProof"] }
    ]
  },
  {
    id: "labour-card",
    name: "Labour Card",
    description: "Labour card registration assistance",
    steps: [
      { id: "personal", title: "Personal Details", fields: ["fullName", "fatherName", "dateOfBirth", "gender"] },
      { id: "work", title: "Work Details", fields: ["occupation", "employerName", "workType"] },
      { id: "address", title: "Address Details", fields: ["district", "block", "village", "address"] },
      { id: "documents", title: "Documents", fields: ["identityProof", "addressProof", "workProof"] }
    ]
  },
  {
    id: "passport-application",
    name: "Passport Application",
    description: "Passport application assistance",
    steps: [
      { id: "personal", title: "Personal Details", fields: ["fullName", "dateOfBirth", "gender", "maritalStatus"] },
      { id: "contact", title: "Contact Details", fields: ["mobile", "email", "address"] },
      { id: "family", title: "Family Details", fields: ["fatherName", "motherName", "spouseName"] },
      { id: "documents", title: "Documents", fields: ["identityProof", "addressProof", "dateOfBirthProof"] }
    ]
  },
  {
    id: "plus-2-admission",
    name: "+2 Admission",
    description: "+2 admission assistance",
    steps: [
      { id: "student", title: "Student Details", fields: ["fullName", "dateOfBirth", "gender", "category"] },
      { id: "education", title: "10th Details", fields: ["board", "rollNumber", "passingYear", "percentage"] },
      { id: "college", title: "College & Stream", fields: ["college", "stream", "subjectChoice"] },
      { id: "documents", title: "Documents", fields: ["10thMarksheet", "identityProof", "photo"] }
    ]
  },
  {
    id: "plus-3-admission",
    name: "+3 Admission",
    description: "+3 admission assistance",
    steps: [
      { id: "student", title: "Student Details", fields: ["fullName", "dateOfBirth", "gender", "category"] },
      { id: "education", title: "+2 Details", fields: ["board", "rollNumber", "passingYear", "percentage"] },
      { id: "college", title: "College & Course", fields: ["college", "course", "subjectChoice"] },
      { id: "documents", title: "Documents", fields: ["12thMarksheet", "identityProof", "photo"] }
    ]
  },
  {
    id: "nursing-admission",
    name: "Nursing Admission",
    description: "Nursing admission assistance",
    steps: [
      { id: "student", title: "Student Details", fields: ["fullName", "dateOfBirth", "gender", "category"] },
      { id: "education", title: "Education Details", fields: ["qualification", "board", "passingYear", "percentage", "scienceSubjects"] },
      { id: "course", title: "Nursing Course", fields: ["course", "collegeChoice"] },
      { id: "documents", title: "Documents", fields: ["marksheet", "identityProof", "photo", "certificate"] }
    ]
  },
  {
    id: "computer-courses",
    name: "Computer Courses",
    description: "Computer course admission assistance",
    steps: [
      { id: "student", title: "Student Details", fields: ["fullName", "dateOfBirth", "gender"] },
      { id: "education", title: "Education Details", fields: ["qualification", "passingYear"] },
      { id: "course", title: "Course Selection", fields: ["course", "duration", "institute"] },
      { id: "documents", title: "Documents", fields: ["identityProof", "educationProof", "photo"] }
    ]
  },
  {
    id: "iti",
    name: "ITI",
    description: "ITI admission assistance",
    steps: [
      { id: "student", title: "Student Details", fields: ["fullName", "dateOfBirth", "gender", "category"] },
      { id: "education", title: "Education Details", fields: ["qualification", "board", "passingYear", "percentage"] },
      { id: "trade", title: "Trade Selection", fields: ["trade", "instituteChoice"] },
      { id: "documents", title: "Documents", fields: ["marksheet", "identityProof", "photo", "certificate"] }
    ]
  },
  {
    id: "scholarship",
    name: "Scholarship",
    description: "Scholarship application assistance",
    steps: [
      { id: "student", title: "Student Details", fields: ["fullName", "dateOfBirth", "gender", "category"] },
      { id: "education", title: "Education Details", fields: ["institution", "course", "year", "percentage"] },
      { id: "bank", title: "Bank Details", fields: ["bankName", "accountHolderName"] },
      { id: "documents", title: "Documents", fields: ["identityProof", "marksheet", "incomeCertificate", "casteCertificate"] }
    ]
  }
];

export function getFormKnowledge(formId: string): FormKnowledge | null {
  const normalized = formId.toLowerCase().trim();

  return (
    FORMS_DATABASE.find(
      (form) =>
        form.id.toLowerCase() === normalized ||
        form.name.toLowerCase() === normalized
    ) || null
  );
}

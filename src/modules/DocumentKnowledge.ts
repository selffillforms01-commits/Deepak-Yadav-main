export interface DocumentKnowledge {
  id: string;
  name: string;
  description?: string;
  category?: string;
  requiredFor?: string[];
}

export interface DocumentCheckResult {
  documentId: string;
  documentName: string;
  available: boolean;
  required: boolean;
  status: "available" | "missing" | "not-required";
  mismatch?: boolean;
  message?: string;
}

export const DOCUMENTS_DATABASE: DocumentKnowledge[] = [
  {
    id: "aadhaar",
    name: "Aadhaar",
    category: "identity",
    requiredFor: [
      "income-certificate",
      "caste-certificate",
      "residence-certificate",
      "pan-card",
      "driving-license",
      "passport-application",
    ],
  },
  {
    id: "10th",
    name: "10th Marksheet",
    category: "education",
    requiredFor: [
      "plus-2-admission",
      "employment-exchange",
      "iti",
      "computer-courses",
    ],
  },
  {
    id: "12th",
    name: "12th Marksheet",
    category: "education",
    requiredFor: [
      "plus-3-admission",
      "nursing-admission",
      "scholarship",
    ],
  },
  {
    id: "income",
    name: "Income Certificate",
    category: "certificate",
    requiredFor: ["ews-certificate", "scholarship"],
  },
  {
    id: "caste",
    name: "Caste Certificate",
    category: "certificate",
    requiredFor: ["scholarship", "caste-certificate"],
  },
  {
    id: "residence",
    name: "Residence Certificate",
    category: "certificate",
    requiredFor: ["residence-certificate"],
  },
  {
    id: "identity-proof",
    name: "Identity Proof",
    category: "identity",
  },
  {
    id: "address-proof",
    name: "Address Proof",
    category: "address",
  },
  {
    id: "date-of-birth-proof",
    name: "Date of Birth Proof",
    category: "identity",
  },
  {
    id: "photo",
    name: "Passport Size Photo",
    category: "photo",
  },
];

export function getDocumentKnowledge(
  documentId: string
): DocumentKnowledge | null {
  const normalized = documentId.toLowerCase().trim();

  return (
    DOCUMENTS_DATABASE.find(
      (document) =>
        document.id.toLowerCase() === normalized ||
        document.name.toLowerCase() === normalized
    ) || null
  );
}

export function getDocumentsForForm(
  formId: string
): DocumentKnowledge[] {
  const normalized = formId.toLowerCase().trim();

  return DOCUMENTS_DATABASE.filter((document) =>
    document.requiredFor?.some(
      (requiredForm) => requiredForm.toLowerCase() === normalized
    )
  );
}

export function checkDocumentAvailability(
  formId: string,
  availableDocumentIds: string[]
): DocumentCheckResult[] {
  const requiredDocuments = getDocumentsForForm(formId);
  const available = new Set(
    availableDocumentIds.map((id) => id.toLowerCase().trim())
  );

  return requiredDocuments.map((document) => {
    const isAvailable =
      available.has(document.id.toLowerCase()) ||
      available.has(document.name.toLowerCase());

    return {
      documentId: document.id,
      documentName: document.name,
      available: isAvailable,
      required: true,
      status: isAvailable ? "available" : "missing",
      message: isAvailable
        ? `${document.name} available.`
        : `${document.name} is required but not available.`,
    };
  });
}

export function checkDocumentMismatch(
  expectedName: string,
  detectedName: string
): {
  mismatch: boolean;
  message: string;
} {
  const expected = expectedName.toLowerCase().trim();
  const detected = detectedName.toLowerCase().trim();

  if (!expected || !detected) {
    return {
      mismatch: false,
      message: "Document information is incomplete.",
    };
  }

  const mismatch = expected !== detected;

  return {
    mismatch,
    message: mismatch
      ? "Document type does not match the expected document."
      : "Document type matches.",
  };
}

export const DocumentKnowledge = {
  getDocumentKnowledge,
  getDocumentsForForm,
  checkDocumentAvailability,
  checkDocumentMismatch,
};

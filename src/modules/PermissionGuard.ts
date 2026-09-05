const SENSITIVE_PATTERNS = [
  /\b\d{12}\b/,
  /\b\d{10}\b/,
  /\b\d{16}\b/,
  /\b\d{6}\b/,
  /\b(otp|one[- ]time password)\b/i,
  /\b(password|passwd|passcode)\b/i,
  /\b(api[- ]?key|secret key|access token|token)\b/i,
  /\b(cvv|cvc)\b/i,
];

const SENSITIVE_FIELD_NAMES = [
  "aadhaar",
  "aadhar",
  "otp",
  "password",
  "passwd",
  "passcode",
  "apikey",
  "api-key",
  "secret",
  "token",
  "access-token",
  "cvv",
  "cvc",
  "account-number",
  "accountnumber",
  "bank-account",
  "card-number",
];

export function containsSensitiveInformation(value: string): boolean {
  if (!value) return false;

  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(value));
}

export function isSensitiveField(
  fieldName: string,
  fieldType?: string
): boolean {
  const normalized = `${fieldName} ${fieldType || ""}`.toLowerCase();

  return SENSITIVE_FIELD_NAMES.some((name) =>
    normalized.includes(name)
  );
}

export function sanitizeForAI(value: string): string {
  if (!value) return "";

  let result = value;

  SENSITIVE_PATTERNS.forEach((pattern) => {
    result = result.replace(pattern, "[REDACTED]");
  });

  return result;
}

export function sanitizeFieldValue(
  fieldName: string,
  value: string,
  fieldType?: string
): string {
  if (!value) return "";

  if (isSensitiveField(fieldName, fieldType)) {
    return "[REDACTED]";
  }

  return sanitizeForAI(value);
}

export function canSendToAI(value: string): boolean {
  return !containsSensitiveInformation(value);
}

export const PermissionGuard = {
  containsSensitiveInformation,
  isSensitiveField,
  sanitizeForAI,
  sanitizeFieldValue,
  canSendToAI,
};

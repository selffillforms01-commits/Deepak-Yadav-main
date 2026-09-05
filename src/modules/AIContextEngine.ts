import { sanitizeForAI } from "./PermissionGuard";

export interface AIFieldContext {
  id: string;
  label?: string;
  type?: string;
  required?: boolean;
  value?: string;
}

export interface AIContext {
  screen?: string;
  form?: unknown;
  fields?: AIFieldContext[];
  activeStepIndex?: number;
  focusedFieldId?: string;
  userMessage?: string;
}

const SENSITIVE_FIELD_PATTERNS = [
  /aadhaar/i,
  /aadhar/i,
  /otp/i,
  /password/i,
  /passwd/i,
  /passcode/i,
  /api.?key/i,
  /secret/i,
  /token/i,
  /account.?number/i,
  /bank.?account/i,
  /card.?number/i,
  /cvv/i,
];

function isSensitiveField(field: AIFieldContext): boolean {
  const text = `${field.id} ${field.label || ""} ${field.type || ""}`;
  return SENSITIVE_FIELD_PATTERNS.some((pattern) => pattern.test(text));
}

function sanitizeField(field: AIFieldContext): AIFieldContext {
  if (isSensitiveField(field)) {
    return {
      id: field.id,
      label: field.label,
      type: field.type,
      required: field.required,
      value: "[REDACTED]",
    };
  }

  return {
    id: field.id,
    label: field.label,
    type: field.type,
    required: field.required,
    value:
      typeof field.value === "string"
        ? sanitizeForAI(field.value)
        : field.value,
  };
}

export function buildAIContext(context: AIContext): AIContext {
  return {
    screen: context.screen,
    form: context.form,
    fields: (context.fields || []).map(sanitizeField),
    activeStepIndex: context.activeStepIndex,
    focusedFieldId: context.focusedFieldId,
    userMessage: context.userMessage
      ? sanitizeForAI(context.userMessage)
      : undefined,
  };
}

export const AIContextEngine = {
  buildAIContext,
  sanitizeField,
  isSensitiveField,
};

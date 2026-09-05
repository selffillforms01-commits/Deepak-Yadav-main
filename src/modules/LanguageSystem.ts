export type SffLanguage = "hindi" | "odia" | "english" | "hinglish";

export function normalizeLanguage(language?: string): SffLanguage {
  const value = (language || "").toLowerCase();

  if (value.includes("odia") || value.includes("oriya")) return "odia";
  if (value.includes("english")) return "english";
  if (value.includes("hindi")) return "hindi";

  return "hinglish";
}

export function getLanguageInstruction(language?: string): string {
  switch (normalizeLanguage(language)) {
    case "odia":
      return "Reply in simple Odia.";
    case "hindi":
      return "Reply in simple Hindi.";
    case "english":
      return "Reply in clear, simple English.";
    default:
      return "Reply in natural Hindi-English (Hinglish).";
  }
}

export const LanguageSystem = {
  normalizeLanguage,
  getLanguageInstruction,
};

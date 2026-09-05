import { useCallback, useState } from "react";
import { GeminiService } from "./GeminiService";
import { AIContextEngine } from "./AIContextEngine";
import { ScreenDetector } from "./ScreenDetector";
import { LanguageSystem } from "./LanguageSystem";
import { GuideEngine } from "./GuideEngine";
import { AlwaysOnEngine } from "./AlwaysOnEngine";

export function useSffAssistant({
  form,
  initialLanguage = "hinglish",
  apiEndpoint = "/api/ai/assistant",
}: {
  form: any;
  initialLanguage?: string;
  apiEndpoint?: string;
}) {
  const [language, setLanguage] = useState(initialLanguage);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [proactiveAlerts, setProactiveAlerts] = useState<any[]>([]);
  const [pendingConsents, setPendingConsents] = useState<any[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [focusedFieldId, setFocusedFieldIdState] = useState<string | undefined>();

  const [fields, setFields] = useState(
    (form?.fields || []).map((field: any) => ({
      ...field,
      value: field.value || "",
    }))
  );

  const steps = form?.steps || [];

  const updateFieldValue = useCallback((id: string, value: string) => {
    setFields((current) =>
      current.map((field: any) =>
        field.id === id ? { ...field, value } : field
      )
    );
  }, []);

  const setFocusedFieldId = useCallback((_id: string) => {}, []);

  const askAssistant = useCallback(
    async (message: string) => {
      if (!message?.trim()) return;

      setChatMessages((current) => [
        ...current,
        { role: "user", content: message },
      ]);

      setIsAiLoading(true);

      try {
        const result = await GeminiService.queryAssistant(
          message,
          language,
          {
            form,
            fields,
            activeStepIndex,
          },
          chatMessages
        );

        setChatMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: result.text,
          },
        ]);
      } catch {
        setChatMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: "AI assistant abhi available nahi hai.",
          },
        ]);
      } finally {
        setIsAiLoading(false);
      }
    },
    [language, form, fields, activeStepIndex, chatMessages]
  );

  const requestAutofill = useCallback((_fieldId: string) => {
    // Sensitive fields are never automatically submitted.
  }, []);

  const grantConsent = useCallback((id: string) => {
    setPendingConsents((current) =>
      current.filter((item: any) => item.id !== id)
    );
  }, []);

  const denyConsent = useCallback((id: string) => {
    setPendingConsents((current) =>
      current.filter((item: any) => item.id !== id)
    );
  }, []);

  return {
    fields,
    steps,
    language,
    chatMessages,
    proactiveAlerts,
    pendingConsents,
    updateFieldValue,
    setFocusedFieldId,
    askAssistant,
    requestAutofill,
    grantConsent,
    denyConsent,
    setLanguage,
    activeStepIndex,
    setActiveStepIndex,
    isAiLoading,
    apiEndpoint,
  };
}




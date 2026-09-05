export interface AssistantResult {
  text: string;
  source: string;
}

export interface AssistantRequest {
  prompt: string;
  language?: string;
  context?: unknown;
  history?: unknown;
}

export const GeminiService = {
  async queryAssistant(
    prompt: string,
    language?: string,
    context?: unknown,
    history?: unknown,
    apiEndpoint = "/api/ai/assistant"
  ): Promise<AssistantResult> {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        language,
        context,
        history,
      } satisfies AssistantRequest),
    });

    let data: { reply?: string; source?: string; error?: string } = {};

    try {
      data = await response.json();
    } catch {
      // Keep the original HTTP error when the server returns non-JSON.
    }

    if (!response.ok) {
      throw new Error(
        data.error || `AI assistant request failed (${response.status})`
      );
    }

    return {
      text: data.reply || "Sorry, AI assistant could not generate a response.",
      source: data.source || "gemini",
    };
  },
};

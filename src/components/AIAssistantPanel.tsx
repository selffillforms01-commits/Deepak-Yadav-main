import React, { useState } from "react";

interface AIAssistantPanelProps {
  chatMessages?: any[];
  onSendMessage?: (message: string) => void;
  isQuerying?: boolean;
  onChangeLanguage?: (language: string) => void;
  language?: string;
}

export function AIAssistantPanel({
  chatMessages = [],
  onSendMessage,
  isQuerying = false,
  onChangeLanguage,
  language = "hinglish",
}: AIAssistantPanelProps) {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    const value = message.trim();
    if (!value || isQuerying) return;

    onSendMessage?.(value);
    setMessage("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex min-h-0 h-full max-h-full flex-col overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
      <div className="flex items-center justify-between flex-shrink-0 border-b border-white p-3 sm:p-4">
        <div>
          <h2 className="font-semibold text-gray-900">SFF AI Assistant</h2>
          <p className="text-xs text-gray-500">Always-on assistance</p>
        </div>

        <select
          value={language}
          onChange={(e) => onChangeLanguage?.(e.target.value)}
          className="rounded-lg border border-white bg-white px-2 py-1 text-xs text-gray-800"
        >
          <option value="hinglish">Hinglish</option>
          <option value="hindi">Hindi</option>
          <option value="odia">Odia</option>
          <option value="english">English</option>
        </select>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 sm:p-4">
        {chatMessages.length === 0 && (
          <div className="text-sm text-gray-600">
            Namaste! Main SFF AI Assistant hoon. Form bharne mein help karunga.
          </div>
        )}

        {chatMessages.map((item, index) => (
          <div
            key={index}
            className={`rounded-xl p-3 text-sm ${
              item.role === "user"
                ? "ml-8 bg-gray-100 text-gray-900"
                : "mr-8 bg-gray-50 text-gray-800"
            }`}
          >
            {item.content || item.text || ""}
          </div>
        ))}

        {isQuerying && (
          <div className="text-xs text-gray-500">AI is thinking...</div>
        )}
      </div>

      <div className="flex-shrink-0 flex gap-2 border-t border-white bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Ask SFF AI..."
          className="min-w-0 flex-1 rounded-xl border border-white bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />

        <button
          type="button"
          onClick={sendMessage}
          disabled={!message.trim() || isQuerying}
          className="rounded-xl border border-white bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}




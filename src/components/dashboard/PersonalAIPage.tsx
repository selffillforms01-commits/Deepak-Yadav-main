import React from "react";
import { AIAssistantPanel } from "../AIAssistantPanel";
import { useSffAssistant } from "../../modules/useSffAssistant";

interface PersonalAIPageProps {}

const PersonalAIPage: React.FC<PersonalAIPageProps> = () => {
  const aiForm = {
    id: "sff-home-assistant",
    fields: [],
    steps: [],
  };

  const {
    chatMessages,
    askAssistant,
    isAiLoading,
    language: aiLanguage,
    setLanguage: setAiLanguage,
  } = useSffAssistant({
    form: aiForm,
    initialLanguage: "hinglish",
    apiEndpoint: "/api/ai/assistant",
  });

  return (
    <div className="w-full min-h-0 h-full flex flex-col">
      <AIAssistantPanel
        chatMessages={chatMessages}
        onSendMessage={askAssistant}
        isQuerying={isAiLoading}
        language={aiLanguage}
        onChangeLanguage={setAiLanguage}
      />
    </div>
  );
};

export default PersonalAIPage;






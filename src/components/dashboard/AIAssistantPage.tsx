import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Copy, 
  Check, 
  RotateCcw
} from 'lucide-react';
import { UserProfile, DashboardTab } from '../../types';
import { useLanguage, Language } from '../../context/LanguageContext';
import { 
  checkPersonalInformationProfile, 
  checkEducationProfile, 
  checkBankProfile, 
  checkCertificatesProfile, 
  checkFullStep2Profile 
} from '../../utils/profileChecker';

interface AIAssistantPageProps {
  user: UserProfile;
  onNavigateTab: (tab: DashboardTab) => void;
  activeView?: 'chat' | 'analytics';
  onActiveViewChange?: (view: 'chat' | 'analytics') => void;
  onBack?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    tab: DashboardTab;
  };
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ 
  user, 
  onNavigateTab,
}) => {
  const { language, setLanguage } = useLanguage();

  const getWelcomeText = (lang: Language) => {
    if (lang === 'hi') {
      return `नमस्ते! मैं SFF Assistant हूँ।\nमैं आपकी प्रोफाइल पूरी करने में मदद कर सकता हूँ।\n\nआप अपना प्रोफाइल पूरा कर लें ताकि सभी सेवाओं का लाभ आसानी से मिल सके।`;
    } else if (lang === 'or') {
      return `ନମସ୍କାର! ମୁଁ SFF Assistant।\nମୁଁ ଆପଣଙ୍କର ପ୍ରୋଫାଇଲ୍ ସମ୍ପୂର୍ଣ୍ଣ କରିବାରେ ସାହାଯ୍ୟ କରିପାରିବି।\n\nଆପଣ ଆପଣଙ୍କର ପ୍ରୋଫାଇଲ୍ ପୂରଣ କରନ୍ତୁ ଯାହାଦ୍ୱାରା ସମସ୍ତ ସେବାର ଲାଭ ସହଜରେ ମିଳିପାରିବ।`;
    }
    return `Hello! I am SFF Assistant.\nI can help you complete your profile.\n\nPlease complete your profile so you can easily access all services.`;
  };

  const getProfileButtonLabel = (lang: Language) => {
    if (lang === 'hi') return 'प्रोफ़ाइल पूरा करें →';
    if (lang === 'or') return 'ପ୍ରୋଫାଇଲ୍ ପୂରଣ କରନ୍ତୁ →';
    return 'Complete Profile →';
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Initialize or update welcome message when language changes
  useEffect(() => {
    setMessages([
      {
        id: 'welcome-1',
        sender: 'ai',
        text: getWelcomeText(language),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: {
          label: getProfileButtonLabel(language),
          tab: 'profile',
        },
      },
    ]);
  }, [language]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Quick Prompt Suggestions based on selected language
  const quickPrompts = language === 'hi' ? [
    "सभी सेवाओं के चार्जेस (Fees)",
    "Govt Jobs Apply (₹40)",
    "Personal Information चेक करें",
    "Education Details चेक करें",
    "Bank Details चेक करें",
    "Other Certificates चेक करें",
    "संपूर्ण प्रोफाइल चेक करें",
    "फॉर्म भरने के लिए कौन-से डॉक्यूमेंट चाहिए?"
  ] : language === 'or' ? [
    "ସମସ୍ତ ସେବାର ଚାର୍ଜ (Fees)",
    "Govt Jobs Apply (₹40)",
    "Personal Information ଯାଞ୍ଚ କରନ୍ତୁ",
    "Education Details ଯାଞ୍ଚ କରନ୍ତୁ",
    "Bank Details ଯାଞ୍ଚ କରନ୍ତୁ",
    "Other Certificates ଯାଞ୍ଚ କରନ୍ତୁ",
    "ସମସ୍ତ ପ୍ରୋଫାଇଲ୍ ଯାଞ୍ଚ କରନ୍ତୁ",
    "ଫର୍ମ ପୂରଣ ପାଇଁ କେଉଁ ସବୁ ଡକ୍ୟୁମେଣ୍ଟ ଦରକାର?"
  ] : [
    "All Service Charges & Fees",
    "Govt Jobs Apply (₹40)",
    "Check Personal Information Profile",
    "Check Education Details Profile",
    "Check Bank Details Profile",
    "Check Other Certificates Profile",
    "Check Full Profile Status",
    "Which documents are required for form auto-filling?"
  ];

  // Speech Recognition setup (Voice Input)
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert(language === 'hi' ? 'आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है।' : language === 'or' ? 'ଆପଣଙ୍କ ବ୍ରାଉଜରରେ ଭଏସ୍ ଇନପୁଟ୍ ସମର୍ଥିତ ନୁହେଁ।' : 'Voice input is not supported in your browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'or' ? 'or-IN' : 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Generate Smart Response based on query
  const generateAIResponse = (query: string): ChatMessage => {
    const q = query.toLowerCase();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 0. Fees / Service Charges Query
    if (
      q.includes('fee') ||
      q.includes('charge') ||
      q.includes('price') ||
      q.includes('रेट') ||
      q.includes('चार्ट') ||
      q.includes('चार्जेस') ||
      q.includes('फीस') ||
      q.includes('ଚାର୍ଜ') ||
      q.includes('ଫି')
    ) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: language === 'hi'
          ? `💰 **Self Fill Forms (SFF) सेवा शुल्क विवरण (Rate List)**:\n\n` +
            `📜 **प्रमाण पत्र और सेवाएं (Certificates & Services):**\n` +
            `• Income Certificate: ₹30/-\n` +
            `• Caste Certificate: ₹30/-\n` +
            `• Residence Certificate: ₹30/-\n` +
            `• Scholarship (State Scholarship Odisha): ₹30/-\n` +
            `• Driving License (DL): ₹30/-\n` +
            `• Employment Exchange: ₹50/-\n` +
            `• Character Certificate: ₹100/-\n` +
            `• PAN Card: ₹150/-\n` +
            `• Nursing / Computer / ITI Enquiry: ₹30/-\n\n` +
            `🏛️ **सरकारी और प्राइवेट नौकरियां (Jobs & Recruitment):**\n` +
            `• All Govt Jobs Application (Odisha & Central): ₹40/-\n` +
            `• Private Jobs Application / Enquiry: ₹40/-\n\n` +
            `⚡ *भुगतान सुरक्षित Razorpay Payment Gateway द्वारा स्वीकार किया जाता है और 30 मिनट में SFF टीम से कॉल प्राप्त होता है।*`
          : language === 'or'
          ? `💰 **Self Fill Forms (SFF) ସେବା ଶୁଳ୍କ ବିବରଣୀ (Rate List)**:\n\n` +
            `📜 **ପ୍ରମାଣପତ୍ର ଏବଂ ସେବା:**\n` +
            `• Income Certificate: ₹30/-\n` +
            `• Caste Certificate: ₹30/-\n` +
            `• Residence Certificate: ₹30/-\n` +
            `• Scholarship (Odisha): ₹30/-\n` +
            `• Driving License: ₹30/-\n` +
            `• Employment Exchange: ₹50/-\n` +
            `• Character Certificate: ₹100/-\n` +
            `• PAN Card: ₹150/-\n` +
            `• Nursing / Computer / ITI: ₹30/-\n\n` +
            `🏛️ **ଚାକିରି ଏବଂ ନିଯୁକ୍ତି (Jobs):**\n` +
            `• ସମସ୍ତ Govt Jobs Application: ₹40/-\n` +
            `• Private Jobs Application: ₹40/-\n\n` +
            `⚡ *ପେମେଣ୍ଟ ସୁରକ୍ଷିତ Razorpay Gateway ଦ୍ୱାରା ଗ୍ରହଣ କରାଯାଏ ଏବଂ 30 ମିନିଟ୍ ମଧ୍ୟରେ କଲ୍ ମିଳିଥାଏ।*`
          : `💰 **Self Fill Forms (SFF) Official Service Charges**:\n\n` +
            `📜 **Certificates & Services:**\n` +
            `• Income Certificate: ₹30/-\n` +
            `• Caste Certificate: ₹30/-\n` +
            `• Residence Certificate: ₹30/-\n` +
            `• Scholarship (Odisha State): ₹30/-\n` +
            `• Driving License: ₹30/-\n` +
            `• Employment Exchange: ₹50/-\n` +
            `• Character Certificate: ₹100/-\n` +
            `• PAN Card: ₹150/-\n` +
            `• Nursing / Computer / ITI Enquiry: ₹30/-\n\n` +
            `🏛️ **Jobs & Recruitment:**\n` +
            `• All Govt Jobs (Odisha & Central): ₹40/-\n` +
            `• Private Jobs Application: ₹40/-\n\n` +
            `⚡ *Payment accepted securely via official Razorpay Payment Gateway (Cards, UPI, NetBanking) with guaranteed 30-min SFF team callback.*`,
        timestamp: timeStr,
        actionButton: {
          label: language === 'hi' ? 'सेवाएं देखें (Services)' : language === 'or' ? 'ସେବା ଦେଖନ୍ତୁ' : 'Explore Services',
          tab: 'services',
        },
      };
    }

    // 0.1 Jobs Query (Govt, Private, OPSC, OSSC, SSC, UPSC, Railway, etc.)
    if (
      q.includes('job') ||
      q.includes('नौकरी') ||
      q.includes('चाकरी') ||
      q.includes('ଚାକିରି') ||
      q.includes('recruitment') ||
      q.includes('govt') ||
      q.includes('opsc') ||
      q.includes('ossc') ||
      q.includes('osssc') ||
      q.includes('ssc') ||
      q.includes('upsc') ||
      q.includes('railway') ||
      q.includes('police')
    ) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: language === 'hi'
          ? `🏛️ **SFF Jobs & Recruitment Hub**:\n\n` +
            `• **Govt Jobs (सरकारी नौकरियां):** ओडिशा (OPSC, OSSC, OSSSC, Odisha Police, Forest, Health, Education, Panchayati Raj) तथा केंद्र सरकार (SSC, UPSC, Railway, Banking, Defence, India Post) की सभी नौकरियों के फॉर्म भरने का सेवा शुल्क मात्र **₹40/-** है।\n\n` +
            `• **Private Jobs (प्राइवेट नौकरियां):** प्राइवेट जॉब्स एडमिन द्वारा मैन्युअल रूप से जोड़ी और प्रबंधित की जाती हैं। इनके लिए इंक्वायरी और आवेदन शुल्क मात्र **₹40/-** है।`
          : language === 'or'
          ? `🏛️ **SFF Jobs & Recruitment Hub**:\n\n` +
            `• **Govt Jobs:** ଓଡ଼ିଶା (OPSC, OSSC, OSSSC, Police, Health, Education) ଏବଂ କେନ୍ଦ୍ର ସରକାର (SSC, UPSC, Railway, Banking) ସମସ୍ତ ଫର୍ମ ପୂରଣର ଚାର୍ଜ **₹40/-**।\n\n` +
            `• **Private Jobs:** ଆଡମିନ୍‌ଙ୍କ ଦ୍ୱାରା ନିୟନ୍ତ୍ରିତ। ଆବେଦନ ଶୁଳ୍କ **₹40/-**।`
          : `🏛️ **SFF Jobs & Recruitment Hub**:\n\n` +
            `• **Govt Jobs:** Apply for all Odisha (OPSC, OSSC, OSSSC, Police, Forest, Health, Education) and Central (SSC, UPSC, Railway, Banking, Defence) Govt Jobs at a fixed processing fee of **₹40/-**.\n\n` +
            `• **Private Jobs:** Managed manually by Admin. Application / enquiry charge is **₹40/-**.`,
        timestamp: timeStr,
        actionButton: {
          label: language === 'hi' ? 'जॉब्स देखें (Jobs)' : language === 'or' ? 'ଜବ୍ସ ଦେଖନ୍ତୁ' : 'Open Jobs',
          tab: 'services',
        },
      };
    }

    // 1. Education Details Check
    if (
      q.includes('education') ||
      q.includes('एजुकेशन') ||
      q.includes('शिक्षा') ||
      q.includes('ଶିକ୍ଷା') ||
      q.includes('qualification') ||
      q.includes('योग्यता')
    ) {
      const eduCheck = checkEducationProfile(user);
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: eduCheck.formattedResponseHi,
        timestamp: timeStr,
        actionButton: {
          label: eduCheck.isComplete ? 'अगले सेक्शन (Bank Details) पर जाएँ →' : 'Education Details पूरा करें',
          tab: 'profile',
        },
      };
    }

    // 2. Bank Details Check
    if (
      q.includes('bank') ||
      q.includes('बैंक') ||
      q.includes('ब्याଙ୍କ') ||
      q.includes('ଖାତା') ||
      q.includes('खाता') ||
      q.includes('account') ||
      q.includes('ifsc')
    ) {
      const bankCheck = checkBankProfile(user);
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: bankCheck.formattedResponseHi,
        timestamp: timeStr,
        actionButton: {
          label: bankCheck.isComplete ? 'अगले सेक्शन (Other Certificates) पर जाएँ →' : 'Bank Details पूरा करें',
          tab: 'profile',
        },
      };
    }

    // 3. Other Certificates Check
    if (
      q.includes('other cert') ||
      q.includes('certificate') ||
      q.includes('सर्टिफिकेट') ||
      q.includes('प्रमाणपत्र') ||
      q.includes('ସାର୍ଟିଫିକେଟ୍')
    ) {
      const certCheck = checkCertificatesProfile(user);
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: certCheck.formattedResponseHi,
        timestamp: timeStr,
        actionButton: {
          label: certCheck.isComplete ? 'सभी प्रमाण पत्र पूरे हैं ✅' : 'Other Certificates पूरा करें',
          tab: 'profile',
        },
      };
    }

    // 4. Personal Information Check
    if (
      q.includes('personal') ||
      q.includes('पर्सनल') ||
      q.includes('व्यक्तिगत') ||
      q.includes('ବ୍ୟକ୍ତିଗତ')
    ) {
      const pCheck = checkPersonalInformationProfile(user);
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: pCheck.formattedResponseHi,
        timestamp: timeStr,
        actionButton: {
          label: pCheck.isComplete ? 'अगले सेक्शन (Education Details) पर जाएँ →' : 'Personal Information पूरा करें',
          tab: 'profile',
        },
      };
    }

    // 5. Full Profile / Step 2 Comprehensive Check
    if (
      q.includes('profile') || 
      q.includes('प्रोफाइल') || 
      q.includes('ପ୍ରୋଫାଇଲ୍') || 
      q.includes('step') || 
      q.includes('स्टेप') || 
      q.includes('check') || 
      q.includes('जांच') || 
      q.includes('चेक')
    ) {
      const step2Full = checkFullStep2Profile(user);
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: step2Full.formattedMasterResponseHi,
        timestamp: timeStr,
        actionButton: {
          label: step2Full.allComplete ? 'प्रोफ़ाइल देखें' : 'अधूरी जानकारी पूरी करें',
          tab: 'profile',
        },
      };
    }

    if (q.includes('document') || q.includes('paper') || q.includes('ଦସ୍ତାବିଜ') || q.includes('डॉक्यूमेंट')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: language === 'hi'
          ? `📄 **आवश्यक दस्तावेज़ों की सूची**:\n\n1. **पहचान पत्र:** आधार कार्ड / पैन कार्ड\n2. **निवास प्रमाण:** मूल निवास प्रमाण पत्र\n3. **शैक्षणिक दस्तावेज़:** 10वीं/12वीं अंकसूची व प्रमाण पत्र\n4. **आय व जाति:** आय एवं जाति प्रमाण पत्र\n5. **बायोमेट्रिक्स:** पासपोर्ट फोटो और डिजिटल हस्ताक्षर\n\nआप अपने दस्तावेज़ों को **'My Documents'** सेक्शन में सुरक्षित रख सकते हैं!`
          : language === 'or'
          ? `📄 **ଆବଶ୍ୟକୀୟ ଦସ୍ତାବିଜର ତାଲିକା**:\n\n1. **ପରିଚୟ ପତ୍ର:** ଆଧାର କାର୍ଡ / ପ୍ୟାନ୍ କାର୍ଡ\n2. **ବାସସ୍ଥାନ ପ୍ରମାଣ:** ସ୍ଥାୟୀ ବାସସ୍ଥାନ ପ୍ରମାଣପତ୍ର\n3. **ଶିକ୍ଷାଗତ ଦସ୍ତାବିଜ:** 10ମ/12ଶ ର ମାର୍କସିଟ୍\n4. **ଆୟ/ଜାତି:** ଆୟ ଏବଂ ଜାତି ପ୍ରମାଣପତ୍ର\n5. **ବାୟୋମେଟ୍ରିକ୍ସ:** ଫୋଟୋ ଏବଂ ଦସ୍ତଖତ\n\nଆପଣ **'My Documents'** ବିଭାଗରେ ସୁରକ୍ଷିତ ରଖିପାରିବେ!`
          : `📄 **Required Documents List**:\n\n1. **Identity:** Aadhaar Card / PAN Card\n2. **Residence:** Domicile / Resident Certificate\n3. **Academic:** Marksheets & Certificates\n4. **Income/Caste:** Latest Income & Caste Certificates\n5. **Biometrics:** Photo & Digital Signature\n\nYou can keep them safe in **'My Documents'**!`,
        timestamp: timeStr,
        actionButton: {
          label: language === 'hi' ? 'दस्तावेज़ खोलें' : language === 'or' ? 'ଦସ୍ତାବିଜ ଖୋଲନ୍ତୁ' : 'Open Documents',
          tab: 'profile',
        },
      };
    }

    // Default friendly response
    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: language === 'hi'
        ? `मैं SFF Assistant हूँ। मैं आपकी प्रोफाइल जांचने और सरकारी फॉर्म भरने में मदद कर सकता हूँ।\n\nआप अपनी प्रोफाइल जांचने के लिए ऊपर दिए गए विकल्पों पर क्लिक कर सकते हैं या अपना प्रश्न टाइप कर सकते हैं!`
        : language === 'or'
        ? `ମୁଁ SFF Assistant। ମୁଁ ଆପଣଙ୍କର ପ୍ରୋଫାଇଲ୍ ଯାଞ୍ଚ କରିବାରେ ଏବଂ ଫର୍ମ ପୂରଣ କରିବାରେ ସାହାଯ୍ୟ କରିପାରିବି।\n\nଆପଣ ଆପଣଙ୍କର ପ୍ରୋଫାଇଲ୍ ଯାଞ୍ଚ କରିବା ପାଇଁ ଉପରେ ଦିଆଯାଇଥିବା ବିକଳ୍ପଗୁଡ଼ିକ ଉପରେ କ୍ଲିକ୍ କରିପାରିବେ!`
        : `I am SFF Assistant. I can help you check your profile and auto-fill government forms.\n\nYou can click the quick prompt options above or type your query below!`,
      timestamp: timeStr,
      actionButton: {
        label: language === 'hi' ? 'प्रोफ़ाइल देखें' : language === 'or' ? 'ପ୍ରୋଫାଇଲ୍ ଦେଖନ୍ତୁ' : 'View Profile',
        tab: 'profile',
      },
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      // Keep existing SFF smart/profile responses working locally.
      const localReply = generateAIResponse(text);

      const lowerText = text.toLowerCase();

      const isLocalHandled =
        lowerText.includes('fee') ||
        lowerText.includes('charge') ||
        lowerText.includes('price') ||
        lowerText.includes('education') ||
        lowerText.includes('qualification') ||
        lowerText.includes('bank') ||
        lowerText.includes('account') ||
        lowerText.includes('ifsc') ||
        lowerText.includes('certificate') ||
        lowerText.includes('document') ||
        lowerText.includes('profile') ||
        lowerText.includes('personal') ||
        lowerText.includes('job') ||
        lowerText.includes('recruitment') ||
        lowerText.includes('govt') ||
        lowerText.includes('opsc') ||
        lowerText.includes('ossc') ||
        lowerText.includes('osssc') ||
        lowerText.includes('ssc') ||
        lowerText.includes('upsc') ||
        lowerText.includes('railway') ||
        lowerText.includes('police') ||
        lowerText.includes('?????') ||
        lowerText.includes('??????') ||
        lowerText.includes('????') ||
        lowerText.includes('??????????') ||
        lowerText.includes('????????') ||
        lowerText.includes('????????');

      if (isLocalHandled) {
        setMessages((prev) => [...prev, localReply]);
        setIsTyping(false);
        return;
      }

      // General questions are handled by Gemini on the server.
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gemini AI request failed.');
      }

      const aiReply: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (error: any) {
      console.error('[SFF AI Assistant]', error);

      const errorReply: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        sender: 'ai',
        text:
          language === 'hi'
            ? '???? ?????, ??? AI Assistant ?? ?????? ???? ?? ?? ??? ??? ????? ????? ??? ??? ??? ????? ?????'
            : language === 'or'
            ? '??????, ????????? AI Assistant ???? ????? ????????????? ?????? ???? ??? ??? ???? ?????? ???????'
            : 'Sorry, the AI Assistant is temporarily unavailable. Please try again shortly.',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-1',
        sender: 'ai',
        text: getWelcomeText(language),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: {
          label: getProfileButtonLabel(language),
          tab: 'profile',
        },
      },
    ]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-[calc(100vh-130px)] sm:h-[680px] bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden font-sans">
      {/* CLEAN SFF HEADER */}
      <div className="px-3.5 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
        {/* SFF NAME & STATUS */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0B3B8C] text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0 tracking-tight">
            SFF
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">SFF Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] text-slate-500 font-bold block">Smart Profile & Form Assistant</span>
          </div>
        </div>

        {/* RIGHT CONTROLS: LANGUAGE SELECTOR & RESET */}
        <div className="flex items-center gap-1.5">
          {/* LANGUAGE SELECTOR */}
          <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 flex items-center gap-0.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                language === 'hi' ? 'bg-[#0B3B8C] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => setLanguage('or')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                language === 'or' ? 'bg-[#0B3B8C] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ଓଡ଼ିଆ
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                language === 'en' ? 'bg-[#0B3B8C] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Eng
            </button>
          </div>

          {/* RESET CHAT BUTTON */}
          <button
            type="button"
            onClick={handleClearChat}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Reset Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CHAT MESSAGES AREA */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-slate-50/60">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-[#0B3B8C] text-white flex items-center justify-center font-black text-[10px] shrink-0 shadow-2xs mt-0.5 tracking-tight">
                SFF
              </div>
            )}

            <div className="max-w-[88%] sm:max-w-[80%] space-y-1.5">
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#0B3B8C] text-white rounded-tr-none font-medium shadow-2xs'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none font-normal shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* ACTION BUTTON INSIDE AI MESSAGE */}
                {msg.actionButton && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center">
                    <button
                      type="button"
                      onClick={() => onNavigateTab(msg.actionButton!.tab)}
                      className="px-3 py-1.5 bg-[#0B3B8C] hover:bg-blue-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <span>{msg.actionButton.label}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className={`flex items-center gap-2 text-[10px] text-slate-400 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span>{msg.timestamp}</span>
                {msg.sender === 'ai' && (
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="hover:text-slate-600 transition-colors cursor-pointer flex items-center gap-0.5"
                    title="Copy text"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-[10px] shrink-0 shadow-2xs mt-0.5">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs text-slate-400 font-medium pl-1"
          >
            <div className="w-5 h-5 rounded-md bg-[#0B3B8C] text-white flex items-center justify-center font-black text-[9px] tracking-tight">
              SFF
            </div>
            <span>SFF Assistant is typing...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK SUGGESTIONS CAROUSEL / CHIPS */}
      <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#0B3B8C] border border-slate-200/80 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* MESSAGE INPUT BOX + SEND BUTTON */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
      >
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
            isListening
              ? 'bg-red-500 text-white border-red-600 animate-pulse'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
          }`}
          title="Voice Input"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          placeholder={
            isListening
              ? 'Listening... speak now...'
              : language === 'hi'
              ? 'SFF Assistant से पूछें...'
              : language === 'or'
              ? 'SFF Assistant ଙ୍କୁ ପଚାରନ୍ତୁ...'
              : 'Ask SFF Assistant...'
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-[#0B3B8C] transition-all"
        />

        <button
          type="submit"
          disabled={!input.trim()}
          className="px-4 py-2.5 bg-[#0B3B8C] hover:bg-blue-900 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
        >
          <span>{language === 'hi' ? 'भेजें' : language === 'or' ? 'ପଠାନ୍ତୁ' : 'Send'}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};



import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'or';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav & Header
    'nav.home': 'Home',
    'nav.services': 'Services & Forms',
    'nav.notifications': 'Notifications',
    'nav.aiAssistant': 'AI Assistant',
    'nav.profile': 'My Profile',
    'nav.documents': 'My Documents',
    'header.title': 'Self Fill Forms Portal',
    'header.subtitle': 'Citizen Smart Assistant',
    'header.back': 'Back',
    'menu.wallet': '1. My Wallet',
    'menu.walletBalance': 'Balance',
    'menu.theme': '2. Theme Mode',
    'menu.requests': '3. My Requests',
    'menu.requestsSub': 'Application status',
    'menu.connect': '4. Connect / Support',
    'menu.connectSub': 'Helpline, Admin & Support',
    'menu.language': '5. Language / भाषा / ଭାଷା',
    'menu.logout': '6. Logout',
    'active': 'Active',

    // Home Page
    'home.welcome': 'Welcome',
    'home.searchPlaceholder': 'Search services, government schemes, or form auto-fill...',
    'home.heroTitle': '1-Click Government Form Auto-Fill Portal',
    'home.heroSubtitle': 'Apply for certificates, scholarships, admissions & jobs without typing errors using verified personal data.',
    'home.applyBtn': 'Apply Now',
    'home.profileScore': 'Profile Score',
    'home.verifiedDocs': 'Verified Documents',
    'home.activeApps': 'Active Applications',
    'home.quickActions': 'Quick Actions',
    'home.popularServices': 'Popular Services & Schemes',
    'home.fillForm': 'Auto-Fill Form',
    'home.uploadDocs': 'Upload Documents',
    'home.checkScore': 'Check Score',

    // Services Page
    'services.all': 'All Services',
    'services.admission': 'Admission',
    'services.admissionSub': 'School & College Admission',
    'services.scholarship': 'Scholarship',
    'services.scholarshipSub': 'Scholarship & Stipend Portal',
    'services.certificates': 'Certificates',
    'services.certificatesSub': 'Income, Caste, Residence & Birth',
    'services.jobs': 'Jobs & Recruitment',
    'services.jobsSub': 'Govt & Private Recruitment',
    'services.resume': 'My Resume',
    'services.resumeSub': 'Digital Resume Builder',
    'services.autoFillNow': '1-Click Auto Fill',
    'services.previewForm': 'Preview & Apply',

    // Documents Page
    'docs.title': 'My Vault & Verified Documents',
    'docs.subtitle': 'Store and verify your essential documents for 1-click form auto-filling.',
    'docs.upload': 'Upload Document',
    'docs.aadhaar': 'Aadhaar Card',
    'docs.pan': 'PAN Card',
    'docs.marksheet': 'Academic Marksheet',
    'docs.caste': 'Caste Certificate',
    'docs.income': 'Income Certificate',
    'docs.residence': 'Resident Certificate',
    'docs.photo': 'Passport Photo',
    'docs.sign': 'Digital Signature',

    // Profile Page
    'profile.title': 'Citizen Profile & Preferences',
    'profile.subtitle': 'Keep your verified details updated for instant 1-click form filling.',
    'profile.personal': '1. Personal Details',
    'profile.address': '2. Address Details',
    'profile.qualification': '3. Qualification Details',
    'profile.bank': '4. Bank Account Details',
    'profile.save': 'Save Profile Changes',
    'profile.myDocumentsBtn': 'MY DOCUMENTS',
    'profile.myDocumentsTitle': 'My Verified Documents',
    'profile.myDocumentsSub': 'Aadhaar, selected education marksheet & certificate, income, caste & residence',

    // AI Assistant
    'ai.title': '24/7 AI Smart Assistant',
    'ai.subtitle': 'Ask questions about schemes, document requirements & form auto-filling.',
    'ai.placeholder': 'Ask AI Assistant in English, Hindi, or Odia...',
    'ai.send': 'Send',
    'ai.voice': 'Voice Input',
    'ai.chatTitle': 'AI Assistant Chat',
    'ai.live247': '24/7 Live',
    'ai.tabChat': 'Chat',
    'ai.tabChart': 'Chart',
    'ai.resetChat': 'Reset Chat',
    'ai.thinking': 'AI Assistant is thinking...',
    'ai.voiceInput': 'Voice Input',
    'ai.listeningPlaceholder': 'Listening... speak now...',
    'ai.inputPlaceholder': 'Ask AI Assistant (e.g. How to apply for Caste Certificate?)...',
    'ai.analyticsTitle': 'AI Analytics & Chart',
    'ai.profileScoreChart': 'Profile Readiness Chart',
    'services.listSubtitle': 'List of available services',

    // Modals
    'modal.requestsTitle': 'My Requests & Form Submissions',
    'modal.requestsDesc': 'Track your real-time application status',
    'modal.walletTitle': 'Citizen Digital Wallet',
    'modal.walletDesc': 'Manage portal balance for service processing fees',
  },
  hi: {
    // Nav & Header
    'nav.home': 'होम (गृह)',
    'nav.services': 'सेवाएं एवं फॉर्म',
    'nav.notifications': 'सूचनाएं',
    'nav.aiAssistant': 'AI सहायक',
    'nav.profile': 'मेरी प्रोफाइल',
    'nav.documents': 'मेरे दस्तावेज',
    'header.title': 'सेल्फ फिल फॉर्म पोर्टल',
    'header.subtitle': 'नागरिक स्मार्ट सहायक',
    'header.back': 'वापस',
    'menu.wallet': '1. मेरा वॉलेट',
    'menu.walletBalance': 'शेष राशि',
    'menu.theme': '2. थीम मोड',
    'menu.requests': '3. मेरे आवेदन',
    'menu.requestsSub': 'आवेदन की स्थिति',
    'menu.connect': '4. संपर्क करें (Connect)',
    'menu.connectSub': 'हेल्पलाइन व सहायता केंद्र',
    'menu.language': '5. भाषा (Language)',
    'menu.logout': '6. लॉगआउट',
    'active': 'सक्रिय',

    // Home Page
    'home.welcome': 'स्वागत है',
    'home.searchPlaceholder': 'सेवाएं, सरकारी योजनाएं या फॉर्म खोजें...',
    'home.heroTitle': '1-क्लिक सरकारी फॉर्म ऑटो-फिल पोर्टल',
    'home.heroSubtitle': 'सत्यापित व्यक्तिगत विवरण का उपयोग करके बिना किसी त्रुटि के प्रमाण पत्र, छात्रवृत्ति और नौकरियों के लिए तुरंत आवेदन करें।',
    'home.applyBtn': 'अभी आवेदन करें',
    'home.profileScore': 'प्रोफाइल स्कोर',
    'home.verifiedDocs': 'सत्यापित दस्तावेज',
    'home.activeApps': 'सक्रिय आवेदन',
    'home.quickActions': 'त्वरित सेवाएं',
    'home.popularServices': 'लोकप्रिय सेवाएं व योजनाएं',
    'home.fillForm': 'फॉर्म ऑटो-फिल',
    'home.uploadDocs': 'दस्तावेज अपलोड',
    'home.checkScore': 'स्कोर चेक करें',

    // Services Page
    'services.all': 'सभी सेवाएं',
    'services.admission': 'प्रवेश (Admission)',
    'services.admissionSub': 'स्कूल व कॉलेज प्रवेश',
    'services.scholarship': 'छात्रवृत्ति (Scholarship)',
    'services.scholarshipSub': 'छात्रवृत्ति व वजीफा पोर्टल',
    'services.certificates': 'प्रमाण पत्र (Certificates)',
    'services.certificatesSub': 'आय, जाति, मूल निवास व जन्म',
    'services.jobs': 'भर्ती व नौकरियां (Jobs)',
    'services.jobsSub': 'सरकारी व निजी भर्ती',
    'services.resume': 'बायोडाटा (My Resume)',
    'services.resumeSub': 'डिजिटल सीवी बिल्डर',
    'services.autoFillNow': '1-क्लिक ऑटो फिल',
    'services.previewForm': 'देखें व आवेदन करें',

    // Documents Page
    'docs.title': 'दस्तावेज वॉल्ट व सत्यापन',
    'docs.subtitle': '1-क्लिक फॉर्म ऑटो-फिलिंग के लिए अपने आवश्यक दस्तावेजों को सुरक्षित रखें।',
    'docs.upload': 'दस्तावेज़ अपलोड करें',
    'docs.aadhaar': 'आधार कार्ड',
    'docs.pan': 'पैन कार्ड',
    'docs.marksheet': '10वीं/12वीं अंकसूची',
    'docs.caste': 'जाति प्रमाण पत्र',
    'docs.income': 'आय प्रमाण पत्र',
    'docs.residence': 'मूल निवास प्रमाण पत्र',
    'docs.photo': 'पासपोर्ट फोटो',
    'docs.sign': 'डिजिटल हस्ताक्षर',

    // Profile Page
    'profile.title': 'नागरिक प्रोफाइल व विवरण',
    'profile.subtitle': 'तुरंत 1-क्लिक फॉर्म भरने के लिए अपना सत्यापित विवरण अपडेट रखें।',
    'profile.personal': '1. व्यक्तिगत विवरण',
    'profile.address': '2. पता विवरण',
    'profile.qualification': '3. शैक्षणिक योग्यता',
    'profile.bank': '4. बैंक खाता विवरण',
    'profile.save': 'प्रोफाइल सहेजें',
    'profile.myDocumentsBtn': 'मेरे दस्तावेज़ (MY DOCUMENTS)',
    'profile.myDocumentsTitle': 'मेरे सत्यापित दस्तावेज़',
    'profile.myDocumentsSub': 'आधार, चयनित शैक्षणिक मार्कशीट एवं प्रमाण पत्र, आय, जाति एवं निवास',

    // AI Assistant
    'ai.title': '24/7 AI स्मार्ट सहायक',
    'ai.subtitle': 'योजनाओं, आवश्यक दस्तावेजों और फॉर्म भरने के बारे में हिंदी या अंग्रेजी में पूछें।',
    'ai.placeholder': 'AI सहायक से हिंदी, अंग्रेजी या उड़िया में पूछें...',
    'ai.send': 'भेजें',
    'ai.voice': 'वॉइस इनपुट',
    'ai.chatTitle': 'AI सहायक चैट',
    'ai.live247': '24/7 लाइव',
    'ai.tabChat': 'चैट',
    'ai.tabChart': 'चार्ट',
    'ai.resetChat': 'चैट रीसेट करें',
    'ai.thinking': 'AI सहायक सोच रहा है...',
    'ai.voiceInput': 'वॉइस इनपुट',
    'ai.listeningPlaceholder': 'सुन रहा हूँ... अब बोलिए...',
    'ai.inputPlaceholder': 'AI सहायक से पूछें (जैसे, जाति प्रमाण पत्र कैसे बनाएं?)...',
    'ai.analyticsTitle': 'AI एनालिटिक्स एवं चार्ट',
    'ai.profileScoreChart': 'प्रोफ़ाइल स्कोर चार्ट',
    'services.listSubtitle': 'उपलब्ध सेवाओं की सूची',

    // Modals
    'modal.requestsTitle': 'मेरे आवेदन एवं फॉर्म स्थितियां',
    'modal.requestsDesc': 'अपने आवेदनों की रीयल-टाइम स्थिति देखें',
    'modal.walletTitle': 'नागरिक डिजिटल वॉलेट',
    'modal.walletDesc': 'सेवा शुल्क भुगतान के लिए पोर्टल बैलेंस प्रबंधित करें',
  },
  or: {
    // Nav & Header
    'nav.home': 'ମୁଖ୍ୟ ପୃଷ୍ଠା',
    'nav.services': 'ସେବା ଏବଂ ଫର୍ମ',
    'nav.notifications': 'ସୂଚନାସମୂହ',
    'nav.aiAssistant': 'AI ସହାୟକ',
    'nav.profile': 'ମୋର ପ୍ରୋଫାଇଲ୍',
    'nav.documents': 'ମୋର ଦସ୍ତାବିଜ',
    'header.title': 'ସେଲ୍ଫ ଫିଲ୍ ଫର୍ମ ପୋର୍ଟାଲ୍',
    'header.subtitle': 'ନାଗରିକ ସ୍ମାର୍ଟ ସହାୟକ',
    'header.back': 'ଫେରନ୍ତୁ',
    'menu.wallet': '1. ମୋର ୱାଲେଟ୍',
    'menu.walletBalance': 'ବଳକା ଟଙ୍କା',
    'menu.theme': '2. ଥିମ୍ ମୋଡ୍',
    'menu.requests': '3. ମୋର ଆବେଦନ',
    'menu.requestsSub': 'ଆବେଦନର ସ୍ଥିତି',
    'menu.connect': '4. ସମ୍ପର୍କ କରନ୍ତୁ (Connect)',
    'menu.connectSub': 'ହେଲ୍ପଲାଇନ୍ ଏବଂ ସହାୟତା',
    'menu.language': '5. ଭାଷା (Language)',
    'menu.logout': '6. ଲଗ୍ଆଉଟ୍',
    'active': 'ସକ୍ରିୟ',

    // Home Page
    'home.welcome': 'ସ୍ୱାଗତ',
    'home.searchPlaceholder': 'ସେବା, ସରକାରୀ ଯୋଜନା କିମ୍ବା ଫର୍ମ ଖୋଜନ୍ତୁ...',
    'home.heroTitle': '1-କ୍ଲିକ୍ ସରକାରୀ ଫର୍ମ ଅଟୋ-ଫିଲ୍ ପୋର୍ଟାଲ୍',
    'home.heroSubtitle': 'ଆପଣଙ୍କ ଯାଞ୍ଚ ହୋଇଥିବା ପ୍ରୋଫାଇଲ୍ ବ୍ୟବହାର କରି ବିନା କୌଣସି ଭୁଲରେ ପ୍ରମାଣପତ୍ର, ସ୍କୋଲାରସିପ୍ ଏବଂ ଚାକିରି ପାଇଁ ତୁରନ୍ତ ଆବେଦନ କରନ୍ତୁ।',
    'home.applyBtn': 'ଏବେ ଆବେଦନ କରନ୍ତୁ',
    'home.profileScore': 'ପ୍ରୋଫାଇଲ୍ ସ୍କୋର',
    'home.verifiedDocs': 'ଯାଞ୍ଚ ହୋଇଥିବା ଦସ୍ତାବିଜ',
    'home.activeApps': 'ସକ୍ରିୟ ଆବେଦନ',
    'home.quickActions': 'ତୁରନ୍ତ ସେବା',
    'home.popularServices': 'ଲୋକପ୍ରିୟ ସେବା ଏବଂ ଯୋଜନା',
    'home.fillForm': 'ଫର୍ମ ଅଟୋ-ଫିଲ୍',
    'home.uploadDocs': 'ଦସ୍ତାବିଜ ଅପଲୋଡ୍',
    'home.checkScore': 'ସ୍କୋର ଚେକ୍ କରନ୍ତୁ',

    // Services Page
    'services.all': 'ସମସ୍ତ ସେବା',
    'services.admission': 'ନାମଲେଖା (Admission)',
    'services.admissionSub': 'ସ୍କୁଲ୍ ଏବଂ କଲେଜ ନାମଲେଖା',
    'services.scholarship': 'ସ୍କୋଲାରସିପ୍ (Scholarship)',
    'services.scholarshipSub': 'ବୃତ୍ତି ଏବଂ ସ୍କୋଲାରସିପ୍ ପୋର୍ଟାଲ୍',
    'services.certificates': 'ପ୍ରମାଣପତ୍ର (Certificates)',
    'services.certificatesSub': 'ଆୟ, ଜାତି, ସ୍ଥାୟୀ ବାସସ୍ଥାନ ଏବଂ ଜନ୍ମ',
    'services.jobs': 'ନିଯୁକ୍ତି ଏବଂ ଚାକିରି (Jobs)',
    'services.jobsSub': 'ସରକାରୀ ଏବଂ ବେସରକାରୀ ନିଯୁକ୍ତି',
    'services.resume': 'ବାୟୋଡାଟା (My Resume)',
    'services.resumeSub': 'ଡିଜିଟାଲ୍ ସିଭି ବିଲ୍ଡର',
    'services.autoFillNow': '1-କ୍ଲିକ୍ ଅଟୋ ଫିଲ୍',
    'services.previewForm': 'ଦେଖନ୍ତୁ ଏବଂ ଆବେଦନ କରନ୍ତୁ',

    // Documents Page
    'docs.title': 'ଦସ୍ତାବିଜ ଭଲ୍ଟ ଏବଂ ଯାଞ୍ଚ',
    'docs.subtitle': '1-କ୍ଲିକ୍ ଫର୍ମ ଅଟୋ-ଫିଲିଂ ପାଇଁ ଆପଣଙ୍କ ଆବଶ୍ୟକୀୟ ଦସ୍ତାବିଜକୁ ସୁରକ୍ଷିତ ରଖନ୍ତୁ।',
    'docs.upload': 'ଦସ୍ତାବିଜ ଅପଲୋଡ୍ କରନ୍ତୁ',
    'docs.aadhaar': 'ଆଧାର କାର୍ଡ',
    'docs.pan': 'ପ୍ୟାନ୍ କାର୍ଡ',
    'docs.marksheet': '10ମ/12ଶ ମାର୍କସିଟ୍',
    'docs.caste': 'ଜାତି ପ୍ରମାଣପତ୍ର',
    'docs.income': 'ଆୟ ପ୍ରମାଣପତ୍ର',
    'docs.residence': 'ସ୍ଥାୟୀ ବାସସ୍ଥାନ ପ୍ରମାଣପତ୍ର',
    'docs.photo': 'ପାସପୋର୍ଟ ଫୋଟୋ',
    'docs.sign': 'ଡିଜିଟାଲ୍ ଦସ୍ତଖତ',

    // Profile Page
    'profile.title': 'ନାଗରିକ ପ୍ରୋଫାଇଲ୍ ଏବଂ ବିବରଣୀ',
    'profile.subtitle': 'ତୁରନ୍ତ 1-କ୍ଲିକ୍ ଫର୍ମ ପୂରଣ ପାଇଁ ଆପଣଙ୍କ ଯାଞ୍ଚ ହୋଇଥିବା ବିବରଣୀ ଅପଡେଟ୍ ରଖନ୍ତୁ।',
    'profile.personal': '1. ବ୍ୟକ୍ତିଗତ ବିବରଣୀ',
    'profile.address': '2. ଠିକଣା ବିବରଣୀ',
    'profile.qualification': '3. ଶିକ୍ଷାଗତ ଯୋଗ୍ୟତା',
    'profile.bank': '4. ବ୍ୟାଙ୍କ ଖାତା ବିବରଣୀ',
    'profile.save': 'ପ୍ରୋଫାଇଲ୍ ସଂରକ୍ଷଣ କରନ୍ତୁ',
    'profile.myDocumentsBtn': 'ମୋର ଦସ୍ତାବିଜ (MY DOCUMENTS)',
    'profile.myDocumentsTitle': 'ମୋର ସତ୍ୟାପିତ ଦସ୍ତାବିଜ',
    'profile.myDocumentsSub': 'ଆଧାର, ମନୋନୀତ ଶିକ୍ଷାଗତ ମାର୍କସିଟ୍ ଏବଂ ପ୍ରମାଣପତ୍ର, ଆୟ, ଜାତି ଏବଂ ବାସସ୍ଥାନ',

    // AI Assistant
    'ai.title': '24/7 AI ସ୍ମାର୍ଟ ସହାୟକ',
    'ai.subtitle': 'ଯୋଜନା, ଆବଶ୍ୟକୀୟ ଦସ୍ତାବିଜ ଏବଂ ଫର୍ମ ପୂରଣ ବିଷୟରେ ଓଡ଼ିଆ, ହିନ୍ଦୀ କିମ୍ବା ଇଂରାଜୀରେ ପଚାରନ୍ତୁ।',
    'ai.placeholder': 'AI ସହାୟକଙ୍କୁ ଓଡ଼ିଆ, ହିନ୍ଦୀ କିମ୍ବା ଇଂରାଜୀରେ ପଚାରନ୍ତୁ...',
    'ai.send': 'ପଠାନ୍ତୁ',
    'ai.voice': 'ଭଏସ୍ ଇନପୁଟ୍',
    'ai.chatTitle': 'AI ସହାୟକ ଚାଟ୍',
    'ai.live247': '24/7 ଲାଇଭ୍',
    'ai.tabChat': 'ଚାଟ୍',
    'ai.tabChart': 'ଚାର୍ଟ',
    'ai.resetChat': 'ଚାଟ୍ ରିସେଟ୍ କରନ୍ତୁ',
    'ai.thinking': 'AI ସହାୟକ ଭାବୁଛି...',
    'ai.voiceInput': 'ଭଏସ୍ ଇନପୁଟ୍',
    'ai.listeningPlaceholder': 'ଶୁଣୁଛି... ଏବେ କୁହନ୍ତୁ...',
    'ai.inputPlaceholder': 'AI ସହାୟକଙ୍କୁ ଓଡ଼ିଆରେ ପଚାରନ୍ତୁ (ଯେପରି, ଜାତି ପ୍ରମାଣପତ୍ର କିପରି ତିଆରି କରିବେ?)...',
    'ai.analyticsTitle': 'AI ଆନାଲିଟିକ୍ସ ଏବଂ ଚାର୍ଟ',
    'ai.profileScoreChart': 'ପ୍ରୋଫାଇଲ୍ ସ୍କୋର ଚାର୍ଟ',
    'services.listSubtitle': 'ସେବା ଗୁଡ଼ିକର ତାଲିକା',

    // Modals
    'modal.requestsTitle': 'ମୋର ଆବେଦନ ଏବଂ ଫର୍ମ ସ୍ଥିତି',
    'modal.requestsDesc': 'ଆପଣଙ୍କ ଆବେଦନର ରିଅଲ-ଟାଇମ୍ ସ୍ଥିତି ଦେଖନ୍ତୁ',
    'modal.walletTitle': 'ନାଗରିକ ଡିଜିଟାଲ୍ ୱାଲେଟ୍',
    'modal.walletDesc': 'ସେବା ଫି ପ୍ରଦାନ ପାଇଁ ପୋର୍ଟାଲ୍ ବାଲାନ୍ସ ପରିଚାଳନା କରନ୍ତୁ',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('sff_language') as Language;
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'or')) {
        return saved;
      }
    } catch (e) {
      console.error(e);
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('sff_language', lang);
    } catch (e) {
      console.error(e);
    }
  };

  const t = (key: string, fallback?: string): string => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

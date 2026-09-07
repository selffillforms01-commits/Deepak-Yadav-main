import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';

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
    'menu.language': '5. Language',
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
    'services.listSubtitle': 'List of available services',

    // Modals
    'modal.requestsTitle': 'My Requests & Form Submissions',
    'modal.requestsDesc': 'Track your real-time application status',
    'modal.walletTitle': 'Citizen Digital Wallet',
    'modal.walletDesc': 'Manage portal balance for service processing fees',
  },

  hi: {
    // Nav & Header
    'nav.home': 'होम',
    'nav.services': 'सेवाएँ और फॉर्म',
    'nav.notifications': 'सूचनाएँ',
    'nav.profile': 'मेरी प्रोफ़ाइल',
    'nav.documents': 'मेरे दस्तावेज़',
    'header.title': 'सेल्फ फिल फॉर्म पोर्टल',
    'header.subtitle': 'नागरिक स्मार्ट सहायक',
    'header.back': 'वापस',
    'menu.wallet': '1. मेरा वॉलेट',
    'menu.walletBalance': 'बैलेंस',
    'menu.theme': '2. थीम मोड',
    'menu.requests': '3. मेरे अनुरोध',
    'menu.requestsSub': 'आवेदन की स्थिति',
    'menu.connect': '4. संपर्क / सहायता',
    'menu.connectSub': 'हेल्पलाइन, एडमिन और सहायता',
    'menu.language': '5. भाषा',
    'menu.logout': '6. लॉगआउट',
    'active': 'सक्रिय',

    // Home Page
    'home.welcome': 'स्वागत है',
    'home.searchPlaceholder': 'सेवाएँ, सरकारी योजनाएँ या फॉर्म ऑटो-फिल खोजें...',
    'home.heroTitle': '1-क्लिक सरकारी फॉर्म ऑटो-फिल पोर्टल',
    'home.heroSubtitle': 'सत्यापित व्यक्तिगत जानकारी का उपयोग करके बिना टाइपिंग की गलतियों के प्रमाणपत्र, छात्रवृत्ति, प्रवेश और नौकरी के लिए आवेदन करें।',
    'home.applyBtn': 'अभी आवेदन करें',
    'home.profileScore': 'प्रोफ़ाइल स्कोर',
    'home.verifiedDocs': 'सत्यापित दस्तावेज़',
    'home.activeApps': 'सक्रिय आवेदन',
    'home.quickActions': 'त्वरित कार्य',
    'home.popularServices': 'लोकप्रिय सेवाएँ और योजनाएँ',
    'home.fillForm': 'फॉर्म ऑटो-फिल',
    'home.uploadDocs': 'दस्तावेज़ अपलोड करें',
    'home.checkScore': 'स्कोर देखें',

    // Services Page
    'services.all': 'सभी सेवाएँ',
    'services.admission': 'प्रवेश',
    'services.admissionSub': 'स्कूल और कॉलेज प्रवेश',
    'services.scholarship': 'छात्रवृत्ति',
    'services.scholarshipSub': 'छात्रवृत्ति और स्टाइपेंड पोर्टल',
    'services.certificates': 'प्रमाणपत्र',
    'services.certificatesSub': 'आय, जाति, निवास और जन्म प्रमाणपत्र',
    'services.jobs': 'नौकरी और भर्ती',
    'services.jobsSub': 'सरकारी और निजी भर्ती',
    'services.resume': 'मेरा रिज्यूमे',
    'services.resumeSub': 'डिजिटल रिज्यूमे बिल्डर',
    'services.autoFillNow': '1-क्लिक ऑटो फिल',
    'services.previewForm': 'पूर्वावलोकन और आवेदन',

    // Documents Page
    'docs.title': 'मेरा वॉल्ट और सत्यापित दस्तावेज़',
    'docs.subtitle': '1-क्लिक फॉर्म ऑटो-फिल के लिए अपने आवश्यक दस्तावेज़ सुरक्षित रखें और सत्यापित करें।',
    'docs.upload': 'दस्तावेज़ अपलोड करें',
    'docs.aadhaar': 'आधार कार्ड',
    'docs.pan': 'पैन कार्ड',
    'docs.marksheet': 'शैक्षणिक मार्कशीट',
    'docs.caste': 'जाति प्रमाणपत्र',
    'docs.income': 'आय प्रमाणपत्र',
    'docs.residence': 'निवास प्रमाणपत्र',
    'docs.photo': 'पासपोर्ट फोटो',
    'docs.sign': 'डिजिटल हस्ताक्षर',

    // Profile Page
    'profile.title': 'नागरिक प्रोफ़ाइल और प्राथमिकताएँ',
    'profile.subtitle': 'त्वरित 1-क्लिक फॉर्म भरने के लिए अपनी सत्यापित जानकारी अपडेट रखें।',
    'profile.personal': '1. व्यक्तिगत जानकारी',
    'profile.address': '2. पता जानकारी',
    'profile.qualification': '3. शैक्षणिक योग्यता',
    'profile.bank': '4. बैंक खाता विवरण',
    'profile.save': 'प्रोफ़ाइल परिवर्तन सहेजें',
    'profile.myDocumentsBtn': 'मेरे दस्तावेज़',
    'profile.myDocumentsTitle': 'मेरे सत्यापित दस्तावेज़',
    'profile.myDocumentsSub': 'आधार, चयनित शैक्षणिक मार्कशीट और प्रमाणपत्र, आय, जाति और निवास',
    'services.listSubtitle': 'उपलब्ध सेवाओं की सूची',

    // Modals
    'modal.requestsTitle': 'मेरे अनुरोध और फॉर्म सबमिशन',
    'modal.requestsDesc': 'अपने आवेदन की वास्तविक समय स्थिति देखें',
    'modal.walletTitle': 'नागरिक डिजिटल वॉलेट',
    'modal.walletDesc': 'सेवा प्रसंस्करण शुल्क के लिए पोर्टल बैलेंस प्रबंधित करें',
  },

  or: {
    // Nav & Header
    'nav.home': 'ହୋମ୍',
    'nav.services': 'ସେବା ଓ ଫର୍ମ',
    'nav.notifications': 'ବିଜ୍ଞପ୍ତି',
    'nav.profile': 'ମୋ ପ୍ରୋଫାଇଲ୍',
    'nav.documents': 'ମୋ ଦଲିଲ',
    'header.title': 'ସେଲ୍ଫ ଫିଲ୍ ଫର୍ମ ପୋର୍ଟାଲ୍',
    'header.subtitle': 'ନାଗରିକ ସ୍ମାର୍ଟ ସହାୟକ',
    'header.back': 'ପଛକୁ',
    'menu.wallet': '1. ମୋ ୱାଲେଟ୍',
    'menu.walletBalance': 'ବାଲାନ୍ସ',
    'menu.theme': '2. ଥିମ୍ ମୋଡ୍',
    'menu.requests': '3. ମୋ ଅନୁରୋଧ',
    'menu.requestsSub': 'ଆବେଦନର ସ୍ଥିତି',
    'menu.connect': '4. ସଂଯୋଗ / ସହାୟତା',
    'menu.connectSub': 'ହେଲ୍ପଲାଇନ୍, ଆଡମିନ୍ ଓ ସହାୟତା',
    'menu.language': '5. ଭାଷା',
    'menu.logout': '6. ଲଗଆଉଟ୍',
    'active': 'ସକ୍ରିୟ',

    // Home Page
    'home.welcome': 'ସ୍ୱାଗତ',
    'home.searchPlaceholder': 'ସେବା, ସରକାରୀ ଯୋଜନା କିମ୍ବା ଫର୍ମ ଅଟୋ-ଫିଲ୍ ଖୋଜନ୍ତୁ...',
    'home.heroTitle': '1-କ୍ଲିକ୍ ସରକାରୀ ଫର୍ମ ଅଟୋ-ଫିଲ୍ ପୋର୍ଟାଲ୍',
    'home.heroSubtitle': 'ସତ୍ୟାପିତ ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ ବ୍ୟବହାର କରି ଟାଇପିଂ ତ୍ରୁଟି ବିନା ପ୍ରମାଣପତ୍ର, ଛାତ୍ରବୃତ୍ତି, ନାମଲେଖା ଓ ଚାକିରି ପାଇଁ ଆବେଦନ କରନ୍ତୁ।',
    'home.applyBtn': 'ବର୍ତ୍ତମାନ ଆବେଦନ କରନ୍ତୁ',
    'home.profileScore': 'ପ୍ରୋଫାଇଲ୍ ସ୍କୋର୍',
    'home.verifiedDocs': 'ସତ୍ୟାପିତ ଦଲିଲ',
    'home.activeApps': 'ସକ୍ରିୟ ଆବେଦନ',
    'home.quickActions': 'ତ୍ୱରିତ କାର୍ଯ୍ୟ',
    'home.popularServices': 'ଲୋକପ୍ରିୟ ସେବା ଓ ଯୋଜନା',
    'home.fillForm': 'ଫର୍ମ ଅଟୋ-ଫିଲ୍',
    'home.uploadDocs': 'ଦଲିଲ ଅପଲୋଡ୍ କରନ୍ତୁ',
    'home.checkScore': 'ସ୍କୋର୍ ଦେଖନ୍ତୁ',

    // Services Page
    'services.all': 'ସମସ୍ତ ସେବା',
    'services.admission': 'ନାମଲେଖା',
    'services.admissionSub': 'ସ୍କୁଲ୍ ଓ କଲେଜ୍ ନାମଲେଖା',
    'services.scholarship': 'ଛାତ୍ରବୃତ୍ତି',
    'services.scholarshipSub': 'ଛାତ୍ରବୃତ୍ତି ଓ ଷ୍ଟାଇପେଣ୍ଡ ପୋର୍ଟାଲ୍',
    'services.certificates': 'ପ୍ରମାଣପତ୍ର',
    'services.certificatesSub': 'ଆୟ, ଜାତି, ବାସସ୍ଥାନ ଓ ଜନ୍ମ ପ୍ରମାଣପତ୍ର',
    'services.jobs': 'ଚାକିରି ଓ ନିଯୁକ୍ତି',
    'services.jobsSub': 'ସରକାରୀ ଓ ବେସରକାରୀ ନିଯୁକ୍ତି',
    'services.resume': 'ମୋ ରିଜ୍ୟୁମ୍',
    'services.resumeSub': 'ଡିଜିଟାଲ୍ ରିଜ୍ୟୁମ୍ ବିଲ୍ଡର୍',
    'services.autoFillNow': '1-କ୍ଲିକ୍ ଅଟୋ ଫିଲ୍',
    'services.previewForm': 'ପୂର୍ବାବଲୋକନ ଓ ଆବେଦନ',

    // Documents Page
    'docs.title': 'ମୋ ଭଲ୍ଟ୍ ଓ ସତ୍ୟାପିତ ଦଲିଲ',
    'docs.subtitle': '1-କ୍ଲିକ୍ ଫର୍ମ ଅଟୋ-ଫିଲ୍ ପାଇଁ ଆବଶ୍ୟକ ଦଲିଲ ସଂରକ୍ଷଣ ଓ ସତ୍ୟାପିତ କରନ୍ତୁ।',
    'docs.upload': 'ଦଲିଲ ଅପଲୋଡ୍ କରନ୍ତୁ',
    'docs.aadhaar': 'ଆଧାର କାର୍ଡ',
    'docs.pan': 'ପାନ୍ କାର୍ଡ',
    'docs.marksheet': 'ଶିକ୍ଷାଗତ ମାର୍କସିଟ୍',
    'docs.caste': 'ଜାତି ପ୍ରମାଣପତ୍ର',
    'docs.income': 'ଆୟ ପ୍ରମାଣପତ୍ର',
    'docs.residence': 'ବାସସ୍ଥାନ ପ୍ରମାଣପତ୍ର',
    'docs.photo': 'ପାସପୋର୍ଟ ଫଟୋ',
    'docs.sign': 'ଡିଜିଟାଲ୍ ସ୍ୱାକ୍ଷର',

    // Profile Page
    'profile.title': 'ନାଗରିକ ପ୍ରୋଫାଇଲ୍ ଓ ପସନ୍ଦ',
    'profile.subtitle': 'ତୁରନ୍ତ 1-କ୍ଲିକ୍ ଫର୍ମ ପୂରଣ ପାଇଁ ଆପଣଙ୍କ ସତ୍ୟାପିତ ତଥ୍ୟ ଅପଡେଟ୍ ରଖନ୍ତୁ।',
    'profile.personal': '1. ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ',
    'profile.address': '2. ଠିକଣା ତଥ୍ୟ',
    'profile.qualification': '3. ଶିକ୍ଷାଗତ ଯୋଗ୍ୟତା',
    'profile.bank': '4. ବ୍ୟାଙ୍କ ଖାତା ବିବରଣୀ',
    'profile.save': 'ପ୍ରୋଫାଇଲ୍ ପରିବର୍ତ୍ତନ ସଞ୍ଚୟ କରନ୍ତୁ',
    'profile.myDocumentsBtn': 'ମୋ ଦଲିଲ',
    'profile.myDocumentsTitle': 'ମୋ ସତ୍ୟାପିତ ଦଲିଲ',
    'profile.myDocumentsSub': 'ଆଧାର, ଚୟନିତ ଶିକ୍ଷାଗତ ମାର୍କସିଟ୍ ଓ ପ୍ରମାଣପତ୍ର, ଆୟ, ଜାତି ଓ ବାସସ୍ଥାନ',
    'services.listSubtitle': 'ଉପଲବ୍ଧ ସେବାର ତାଲିକା',

    // Modals
    'modal.requestsTitle': 'ମୋ ଅନୁରୋଧ ଓ ଫର୍ମ ସବମିସନ୍',
    'modal.requestsDesc': 'ଆପଣଙ୍କ ଆବେଦନର ବାସ୍ତବ ସମୟ ସ୍ଥିତି ଦେଖନ୍ତୁ',
    'modal.walletTitle': 'ନାଗରିକ ଡିଜିଟାଲ୍ ୱାଲେଟ୍',
    'modal.walletDesc': 'ସେବା ପ୍ରକ୍ରିୟାକରଣ ଶୁଳ୍କ ପାଇଁ ପୋର୍ଟାଲ୍ ବାଲାନ୍ସ ପରିଚାଳନା କରନ୍ତୁ',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getCurrentUserKey = (): string => {
    try {
      const firebaseUid = auth.currentUser?.uid;

      if (firebaseUid) {
        return firebaseUid;
      }

      const storedUser = localStorage.getItem('sff_user');

      if (storedUser) {
        const user = JSON.parse(storedUser);

        const key =
          user?.uid ||
          user?.firebaseUid ||
          user?.sffUserId ||
          user?.userId ||
          user?.email ||
          user?.mobile;

        if (key) {
          return String(key);
        }
      }
    } catch (e) {
      console.error('Unable to determine current user for language:', e);
    }

    return '';
  };

  const getLanguageStorageKey = (userKey: string): string => {
    return userKey
      ? `sff_language_${userKey.replace(/[^a-zA-Z0-9_.-]/g, '_').toLowerCase()}`
      : 'sff_language_guest';
  };

  const getSavedLanguage = (userKey: string): Language => {
    try {
      const key = getLanguageStorageKey(userKey);
      const saved = localStorage.getItem(key) as Language;

      if (saved === 'en' || saved === 'hi' || saved === 'or') {
        return saved;
      }
    } catch (e) {
      console.error('Unable to load user language:', e);
    }

    return 'en';
  };

  const [userKey, setUserKey] = useState<string>(() => getCurrentUserKey());

  const [language, setLanguageState] = useState<Language>(() => {
    return getSavedLanguage(getCurrentUserKey());
  });

  useEffect(() => {
    const checkUser = () => {
      const currentKey = getCurrentUserKey();

      if (currentKey !== userKey) {
        setUserKey(currentKey);
        setLanguageState(getSavedLanguage(currentKey));
      }
    };

    checkUser();

    const interval = window.setInterval(checkUser, 500);

    return () => {
      window.clearInterval(interval);
    };
  }, [userKey]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);

    try {
      const currentKey = getCurrentUserKey();
      const storageKey = getLanguageStorageKey(currentKey);

      localStorage.setItem(storageKey, lang);
    } catch (e) {
      console.error('Unable to save user language:', e);
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

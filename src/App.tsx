import React, { useState, useEffect } from 'react';
import { BackgroundCurves } from './components/BackgroundCurves';
import { LoginPage } from './components/LoginPage';
import { AdminLoginPlaceholder } from './components/AdminLoginPlaceholder';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { MaintenanceDashboard } from './components/maintenance/MaintenanceDashboard';
import { PortalRoute, DashboardTab, UserProfile } from './types';
import { AdminUserRecord } from './components/admin/AdminTypes';
import { LanguageProvider } from './context/LanguageContext';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  getUserProfileFromFirestore,
  saveUserProfileToFirestore,
  subscribeToUserProfile,
  logoutFirebaseUser,
  getUserDocumentsFromFirestore
} from './lib/firestoreService';
import { adminStore } from './components/admin/adminStore';
import { SplashScreen } from './components/SplashScreen';

import { mapAdminUserToUserProfile } from './utils/profileChecker';

export default function App() {
  const initialSettings = adminStore.getSettings();
  const [showSplash, setShowSplash] = useState<boolean>(() => initialSettings.splashEnabled ?? true);
  const [splashConfig, setSplashConfig] = useState({
    imageUrl: initialSettings.splashImageUrl || '/sff-logo.svg',
    durationSeconds: initialSettings.splashDurationSeconds ?? 3,
  });

  const [currentRoute, setCurrentRoute] = useState<PortalRoute>('citizen-login');
  const [currentTab, setCurrentTab] = useState<DashboardTab>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>(() => initialSettings.appLogoUrl || '/sff-logo.svg');
  const [maintenanceUserName, setMaintenanceUserName] = useState<string>('Maintenance Staff');

  // Sync settings from adminStore
  useEffect(() => {
    const handleStoreChange = () => {
      const s = adminStore.getSettings();
      if (s.appLogoUrl) {
        setLogoUrl(s.appLogoUrl);
      }
      setSplashConfig({
        imageUrl: s.splashImageUrl || '/sff-logo.svg',
        durationSeconds: s.splashDurationSeconds ?? 3,
      });
    };
    handleStoreChange();
    const unsubscribe = adminStore.subscribe(handleStoreChange);
    return () => unsubscribe();
  }, []);

  const [user, setUser] = useState<UserProfile>({
    name: '',
    email: '',
    mobile: '',
    aadhaarLast4: '',
    address: '',
    district: '',
    state: '',
    pincode: ''
  });

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setIsLoggedIn(true);
        setCurrentRoute('dashboard');

        const key = fbUser.uid;
        const profile = (await getUserProfileFromFirestore(key)) || (fbUser.email ? await getUserProfileFromFirestore(fbUser.email) : null);

        if (profile) {
          setUser(profile);
        } else {
          const newProfile: UserProfile = {
            name: fbUser.displayName || 'Citizen User',
            email: fbUser.email || '',
            mobile: fbUser.phoneNumber || '',
          };
          setUser(newProfile);
          await saveUserProfileToFirestore(fbUser.uid, newProfile);
        }

        const unsubProfile = subscribeToUserProfile(key, (updated) => {
          if (updated) {
            setUser(updated);
          }
        });

        return () => unsubProfile();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateUser = async (updated: UserProfile) => {
    setUser(updated);
    const currentUser = auth.currentUser;
    const key = currentUser?.uid || updated.email || updated.mobile;
    if (key) {
      await saveUserProfileToFirestore(key, updated);
      if (updated.email) {
        await saveUserProfileToFirestore(updated.email, updated);
      }
    }
  };

  const handleLoginSuccess = async (username: string, registeredProfile?: UserProfile) => {
    if (registeredProfile) {
      setUser(registeredProfile);
      const key = auth.currentUser?.uid || registeredProfile.email || registeredProfile.mobile;
      if (key) {
        await saveUserProfileToFirestore(key, registeredProfile);
      }
    } else if (username) {
      const key = auth.currentUser?.uid || username.trim().toLowerCase();
      const loaded = await getUserProfileFromFirestore(key);
      if (loaded) {
        setUser(loaded);
      } else {
        const fallbackProfile: UserProfile = {
          email: username.includes('@') ? username : `${username}@citizen.selffillforms.app`,
          name: username.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Citizen User',
          mobile: !username.includes('@') ? username : '',
        };
        setUser(fallbackProfile);
        await saveUserProfileToFirestore(key, fallbackProfile);
      }
    }
    setIsLoggedIn(true);
    setCurrentRoute('dashboard');
    setCurrentTab('home');
  };

  const handleLogout = async () => {
    await logoutFirebaseUser();
    setIsLoggedIn(false);
    setIsImpersonating(false);
    setCurrentRoute('citizen-login');
    setCurrentTab('home');
  };

  const handleImpersonateUser = async (uRecord: AdminUserRecord) => {
    // Look up profile in Firestore using all possible candidate keys
    const keysToTry = [
      uRecord.email,
      uRecord.mobile,
      uRecord.sffUserId,
      uRecord.id,
    ].filter(Boolean) as string[];

    let profile: UserProfile | null = null;
    for (const key of keysToTry) {
      profile = await getUserProfileFromFirestore(key);
      if (profile) break;
    }

    if (!profile) {
      profile = mapAdminUserToUserProfile(uRecord);
    }

    // Merge media URLs if present on uRecord but missing on profile
    if (!profile.photoUrl && uRecord.photoUrl) profile.photoUrl = uRecord.photoUrl;
    if (!profile.signatureUrl && uRecord.signatureUrl) profile.signatureUrl = uRecord.signatureUrl;
    if (!profile.thumbImpressionUrl && uRecord.thumbImpressionUrl) profile.thumbImpressionUrl = uRecord.thumbImpressionUrl;

    // Load user documents from Firestore
    const docKeysToTry = [
      profile.email,
      profile.mobile,
      profile.sffUserId,
      profile.uid,
      uRecord.id,
    ].filter(Boolean) as string[];

    let userDocs: any[] = [];
    for (const dKey of docKeysToTry) {
      const fetched = await getUserDocumentsFromFirestore(dKey);
      if (fetched && fetched.length > 0) {
        userDocs = fetched;
        break;
      }
    }

    // Cache in localStorage so components like DocumentsPage and ProfilePage display everything immediately
    const primaryKey = profile.email || profile.mobile || profile.sffUserId || uRecord.id;
    const safeKey = primaryKey.replace(/[^a-zA-Z0-9_.-]/g, '_').toLowerCase();
    try {
      localStorage.setItem(`sff_user_profile_${safeKey}`, JSON.stringify(profile));
      localStorage.setItem('sff_current_user_profile', JSON.stringify(profile));
      if (userDocs.length > 0) {
        localStorage.setItem(`sff_user_documents_${safeKey}`, JSON.stringify(userDocs));
        localStorage.setItem('sff_user_documents', JSON.stringify(userDocs));
      }
    } catch (e) {
      console.warn('LocalStorage impersonation cache warning:', e);
    }

    setUser(profile);
    setIsImpersonating(true);
    setIsLoggedIn(true);
    setCurrentRoute('dashboard');
    setCurrentTab('profile');
  };

  const handleReturnToAdmin = () => {
    setIsImpersonating(false);
    setCurrentRoute('admin-dashboard');
  };

  return (
    <LanguageProvider>
      <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-[#0B3B8C] selection:text-white">
        {/* Background abstract curves & light blue gradient for non-dashboard views */}
        {!isLoggedIn && currentRoute !== 'admin-dashboard' && <BackgroundCurves />}

        {/* Splash Screen on App Start */}
        {showSplash && (
          <SplashScreen
            imageUrl={splashConfig.imageUrl}
            durationSeconds={splashConfig.durationSeconds}
            onComplete={() => setShowSplash(false)}
          />
        )}

        {/* Dynamic View Routing */}
        {currentRoute === 'maintenance-dashboard' ? (
          <MaintenanceDashboard
            userName={maintenanceUserName}
            onLogout={handleLogout}
            logoUrl={logoUrl}
          />
        ) : currentRoute === 'admin-dashboard' ? (
          <AdminLayout
            onLogout={handleLogout}
            logoUrl={logoUrl}
            onLogoChange={(newUrl) => setLogoUrl(newUrl)}
            onImpersonateUser={handleImpersonateUser}
          />
        ) : isLoggedIn && currentRoute === 'dashboard' ? (
          <DashboardLayout
            user={user}
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
            logoUrl={logoUrl}
            isImpersonating={isImpersonating}
            onReturnToAdmin={handleReturnToAdmin}
          />
        ) : currentRoute === 'citizen-login' ? (
          <LoginPage
            onNavigate={(route) => setCurrentRoute(route)}
            onLoginSuccess={handleLoginSuccess}
            logoUrl={logoUrl}
            onLogoChange={(newUrl) => setLogoUrl(newUrl)}
          />
        ) : (
          <AdminLoginPlaceholder
            route={currentRoute as 'admin-login' | 'maintenance-login'}
            onBack={() => setCurrentRoute('citizen-login')}
            onEnterAdmin={() => setCurrentRoute('admin-dashboard')}
            onEnterMaintenance={(mName) => {
              if (mName) setMaintenanceUserName(mName);
              setCurrentRoute('maintenance-dashboard');
            }}
            logoUrl={logoUrl}
          />
        )}
      </div>
    </LanguageProvider>
  );
}



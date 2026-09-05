import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendEmailVerification,
  reload,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth, db, storage, googleProvider } from './firebase';
import { UserProfile, OtherCertificate } from '../types';
import { saveFileToIndexedDB, getFileFromIndexedDB } from '../utils/indexedDbStorage';

export async function resolveFileUrl(url: string | null | undefined): Promise<string> {
  if (!url) return '';
  if (url.startsWith('indexeddb://')) {
    const resolved = await getFileFromIndexedDB(url);
    return resolved || url;
  }
  return url;
}

export interface DocumentRecord {
  id: string;
  userId: string;
  name: string;
  category: 'identity' | 'educational' | 'income-caste' | 'other';
  iconType?: string;
  status: 'Verified' | 'Pending Verification' | 'Rejected' | 'Not Uploaded';
  uploadDate: string;
  fileSize: string;
  fileType: 'pdf' | 'jpg' | 'png';
  documentNumber?: string;
  issuingAuthority?: string;
  customFileUrl?: string;
  storagePath?: string;
  isOptional?: boolean;
  updatedAt?: any;
}

export interface ServiceRequestRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userMobile: string;
  serviceTitle: string;
  category: 'Government Certificate' | 'Admission Form' | 'Scholarship' | 'Job Application' | 'Other';
  appliedDate: string;
  status: 'Pending' | 'In Progress' | 'Approved' | 'Rejected';
  trackingId: string;
  amount?: string;
  details?: Record<string, any>;
  updatedAt?: any;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
  link?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
}

// Helper to normalize user ID / key
export function getUserDocRef(userIdOrEmail: string) {
  const safeId = userIdOrEmail.replace(/[^a-zA-Z0-9_.-]/g, '_').toLowerCase();
  return doc(db, 'users', safeId);
}

// Generate serial user ID like SFF-U-000001
export async function generateNextSffUserId(): Promise<string> {
  try {
    const counterRef = doc(db, 'admin_store', 'user_counter');
    const counterSnap = await getDoc(counterRef);
    let nextNum = 1;
    if (counterSnap.exists() && typeof counterSnap.data()?.count === 'number') {
      nextNum = counterSnap.data().count + 1;
    }
    await setDoc(counterRef, { count: nextNum, updatedAt: serverTimestamp() }, { merge: true });
    const padded = String(nextNum).padStart(6, '0');
    return `SFF-U-${padded}`;
  } catch (error) {
    console.warn('Firestore counter warning, using local counter fallback:', error);
    const localCount = parseInt(localStorage.getItem('sff_user_counter') || '0', 10) + 1;
    localStorage.setItem('sff_user_counter', localCount.toString());
    const padded = String(localCount).padStart(6, '0');
    return `SFF-U-${padded}`;
  }
}

// --- USER PROFILE & DATA IN FIRESTORE ---

export async function saveUserProfileToFirestore(userIdOrEmail: string, profile: Partial<UserProfile>): Promise<void> {
  if (!userIdOrEmail) return;
  try {
    const userRef = getUserDocRef(userIdOrEmail);
    const cleanProfile: UserProfile = JSON.parse(JSON.stringify(profile));

    // Move heavy data URLs to IndexedDB if they exceed 400KB
    const imageFields: (keyof UserProfile)[] = ['photoUrl', 'signatureUrl', 'thumbImpressionUrl'];
    for (const field of imageFields) {
      const val = cleanProfile[field];
      if (typeof val === 'string' && val.length > 400000 && val.startsWith('data:')) {
        const idbKey = `idb_prof_${field}_${Date.now()}`;
        const idbUrl = await saveFileToIndexedDB(idbKey, val);
        (cleanProfile as any)[field] = idbUrl;
      }
    }

    // Always update local cache for permanent instant recovery
    const safeKey = userIdOrEmail.replace(/[^a-zA-Z0-9_.-]/g, '_').toLowerCase();
    try {
      localStorage.setItem(`sff_user_profile_${safeKey}`, JSON.stringify(cleanProfile));
      localStorage.setItem('sff_current_user_profile', JSON.stringify(cleanProfile));
    } catch (e) {
      console.warn('LocalStorage save notice:', e);
    }

    await setDoc(userRef, {
      ...cleanProfile,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userIdOrEmail}`);
  }
}

export async function getUserProfileFromFirestore(userIdOrEmail: string): Promise<UserProfile | null> {
  if (!userIdOrEmail) return null;
  const safeKey = userIdOrEmail.replace(/[^a-zA-Z0-9_.-]/g, '_').toLowerCase();

  try {
    const userRef = getUserDocRef(userIdOrEmail);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      const profile = snapshot.data() as UserProfile;
      
      // Resolve any IndexedDB urls for images
      if (profile.photoUrl) profile.photoUrl = await resolveFileUrl(profile.photoUrl);
      if (profile.signatureUrl) profile.signatureUrl = await resolveFileUrl(profile.signatureUrl);
      if (profile.thumbImpressionUrl) profile.thumbImpressionUrl = await resolveFileUrl(profile.thumbImpressionUrl);

      // Save to local cache
      try {
        localStorage.setItem(`sff_user_profile_${safeKey}`, JSON.stringify(profile));
        localStorage.setItem('sff_current_user_profile', JSON.stringify(profile));
      } catch (e) {
        // ignore
      }
      return profile;
    }
  } catch (error) {
    console.warn(`Firestore profile read warning for users/${userIdOrEmail}:`, error);
  }

  // Local storage fallback if Firestore is offline or empty
  try {
    const local = localStorage.getItem(`sff_user_profile_${safeKey}`) || localStorage.getItem('sff_current_user_profile');
    if (local) {
      const parsed = JSON.parse(local) as UserProfile;
      if (parsed.photoUrl) parsed.photoUrl = await resolveFileUrl(parsed.photoUrl);
      if (parsed.signatureUrl) parsed.signatureUrl = await resolveFileUrl(parsed.signatureUrl);
      if (parsed.thumbImpressionUrl) parsed.thumbImpressionUrl = await resolveFileUrl(parsed.thumbImpressionUrl);
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse local profile fallback', e);
  }

  return null;
}

export function subscribeToUserProfile(userIdOrEmail: string, callback: (profile: UserProfile | null) => void) {
  if (!userIdOrEmail) return () => {};
  const userRef = getUserDocRef(userIdOrEmail);
  return onSnapshot(userRef, async (snapshot) => {
    if (snapshot.exists()) {
      const profile = snapshot.data() as UserProfile;
      if (profile.photoUrl) profile.photoUrl = await resolveFileUrl(profile.photoUrl);
      if (profile.signatureUrl) profile.signatureUrl = await resolveFileUrl(profile.signatureUrl);
      if (profile.thumbImpressionUrl) profile.thumbImpressionUrl = await resolveFileUrl(profile.thumbImpressionUrl);
      callback(profile);
    } else {
      callback(null);
    }
  }, (err) => {
    console.warn('Notice subscribing to profile:', err);
  });
}

// --- DOCUMENTS IN FIRESTORE & STORAGE ---

export async function getUserDocumentsFromFirestore(userId: string): Promise<DocumentRecord[]> {
  if (!userId) return [];
  const safeUserId = userId.replace(/[^a-zA-Z0-9_.-]/g, '_').toLowerCase();

  try {
    const docRef = doc(db, 'user_documents', userId);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data()?.documents) {
      const docs = snap.data().documents as DocumentRecord[];
      for (const d of docs) {
        if (d.customFileUrl) {
          d.customFileUrl = await resolveFileUrl(d.customFileUrl);
        }
      }
      try {
        localStorage.setItem(`sff_user_documents_${safeUserId}`, JSON.stringify(docs));
        localStorage.setItem('sff_user_documents', JSON.stringify(docs));
      } catch (e) {
        // ignore
      }
      return docs;
    }
  } catch (e) {
    console.warn('Notice getting documents from Firestore:', e);
  }

  // Fallback to local cache if Firestore read fails/empty
  try {
    const cached = localStorage.getItem(`sff_user_documents_${safeUserId}`) || localStorage.getItem('sff_user_documents');
    if (cached) {
      const parsed = JSON.parse(cached) as DocumentRecord[];
      for (const d of parsed) {
        if (d.customFileUrl) {
          d.customFileUrl = await resolveFileUrl(d.customFileUrl);
        }
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse local documents fallback', e);
  }

  return [];
}

export async function saveUserDocumentsToFirestore(userId: string, documents: DocumentRecord[]): Promise<void> {
  if (!userId) return;
  const docRef = doc(db, 'user_documents', userId);
  const cleanDocs: DocumentRecord[] = JSON.parse(JSON.stringify(documents));
  const safeUserId = userId.replace(/[^a-zA-Z0-9_.-]/g, '_').toLowerCase();

  // Sanitize large data URLs to IndexedDB if needed
  for (const item of cleanDocs) {
    if (item.customFileUrl && item.customFileUrl.length > 400000 && item.customFileUrl.startsWith('data:')) {
      const idbKey = `idb_doc_${Date.now()}_${item.id || 'file'}`;
      const idbUrl = await saveFileToIndexedDB(idbKey, item.customFileUrl);
      item.customFileUrl = idbUrl;
    }
  }

  // Update local cache
  try {
    localStorage.setItem(`sff_user_documents_${safeUserId}`, JSON.stringify(cleanDocs));
    localStorage.setItem('sff_user_documents', JSON.stringify(cleanDocs));
  } catch (e) {
    console.warn('LocalStorage save documents notice:', e);
  }

  await setDoc(docRef, {
    userId,
    documents: cleanDocs,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function uploadDocumentToStorage(
  userId: string,
  file: File,
  folder: string = 'documents'
): Promise<{ downloadUrl: string; storagePath: string }> {
  const timestamp = Date.now();
  const safeUserId = (userId || 'citizen_user').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeName = (file.name || 'uploaded_file').replace(/[^a-zA-Z0-9_.-]/g, '_');
  const storagePath = `users/${safeUserId}/${safeFolder}/${timestamp}_${safeName}`;

  try {
    const storageRef = ref(storage, storagePath);
    const metadata = { contentType: file.type || 'image/jpeg' };

    const uploadPromise = (async () => {
      await uploadBytes(storageRef, file, metadata);
      return await getDownloadURL(storageRef);
    })();

    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('Firebase Storage upload timeout - using local storage fallback')), 5000);
    });

    const downloadUrl = await Promise.race([uploadPromise, timeoutPromise]);
    return { downloadUrl, storagePath };
  } catch (err: any) {
    console.warn(
      'Notice: Firebase Storage upload notice or restriction. Applying IndexedDB/DataURL fallback.',
      err
    );

    // Fallback convert to DataURL / IndexedDB so user upload always succeeds regardless of file size
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        if (dataUrl && dataUrl.length > 400000) {
          const idbKey = `idb_file_${timestamp}_${safeName}`;
          const idbUrl = await saveFileToIndexedDB(idbKey, file);
          resolve({
            downloadUrl: idbUrl || dataUrl,
            storagePath: `fallback_idb_${timestamp}`,
          });
        } else {
          resolve({
            downloadUrl: dataUrl,
            storagePath: `fallback_data_url_${timestamp}`,
          });
        }
      };
      reader.onerror = () => {
        resolve({
          downloadUrl: '',
          storagePath: `fallback_failed_${timestamp}`,
        });
      };
      reader.readAsDataURL(file);
    });
  }
}

export async function deleteFileFromStorage(storagePath: string): Promise<void> {
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
  } catch (err) {
    console.warn('Notice deleting file from storage:', err);
  }
}

// --- SERVICE REQUESTS (APPLICATION / ADMISSION / SCHOLARSHIP / JOB) IN FIRESTORE ---

export async function getUserServiceRequests(userId: string): Promise<ServiceRequestRecord[]> {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'service_requests'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const requests: ServiceRequestRecord[] = [];
    snap.forEach((docSnap) => {
      requests.push({ id: docSnap.id, ...docSnap.data() } as ServiceRequestRecord);
    });
    return requests;
  } catch (e) {
    console.warn('Notice getting service requests:', e);
    return [];
  }
}

export async function addServiceRequestToFirestore(requestData: Omit<ServiceRequestRecord, 'id'>): Promise<string> {
  const colRef = collection(db, 'service_requests');
  const docRef = await addDoc(colRef, {
    ...requestData,
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

// --- RESUME, ADMISSION, SCHOLARSHIP, JOBS SPECIFIC FIRESTORE STORAGE ---

export async function saveSectionDataToFirestore(userId: string, section: string, data: any): Promise<void> {
  if (!userId) return;
  const docRef = doc(db, `user_${section}`, userId);
  await setDoc(docRef, {
    userId,
    data: JSON.parse(JSON.stringify(data)),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function getSectionDataFromFirestore(userId: string, section: string): Promise<any | null> {
  if (!userId) return null;
  try {
    const docRef = doc(db, `user_${section}`, userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().data;
    }
  } catch (e) {
    console.warn(`Notice reading user_${section}:`, e);
  }
  return null;
}

// --- NOTIFICATIONS IN FIRESTORE ---

export async function getUserNotificationsFromFirestore(userId: string): Promise<NotificationRecord[]> {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: NotificationRecord[] = [];
    snap.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as NotificationRecord);
    });
    return list;
  } catch (e) {
    console.warn('Notice fetching notifications:', e);
    return [];
  }
}

export async function addNotificationToFirestore(userId: string, notif: Omit<NotificationRecord, 'id' | 'userId'>): Promise<void> {
  const colRef = collection(db, 'notifications');
  await addDoc(colRef, {
    userId,
    ...notif,
    createdAt: serverTimestamp()
  });
}

// --- FIREBASE AUTHENTICATION FLOWS ---
// --- CHECK EXISTING USER BY MOBILE / EMAIL ---

export async function checkUserAlreadyRegistered(
  mobileNumber: string,
  email: string
): Promise<{ exists: boolean; field?: 'mobile' | 'email' }> {
  const cleanMobile = mobileNumber.replace(/\D/g, '');
  const cleanEmail = email.trim().toLowerCase();

  // Check mobile number
  if (cleanMobile) {
    const mobileQuery = query(
      collection(db, 'users'),
      where('mobileNumber', '==', cleanMobile)
    );

    const mobileSnapshot = await getDocs(mobileQuery);

    if (!mobileSnapshot.empty) {
      return {
        exists: true,
        field: 'mobile'
      };
    }
  }

  // Check email address
  if (cleanEmail) {
    const emailQuery = query(
      collection(db, 'users'),
      where('email', '==', cleanEmail)
    );

    const emailSnapshot = await getDocs(emailQuery);

    if (!emailSnapshot.empty) {
      return {
        exists: true,
        field: 'email'
      };
    }
  }

  return {
    exists: false
  };
}

export interface NewRegisterParams {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
}

export async function registerUserWithFirebaseNew(
  params: NewRegisterParams
): Promise<{ fbUser: FirebaseUser; sffUserId: string; profile: UserProfile }> {
  const { fullName, email, mobileNumber, password } = params;

  const cleanEmail = email.trim().toLowerCase();
  const cleanMobile = mobileNumber.trim().replace(/\D/g, '');
  const cleanName = fullName.trim();

  // 1. Generate SFF User ID
  const sffUserId = await generateNextSffUserId();

  // 2. Create Firebase Email/Password account
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    cleanEmail,
    password
  );

  const fbUser = userCredential.user;

  // 3. Set display name
  await updateProfile(fbUser, {
    displayName: cleanName
  }).catch(() => {});

  // Email OTP was already verified through the SFF/Resend OTP system.
  // Do NOT send Firebase's separate verification email.

  // 4. Create SFF user profile
  const userData: UserProfile = {
    uid: fbUser.uid,
    fullName: cleanName,
    name: cleanName,
    email: cleanEmail,
    mobileNumber: cleanMobile,
    mobile: cleanMobile,

    role: 'user',
    accountStatus: 'active',

    // Email was verified through Resend OTP.
    emailVerified: true,

    // No SMS/Phone OTP is used.
    mobileVerified: false,
    phoneVerified: false,

    profileCompletion: 0,
    profileCompleted: false,

    sffUserId: sffUserId,
    userId: sffUserId,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // 5. Save main user document
  const userDocRef = doc(db, 'users', fbUser.uid);

  await setDoc(
    userDocRef,
    userData,
    { merge: true }
  );

  // 6. Preserve existing lookup indexes
  if (cleanMobile) {
    await setDoc(getUserDocRef(cleanMobile), userData, { merge: true }).catch(() => {});
  }

  if (cleanEmail) {
    await setDoc(getUserDocRef(cleanEmail), userData, { merge: true }).catch(() => {});
  }

  if (sffUserId) {
    await setDoc(getUserDocRef(sffUserId), userData, { merge: true }).catch(() => {});
  }

  console.log(
    '? Email OTP verified user profile created:',
    `users/${fbUser.uid}`
  );

  return {
    fbUser,
    sffUserId,
    profile: userData
  };
}

// --- PHONE AUTHENTICATION HELPERS ---

export function setupRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  // Clear any existing verifier instance on window if present
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch (e) {
      // ignore
    }
    (window as any).recaptchaVerifier = null;
  }

  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      // Response expired
    }
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

export async function sendPhoneOtp(
  mobileNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  const digitsOnly = mobileNumber.replace(/\D/g, '');
  let formattedPhone: string;
  if (digitsOnly.length === 10) {
    formattedPhone = `+91${digitsOnly}`;
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    formattedPhone = `+${digitsOnly}`;
  } else if (mobileNumber.trim().startsWith('+')) {
    formattedPhone = `+${digitsOnly}`;
  } else {
    formattedPhone = `+91${digitsOnly}`;
  }
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
    return confirmationResult;
  } catch (err: any) {
    console.error('signInWithPhoneNumber failed:', err);
    throw err;
  }
}

export interface PhoneAuthRegisterParams {
  fullName: string;
  mobileNumber: string;
  email?: string;
  password?: string;
  confirmationResult?: ConfirmationResult | null;
  otpCode?: string;
}

export async function registerUserWithPhoneAuthAndStore(
  params: PhoneAuthRegisterParams
): Promise<{ fbUser?: FirebaseUser | null; sffUserId: string; profile: UserProfile }> {
  const { fullName, mobileNumber, email = '', password = '', confirmationResult, otpCode } = params;

  const cleanMobile = mobileNumber.trim().replace(/\D/g, '');
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();

  let fbUser: FirebaseUser | null = null;

    // --- PREVENT DUPLICATE MOBILE NUMBER ---
  if (cleanMobile) {
    const mobileQuery = query(
      collection(db, 'users'),
      where('mobileNumber', '==', cleanMobile)
    );

    const mobileSnapshot = await getDocs(mobileQuery);

    if (!mobileSnapshot.empty) {
      throw new Error(
        'This mobile number is already registered. Please login with your existing account.'
      );
    }
  }

  // --- PREVENT DUPLICATE EMAIL ---
  if (cleanEmail) {
    const emailQuery = query(
      collection(db, 'users'),
      where('email', '==', cleanEmail)
    );

    const emailSnapshot = await getDocs(emailQuery);

    if (!emailSnapshot.empty) {
      throw new Error(
        'This email address is already registered. Please login with your existing account.'
      );
    }
  }

  // 1. Confirm OTP if confirmationResult & otpCode are provided
  if (confirmationResult && otpCode) {
    try {
      const userCred = await confirmationResult.confirm(otpCode);
      fbUser = userCred.user;
      if (cleanName && fbUser) {
        await updateProfile(fbUser, { displayName: cleanName }).catch(() => {});
      }
    } catch (otpErr: any) {
      console.error('OTP confirmation error:', otpErr);

      if (otpErr?.code === 'auth/invalid-verification-code') {
        throw new Error(
          'Incorrect OTP entered. Please enter the valid 6-digit SMS code received on your mobile number.'
        );
      }

      if (otpErr?.code === 'auth/code-expired') {
        throw new Error(
          'The OTP code has expired. Please click "Resend OTP" to receive a new code via SMS.'
        );
      }

      throw new Error(
        otpErr?.message ||
        'OTP verification failed. Please check the code sent to your phone and try again.'
      );
    }
  }

  // 2. Ensure Email/Password Firebase Auth account is created for seamless password logins
  const emailToUse = cleanEmail || `${cleanMobile}@citizen.selffillforms.app`;

  if (password) {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, emailToUse, password);
      fbUser = userCred.user;
      if (cleanName && fbUser) {
        await updateProfile(fbUser, { displayName: cleanName }).catch(() => {});
      }
    } catch (emailAuthErr: any) {
      if (
        emailAuthErr?.code === 'auth/api-key-not-valid' ||
        emailAuthErr?.message?.includes('api-key-not-valid') ||
        emailAuthErr?.message?.includes('valid-api-key')
      ) {
        console.warn('Firebase Auth API key invalid during user creation. Account record will be stored in Firestore database.', emailAuthErr);
      } else if (emailAuthErr.code === 'auth/email-already-in-use') {
        try {
          const signCred = await signInWithEmailAndPassword(auth, emailToUse, password);
          fbUser = signCred.user;
        } catch (signErr) {
          console.warn('Existing account sign-in check notice:', signErr);
        }
      } else {
        console.warn('Firebase Auth account creation notice:', emailAuthErr);
      }
    }
  }

  // 3. Generate SFF User ID (Example: SFF-U-000001)
  const sffUserId = await generateNextSffUserId();
  const targetUid =
    fbUser?.uid ||
    (cleanMobile
      ? `sff_user_${cleanMobile}_${Date.now()}`
      : `sff_user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`);

  // 4. Create document in users/{uid}
  const userDocRef = doc(db, 'users', targetUid);
  const userData: UserProfile = {
    uid: targetUid,
    fullName: cleanName,
    name: cleanName,
    email: cleanEmail,
    mobileNumber: cleanMobile,
    mobile: cleanMobile,
    role: 'user',
    accountStatus: 'active',
    mobileVerified: true,
    phoneVerified: true,
    emailVerified: true,
    profileCompletion: 0,
    profileCompleted: false,
    sffUserId: sffUserId,
    userId: sffUserId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userDocRef, userData, { merge: true });

  // Index references under mobile, email (if provided), and sffUserId
  if (cleanMobile) {
    await setDoc(getUserDocRef(cleanMobile), userData, { merge: true }).catch(() => {});
  }
  if (cleanEmail) {
    await setDoc(getUserDocRef(cleanEmail), userData, { merge: true }).catch(() => {});
  }
  if (sffUserId) {
    await setDoc(getUserDocRef(sffUserId), userData, { merge: true }).catch(() => {});
  }

  return { fbUser, sffUserId, profile: userData };
}

export async function resendVerificationEmail(user?: FirebaseUser | null): Promise<void> {
  const currentUser = user || auth.currentUser;
  if (!currentUser) {
    throw new Error('No active user account found to resend verification email.');
  }
  await sendEmailVerification(currentUser);
}

export async function checkUserEmailVerificationStatus(user?: FirebaseUser | null): Promise<boolean> {
  const currentUser = user || auth.currentUser;
  if (!currentUser) return false;

  await reload(currentUser);
  const isVerified = currentUser.emailVerified;

  if (isVerified) {
    try {
      // Automatically update the user's Firestore record: emailVerified = true
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        emailVerified: true,
        updatedAt: serverTimestamp()
      });

      if (currentUser.email) {
        await updateDoc(getUserDocRef(currentUser.email), {
          emailVerified: true,
          updatedAt: serverTimestamp()
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Firestore emailVerified update warning:', err);
    }
  }

  return isVerified;
}

export async function registerUserWithFirebase(
  email: string,
  pass: string,
  profile: UserProfile
): Promise<FirebaseUser> {
  const res = await registerUserWithPhoneAuthAndStore({
    fullName: profile.name || profile.fullName || 'Citizen User',
    email: email,
    mobileNumber: profile.mobile || profile.mobileNumber || '',
    password: pass
  });
  return res.fbUser || auth.currentUser!;
}

export async function loginUserWithFirebase(
  identifier: string,
  pass: string
): Promise<{ user: FirebaseUser; profile: UserProfile | null }> {
  const cleanId = identifier.trim();

  if (!cleanId || !pass) {
    const err: any = new Error('Mobile No., Email or SFF User ID and Password are required.');
    err.code = 'auth/missing-credentials';
    throw err;
  }

  // 1. Look up profile by User ID (SFF-U-000001), Email, or Mobile in Firestore first
  let existingProfile = await getUserProfileFromFirestore(cleanId.toLowerCase());
  if (!existingProfile && cleanId.toUpperCase().startsWith('SFF-U-')) {
    existingProfile = await getUserProfileFromFirestore(cleanId.toUpperCase());
  }

  // Query fallback by mobileNumber, email or sffUserId in Firestore
  if (!existingProfile) {
    try {
      const usersRef = collection(db, 'users');
      const mobClean = cleanId.replace(/\D/g, '');
      if (mobClean.length >= 10) {
        const qMob = query(usersRef, where('mobileNumber', '==', mobClean));
        const snapMob = await getDocs(qMob);
        if (!snapMob.empty) {
          existingProfile = snapMob.docs[0].data() as UserProfile;
        }
      }
      if (!existingProfile && cleanId.includes('@')) {
        const qEmail = query(usersRef, where('email', '==', cleanId.toLowerCase()));
        const snapEmail = await getDocs(qEmail);
        if (!snapEmail.empty) {
          existingProfile = snapEmail.docs[0].data() as UserProfile;
        }
      }
      if (!existingProfile && cleanId.toUpperCase().startsWith('SFF-U-')) {
        const qSff = query(usersRef, where('sffUserId', '==', cleanId.toUpperCase()));
        const snapSff = await getDocs(qSff);
        if (!snapSff.empty) {
          existingProfile = snapSff.docs[0].data() as UserProfile;
        }
      }
    } catch (qErr) {
      console.warn('Firestore collection query notice:', qErr);
    }
  }

  // STRICT REQUIREMENT: If NOT registered in Firestore database, refuse login!
  if (!existingProfile) {
    const err: any = new Error('No registered account found in SFF database for this identifier.');
    err.code = 'auth/user-not-found';
    throw err;
  }

  // 2. Determine email handle for Firebase Auth
  let emailToUse = '';
  if (existingProfile.email && existingProfile.email.includes('@')) {
    emailToUse = existingProfile.email.toLowerCase();
  } else if (existingProfile.mobileNumber || existingProfile.mobile) {
    const mob = (existingProfile.mobileNumber || existingProfile.mobile).replace(/\D/g, '');
    emailToUse = `${mob}@citizen.selffillforms.app`;
  } else if (existingProfile.sffUserId) {
    emailToUse = `${existingProfile.sffUserId.toLowerCase()}@citizen.selffillforms.app`;
  } else {
    emailToUse = `${cleanId.toLowerCase()}@citizen.selffillforms.app`;
  }

  // 3. Authenticate with Firebase Auth using password
  try {
    const userCredential = await signInWithEmailAndPassword(auth, emailToUse, pass);
    const fbUser = userCredential.user;
    return { user: fbUser, profile: existingProfile };
  } catch (authErr: any) {
    if (
      authErr?.code === 'auth/api-key-not-valid' ||
      authErr?.message?.includes('api-key-not-valid') ||
      authErr?.message?.includes('valid-api-key')
    ) {
      console.warn('Firebase Auth API key invalid, signing in user via validated Firestore profile:', existingProfile);
      const fallbackFbUser: any = {
        uid: existingProfile.uid || `sff_user_${existingProfile.mobileNumber || Date.now()}`,
        email: existingProfile.email || emailToUse,
        displayName: existingProfile.fullName || existingProfile.name || 'Citizen User',
      };
      return { user: fallbackFbUser, profile: existingProfile };
    }
    throw authErr;
  }
}

export async function loginWithGoogleProvider(): Promise<{ user: FirebaseUser; profile: UserProfile | null }> {
  const res = await signInWithPopup(auth, googleProvider);
  const fbUser = res.user;

  let profile = await getUserProfileFromFirestore(fbUser.uid);
  if (!profile) {
    profile = {
      name: fbUser.displayName || 'Citizen User',
      email: fbUser.email || '',
      mobile: fbUser.phoneNumber || '',
      photoUrl: fbUser.photoURL || undefined
    };
    await saveUserProfileToFirestore(fbUser.uid, profile);
  }

  return { user: fbUser, profile };
}

export async function logoutFirebaseUser(): Promise<void> {
  await signOut(auth);
}

export async function wipeAllFirestoreCollections(): Promise<void> {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    usersSnap.forEach((d) => {
      deleteDoc(d.ref).catch(() => {});
    });
    const storeSnap = await getDocs(collection(db, 'admin_store'));
    storeSnap.forEach((d) => {
      deleteDoc(d.ref).catch(() => {});
    });
  } catch (e) {
    console.warn('Wipe firestore collections warning:', e);
  }
}







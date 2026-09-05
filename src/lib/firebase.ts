import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);

const targetDbId =
  (firebaseConfig as any).firestoreDatabaseId && (firebaseConfig as any).firestoreDatabaseId !== '(default)'
    ? (firebaseConfig as any).firestoreDatabaseId
    : (firebaseConfig as any).databaseId && (firebaseConfig as any).databaseId !== '(default)'
    ? (firebaseConfig as any).databaseId
    : undefined;

let db: any;
try {
  if (targetDbId) {
    db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, targetDbId);
  } else {
    db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  }
} catch (e) {
  db = targetDbId ? getFirestore(app, targetDbId) : getFirestore(app);
}
const storageBucket = firebaseConfig.storageBucket
  ? (firebaseConfig.storageBucket.startsWith('gs://') ? firebaseConfig.storageBucket : `gs://${firebaseConfig.storageBucket}`)
  : undefined;
const storage = getStorage(app, storageBucket);
const googleProvider = new GoogleAuthProvider();

let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported && firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export { app, auth, db, storage, analytics, googleProvider };


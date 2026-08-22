import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey.length > 5
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('PairPlay: Firebase initialization failed, running in local-only fallback mode.', err);
  }
}

export { app, auth, db };

export async function ensureAnonymousUser(): Promise<User | null> {
  if (!auth) return null;

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth!, async (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        try {
          const userCredential = await signInAnonymously(auth!);
          resolve(userCredential.user);
        } catch (err) {
          console.warn('PairPlay: Anonymous auth sign-in failed', err);
          resolve(null);
        }
      }
    });
  });
}

export async function signInAnonymouslyToFirebase(): Promise<User> {
  const user = await ensureAnonymousUser();
  if (!user) {
    throw new Error('Unable to authenticate anonymously. Please check Firebase credentials.');
  }
  return user;
}

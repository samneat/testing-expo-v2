import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import Constants from 'expo-constants';
import { firebaseConfig as fallbackConfig } from '../../config/firebase';

// Build config from either Expo extra (app.config.ts) or EXPO_PUBLIC_* envs
const extraFirebase = (Constants.expoConfig?.extra as any)?.firebase ?? {};

const envFirebase = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function sanitize(value?: string) {
  return typeof value === 'string' ? value.trim() : undefined;
}

const firebaseConfig = {
  apiKey: sanitize(envFirebase.apiKey) ?? sanitize(extraFirebase.apiKey) ?? fallbackConfig.apiKey,
  authDomain: sanitize(envFirebase.authDomain) ?? sanitize(extraFirebase.authDomain) ?? fallbackConfig.authDomain,
  projectId: sanitize(envFirebase.projectId) ?? sanitize(extraFirebase.projectId) ?? fallbackConfig.projectId,
  storageBucket: sanitize(envFirebase.storageBucket) ?? sanitize(extraFirebase.storageBucket) ?? fallbackConfig.storageBucket,
  messagingSenderId: sanitize(envFirebase.messagingSenderId) ?? sanitize(extraFirebase.messagingSenderId) ?? fallbackConfig.messagingSenderId,
  appId: sanitize(envFirebase.appId) ?? sanitize(extraFirebase.appId) ?? fallbackConfig.appId,
  measurementId: sanitize(envFirebase.measurementId) ?? sanitize(extraFirebase.measurementId),
};

// Validate required fields
if (!firebaseConfig.apiKey) {
  throw new Error('Missing EXPO_PUBLIC_FIREBASE_API_KEY. Update .env and restart with cache clear.');
}
if (!firebaseConfig.appId) {
  throw new Error('Missing EXPO_PUBLIC_FIREBASE_APP_ID. Update .env and restart with cache clear.');
}

// Quick sanity check for common mistakes
if (!firebaseConfig.apiKey.startsWith('AIza')) {
  throw new Error('Invalid Firebase apiKey format. Ensure you used the Web API key from Firebase console.');
}

// Dev-only masked logging to help diagnose 400s without exposing secrets
if (__DEV__) {
  const mask = (v?: string) => (v ? `${v.slice(0, 4)}…${v.slice(-4)}` : 'undefined');
  // eslint-disable-next-line no-console
  console.debug('[Firebase] Web config loaded', {
    apiKey: firebaseConfig.apiKey ? mask(firebaseConfig.apiKey) : 'missing',
    authDomain: firebaseConfig.authDomain ?? 'missing',
    projectId: firebaseConfig.projectId ?? 'missing',
    appId: firebaseConfig.appId ? mask(firebaseConfig.appId) : 'missing',
  });
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig as any);

export const firebaseAuth = getAuth(app);

export default app;

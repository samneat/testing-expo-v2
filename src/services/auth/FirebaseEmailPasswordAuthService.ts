import * as SecureStore from 'expo-secure-store';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged as firebaseOnAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from './firebaseApp';
import { AuthUser, IAuthService } from './IAuthService';

export const TOKEN_KEY = 'firebase_id_token';

function mapFirebaseUser(user: any | null): AuthUser | null {
  if (!user) return null;
  return { uid: user.uid, email: user.email ?? null };
}

function mapErrorToMessage(err: unknown): string {
  const code = (err as any)?.code as string | undefined;
  const message = (err as any)?.message as string | undefined;
  
  // Log the full error for debugging
  if (__DEV__) {
    console.error('[Auth Error] Code:', code, 'Message:', message);
    console.error('[Auth Error] Full error:', err);
  }

  switch (code) {
    case 'auth/invalid-api-key':
      return 'Invalid Firebase API key. Check environment variables and restart the app.';
    case 'auth/invalid-email':
      return 'The email address is invalid.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid credentials. Please check your email and password.';
    case 'auth/missing-password':
      return 'Please enter your password.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in or use a different email.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is disabled in Firebase Console. Enable it under Authentication > Sign-in method.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/app-deleted':
      return 'Firebase project configuration error. Check your Firebase setup.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized. Add it to Firebase Console > Authentication > Settings > Authorized domains.';
    default:
      // Show the raw error code and message for debugging 400 errors
      return `Authentication failed${code ? ` (${code})` : ''}${message && __DEV__ ? `: ${message}` : '. Please try again.'}`;
  }
}

export class FirebaseEmailPasswordAuthService implements IAuthService {
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const { user } = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const token = await (user as any).getIdToken();
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      return { uid: user.uid, email: user.email ?? null };
    } catch (err) {
      // eslint-disable-next-line no-console
      if (__DEV__) console.debug('[Auth] signIn failed', err);
      throw new Error(mapErrorToMessage(err));
    }
  }

  async signUp(email: string, password: string): Promise<AuthUser> {
    try {
      const { user } = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const token = await (user as any).getIdToken();
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      return { uid: user.uid, email: user.email ?? null };
    } catch (err) {
      // eslint-disable-next-line no-console
      if (__DEV__) console.debug('[Auth] signUp failed', err);
      throw new Error(mapErrorToMessage(err));
    }
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(firebaseAuth);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }

  getCurrentUser(): AuthUser | null {
    return mapFirebaseUser((firebaseAuth as any).currentUser);
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    const unsubscribe = firebaseOnAuthStateChanged(firebaseAuth, (user) => {
      callback(mapFirebaseUser(user));
    });
    return unsubscribe;
  }
}

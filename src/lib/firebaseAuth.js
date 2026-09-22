import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { firebaseConfig, hasFirebaseConfig } from './firebaseConfig';

export async function signInWithGoogle() {
  if (!hasFirebaseConfig) throw new Error('Google sign-in is not configured yet.');
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const result = await signInWithPopup(getAuth(app), new GoogleAuthProvider());
  const idToken = await result.user.getIdToken();
  return { email: result.user.email, idToken };
}

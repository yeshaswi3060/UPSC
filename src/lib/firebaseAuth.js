import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { firebaseConfig, hasFirebaseConfig, missingFirebaseAuthConfig } from './firebaseConfig';

export async function signInWithGoogle() {
  if (!hasFirebaseConfig) throw new Error(`Google sign-in is missing production settings: ${missingFirebaseAuthConfig.join(', ')}.`);
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const result = await signInWithPopup(getAuth(app), new GoogleAuthProvider());
  const idToken = await result.user.getIdToken();
  return { email: result.user.email, idToken };
}

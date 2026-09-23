// Web configuration for the existing All-cloths Firebase project.
// These values are intentionally read from Vite environment variables so the
// project can be moved to the new Firebase project later without code edits.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Firebase Auth only needs these values. Storage, messaging and Analytics are
// optional for this app and should not disable the Google sign-in button.
export const missingFirebaseAuthConfig = Object.entries({
  VITE_FIREBASE_API_KEY: firebaseConfig.apiKey,
  VITE_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  VITE_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  VITE_FIREBASE_APP_ID: firebaseConfig.appId
}).filter(([, value]) => !value).map(([key]) => key);

export const hasFirebaseConfig = missingFirebaseAuthConfig.length === 0;

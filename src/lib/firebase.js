import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { isSupported as isAnalyticsSupported, getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Firebase's getAuth() throws synchronously on a missing/invalid apiKey, and
// this app mounts AuthProvider above every route — so an unconfigured .env
// must not crash pages (like the checkout flow) that have nothing to do with
// auth. Only initialize once real config is present.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
)

export const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null
export const auth = app ? getAuth(app) : null

// Analytics needs its own async support check (fails in unsupported browsers,
// blocked-tracking contexts, etc.) so it resolves later rather than export directly.
export const analyticsReady =
  app && firebaseConfig.measurementId
    ? isAnalyticsSupported().then((supported) => (supported ? getAnalytics(app) : null))
    : Promise.resolve(null)

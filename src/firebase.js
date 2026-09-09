// Firebase initialization for PETORA Help (Phase 2A).
// Config comes ONLY from environment variables (see .env.example).
// No credentials are hardcoded here. These values are public identifiers;
// real security is enforced by Firestore + Storage rules.
//
// Firebase SDK is loaded LAZILY (dynamic import) so the homepage bundle
// stays light for mobile users — it downloads only when a report is submitted.

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// True only when every required value is present.
// When false, the UI shows a setup notice and NEVER fakes a submission.
export const isFirebaseConfigured = Object.values(config).every((v) => typeof v === 'string' && v.length > 0)

let appPromise = null

function getApp() {
  if (!isFirebaseConfigured) {
    return Promise.reject(new Error('Firebase is not configured. See FIREBASE_SETUP.md.'))
  }
  if (!appPromise) {
    appPromise = import('firebase/app').then(({ initializeApp }) => initializeApp(config))
  }
  return appPromise
}

export async function getDb() {
  const [{ getFirestore }, app] = await Promise.all([import('firebase/firestore'), getApp()])
  return getFirestore(app)
}

export async function getStorage() {
  const [{ getStorage }, app] = await Promise.all([import('firebase/storage'), getApp()])
  return getStorage(app)
}

if (!isFirebaseConfigured && import.meta.env.DEV) {
  console.warn('[PETORA Help] Firebase is not configured. Copy .env.example to .env and follow FIREBASE_SETUP.md.')
}

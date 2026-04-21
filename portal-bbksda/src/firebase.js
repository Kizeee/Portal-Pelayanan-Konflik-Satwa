import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase config — API key bukan rahasia; keamanan dijaga oleh Firebase Security Rules.
// Gunakan env var jika tersedia, fallback ke nilai produksi.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAP7Hzjdfe8Am2nR8FZTkGjuQZBuIZ_XS0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'portal-satwa-riau.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'portal-satwa-riau',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'portal-satwa-riau.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '489548139703',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:489548139703:web:2503455c8bd02c78355132',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-PXJ1HNK0KZ',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
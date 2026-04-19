import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we have valid config (at least apiKey and projectId)
const hasValidConfig =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "undefined" &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "undefined";

let app = null;
let auth = null;
let db = null;

if (hasValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.warn("Firebase initialization failed:", error.message);
  }
} else {
  console.warn(
    "Firebase config not found. Add NEXT_PUBLIC_FIREBASE_* variables to .env.local"
  );
}

export { app, auth, db };

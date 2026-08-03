import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  type Auth,
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let authInstance: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  const existing = getApps();
  return existing.length ? existing[0] : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
    // Explicit even though browserLocalPersistence is already the web SDK
    // default — keeps the session alive across tabs/restarts intentionally,
    // not by accident.
    if (typeof window !== "undefined") {
      void setPersistence(authInstance, browserLocalPersistence);
    }
  }
  return authInstance;
}

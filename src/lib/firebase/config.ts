import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  type Auth,
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";

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
let firestoreInstance: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  const existing = getApps();
  return existing.length ? existing[0] : initializeApp(firebaseConfig);
}

export function getFirebaseFirestore(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp());
  }
  return firestoreInstance;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
    // Dev/test only: point the SDK at a local Auth emulator so auth flows
    // (password reset, email verification action codes) can be exercised
    // end to end without touching production accounts. The env var is
    // never set in Vercel, so this is dead code in production builds'
    // runtime path; NEXT_PUBLIC_ because the connection happens client-side.
    const emulatorHost = process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST;
    if (emulatorHost && typeof window !== "undefined") {
      connectAuthEmulator(authInstance, `http://${emulatorHost}`, {
        disableWarnings: true,
      });
    }
    // Explicit even though browserLocalPersistence is already the web SDK
    // default — keeps the session alive across tabs/restarts intentionally,
    // not by accident.
    if (typeof window !== "undefined") {
      void setPersistence(authInstance, browserLocalPersistence);
    }
  }
  return authInstance;
}

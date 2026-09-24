import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  type Auth,
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";

import { firebaseAuthDomain } from "@/lib/firebase/auth-domain";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // Always `<projectId>.firebaseapp.com`: Google rejects the branded
  // auth.yovoice.app handler with redirect_uri_mismatch, and the app moved
  // off it for the same reason. Why, and what that does not affect:
  // src/lib/firebase/auth-domain.ts. NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is no
  // longer read, so a stale value in Vercel cannot bring the error back.
  authDomain: firebaseAuthDomain(projectId),
  projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// authDomain is not listed: it is derived from projectId, which is.
const requiredFirebaseConfig = [
  firebaseConfig.apiKey,
  firebaseConfig.projectId,
  firebaseConfig.storageBucket,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
];

export const isFirebaseConfigured = requiredFirebaseConfig.every(
  (value) => typeof value === "string" && value.trim().length > 0,
);

let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error("YO Voice account services are unavailable in this environment.");
  }
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

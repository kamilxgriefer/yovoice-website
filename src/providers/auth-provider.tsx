"use client";

import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateEmail,
  updatePassword,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { getFirebaseAuth } from "@/lib/firebase/config";
import { getFirebaseFirestore } from "@/lib/firebase/config";
import {
  resetPasswordActionCodeSettings,
  verifyEmailActionCodeSettings,
} from "@/lib/auth/action-code-settings";

// Matches the shape FriendService.ensureUserDocument() / PresenceService
// write from the Flutter app — accounts created here need the same
// users/{uid} doc shape so the app doesn't see a partial profile the first
// time someone who registered on the website opens it.
async function ensureUserProfile(user: User, displayName: string) {
  await setDoc(
    doc(getFirebaseFirestore(), "users", user.uid),
    {
      uid: user.uid,
      displayName: displayName.trim() || user.email?.split("@")[0] || "YO Voice user",
      email: user.email?.trim().toLowerCase() ?? "",
      photoUrl: user.photoURL,
      isOnline: false,
      lastSeen: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  /** Forces a fresh emailVerified read from Firebase and syncs it into
   * context `user` (onAuthStateChanged does NOT refire after reload()).
   * Returns the up-to-date verified state. */
  reloadUser: () => Promise<boolean>;
  updateDisplayName: (displayName: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  changeEmail: (currentPassword: string, newEmail: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

async function reauthenticate(user: User, currentPassword: string) {
  if (!user.email) throw new Error("No email on this account.");
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    // onAuthStateChanged's first callback is normally near-instant (it's a
    // local IndexedDB read, not a network round-trip) but every page that
    // gates its UI on `loading` — the verify-email prompt, the whole
    // /account section — would otherwise spin forever if it never fires
    // for any reason (a slow/unavailable network, a wedged IndexedDB
    // connection). Fail open to "signed out" after a timeout rather than
    // hang indefinitely; this doesn't grant access to anything, it just
    // stops the spinner and lets the normal unauthenticated flow (login
    // redirect, "resend verification" prompt) take over.
    const failSafeTimer = setTimeout(() => setLoading(false), 8000);
    return () => {
      unsubscribe();
      clearTimeout(failSafeTimer);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: async (email, password) => {
        await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      },
      signUp: async (email, password, displayName) => {
        const credential = await createUserWithEmailAndPassword(
          getFirebaseAuth(),
          email,
          password,
        );
        if (displayName.trim()) {
          await updateProfile(credential.user, {
            displayName: displayName.trim(),
          });
        }
        await ensureUserProfile(credential.user, displayName);
        await sendEmailVerification(credential.user, verifyEmailActionCodeSettings());
      },
      signOut: async () => {
        await firebaseSignOut(getFirebaseAuth());
      },
      resetPassword: async (email) => {
        await sendPasswordResetEmail(
          getFirebaseAuth(),
          email,
          resetPasswordActionCodeSettings(),
        );
      },
      resendVerificationEmail: async () => {
        const current = getFirebaseAuth().currentUser;
        if (!current) throw new Error("Not signed in.");
        await sendEmailVerification(current, verifyEmailActionCodeSettings());
      },
      reloadUser: async () => {
        const current = getFirebaseAuth().currentUser;
        if (!current) return false;
        await current.reload();
        setUser({ ...current });
        return current.emailVerified;
      },
      updateDisplayName: async (displayName) => {
        const current = getFirebaseAuth().currentUser;
        if (!current) throw new Error("Not signed in.");
        await updateProfile(current, { displayName: displayName.trim() });
        // updateProfile doesn't trigger onAuthStateChanged; force a local refresh.
        setUser({ ...current });
      },
      changePassword: async (currentPassword, newPassword) => {
        const current = getFirebaseAuth().currentUser;
        if (!current) throw new Error("Not signed in.");
        await reauthenticate(current, currentPassword);
        await updatePassword(current, newPassword);
      },
      changeEmail: async (currentPassword, newEmail) => {
        const current = getFirebaseAuth().currentUser;
        if (!current) throw new Error("Not signed in.");
        await reauthenticate(current, currentPassword);
        await updateEmail(current, newEmail);
        await sendEmailVerification(current, verifyEmailActionCodeSettings());
        setUser({ ...current });
      },
    }),
    [user, loading],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

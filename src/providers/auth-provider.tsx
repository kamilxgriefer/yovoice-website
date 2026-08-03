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

import { getFirebaseAuth } from "@/lib/firebase/config";

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
    return unsubscribe;
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
        await sendEmailVerification(credential.user);
      },
      signOut: async () => {
        await firebaseSignOut(getFirebaseAuth());
      },
      resetPassword: async (email) => {
        await sendPasswordResetEmail(getFirebaseAuth(), email);
      },
      resendVerificationEmail: async () => {
        const current = getFirebaseAuth().currentUser;
        if (!current) throw new Error("Not signed in.");
        await sendEmailVerification(current);
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
        await sendEmailVerification(current);
        setUser({ ...current });
      },
    }),
    [user, loading],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

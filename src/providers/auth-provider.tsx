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
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";

import {
  getFirebaseAuth,
  getFirebaseFirestore,
  isFirebaseConfigured,
} from "@/lib/firebase/config";
import {
  resetPasswordActionCodeSettings,
  verifyEmailActionCodeSettings,
} from "@/lib/auth/action-code-settings";
import {
  completeRegistration,
  planUserProfileBootstrap,
} from "@/lib/auth/registration-profile";
import {
  verificationEmailDelivery,
  type RegistrationResult,
} from "@/lib/auth/registration-flow";
import {
  createFirebaseTotpSignInChallenge,
  isMultiFactorRequiredError,
  type EmailPasswordSignInResult,
} from "@/lib/auth/totp-sign-in";

// Bootstraps users/{uid} with the same seed the app's
// ProfileService.ensureProfile() writes, restricted to the keys the app's
// Firestore Rules accept (see registration-profile.ts). A transaction picks
// create vs. merge from the document's real state, so a partial document
// written first by presence never turns the create payload into a refused
// update.
async function ensureUserProfile(user: User, displayName: string) {
  const firestore = getFirebaseFirestore();
  const profileRef = doc(firestore, "users", user.uid);
  await runTransaction(firestore, async (transaction) => {
    const snapshot = await transaction.get(profileRef);
    const plan = planUserProfileBootstrap({
      uid: user.uid,
      email: user.email,
      displayName,
      existing: snapshot.exists() ? snapshot.data() : null,
      serverTimestamp: serverTimestamp(),
    });
    if (plan.kind === "create") {
      transaction.set(profileRef, plan.data);
    } else if (plan.kind === "merge") {
      transaction.set(profileRef, plan.data, { merge: true });
    }
  });
}

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<EmailPasswordSignInResult>;
  /** Throws only when the account could not be created. Once it exists, the
   * result says whether the verification email was sent. */
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<RegistrationResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  /** Forces a fresh emailVerified read from Firebase and syncs it into
   * context `user` (onAuthStateChanged does NOT refire after reload()).
   * Returns the up-to-date verified state. */
  reloadUser: () => Promise<boolean>;
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
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

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
        const auth = getFirebaseAuth();
        try {
          await signInWithEmailAndPassword(auth, email, password);
          return { status: "signed-in" };
        } catch (error) {
          if (!isMultiFactorRequiredError(error)) throw error;
          return {
            status: "totp-required",
            challenge: createFirebaseTotpSignInChallenge(auth, error),
          };
        }
      },
      signUp: async (email, password, displayName) => {
        const credential = await createUserWithEmailAndPassword(
          getFirebaseAuth(),
          email,
          password,
        );
        const trimmedDisplayName = displayName.trim();
        // The account already exists at this point. A refused profile write
        // is recoverable (the app completes the profile on first sign-in);
        // a skipped verification email is not, so it is always attempted.
        // Its failure is returned, not thrown: the account exists, so the
        // form must move on to /verify-email and say the email was not sent.
        const verificationEmail = await verificationEmailDelivery(
          () =>
            completeRegistration({
              updateAuthDisplayName: trimmedDisplayName
                ? () =>
                    updateProfile(credential.user, {
                      displayName: trimmedDisplayName,
                    })
                : undefined,
              writeProfile: () =>
                ensureUserProfile(credential.user, displayName),
              sendVerificationEmail: () =>
                sendEmailVerification(
                  credential.user,
                  verifyEmailActionCodeSettings(),
                ),
              onNonFatalError: (step, error) => {
                console.error(
                  `YO Voice registration: the ${step} step failed; the account was created and verification email delivery was still attempted.`,
                  error,
                );
              },
            }),
          (error) => {
            console.error(
              "YO Voice registration: the account was created but the verification email was not sent.",
              error,
            );
          },
        );
        return { verificationEmail };
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

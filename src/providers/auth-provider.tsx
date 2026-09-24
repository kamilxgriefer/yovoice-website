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
  GoogleAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateEmail,
  updatePassword,
  updateProfile,
  type User,
  type UserCredential,
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
  type SignInResult,
} from "@/lib/auth/totp-sign-in";
import {
  APPLE_PROVIDER_ID,
  APPLE_SCOPES,
  GOOGLE_CUSTOM_PARAMETERS,
  SOCIAL_PROVIDER_NAME,
  type SocialProvider,
} from "@/lib/auth/social-sign-in";

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

/**
 * The app's `_createSocialUserProfileIfNeeded`: only a first sign-in writes
 * users/{uid}, with the same rule-safe bootstrap as email registration (the
 * name comes from the provider, then the email's local part). Firebase has
 * already signed the account in, so a refused write never undoes that: it is
 * reported, and the app completes a missing profile on first open. Never
 * rejects.
 */
function createSocialUserProfileIfNeeded(
  credential: UserCredential,
  provider: SocialProvider,
): Promise<void> {
  if (!getAdditionalUserInfo(credential)?.isNewUser) return Promise.resolve();
  return ensureUserProfile(
    credential.user,
    credential.user.displayName ?? "",
  ).catch((error: unknown) => {
    console.error(
      `YO Voice ${SOCIAL_PROVIDER_NAME[provider]} sign-in: the account was created but its profile could not be written; the app completes it on first open.`,
      error,
    );
  });
}

/** The same provider set-up as the app's AuthService on the web. */
function createSocialAuthProvider(provider: SocialProvider) {
  if (provider === "google") {
    const google = new GoogleAuthProvider();
    google.setCustomParameters({ ...GOOGLE_CUSTOM_PARAMETERS });
    return google;
  }
  const apple = new OAuthProvider(APPLE_PROVIDER_ID);
  for (const scope of APPLE_SCOPES) apple.addScope(scope);
  return apple;
}

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<EmailPasswordSignInResult>;
  /** "Continue with Google / Apple" in a popup. A first sign-in creates the
   * account; its users/{uid} profile is bootstrapped before this resolves, and
   * a refused profile write is reported to the console but never fails the
   * sign-in (the app completes a missing profile on first open). Throws the
   * Firebase error otherwise, including the popup being closed. */
  signInWithProvider: (provider: SocialProvider) => Promise<SignInResult>;
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
  /** Proves the person at the keyboard is the account holder, and refreshes
   * the ID token so a server call that requires a recent sign-in — account
   * deletion asks for one no older than five minutes — sees the new
   * auth_time. Throws the Firebase auth error on a wrong password. */
  reauthenticate: (currentPassword: string) => Promise<void>;
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
      signInWithProvider: async (provider) => {
        const auth = getFirebaseAuth();
        try {
          // First, with nothing awaited before it: browsers only let the page
          // open the provider's window while the click is still fresh.
          const credential = await signInWithPopup(
            auth,
            createSocialAuthProvider(provider),
          );
          await createSocialUserProfileIfNeeded(credential, provider);
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
      reauthenticate: async (currentPassword) => {
        const current = getFirebaseAuth().currentUser;
        if (!current) throw new Error("Not signed in.");
        await reauthenticate(current, currentPassword);
        // reauthenticateWithCredential mints a new token, but the cached one
        // is what a callable would send; force the refresh so the server reads
        // the fresh auth_time rather than the sign-in that happened hours ago.
        await current.getIdToken(true);
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

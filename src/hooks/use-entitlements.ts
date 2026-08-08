"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";

import { useAuth } from "@/hooks/use-auth";
import { getFirebaseFirestore } from "@/lib/firebase/config";

export type WebEntitlements = {
  isPremium: boolean;
  plan: "monthly" | "yearly" | "none";
  status: string;
  inGracePeriod: boolean;
  currentPeriodEnd: Date | null;
};

export const FREE_ENTITLEMENTS: WebEntitlements = {
  isPremium: false,
  plan: "none",
  status: "none",
  inGracePeriod: false,
  currentPeriodEnd: null,
};

type DocState = { uid: string; value: WebEntitlements };

/**
 * Live view of the signed-in user's `entitlements/{uid}` document — the
 * trusted, Cloud-Functions-written subscription state (app-side twin:
 * SubscriptionEntitlements). Validity is recomputed here from
 * currentPeriodEnd exactly like the app and firestore.rules do, so a
 * lapsed subscription reads as free even before the server sweep runs.
 * Anonymous visitors and read errors resolve to FREE — never premium.
 *
 * State is only ever written from onSnapshot callbacks (async), and the
 * signed-out / switched-account cases are DERIVED by matching the cached
 * doc's uid against the current user — no synchronous setState in the
 * effect, no stale entitlements leaking across accounts.
 */
export function useEntitlements(): {
  entitlements: WebEntitlements;
  loading: boolean;
} {
  const { user, loading: authLoading } = useAuth();
  const [docState, setDocState] = useState<DocState | null>(null);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    const reference = doc(getFirebaseFirestore(), "entitlements", uid);
    const unsubscribe = onSnapshot(
      reference,
      (snapshot) => {
        const data = snapshot.data();
        if (!data) {
          setDocState({ uid, value: FREE_ENTITLEMENTS });
          return;
        }
        const periodEnd =
          data.currentPeriodEnd instanceof Timestamp
            ? data.currentPeriodEnd.toDate()
            : null;
        const status = typeof data.status === "string" ? data.status : "none";
        const active =
          ["active", "trialing", "grace"].includes(status) &&
          periodEnd !== null &&
          periodEnd.getTime() > Date.now();

        setDocState({
          uid,
          value: {
            isPremium: active,
            plan:
              data.plan === "monthly" || data.plan === "yearly"
                ? data.plan
                : "none",
            status,
            inGracePeriod: active && status === "grace",
            currentPeriodEnd: periodEnd,
          },
        });
      },
      () => {
        // Fail closed.
        setDocState({ uid, value: FREE_ENTITLEMENTS });
      },
    );
    return unsubscribe;
  }, [user]);

  if (authLoading) {
    return { entitlements: FREE_ENTITLEMENTS, loading: true };
  }
  if (!user) {
    return { entitlements: FREE_ENTITLEMENTS, loading: false };
  }
  if (docState?.uid !== user.uid) {
    return { entitlements: FREE_ENTITLEMENTS, loading: true };
  }
  return { entitlements: docState.value, loading: false };
}

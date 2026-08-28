"use client";

import { useLayoutEffect, useRef } from "react";

import { getFirebaseAuth } from "@/lib/firebase/config";
import {
  accountCapabilityAttemptIsCurrent,
  type AccountCapabilityAttempt,
  type BillingAccountIdentity,
} from "@/lib/premium/billing-contract";

/**
 * Checkout and Customer Portal URLs are bearer capabilities. If Auth changes
 * while a callable is in flight, a URL created for the old account must never
 * be opened under the new page state.
 */
export function useAccountCapabilityGuard(
  accountIdentity: BillingAccountIdentity | undefined,
) {
  const mountedRef = useRef(true);
  const identityRef = useRef(accountIdentity);
  const generationRef = useRef(0);

  useLayoutEffect(() => {
    if (identityRef.current !== accountIdentity) {
      identityRef.current = accountIdentity;
      generationRef.current += 1;
    }
  }, [accountIdentity]);

  useLayoutEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      generationRef.current += 1;
    };
  }, []);

  function begin(): AccountCapabilityAttempt | null {
    const firebaseUid = getFirebaseAuth().currentUser?.uid ?? null;
    const identity = identityRef.current;
    if (
      !mountedRef.current ||
      typeof identity !== "string" ||
      identity !== firebaseUid
    ) {
      return null;
    }
    return {
      accountIdentity: identity,
      generation: generationRef.current,
    };
  }

  function isCurrent(attempt: AccountCapabilityAttempt): boolean {
    return accountCapabilityAttemptIsCurrent(
      attempt,
      identityRef.current,
      generationRef.current,
      getFirebaseAuth().currentUser?.uid ?? null,
      mountedRef.current,
    );
  }

  function isMounted(): boolean {
    return mountedRef.current;
  }

  return { begin, isCurrent, isMounted };
}

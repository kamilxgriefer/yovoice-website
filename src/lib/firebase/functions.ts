import { type Functions, getFunctions } from "firebase/functions";

import { getFirebaseApp } from "@/lib/firebase/config";

// Every Cloud Function in this project is deployed to europe-west1 (see
// functions/ in the app repo). The default getFunctions() region is
// us-central1, so requesting it without the region would 404 every call.
const FUNCTIONS_REGION = "europe-west1";

let functionsInstance: Functions | null = null;

export function getFirebaseFunctions(): Functions {
  if (!functionsInstance) {
    functionsInstance = getFunctions(getFirebaseApp(), FUNCTIONS_REGION);
  }
  return functionsInstance;
}

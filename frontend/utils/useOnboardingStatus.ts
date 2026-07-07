import { useEffect, useState } from "react";

import { ENDPOINTS } from "../constants/api";
import { useAuthedFetch } from "./api";

export type OnboardingStatus = "checking" | "needed" | "done";

// A missing /profile/me row means this user hasn't been through the one-time
// onboarding flow yet. Shared by (auth)/_layout.tsx (deciding where a freshly
// signed-in user lands: "/" vs "/onboarding") and (tabs)/_layout.tsx (so a
// user who lands on a tabs route directly - bookmark, deep link, reload -
// without ever passing back through (auth) can't skip onboarding either).
export function useOnboardingStatus(isSignedIn: boolean | undefined): OnboardingStatus {
  const authedFetch = useAuthedFetch();
  const [status, setStatus] = useState<OnboardingStatus>("checking");

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    let cancelled = false;
    authedFetch(ENDPOINTS.profile)
      .then((response) => {
        if (!cancelled) {
          setStatus(response.status === 404 ? "needed" : "done");
        }
      })
      .catch(() => {
        // Fail open - a broken connectivity check shouldn't trap an
        // already-authenticated user behind a permanent loading state.
        if (!cancelled) {
          setStatus("done");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, authedFetch]);

  return status;
}

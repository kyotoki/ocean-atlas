import { useAuth } from "@clerk/clerk-expo";
import { useCallback, useRef } from "react";

export function useAuthedFetch() {
  const { getToken } = useAuth();

  // Clerk Expo's getToken is a new function reference on every render, so it
  // goes in a ref rather than a useCallback dependency - otherwise every
  // consumer that depends on this fetch function (e.g. via useFocusEffect)
  // re-runs on every render, causing a refetch loop.
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  return useCallback(async (input: string, init: RequestInit = {}) => {
    const token = await getTokenRef.current();
    const headers = new Headers(init.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return fetch(input, { ...init, headers });
  }, []);
}

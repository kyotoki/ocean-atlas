import { ClerkLoaded, ClerkLoading, ClerkProvider } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import OceanLoadingScreen from "../components/auth/OceanLoadingScreen";
import { PreferencesProvider } from "../contexts/PreferencesContext";
import { AnalyticsEvents, track } from "../utils/analytics";
import { tokenCache } from "../utils/tokenCache";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Set it in frontend/.env."
  );
}

export default function RootLayout() {
  // Fires once per cold start of the root layout - the simplest faithful
  // reading of "app opened" as a retention event, independent of whether the
  // user is signed in yet (auth state itself is a separate concern).
  useEffect(() => {
    track(AnalyticsEvents.AppOpened);
  }, []);

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <StatusBar style="light" />
      <ClerkLoading>
        <OceanLoadingScreen />
      </ClerkLoading>
      <ClerkLoaded>
        <PreferencesProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" />
          </Stack>
        </PreferencesProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

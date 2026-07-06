import { ClerkLoaded, ClerkLoading, ClerkProvider } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import OceanLoadingScreen from "../components/auth/OceanLoadingScreen";
import { PreferencesProvider } from "../contexts/PreferencesContext";
import { tokenCache } from "../utils/tokenCache";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Set it in frontend/.env."
  );
}

export default function RootLayout() {
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
          </Stack>
        </PreferencesProvider>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";

import OceanLoadingScreen from "../../components/auth/OceanLoadingScreen";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <OceanLoadingScreen />;
  }

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

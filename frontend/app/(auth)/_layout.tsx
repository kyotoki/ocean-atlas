import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";

import OceanLoadingScreen from "../../components/auth/OceanLoadingScreen";
import { useOnboardingStatus } from "../../utils/useOnboardingStatus";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const onboardingStatus = useOnboardingStatus(isSignedIn);

  if (!isLoaded) {
    return <OceanLoadingScreen />;
  }

  if (isSignedIn) {
    if (onboardingStatus === "checking") {
      return <OceanLoadingScreen />;
    }
    return <Redirect href={onboardingStatus === "needed" ? "/onboarding" : "/"} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

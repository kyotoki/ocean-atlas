import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { StyleSheet, View } from "react-native";

import OceanLoadingScreen from "../../components/auth/OceanLoadingScreen";
import AnimatedTabIcon from "../../components/ui/AnimatedTabIcon";
import { TAB_BAR_HEIGHT } from "../../constants/layout";
import { useOnboardingStatus } from "../../utils/useOnboardingStatus";

const OCEAN_BLUE = "#0B3D91";
const SLATE_GRAY = "#94A3B8";

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const onboardingStatus = useOnboardingStatus(isSignedIn);

  if (!isLoaded) {
    return <OceanLoadingScreen />;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  // Guards direct entry into a tabs route (bookmark, deep link, reload) that
  // never passed back through (auth)/_layout.tsx's own onboarding check - a
  // user who signed up but abandoned onboarding partway through could
  // otherwise land straight in the app without ever finishing it.
  if (onboardingStatus === "checking") {
    return <OceanLoadingScreen />;
  }
  if (onboardingStatus === "needed") {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: OCEAN_BLUE },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "700" },
        tabBarActiveTintColor: OCEAN_BLUE,
        tabBarInactiveTintColor: SLATE_GRAY,
        // Absolutely positioned so the blurred/translucent background can
        // float over screen content (the "acrylic" look) - screens compensate
        // with extra bottom padding via constants/layout.ts's TAB_BAR_HEIGHT,
        // since the tab bar no longer reserves its own layout space.
        tabBarStyle: {
          position: "absolute",
          height: TAB_BAR_HEIGHT,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: "transparent",
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: "rgba(11, 61, 145, 0.14)",
          elevation: 0,
          shadowColor: "#021019",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        // The Map tab can sit over dark/busy satellite or hybrid imagery, so
        // blur alone isn't enough contrast for the tab icons/labels - a solid
        // semi-opaque wash on top of the blur guarantees legibility no matter
        // what's behind it (map tiles, photos, anything).
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
            <View style={styles.tabBarScrim} />
          </View>
        ),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Map",
          headerTitle: "Svel",
          tabBarIcon: ({ focused, size }) => (
            <AnimatedTabIcon name="map-outline" focused={focused} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: "Log",
          headerTitle: "Log Adventure",
          tabBarIcon: ({ focused, size }) => (
            <AnimatedTabIcon name="create-outline" focused={focused} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerTitle: "Profile",
          tabBarIcon: ({ focused, size }) => (
            <AnimatedTabIcon name="person-circle-outline" focused={focused} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
});

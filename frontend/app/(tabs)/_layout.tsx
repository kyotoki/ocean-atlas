import { Ionicons } from "@expo/vector-icons";
import { useAuth, useClerk } from "@clerk/clerk-expo";
import { Redirect, Tabs } from "expo-router";
import { TouchableOpacity } from "react-native";

import OceanLoadingScreen from "../../components/auth/OceanLoadingScreen";

const OCEAN_BLUE = "#0B3D91";
const INACTIVE_GRAY = "#8E8E93";

function SignOutButton() {
  const { signOut } = useClerk();

  return (
    <TouchableOpacity onPress={() => signOut()} hitSlop={12} style={{ marginRight: 16 }}>
      <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <OceanLoadingScreen />;
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: OCEAN_BLUE },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "700" },
        headerRight: () => <SignOutButton />,
        tabBarActiveTintColor: OCEAN_BLUE,
        tabBarInactiveTintColor: INACTIVE_GRAY,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ocean Map",
          headerTitle: "Ocean Atlas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: "Log Dive",
          headerTitle: "Adventure Log",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerTitle: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

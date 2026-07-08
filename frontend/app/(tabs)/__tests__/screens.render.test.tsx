import { render, screen, waitFor } from "@testing-library/react-native";

// A pure render smoke test for the two newly-tokenized screens: every
// StyleSheet.create() call across their whole import tree gets evaluated
// when these mount, so this catches a bad token reference (e.g. a typo'd
// path into constants/theme.ts) that tsc's structural typing wouldn't -
// style objects are just Record<string, unknown> as far as the type checker
// is concerned.

const mockAuthedFetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });
jest.mock("../../../utils/api", () => ({
  useAuthedFetch: () => mockAuthedFetch,
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock("../../../contexts/PreferencesContext", () => ({
  usePreferences: () => ({
    unitSystem: "metric",
    mapStyle: "standard",
    setUnitSystem: jest.fn(),
    setMapStyle: jest.fn(),
  }),
}));

jest.mock("@clerk/clerk-expo", () => ({
  useUser: () => ({ user: { id: "user_1", fullName: "Test Diver", username: "testdiver", imageUrl: null } }),
  useClerk: () => ({ signOut: jest.fn() }),
}));

jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback: () => void) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    require("react").useEffect(() => {
      callback();
    }, [callback]);
  },
}));

// react-leaflet/leaflet don't have a meaningful jsdom-free RN test double -
// PersonalMapSection's DiveMapView is mocked out entirely since map
// rendering itself isn't what this test is verifying.
jest.mock("../../../components/map/DiveMapView", () => "DiveMapView");

// @expo/vector-icons' font-loading check (loadedNativeFonts.forEach) isn't
// happy running under plain jest-expo without a device/font runtime -
// unrelated to what this test verifies, so Ionicons is stubbed to a plain
// component instead of pulling in the real font machinery.
jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  return { Ionicons: View };
});

import LogAdventureScreen from "../log";
import ProfileScreen from "../profile";

test("log screen renders without throwing", () => {
  render(<LogAdventureScreen />);
  expect(screen.getByText("Log Adventure")).toBeTruthy();
});

test("profile screen renders without throwing", async () => {
  render(<ProfileScreen />);
  expect(screen.getByText("Test Diver")).toBeTruthy();
  // Let the profile-data fetch settle so its state updates land inside act().
  await waitFor(() => expect(mockAuthedFetch).toHaveBeenCalled());
});

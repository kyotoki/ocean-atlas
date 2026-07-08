import { act, renderHook, waitFor } from "@testing-library/react-native";

import { useProfileData } from "../useProfileData";

const mockUser = { id: "user_1", fullName: "Test User", username: "testuser", imageUrl: null };
const mockSignOut = jest.fn();
jest.mock("@clerk/clerk-expo", () => ({
  useUser: () => ({ user: mockUser }),
  useClerk: () => ({ signOut: mockSignOut }),
}));

jest.mock("@react-navigation/native", () => ({
  // Runs the focus callback once on mount, same effect useFocusEffect has
  // the first time a screen becomes focused.
  useFocusEffect: (callback: () => void) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    require("react").useEffect(() => {
      callback();
    }, [callback]);
  },
}));

jest.mock("../../contexts/PreferencesContext", () => ({
  usePreferences: () => ({
    unitSystem: "metric",
    mapStyle: "standard",
    setUnitSystem: jest.fn(),
    setMapStyle: jest.fn(),
  }),
}));

const mockAuthedFetch = jest.fn();
jest.mock("../../utils/api", () => ({
  useAuthedFetch: () => mockAuthedFetch,
}));

jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    setItemAsync: jest.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    }),
  };
});

const ADVENTURES = [
  {
    id: 1,
    title: "Reef Dive",
    date: "2026-07-01",
    created_at: "2026-07-01T10:00:00Z",
    location_name: "Blue Hole",
    latitude: 1,
    longitude: 2,
    max_depth_meters: 18,
    duration_minutes: 40,
    notes: null,
    photos: [],
    water_temp_c: null,
    wave_height_m: null,
    tide_height_m: null,
    activity_type: "scuba",
    tank_pressure_bar: null,
    gas_mix: null,
  },
];
const SCUBA_STATS = { activity_type: "scuba", total_trips: 5, total_minutes: 200, deepest_meters: 30, average_bottom_time_minutes: 40, favorite_site: "Blue Hole" };
const SNORKEL_STATS = { activity_type: "snorkeling", total_trips: 2, total_minutes: 60, deepest_meters: null, average_bottom_time_minutes: null, favorite_site: null };

function okJson(data: unknown) {
  return { ok: true, status: 200, json: async () => data };
}

beforeEach(() => {
  mockAuthedFetch.mockReset();
  mockSignOut.mockReset();
});

describe("viewing stats", () => {
  test("fetches adventures and per-activity stats on focus", async () => {
    mockAuthedFetch
      .mockResolvedValueOnce(okJson(ADVENTURES))
      .mockResolvedValueOnce(okJson(SCUBA_STATS))
      .mockResolvedValueOnce(okJson(SNORKEL_STATS));

    const { result } = renderHook(() => useProfileData());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.adventures).toEqual(ADVENTURES);
    expect(result.current.scubaStats).toEqual(SCUBA_STATS);
    expect(result.current.snorkelingStats).toEqual(SNORKEL_STATS);
    expect(result.current.error).toBeNull();
    expect(mockAuthedFetch).toHaveBeenCalledTimes(3);
  });

  test("surfaces an error and stops loading when a stats request fails", async () => {
    mockAuthedFetch
      .mockResolvedValueOnce(okJson(ADVENTURES))
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce(okJson(SNORKEL_STATS));

    const { result } = renderHook(() => useProfileData());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toContain("500");
  });
});

describe("editing a profile", () => {
  test("updateLocalProfile persists changes to device storage", async () => {
    mockAuthedFetch.mockResolvedValue(okJson([]));
    const { result } = renderHook(() => useProfileData());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.updateLocalProfile({ bio: "Wreck diving enthusiast" });
    });

    await waitFor(() => expect(result.current.localProfile.bio).toBe("Wreck diving enthusiast"));

    // Round-trips through the real storage layer (mocked SecureStore) rather
    // than just asserting in-memory state, since the whole point of editing
    // a profile is that it survives beyond the current render.
    const SecureStore = require("expo-secure-store");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "svel_profile_user_1",
      expect.stringContaining("Wreck diving enthusiast")
    );
  });

  test("toggleCertification adds and then removes a certification", async () => {
    mockAuthedFetch.mockResolvedValue(okJson([]));
    const { result } = renderHook(() => useProfileData());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.toggleCertification("PADI Open Water");
    });
    await waitFor(() =>
      expect(result.current.localProfile.certifications).toContain("PADI Open Water")
    );

    act(() => {
      result.current.toggleCertification("PADI Open Water");
    });
    await waitFor(() =>
      expect(result.current.localProfile.certifications).not.toContain("PADI Open Water")
    );
  });
});

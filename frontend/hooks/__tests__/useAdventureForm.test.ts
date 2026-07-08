import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { act, renderHook } from "@testing-library/react-native";

import { getQueue } from "../../utils/adventureQueue";
import { showAlert } from "../../utils/crossPlatformAlert";
import { useAdventureForm } from "../useAdventureForm";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
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

jest.mock("../../utils/crossPlatformAlert", () => ({
  showAlert: jest.fn(),
}));

function fillValidForm(form: ReturnType<typeof useAdventureForm>) {
  act(() => {
    form.updateField("title", "Reef Dive");
    form.updateField("location_name", "Blue Hole");
    form.updateField("latitude", "1");
    form.updateField("longitude", "2");
    form.updateField("max_depth_meters", "18");
    form.updateField("duration_minutes", "40");
  });
}

beforeEach(async () => {
  await AsyncStorage.clear();
  mockAuthedFetch.mockReset();
  mockPush.mockReset();
  (showAlert as jest.Mock).mockReset();
  (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
});

test("does not submit when required fields are missing", async () => {
  const { result } = renderHook(() => useAdventureForm());

  await act(async () => {
    await result.current.handleSubmit();
  });

  expect(mockAuthedFetch).not.toHaveBeenCalled();
  expect(result.current.errors.title).toBeTruthy();
  expect(result.current.errors.location_name).toBeTruthy();
});

test("logs an adventure successfully when online", async () => {
  mockAuthedFetch.mockResolvedValue({ ok: true, json: async () => ({ id: 1 }) });

  const { result } = renderHook(() => useAdventureForm());
  fillValidForm(result.current);

  await act(async () => {
    await result.current.handleSubmit();
  });

  expect(mockAuthedFetch).toHaveBeenCalledTimes(1);
  const [endpoint, init] = mockAuthedFetch.mock.calls[0];
  expect(endpoint).toContain("/adventures/");
  const body = JSON.parse(init.body);
  expect(body).toMatchObject({
    title: "Reef Dive",
    location_name: "Blue Hole",
    latitude: 1,
    longitude: 2,
    max_depth_meters: 18,
    duration_minutes: 40,
    activity_type: "scuba",
  });

  // Form resets back to blank after a successful submit.
  expect(result.current.form.title).toBe("");
  expect(showAlert).toHaveBeenCalledWith(
    "Adventure logged",
    expect.any(String),
    expect.any(Array)
  );
  expect(await getQueue()).toHaveLength(0);
});

test("queues the adventure locally when the device is offline", async () => {
  (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

  const { result } = renderHook(() => useAdventureForm());
  fillValidForm(result.current);

  await act(async () => {
    await result.current.handleSubmit();
  });

  expect(mockAuthedFetch).not.toHaveBeenCalled();

  const queue = await getQueue();
  expect(queue).toHaveLength(1);
  expect(queue[0].payload).toMatchObject({ title: "Reef Dive", location_name: "Blue Hole" });
  expect(queue[0].status).toBe("pending");

  // Form resets, same as a successful online submit.
  expect(result.current.form.title).toBe("");
  expect(showAlert).toHaveBeenCalledWith(
    "Saved offline",
    expect.stringContaining("will sync automatically"),
    expect.any(Array)
  );
});

test("queues the adventure when the request fails for a connectivity reason", async () => {
  // NetInfo said we were online, but the actual request still couldn't
  // complete - treated the same as a known-offline submission.
  mockAuthedFetch.mockRejectedValue(new TypeError("Network request failed"));

  const { result } = renderHook(() => useAdventureForm());
  fillValidForm(result.current);

  await act(async () => {
    await result.current.handleSubmit();
  });

  expect(await getQueue()).toHaveLength(1);
  expect(showAlert).toHaveBeenCalledWith(
    "Saved offline",
    expect.stringContaining("will sync automatically"),
    expect.any(Array)
  );
});

test("shows a real error and does not queue when the server rejects the request", async () => {
  mockAuthedFetch.mockResolvedValue({ ok: false, status: 422 });

  const { result } = renderHook(() => useAdventureForm());
  fillValidForm(result.current);

  await act(async () => {
    await result.current.handleSubmit();
  });

  expect(await getQueue()).toHaveLength(0);
  expect(showAlert).toHaveBeenCalledWith(
    "Unable to save adventure",
    expect.stringContaining("422")
  );
  // Form is left filled so the user can retry, not silently cleared.
  expect(result.current.form.title).toBe("Reef Dive");
});

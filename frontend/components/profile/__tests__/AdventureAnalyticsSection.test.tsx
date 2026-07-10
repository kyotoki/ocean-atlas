import { fireEvent, render, screen } from "@testing-library/react-native";
import { useState } from "react";

import { ActivityFilter, ActivityStats } from "../../../types/adventure";
import { CombinedActivityStats } from "../../../utils/activityStats";
import AdventureAnalyticsSection from "../AdventureAnalyticsSection";

// @expo/vector-icons' font-loading check (loadedNativeFonts.forEach) isn't
// happy running under plain jest-expo without a device/font runtime -
// unrelated to what this test verifies, so Ionicons is stubbed to a plain
// component instead of pulling in the real font machinery.
jest.mock("@expo/vector-icons", () => {
  const { View } = require("react-native");
  return { Ionicons: View };
});

const SCUBA_STATS: ActivityStats = {
  activity_type: "scuba",
  total_trips: 7,
  total_minutes: 280,
  deepest_meters: 30,
  average_bottom_time_minutes: 40,
  favorite_site: "Blue Hole",
};
const SNORKEL_STATS: ActivityStats = {
  activity_type: "snorkeling",
  total_trips: 4,
  total_minutes: 120,
  deepest_meters: null,
  average_bottom_time_minutes: null,
  favorite_site: "Shallow Bay",
};
const FREEDIVING_STATS: ActivityStats = {
  activity_type: "freediving",
  total_trips: 9,
  total_minutes: 27,
  deepest_meters: 22,
  average_bottom_time_minutes: 3,
  favorite_site: "Reef Point",
};
const ALL_STATS: CombinedActivityStats = {
  total_trips: 20,
  total_minutes: 427,
  deepest_meters: 30,
  average_bottom_time_minutes: 21.35,
  favorite_site: "Blue Hole",
};

function Harness({ initial = "scuba" as ActivityFilter }) {
  const [tab, setTab] = useState<ActivityFilter>(initial);
  return (
    <AdventureAnalyticsSection
      activeActivityTab={tab}
      onActivityTabChange={setTab}
      scubaStats={SCUBA_STATS}
      snorkelingStats={SNORKEL_STATS}
      freedivingStats={FREEDIVING_STATS}
      allStats={ALL_STATS}
      unitSystem="metric"
      onLogAdventure={jest.fn()}
    />
  );
}

function openPickerAndSelect(label: string) {
  fireEvent.press(screen.getByLabelText("Filter analytics by activity type"));
  fireEvent.press(screen.getByText(label));
}

test("shows the initially selected activity type's stats", () => {
  render(<Harness initial="scuba" />);

  expect(screen.getByText("7")).toBeTruthy();
  expect(screen.getByText("Blue Hole")).toBeTruthy();
  // Other activity types' distinctive values aren't shown.
  expect(screen.queryByText("9")).toBeNull();
  expect(screen.queryByText("Reef Point")).toBeNull();
});

test("selecting a different activity type filters the displayed stats", () => {
  render(<Harness initial="scuba" />);

  openPickerAndSelect("Freediving");

  expect(screen.getByText("9")).toBeTruthy();
  expect(screen.getByText("Reef Point")).toBeTruthy();
  // The previously-shown scuba-specific values are gone.
  expect(screen.queryByText("7")).toBeNull();
  expect(screen.queryByText("Blue Hole")).toBeNull();
});

test("selecting All Activities shows the combined stats across every type", () => {
  render(<Harness initial="scuba" />);

  openPickerAndSelect("All Activities");

  expect(screen.getByText("20")).toBeTruthy();
  expect(screen.getByText("Total Adventures")).toBeTruthy();
  expect(screen.getByText("Blue Hole")).toBeTruthy();
  // Single-activity-only stats aren't shown in the combined view.
  expect(screen.queryByText("7")).toBeNull();
  expect(screen.queryByText("9")).toBeNull();
});

test("the trigger reflects the currently selected activity type", () => {
  render(<Harness initial="snorkeling" />);
  expect(screen.getByText("Snorkeling")).toBeTruthy();

  openPickerAndSelect("All Activities");
  expect(screen.getByText("All Activities")).toBeTruthy();
});

test("shows an empty state instead of stat cards when there are zero adventures total", () => {
  const onLogAdventure = jest.fn();
  render(
    <AdventureAnalyticsSection
      activeActivityTab="scuba"
      onActivityTabChange={jest.fn()}
      scubaStats={null}
      snorkelingStats={null}
      freedivingStats={null}
      allStats={{ total_trips: 0, total_minutes: 0, deepest_meters: null, average_bottom_time_minutes: null, favorite_site: null }}
      unitSystem="metric"
      onLogAdventure={onLogAdventure}
    />
  );

  expect(screen.getByText("No stats yet")).toBeTruthy();
  fireEvent.press(screen.getByLabelText("Log Adventure"));
  expect(onLogAdventure).toHaveBeenCalledTimes(1);
});

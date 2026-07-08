import { StyleSheet, View } from "react-native";

import { spacing } from "../../constants/theme";
import { ActivityStats, ActivityType } from "../../types/adventure";
import { UnitSystem } from "../../utils/units";
import { formatDepth } from "../../utils/units";
import AccordionSection from "./AccordionSection";
import SegmentedControl from "./SegmentedControl";
import StatCard from "./StatCard";

const ACTIVITY_TAB_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: "scuba", label: "Scuba" },
  { value: "snorkeling", label: "Snorkeling" },
];

function formatHours(totalMinutes: number): string {
  return `${(totalMinutes / 60).toFixed(1)} hrs`;
}

function formatSnorkelDuration(totalMinutes: number): string {
  return `${(totalMinutes / 60).toFixed(1)} Hours`;
}

interface AdventureAnalyticsSectionProps {
  activeActivityTab: ActivityType;
  onActivityTabChange: (next: ActivityType) => void;
  scubaStats: ActivityStats | null;
  snorkelingStats: ActivityStats | null;
  unitSystem: UnitSystem;
}

export default function AdventureAnalyticsSection({
  activeActivityTab,
  onActivityTabChange,
  scubaStats,
  snorkelingStats,
  unitSystem,
}: AdventureAnalyticsSectionProps) {
  return (
    <AccordionSection title="Adventure Analytics" icon="analytics-outline" defaultExpanded>
      <SegmentedControl
        options={ACTIVITY_TAB_OPTIONS}
        value={activeActivityTab}
        onChange={onActivityTabChange}
      />
      <View style={styles.segmentedControlSpacer} />
      {activeActivityTab === "scuba" ? (
        <>
          <View style={styles.statsGridRow}>
            <StatCard
              icon="boat-outline"
              label="Total Scuba Dives"
              value={String(scubaStats?.total_trips ?? 0)}
            />
            <StatCard
              icon="time-outline"
              label="Total Dive Hours"
              value={formatHours(scubaStats?.total_minutes ?? 0)}
            />
          </View>
          <View style={styles.statsGridRow}>
            <StatCard
              icon="arrow-down-outline"
              label="Deepest Dive"
              value={
                scubaStats?.deepest_meters != null
                  ? formatDepth(scubaStats.deepest_meters, unitSystem)
                  : "—"
              }
            />
            <StatCard
              icon="speedometer-outline"
              label="Average Bottom Time"
              value={
                scubaStats?.average_bottom_time_minutes != null
                  ? `${Math.round(scubaStats.average_bottom_time_minutes)} min`
                  : "—"
              }
            />
          </View>
          <View style={styles.statsGridRow}>
            <StatCard
              icon="heart-outline"
              label="Favorite Dive Site"
              value={scubaStats?.favorite_site ?? "None Logged"}
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.statsGridRow}>
            <StatCard
              featured
              icon="hourglass-outline"
              label="Total Snorkel Time"
              value={formatSnorkelDuration(snorkelingStats?.total_minutes ?? 0)}
            />
          </View>
          <View style={styles.statsGridRow}>
            <StatCard
              icon="water-outline"
              label="Total Snorkeling Trips"
              value={String(snorkelingStats?.total_trips ?? 0)}
            />
            <StatCard
              icon="heart-outline"
              label="Favorite Reef Site"
              value={snorkelingStats?.favorite_site ?? "None Logged"}
            />
          </View>
        </>
      )}
    </AccordionSection>
  );
}

const styles = StyleSheet.create({
  segmentedControlSpacer: {
    height: spacing.md,
  },
  statsGridRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
});

import { StyleSheet, View } from "react-native";

import { spacing } from "../../constants/theme";
import { ActivityFilter, ActivityStats } from "../../types/adventure";
import { CombinedActivityStats } from "../../utils/activityStats";
import { UnitSystem } from "../../utils/units";
import { formatDepth } from "../../utils/units";
import EmptyState from "../ui/EmptyState";
import AccordionSection from "./AccordionSection";
import ActivityTypeFilter from "./ActivityTypeFilter";
import StatCard from "./StatCard";

function formatHours(totalMinutes: number): string {
  return `${(totalMinutes / 60).toFixed(1)} hrs`;
}

function formatSnorkelDuration(totalMinutes: number): string {
  return `${(totalMinutes / 60).toFixed(1)} Hours`;
}

interface AdventureAnalyticsSectionProps {
  activeActivityTab: ActivityFilter;
  onActivityTabChange: (next: ActivityFilter) => void;
  scubaStats: ActivityStats | null;
  snorkelingStats: ActivityStats | null;
  freedivingStats: ActivityStats | null;
  allStats: CombinedActivityStats;
  unitSystem: UnitSystem;
  onLogAdventure: () => void;
}

export default function AdventureAnalyticsSection({
  activeActivityTab,
  onActivityTabChange,
  scubaStats,
  snorkelingStats,
  freedivingStats,
  allStats,
  unitSystem,
  onLogAdventure,
}: AdventureAnalyticsSectionProps) {
  // Zero adventures *total* (across every activity type) means there's
  // nothing to analyze yet - distinct from viewing a single activity tab
  // that legitimately has zero trips while other tabs have real data, which
  // still shows its real (zero-value) stat cards further below rather than
  // this empty state.
  if (allStats.total_trips === 0) {
    return (
      <AccordionSection title="Adventure Analytics" icon="analytics-outline" defaultExpanded>
        <EmptyState
          size="compact"
          icon={{ name: "analytics-outline" }}
          title="No stats yet"
          message="Log your first adventure to start tracking depth, time, and favorite sites."
          action={{ label: "Log Adventure", onPress: onLogAdventure }}
        />
      </AccordionSection>
    );
  }

  return (
    <AccordionSection title="Adventure Analytics" icon="analytics-outline" defaultExpanded>
      <ActivityTypeFilter value={activeActivityTab} onChange={onActivityTabChange} />
      <View style={styles.filterSpacer} />
      {activeActivityTab === "all" && (
        <>
          <View style={styles.statsGridRow}>
            <StatCard
              icon="compass-outline"
              label="Total Adventures"
              value={String(allStats.total_trips)}
            />
            <StatCard icon="time-outline" label="Total Time" value={formatHours(allStats.total_minutes)} />
          </View>
          <View style={styles.statsGridRow}>
            <StatCard
              icon="arrow-down-outline"
              label="Deepest Point"
              value={allStats.deepest_meters != null ? formatDepth(allStats.deepest_meters, unitSystem) : "—"}
            />
            <StatCard
              icon="speedometer-outline"
              label="Average Duration"
              value={
                allStats.average_bottom_time_minutes != null
                  ? `${Math.round(allStats.average_bottom_time_minutes)} min`
                  : "—"
              }
            />
          </View>
          <View style={styles.statsGridRow}>
            <StatCard
              icon="heart-outline"
              label="Favorite Site"
              value={allStats.favorite_site ?? "None Logged"}
            />
          </View>
        </>
      )}
      {activeActivityTab === "scuba" && (
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
      )}
      {activeActivityTab === "snorkeling" && (
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
      {activeActivityTab === "freediving" && (
        <>
          <View style={styles.statsGridRow}>
            <StatCard
              icon="body-outline"
              label="Total Freediving Sessions"
              value={String(freedivingStats?.total_trips ?? 0)}
            />
            <StatCard
              icon="time-outline"
              label="Total Time"
              value={formatHours(freedivingStats?.total_minutes ?? 0)}
            />
          </View>
          <View style={styles.statsGridRow}>
            <StatCard
              icon="arrow-down-outline"
              label="Deepest Freedive"
              value={
                freedivingStats?.deepest_meters != null
                  ? formatDepth(freedivingStats.deepest_meters, unitSystem)
                  : "—"
              }
            />
            <StatCard
              icon="speedometer-outline"
              label="Average Breath-Hold Time"
              value={
                freedivingStats?.average_bottom_time_minutes != null
                  ? `${Math.round(freedivingStats.average_bottom_time_minutes)} min`
                  : "—"
              }
            />
          </View>
          <View style={styles.statsGridRow}>
            <StatCard
              icon="heart-outline"
              label="Favorite Freediving Site"
              value={freedivingStats?.favorite_site ?? "None Logged"}
            />
          </View>
        </>
      )}
    </AccordionSection>
  );
}

const styles = StyleSheet.create({
  filterSpacer: {
    height: spacing.md,
  },
  statsGridRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
});

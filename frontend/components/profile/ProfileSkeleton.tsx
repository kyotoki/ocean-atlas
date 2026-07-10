import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { colors, elevation, radius, spacing } from "../../constants/theme";
import Skeleton from "../ui/Skeleton";

// Shown in place of profile.tsx's Analytics/Achievements/Map/Gallery block
// while useProfileData's initial fetch is in flight - shaped like that real
// content (an AccordionSection card per section, each mimicking its
// section's actual layout) rather than a single generic spinner, so the
// screen doesn't visually "jump" once the real content mounts.
export default function ProfileSkeleton() {
  return (
    <View>
      <SkeletonCard>
        <Skeleton style={styles.filterBar} />
        <View style={styles.statsRow}>
          <Skeleton style={styles.statCard} />
          <Skeleton style={styles.statCard} />
        </View>
        <View style={styles.statsRow}>
          <Skeleton style={styles.statCard} />
          <Skeleton style={styles.statCard} />
        </View>
        <View style={styles.statsRow}>
          <Skeleton style={styles.statCardWide} />
        </View>
      </SkeletonCard>

      <SkeletonCard>
        <View style={styles.badgeRow}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.badgeTile}>
              <Skeleton style={styles.badgeCircle} />
              <Skeleton style={styles.badgeLabel} />
            </View>
          ))}
        </View>
      </SkeletonCard>

      <SkeletonCard>
        <Skeleton style={styles.mapRect} />
      </SkeletonCard>

      <SkeletonCard>
        <View style={styles.photoRow}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} style={styles.photoThumb} />
          ))}
        </View>
      </SkeletonCard>
    </View>
  );
}

// Mirrors AccordionSection's own card chrome (rounded white card, header row
// with an icon badge + title bar) so the skeleton reads as "this exact card,
// not yet loaded" rather than an unrelated placeholder shape.
function SkeletonCard({ children }: { children: ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Skeleton style={styles.headerIcon} />
          <Skeleton style={styles.headerTitle} />
        </View>
        <Skeleton style={styles.headerChevron} />
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...elevation.card,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: colors.border.default,
  },
  headerTitle: {
    width: 140,
    height: 16,
    borderRadius: radius.sm,
    backgroundColor: colors.border.default,
  },
  headerChevron: {
    width: 18,
    height: 18,
    borderRadius: radius.sm,
    backgroundColor: colors.border.default,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  filterBar: {
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.border.default,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statCard: {
    flex: 1,
    height: 88,
    borderRadius: radius.lg,
    backgroundColor: colors.border.default,
  },
  statCardWide: {
    flex: 1,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.border.default,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  badgeTile: {
    width: 58,
    alignItems: "center",
    gap: spacing.xs,
  },
  badgeCircle: {
    width: 58,
    height: 58,
    borderRadius: radius.full,
    backgroundColor: colors.border.default,
  },
  badgeLabel: {
    width: 48,
    height: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.border.default,
  },
  mapRect: {
    height: 260,
    borderRadius: radius.lg,
    backgroundColor: colors.border.default,
  },
  photoRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  photoThumb: {
    width: 90,
    height: 90,
    borderRadius: radius.md,
    backgroundColor: colors.border.default,
  },
});

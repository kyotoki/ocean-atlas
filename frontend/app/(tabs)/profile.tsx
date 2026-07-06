import { Ionicons } from "@expo/vector-icons";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AdventureDetailModal from "../../components/map/AdventureDetailModal";
import DiveMapView from "../../components/map/DiveMapView";
import AccordionSection from "../../components/profile/AccordionSection";
import EditProfileModal from "../../components/profile/EditProfileModal";
import GearManagerModal from "../../components/profile/GearManagerModal";
import MapStylePickerModal from "../../components/profile/MapStylePickerModal";
import PrivacyControlsModal from "../../components/profile/PrivacyControlsModal";
import ProfileCoreCard from "../../components/profile/ProfileCoreCard";
import SegmentedControl from "../../components/profile/SegmentedControl";
import SettingsRow from "../../components/profile/SettingsRow";
import StatCard from "../../components/profile/StatCard";
import WaveSpinner from "../../components/ui/WaveSpinner";
import { ENDPOINTS } from "../../constants/api";
import { usePreferences } from "../../contexts/PreferencesContext";
import { ActivityStats, ActivityType, Adventure } from "../../types/adventure";
import { useAuthedFetch } from "../../utils/api";
import {
  DEFAULT_LOCAL_PROFILE,
  loadLocalProfile,
  LocalProfileFields,
  saveLocalProfile,
} from "../../utils/profileStorage";
import { formatDepth } from "../../utils/units";

const ACHIEVEMENTS = [
  { name: "Night Owl", icon: "moon-outline" as const },
  { name: "Deep Diver", icon: "arrow-down-circle-outline" as const },
  { name: "Snorkel Squad", icon: "people-outline" as const },
  { name: "Century Club", icon: "trophy-outline" as const },
];

const UNIT_SYSTEM_OPTIONS = [
  { value: "metric" as const, label: "Metric" },
  { value: "imperial" as const, label: "Imperial" },
];

const MAP_STYLE_LABELS = {
  standard: "Standard",
  satellite: "Satellite",
  hybrid: "Hybrid",
};

function formatHours(totalMinutes: number): string {
  return `${(totalMinutes / 60).toFixed(1)} hrs`;
}

const ACTIVITY_TAB_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: "scuba", label: "Scuba" },
  { value: "snorkeling", label: "Snorkeling" },
];

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const authedFetch = useAuthedFetch();
  const { unitSystem, mapStyle, setUnitSystem, setMapStyle } = usePreferences();

  const [localProfile, setLocalProfile] = useState<LocalProfileFields>(DEFAULT_LOCAL_PROFILE);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  const [scubaStats, setScubaStats] = useState<ActivityStats | null>(null);
  const [snorkelingStats, setSnorkelingStats] = useState<ActivityStats | null>(null);
  const [activeActivityTab, setActiveActivityTab] = useState<ActivityType>("scuba");
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  const [isGearModalVisible, setIsGearModalVisible] = useState(false);
  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);
  const [isPrivacyModalVisible, setIsPrivacyModalVisible] = useState(false);
  const [isMapStylePickerVisible, setIsMapStylePickerVisible] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    let cancelled = false;
    loadLocalProfile(user.id).then((fields) => {
      if (!cancelled) {
        setLocalProfile(fields);
        setIsProfileLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const updateLocalProfile = useCallback(
    (patch: Partial<LocalProfileFields>) => {
      setLocalProfile((prev) => {
        const next = { ...prev, ...patch };
        if (user?.id) {
          saveLocalProfile(user.id, next);
        }
        return next;
      });
    },
    [user?.id]
  );

  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [adventuresResponse, scubaResponse, snorkelingResponse] = await Promise.all([
        authedFetch(ENDPOINTS.adventures),
        authedFetch(ENDPOINTS.statsByActivity("scuba")),
        authedFetch(ENDPOINTS.statsByActivity("snorkeling")),
      ]);
      for (const response of [adventuresResponse, scubaResponse, snorkelingResponse]) {
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
      }
      setAdventures(await adventuresResponse.json());
      setScubaStats(await scubaResponse.json());
      setSnorkelingStats(await snorkelingResponse.json());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to reach the Ocean Atlas server."
      );
    } finally {
      setIsLoading(false);
    }
  }, [authedFetch]);

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [fetchProfileData])
  );

  const handleLogOut = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  const displayName = user?.fullName?.trim() || user?.username || "Ocean Explorer";
  const email = user?.primaryEmailAddress?.emailAddress;
  const recentPhotos = adventures.filter((a) => a.photo_url);
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={["#02101F", "#062C43", "#0B3D5C"]} style={styles.header}>
          <View style={styles.avatarWrap}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={30} color="#FFFFFF" />
              </View>
            )}
            <Pressable
              style={styles.avatarEditBadge}
              hitSlop={8}
              onPress={() =>
                Alert.alert(
                  "Coming soon",
                  "Profile photo uploads will be available in a future update."
                )
              }
            >
              <Ionicons name="camera" size={14} color="#0B3D5C" />
            </Pressable>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          {email ? <Text style={styles.email}>{email}</Text> : null}
        </LinearGradient>

        {isProfileLoaded && (
          <ProfileCoreCard profile={localProfile} onUpdate={updateLocalProfile} />
        )}

        {isLoading ? (
          <View style={styles.centered}>
            <WaveSpinner size="large" color="#0B3D91" />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons name="cloud-offline-outline" size={36} color="#B00020" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <AccordionSection title="Adventure Analytics" icon="analytics-outline" defaultExpanded>
              <SegmentedControl
                options={ACTIVITY_TAB_OPTIONS}
                value={activeActivityTab}
                onChange={setActiveActivityTab}
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
                      icon="water-outline"
                      label="Total Snorkeling Trips"
                      value={String(snorkelingStats?.total_trips ?? 0)}
                    />
                    <StatCard
                      icon="time-outline"
                      label="Total Surface Time"
                      value={formatHours(snorkelingStats?.total_minutes ?? 0)}
                    />
                  </View>
                  <View style={styles.statsGridRow}>
                    <StatCard
                      icon="arrow-down-outline"
                      label="Deepest Snorkel Breath"
                      value={
                        snorkelingStats?.deepest_meters != null
                          ? formatDepth(snorkelingStats.deepest_meters, unitSystem)
                          : "—"
                      }
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

            <AccordionSection
              title="Personal Ocean Map"
              icon="map-outline"
              lazy
              onExpandedChange={setIsMapExpanded}
            >
              <View style={styles.miniMapWrap}>
                <DiveMapView
                  adventures={adventures}
                  onSelectAdventure={setSelectedAdventure}
                  invalidateSizeTrigger={isMapExpanded}
                />
              </View>
            </AccordionSection>

            <AccordionSection title="Media & Milestone Gallery" icon="images-outline">
              <Text style={styles.subLabel}>RECENT PHOTOS</Text>
              {recentPhotos.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.photoRow}
                >
                  {recentPhotos.map((adventure) => (
                    <Image
                      key={adventure.id}
                      source={{ uri: adventure.photo_url! }}
                      style={styles.photoThumb}
                    />
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.emptyGalleryText}>
                  No photos yet. Add one next time you log a dive.
                </Text>
              )}

              <Text style={[styles.subLabel, styles.achievementsLabel]}>ACHIEVEMENTS</Text>
              <View style={styles.achievementsGrid}>
                {ACHIEVEMENTS.map((achievement) => (
                  <View key={achievement.name} style={styles.achievementTile}>
                    <Ionicons name={achievement.icon} size={22} color="#94A3B8" />
                    <Text style={styles.achievementName}>{achievement.name}</Text>
                    <View style={styles.lockBadge}>
                      <Ionicons name="lock-closed" size={10} color="#FFFFFF" />
                    </View>
                  </View>
                ))}
              </View>
            </AccordionSection>

            <AccordionSection title="My Gear" icon="bag-handle-outline">
              <SettingsRow
                icon="construct-outline"
                label="Manage Equipment"
                subtext={
                  localProfile.gear.length > 0
                    ? `${localProfile.gear.length} item${localProfile.gear.length === 1 ? "" : "s"} tracked`
                    : "Add your wetsuit, fins, computer & more"
                }
                onPress={() => setIsGearModalVisible(true)}
              />
            </AccordionSection>

            <AccordionSection title="Preferences & Units" icon="options-outline">
              <SettingsRow
                icon="thermometer-outline"
                label="Unit Measurements"
                rightElement={
                  <View style={styles.unitToggleWrap}>
                    <SegmentedControl
                      options={UNIT_SYSTEM_OPTIONS}
                      value={unitSystem}
                      onChange={setUnitSystem}
                    />
                  </View>
                }
              />
              <SettingsRow
                icon="map-outline"
                label="Map Preferences"
                subtext={MAP_STYLE_LABELS[mapStyle]}
                onPress={() => setIsMapStylePickerVisible(true)}
              />
            </AccordionSection>

            <AccordionSection title="Account & Premium" icon="person-circle-outline">
              <SettingsRow
                icon="create-outline"
                label="Edit Profile"
                subtext="Name, email, bio & home country"
                onPress={() => setIsEditProfileVisible(true)}
              />
              <SettingsRow
                icon="star"
                label="Ocean Atlas Pro"
                subtext="Unlock premium features"
                highlighted
                onPress={() =>
                  Alert.alert("Ocean Atlas Pro", "Premium subscriptions are coming soon!")
                }
              />
              <SettingsRow
                icon="lock-closed-outline"
                label="Privacy Controls"
                subtext="Manage who can see your map & logs"
                onPress={() => setIsPrivacyModalVisible(true)}
              />
            </AccordionSection>
          </>
        )}

        <View style={styles.utilitiesCard}>
          <SettingsRow
            icon="add-circle"
            label="Add New Adventure"
            onPress={() => router.push("/log")}
          />
          <View style={styles.utilitiesDivider} />
          <Pressable style={styles.logOutRow} onPress={handleLogOut}>
            <View style={styles.logOutIconBadge}>
              <Ionicons name="log-out-outline" size={17} color="#B00020" />
            </View>
            <Text style={styles.logOutLabel}>Log Out</Text>
          </Pressable>
          <Text style={styles.versionText}>Ocean Atlas v{appVersion} (Production Build)</Text>
        </View>
      </ScrollView>

      <AdventureDetailModal
        key={selectedAdventure?.id ?? "none"}
        adventure={selectedAdventure}
        onClose={() => setSelectedAdventure(null)}
      />

      <GearManagerModal
        visible={isGearModalVisible}
        onClose={() => setIsGearModalVisible(false)}
        gear={localProfile.gear}
        adventures={adventures}
        onUpdate={(gear) => updateLocalProfile({ gear })}
      />

      <EditProfileModal
        visible={isEditProfileVisible}
        onClose={() => setIsEditProfileVisible(false)}
        profile={localProfile}
        onUpdateProfile={updateLocalProfile}
      />

      <PrivacyControlsModal
        visible={isPrivacyModalVisible}
        onClose={() => setIsPrivacyModalVisible(false)}
      />

      <MapStylePickerModal
        visible={isMapStylePickerVisible}
        onClose={() => setIsMapStylePickerVisible(false)}
        value={mapStyle}
        onSelect={setMapStyle}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F6FC",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 16,
  },
  avatarWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: "rgba(6, 182, 212, 0.6)",
    padding: 3,
    marginBottom: 14,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 39,
  },
  avatarPlaceholder: {
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#0B3D5C",
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  email: {
    fontSize: 13,
    color: "#8FB8CE",
    marginTop: 4,
  },
  segmentedControlSpacer: {
    height: 14,
  },
  statsGridRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  miniMapWrap: {
    height: 260,
    borderRadius: 14,
    overflow: "hidden",
  },
  subLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  achievementsLabel: {
    marginTop: 18,
  },
  photoRow: {
    gap: 10,
  },
  photoThumb: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
  },
  emptyGalleryText: {
    fontSize: 13,
    color: "#94A3B8",
    fontStyle: "italic",
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  achievementTile: {
    width: "31%",
    aspectRatio: 1,
    backgroundColor: "#F2F6FC",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    position: "relative",
  },
  achievementName: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  lockBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
  },
  unitToggleWrap: {
    width: 160,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 10,
  },
  errorText: {
    fontSize: 13,
    color: "#5A6B87",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  utilitiesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 2,
    padding: 16,
    shadowColor: "#021019",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  utilitiesDivider: {
    height: 1,
    backgroundColor: "#F2F6FC",
    marginVertical: 4,
  },
  logOutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  logOutIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FBEAEA",
    alignItems: "center",
    justifyContent: "center",
  },
  logOutLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#B00020",
  },
  versionText: {
    fontSize: 11,
    color: "#B7C2D0",
    textAlign: "center",
    marginTop: 12,
  },
});

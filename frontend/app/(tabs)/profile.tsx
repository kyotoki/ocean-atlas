import { Ionicons } from "@expo/vector-icons";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AdventureDetailModal from "../../components/map/AdventureDetailModal";
import DiveMapView from "../../components/map/DiveMapView";
import AccordionSection from "../../components/profile/AccordionSection";
import AchievementBadge from "../../components/profile/AchievementBadge";
import AchievementDetailModal from "../../components/profile/AchievementDetailModal";
import CertificationsModal from "../../components/profile/CertificationsModal";
import EditProfileModal from "../../components/profile/EditProfileModal";
import GearManagerModal from "../../components/profile/GearManagerModal";
import MapStylePickerModal from "../../components/profile/MapStylePickerModal";
import PrivacyControlsModal from "../../components/profile/PrivacyControlsModal";
import ProfileCoreCard from "../../components/profile/ProfileCoreCard";
import SegmentedControl from "../../components/profile/SegmentedControl";
import SettingsCogButton from "../../components/profile/SettingsCogButton";
import SettingsMenuModal from "../../components/profile/SettingsMenuModal";
import SvelProModal from "../../components/profile/SvelProModal";
import SettingsRow from "../../components/profile/SettingsRow";
import StatCard from "../../components/profile/StatCard";
import WaveSpinner from "../../components/ui/WaveSpinner";
import { ENDPOINTS } from "../../constants/api";
import { TAB_BAR_HEIGHT } from "../../constants/layout";
import { usePreferences } from "../../contexts/PreferencesContext";
import { ActivityStats, ActivityType, Adventure } from "../../types/adventure";
import { Achievement, buildAchievements } from "../../utils/achievements";
import { useAuthedFetch } from "../../utils/api";
import { CERTIFICATIONS } from "../../utils/certifications";
import { countryCodeToFlag, COUNTRIES } from "../../utils/countries";
import { showAlert } from "../../utils/crossPlatformAlert";
import {
  DEFAULT_LOCAL_PROFILE,
  loadLocalProfile,
  LocalProfileFields,
  saveLocalProfile,
} from "../../utils/profileStorage";
import { formatDepth } from "../../utils/units";

const MAP_STYLE_LABELS = {
  standard: "Standard",
  satellite: "Satellite",
  hybrid: "Hybrid",
};

function formatHours(totalMinutes: number): string {
  return `${(totalMinutes / 60).toFixed(1)} hrs`;
}

function formatSnorkelDuration(totalMinutes: number): string {
  return `${(totalMinutes / 60).toFixed(1)} Hours`;
}

const ACTIVITY_TAB_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: "scuba", label: "Scuba" },
  { value: "snorkeling", label: "Snorkeling" },
];

// LayoutAnimation is opt-in on Android; iOS and web (a documented no-op there
// - RN Web's UIManager.configureNextLayoutAnimation just resolves its
// callback immediately) don't need this.
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  const [isSettingsMenuVisible, setIsSettingsMenuVisible] = useState(false);
  const [isSvelProModalVisible, setIsSvelProModalVisible] = useState(false);
  const [isCertificationsModalVisible, setIsCertificationsModalVisible] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

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

  const toggleCertification = useCallback(
    (value: string) => {
      setLocalProfile((prev) => {
        const nextCertifications = prev.certifications.includes(value)
          ? prev.certifications.filter((c) => c !== value)
          : [...prev.certifications, value];
        const next = { ...prev, certifications: nextCertifications };
        if (user?.id) {
          saveLocalProfile(user.id, next);
        }
        return next;
      });
    },
    [user?.id]
  );

  const achievements = useMemo(
    () => buildAchievements(adventures, localProfile.gear, localProfile.certifications),
    [adventures, localProfile.gear, localProfile.certifications]
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
        err instanceof Error ? err.message : "Unable to reach the Svel server."
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

  const handleDeleteAdventure = async (adventure: Adventure) => {
    try {
      const response = await authedFetch(ENDPOINTS.adventure(adventure.id), {
        method: "DELETE",
      });
      if (!response.ok && response.status !== 204) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      setAdventures((prev) => prev.filter((a) => a.id !== adventure.id));
      setSelectedAdventure(null);
    } catch (err) {
      showAlert(
        "Unable to delete adventure",
        err instanceof Error ? err.message : "Check that the Svel server is running."
      );
    }
  };

  const handleAvatarPress = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert(
        "Photo library access needed",
        "Enable photo library access in Settings to change your profile photo."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      updateLocalProfile({ photoUri: result.assets[0].uri });
    }
  };

  const handleLogOut = () => {
    showAlert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          setIsSettingsMenuVisible(false);
          setLocalProfile(DEFAULT_LOCAL_PROFILE);
          setIsProfileLoaded(false);
          setAdventures([]);
          setScubaStats(null);
          setSnorkelingStats(null);
          signOut();
        },
      },
    ]);
  };

  const openEditProfile = () => {
    setIsSettingsMenuVisible(false);
    setIsEditProfileVisible(true);
  };

  const openGearManager = () => {
    setIsSettingsMenuVisible(false);
    setIsGearModalVisible(true);
  };

  const openPrivacyControls = () => {
    setIsSettingsMenuVisible(false);
    setIsPrivacyModalVisible(true);
  };

  const openMapStylePicker = () => {
    setIsSettingsMenuVisible(false);
    setIsMapStylePickerVisible(true);
  };

  const openSvelPro = () => {
    setIsSettingsMenuVisible(false);
    setIsSvelProModalVisible(true);
  };

  const handleActivityTabChange = (next: ActivityType) => {
    // Scuba and Snorkeling show a different set/count of StatCards, so this
    // keeps the swap a soft fade rather than an instant jump.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveActivityTab(next);
  };

  const displayName = user?.fullName?.trim() || user?.username || "Ocean Explorer";
  const avatarUri = localProfile.photoUri ?? user?.imageUrl ?? null;
  const hasBio = Boolean(localProfile.bio && localProfile.bio.trim());
  const homeCountry = COUNTRIES.find((c) => c.code === localProfile.homeCountryCode);
  const recentPhotos = adventures.filter((a) => a.photos.length > 0);
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={["#02101F", "#062C43", "#0B3D5C"]} style={styles.header}>
          <View style={styles.settingsCogWrap}>
            <SettingsCogButton onPress={() => setIsSettingsMenuVisible(true)} />
          </View>
          <Pressable
            style={({ pressed }) => [styles.avatarWrap, pressed && styles.avatarWrapPressed]}
            onPress={handleAvatarPress}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={30} color="#FFFFFF" />
              </View>
            )}
            <View style={styles.avatarOverlay}>
              <Ionicons name="camera" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={14} color="#0B3D5C" />
            </View>
          </Pressable>
          <View style={styles.identityCard}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={hasBio ? styles.bio : styles.bioPlaceholder} numberOfLines={2}>
              {hasBio ? localProfile.bio : "Add a bio..."}
            </Text>
            <View style={styles.homeCountryRow}>
              {homeCountry ? (
                <>
                  <Text style={styles.homeCountryFlag}>{countryCodeToFlag(homeCountry.code)}</Text>
                  <Text style={styles.homeCountryText}>{homeCountry.name}</Text>
                </>
              ) : (
                <Text style={styles.homeCountryPlaceholder}>Select your home country</Text>
              )}
            </View>
          </View>
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
                onChange={handleActivityTabChange}
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

            <AccordionSection title="Achievement Milestone Matrix" icon="trophy-outline" defaultExpanded>
              <Text style={styles.subLabel}>SCUBA MILESTONES</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.achievementScrollRow}
              >
                {achievements.scuba.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    onPress={setSelectedAchievement}
                  />
                ))}
              </ScrollView>

              <Text style={[styles.subLabel, styles.subLabelSpaced]}>SNORKEL MILESTONES</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.achievementScrollRow}
              >
                {achievements.snorkel.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    onPress={setSelectedAchievement}
                  />
                ))}
              </ScrollView>

              <Text style={[styles.subLabel, styles.subLabelSpaced]}>CERTIFICATIONS</Text>
              <View style={styles.achievementRow}>
                {achievements.certification.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    onPress={setSelectedAchievement}
                  />
                ))}
              </View>
              <SettingsRow
                icon="ribbon-outline"
                label="My Certifications & Licenses"
                subtext={
                  localProfile.certifications.length > 0
                    ? `${localProfile.certifications.length} of ${CERTIFICATIONS.length} logged`
                    : "Log your real-world diving credentials"
                }
                onPress={() => setIsCertificationsModalVisible(true)}
              />

              <Text style={[styles.subLabel, styles.subLabelSpaced]}>GLOBAL & ADVENTURE</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.achievementScrollRow}
              >
                {achievements.global.map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    onPress={setSelectedAchievement}
                  />
                ))}
              </ScrollView>
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
                    <View key={adventure.id} style={styles.photoThumbWrap}>
                      <Image source={{ uri: adventure.photos[0] }} style={styles.photoThumb} />
                      <View style={styles.photoDurationPill}>
                        <Text style={styles.photoDurationPillText}>
                          ⏱️ {adventure.duration_minutes}m
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.emptyGalleryText}>
                  No photos yet. Add one next time you log an adventure.
                </Text>
              )}
            </AccordionSection>
          </>
        )}

        <View style={styles.utilitiesCard}>
          <SettingsRow
            icon="add-circle"
            label="Add New Adventure"
            onPress={() => router.push("/log")}
          />
        </View>
      </ScrollView>

      <AdventureDetailModal
        key={selectedAdventure?.id ?? "none"}
        adventure={selectedAdventure}
        onClose={() => setSelectedAdventure(null)}
        onDelete={handleDeleteAdventure}
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

      <SettingsMenuModal
        visible={isSettingsMenuVisible}
        onClose={() => setIsSettingsMenuVisible(false)}
        onEditProfile={openEditProfile}
        onManageGear={openGearManager}
        onOpenSvelPro={openSvelPro}
        onPrivacyControls={openPrivacyControls}
        onMapPreferences={openMapStylePicker}
        gearSubtext={
          localProfile.gear.length > 0
            ? `${localProfile.gear.length} item${localProfile.gear.length === 1 ? "" : "s"} tracked`
            : "Add your wetsuit, fins, computer & more"
        }
        unitSystem={unitSystem}
        onUnitSystemChange={setUnitSystem}
        mapStyleLabel={MAP_STYLE_LABELS[mapStyle]}
        onLogOut={handleLogOut}
        appVersion={appVersion}
      />

      <SvelProModal
        visible={isSvelProModalVisible}
        onClose={() => setIsSvelProModalVisible(false)}
      />

      <CertificationsModal
        visible={isCertificationsModalVisible}
        onClose={() => setIsCertificationsModalVisible(false)}
        certifications={localProfile.certifications}
        onToggle={toggleCertification}
      />

      <AchievementDetailModal
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
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
    paddingBottom: 40 + TAB_BAR_HEIGHT,
  },
  header: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 16,
  },
  settingsCogWrap: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
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
  avatarWrapPressed: {
    opacity: 0.85,
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
  avatarOverlay: {
    position: "absolute",
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    borderRadius: 39,
    backgroundColor: "rgba(2, 16, 25, 0.28)",
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
  identityCard: {
    alignSelf: "stretch",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 4,
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  bio: {
    fontSize: 13,
    fontWeight: "500",
    color: "#C7DCE8",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 6,
  },
  bioPlaceholder: {
    fontSize: 13,
    fontWeight: "500",
    fontStyle: "italic",
    color: "#6E93A8",
    textAlign: "center",
    marginTop: 6,
  },
  homeCountryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  homeCountryFlag: {
    fontSize: 14,
  },
  homeCountryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8FB8CE",
  },
  homeCountryPlaceholder: {
    fontSize: 12,
    fontWeight: "500",
    fontStyle: "italic",
    color: "#6E93A8",
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
  subLabelSpaced: {
    marginTop: 18,
  },
  photoRow: {
    gap: 10,
  },
  photoThumbWrap: {
    position: "relative",
    // Without this, the wrapper stretches to the horizontal ScrollView row's
    // full cross-axis height (flexbox's default alignItems: "stretch"),
    // so the pill's `bottom` would anchor to that stretched height instead
    // of the 90px-tall image actually visible inside it.
    alignSelf: "flex-start",
  },
  photoThumb: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
  },
  photoDurationPill: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(2, 16, 25, 0.68)",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  photoDurationPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyGalleryText: {
    fontSize: 13,
    color: "#94A3B8",
    fontStyle: "italic",
  },
  achievementScrollRow: {
    flexDirection: "row",
    gap: 14,
    paddingBottom: 4,
  },
  achievementRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    paddingBottom: 4,
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
});

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LayoutAnimation, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AchievementsSection from "../../components/profile/AchievementsSection";
import AdventureAnalyticsSection from "../../components/profile/AdventureAnalyticsSection";
import MediaGallerySection from "../../components/profile/MediaGallerySection";
import PersonalMapSection from "../../components/profile/PersonalMapSection";
import ProfileCoreCard from "../../components/profile/ProfileCoreCard";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileModals from "../../components/profile/ProfileModals";
import SettingsRow from "../../components/profile/SettingsRow";
import PendingSyncBadge from "../../components/ui/PendingSyncBadge";
import WaveSpinner from "../../components/ui/WaveSpinner";
import { TAB_BAR_HEIGHT } from "../../constants/layout";
import { colors, elevation, radius, spacing, typography } from "../../constants/theme";
import { useProfileData } from "../../hooks/useProfileData";
import { ActivityType } from "../../types/adventure";
import "../../utils/enableLayoutAnimation";

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useProfileData();

  const handleActivityTabChange = (next: ActivityType) => {
    // Scuba and Snorkeling show a different set/count of StatCards, so this
    // keeps the swap a soft fade rather than an instant jump.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    profile.handleActivityTabChange(next);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProfileHeader
          avatarUri={profile.avatarUri}
          onAvatarPress={profile.handleAvatarPress}
          onOpenSettings={() => profile.setIsSettingsMenuVisible(true)}
          displayName={profile.displayName}
          hasBio={profile.hasBio}
          bio={profile.localProfile.bio}
          homeCountry={profile.homeCountry}
          countryCodeToFlag={profile.countryCodeToFlag}
        />

        {profile.isProfileLoaded && (
          <ProfileCoreCard profile={profile.localProfile} onUpdate={profile.updateLocalProfile} />
        )}

        {profile.isLoading ? (
          <View style={styles.centered}>
            <WaveSpinner size="large" color={colors.primary} />
          </View>
        ) : profile.error ? (
          <View style={styles.centered}>
            <Ionicons name="cloud-offline-outline" size={36} color={colors.error} />
            <Text style={styles.errorText}>{profile.error}</Text>
          </View>
        ) : (
          <>
            <View style={styles.syncBadgeRow}>
              <PendingSyncBadge />
            </View>

            <AdventureAnalyticsSection
              activeActivityTab={profile.activeActivityTab}
              onActivityTabChange={handleActivityTabChange}
              scubaStats={profile.scubaStats}
              snorkelingStats={profile.snorkelingStats}
              unitSystem={profile.unitSystem}
            />

            <AchievementsSection
              achievements={profile.achievements}
              certificationsLoggedCount={profile.localProfile.certifications.length}
              onSelectAchievement={profile.setSelectedAchievement}
              onOpenCertifications={() => profile.setIsCertificationsModalVisible(true)}
            />

            <PersonalMapSection
              adventures={profile.adventures}
              onSelectAdventure={profile.setSelectedAdventure}
              isMapExpanded={profile.isMapExpanded}
              onExpandedChange={profile.setIsMapExpanded}
            />

            <MediaGallerySection recentPhotos={profile.recentPhotos} />
          </>
        )}

        <View style={styles.utilitiesCard}>
          <SettingsRow icon="add-circle" label="Add New Adventure" onPress={() => router.push("/log")} />
        </View>
      </ScrollView>

      <ProfileModals
        selectedAdventure={profile.selectedAdventure}
        onCloseAdventure={() => profile.setSelectedAdventure(null)}
        onDeleteAdventure={profile.handleDeleteAdventure}
        isGearModalVisible={profile.isGearModalVisible}
        onCloseGearModal={() => profile.setIsGearModalVisible(false)}
        gear={profile.localProfile.gear}
        adventures={profile.adventures}
        onUpdateGear={(gear) => profile.updateLocalProfile({ gear })}
        isEditProfileVisible={profile.isEditProfileVisible}
        onCloseEditProfile={() => profile.setIsEditProfileVisible(false)}
        profile={profile.localProfile}
        onUpdateProfile={profile.updateLocalProfile}
        isPrivacyModalVisible={profile.isPrivacyModalVisible}
        onClosePrivacyModal={() => profile.setIsPrivacyModalVisible(false)}
        isMapStylePickerVisible={profile.isMapStylePickerVisible}
        onCloseMapStylePicker={() => profile.setIsMapStylePickerVisible(false)}
        mapStyle={profile.mapStyle}
        onSelectMapStyle={profile.setMapStyle}
        isSettingsMenuVisible={profile.isSettingsMenuVisible}
        onCloseSettingsMenu={() => profile.setIsSettingsMenuVisible(false)}
        onEditProfile={profile.openEditProfile}
        onManageGear={profile.openGearManager}
        onOpenSvelPro={profile.openSvelPro}
        onPrivacyControls={profile.openPrivacyControls}
        onMapPreferences={profile.openMapStylePicker}
        unitSystem={profile.unitSystem}
        onUnitSystemChange={profile.setUnitSystem}
        onLogOut={profile.handleLogOut}
        appVersion={profile.appVersion}
        isSvelProModalVisible={profile.isSvelProModalVisible}
        onCloseSvelProModal={() => profile.setIsSvelProModalVisible(false)}
        isCertificationsModalVisible={profile.isCertificationsModalVisible}
        onCloseCertificationsModal={() => profile.setIsCertificationsModalVisible(false)}
        certifications={profile.localProfile.certifications}
        onToggleCertification={profile.toggleCertification}
        selectedAchievement={profile.selectedAchievement}
        onCloseAchievement={() => profile.setSelectedAchievement(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.page,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl + TAB_BAR_HEIGHT,
  },
  syncBadgeRow: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  errorText: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
  utilitiesCard: {
    backgroundColor: colors.surface.card,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.xxs,
    padding: spacing.md,
    ...elevation.card,
  },
});

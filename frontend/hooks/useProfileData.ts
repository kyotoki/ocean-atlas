import { useClerk, useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ENDPOINTS } from "../constants/api";
import { usePreferences } from "../contexts/PreferencesContext";
import { ActivityStats, ActivityType, Adventure } from "../types/adventure";
import { Achievement, buildAchievements } from "../utils/achievements";
import { useAuthedFetch } from "../utils/api";
import { countryCodeToFlag, COUNTRIES } from "../utils/countries";
import { showAlert } from "../utils/crossPlatformAlert";
import {
  DEFAULT_LOCAL_PROFILE,
  loadLocalProfile,
  LocalProfileFields,
  saveLocalProfile,
} from "../utils/profileStorage";

export function useProfileData() {
  const { user } = useUser();
  const { signOut } = useClerk();
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
      setError(err instanceof Error ? err.message : "Unable to reach the Svel server.");
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
    setActiveActivityTab(next);
  };

  const displayName = user?.fullName?.trim() || user?.username || "Ocean Explorer";
  const avatarUri = localProfile.photoUri ?? user?.imageUrl ?? null;
  const hasBio = Boolean(localProfile.bio && localProfile.bio.trim());
  const homeCountry = COUNTRIES.find((c) => c.code === localProfile.homeCountryCode);
  const recentPhotos = adventures.filter((a) => a.photos.length > 0);
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  return {
    localProfile,
    isProfileLoaded,
    scubaStats,
    snorkelingStats,
    activeActivityTab,
    adventures,
    isLoading,
    error,
    selectedAdventure,
    isMapExpanded,
    isGearModalVisible,
    isEditProfileVisible,
    isPrivacyModalVisible,
    isMapStylePickerVisible,
    isSettingsMenuVisible,
    isSvelProModalVisible,
    isCertificationsModalVisible,
    selectedAchievement,
    achievements,
    unitSystem,
    mapStyle,
    setUnitSystem,
    setMapStyle,
    displayName,
    avatarUri,
    hasBio,
    homeCountry,
    recentPhotos,
    appVersion,
    setSelectedAdventure,
    setIsMapExpanded,
    setIsGearModalVisible,
    setIsEditProfileVisible,
    setIsPrivacyModalVisible,
    setIsMapStylePickerVisible,
    setIsSettingsMenuVisible,
    setIsSvelProModalVisible,
    setIsCertificationsModalVisible,
    setSelectedAchievement,
    updateLocalProfile,
    toggleCertification,
    handleDeleteAdventure,
    handleAvatarPress,
    handleLogOut,
    openEditProfile,
    openGearManager,
    openPrivacyControls,
    openMapStylePicker,
    openSvelPro,
    handleActivityTabChange,
    countryCodeToFlag,
  };
}

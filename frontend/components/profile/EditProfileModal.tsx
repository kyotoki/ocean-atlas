import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { countryCodeToFlag, COUNTRIES } from "../../utils/countries";
import { showAlert } from "../../utils/crossPlatformAlert";
import { LocalProfileFields } from "../../utils/profileStorage";
import CountryPickerModal from "./CountryPickerModal";

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profile: LocalProfileFields;
  onUpdateProfile: (next: Partial<LocalProfileFields>) => void;
}

export default function EditProfileModal({
  visible,
  onClose,
  profile,
  onUpdateProfile,
}: EditProfileModalProps) {
  const { user } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [bioDraft, setBioDraft] = useState(profile.bio);
  const [isCountryPickerVisible, setIsCountryPickerVisible] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    if (visible) {
      setFirstName(user?.firstName ?? "");
      setLastName(user?.lastName ?? "");
      setBioDraft(profile.bio);
    }
  }, [visible, user, profile.bio]);

  const homeCountry = COUNTRIES.find((c) => c.code === profile.homeCountryCode);

  const handleClose = async () => {
    onUpdateProfile({ bio: bioDraft });
    const nameChanged = firstName !== (user?.firstName ?? "") || lastName !== (user?.lastName ?? "");
    if (nameChanged && user) {
      setIsSavingName(true);
      try {
        await user.update({ firstName, lastName });
      } catch {
        showAlert("Unable to update name", "Check your connection and try again.");
      } finally {
        setIsSavingName(false);
      }
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Edit Profile</Text>
            <Pressable onPress={handleClose} hitSlop={10}>
              <Ionicons name="close" size={20} color="#5A6B87" />
            </Pressable>
          </View>

          <Text style={styles.label}>NAME</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="First name"
              placeholderTextColor="#A0AEC0"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Last name"
              placeholderTextColor="#A0AEC0"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <Text style={styles.label}>EMAIL</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>
              {user?.primaryEmailAddress?.emailAddress ?? "—"}
            </Text>
          </View>
          <Text style={styles.helperText}>
            Changing your email requires verification and isn't available here yet.
          </Text>

          <Text style={styles.label}>BIO</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Add a short bio about your diving journey..."
            placeholderTextColor="#A0AEC0"
            value={bioDraft}
            onChangeText={setBioDraft}
            multiline
            numberOfLines={3}
            maxLength={280}
          />

          <Text style={styles.label}>HOME COUNTRY</Text>
          <Pressable style={styles.countryRow} onPress={() => setIsCountryPickerVisible(true)}>
            {homeCountry ? (
              <>
                <Text style={styles.flag}>{countryCodeToFlag(homeCountry.code)}</Text>
                <Text style={styles.countryName}>{homeCountry.name}</Text>
              </>
            ) : (
              <Text style={styles.countryPlaceholder}>Select your home country</Text>
            )}
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" style={styles.countryChevron} />
          </Pressable>

          <Pressable
            style={[styles.saveButton, isSavingName && styles.saveButtonDisabled]}
            onPress={handleClose}
            disabled={isSavingName}
          >
            <Text style={styles.saveButtonText}>{isSavingName ? "Saving..." : "Done"}</Text>
          </Pressable>

          <CountryPickerModal
            visible={isCountryPickerVisible}
            onClose={() => setIsCountryPickerVisible(false)}
            onSelect={(code) => onUpdateProfile({ homeCountryCode: code })}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(4, 20, 35, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    maxHeight: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#101828",
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 12,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  input: {
    backgroundColor: "#F2F6FC",
    borderWidth: 1,
    borderColor: "#D0D9E6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#101828",
  },
  bioInput: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  readOnlyField: {
    backgroundColor: "#F2F6FC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  readOnlyText: {
    fontSize: 14,
    color: "#5A6B87",
  },
  helperText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
    fontStyle: "italic",
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F2F6FC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  flag: {
    fontSize: 18,
  },
  countryName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#344054",
    flex: 1,
  },
  countryPlaceholder: {
    fontSize: 14,
    color: "#94A3B8",
    flex: 1,
  },
  countryChevron: {
    marginLeft: "auto",
  },
  saveButton: {
    marginTop: 18,
    backgroundColor: "#0B3D91",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});

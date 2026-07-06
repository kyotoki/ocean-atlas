import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { countryCodeToFlag, COUNTRIES } from "../../utils/countries";
import { LocalProfileFields } from "../../utils/profileStorage";
import CountryPickerModal from "./CountryPickerModal";

const CERTIFICATION_OPTIONS = [
  "Open Water",
  "Advanced Open Water",
  "Rescue Diver",
  "Divemaster",
  "Freediver",
  "Snorkel Master",
];

interface ProfileCoreCardProps {
  profile: LocalProfileFields;
  onUpdate: (next: Partial<LocalProfileFields>) => void;
}

export default function ProfileCoreCard({ profile, onUpdate }: ProfileCoreCardProps) {
  const [bioDraft, setBioDraft] = useState(profile.bio);
  const [isCountryPickerVisible, setIsCountryPickerVisible] = useState(false);

  const toggleCertification = (name: string) => {
    const next = profile.certifications.includes(name)
      ? profile.certifications.filter((c) => c !== name)
      : [...profile.certifications, name];
    onUpdate({ certifications: next });
  };

  const homeCountry = COUNTRIES.find((c) => c.code === profile.homeCountryCode);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>BIO</Text>
      <TextInput
        style={styles.bioInput}
        placeholder="Add a short bio about your diving journey..."
        placeholderTextColor="#A0AEC0"
        value={bioDraft}
        onChangeText={setBioDraft}
        onBlur={() => onUpdate({ bio: bioDraft })}
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

      <Text style={styles.label}>CERTIFICATIONS</Text>
      <View style={styles.chipsRow}>
        {CERTIFICATION_OPTIONS.map((name) => {
          const selected = profile.certifications.includes(name);
          return (
            <Pressable
              key={name}
              onPress={() => toggleCertification(name)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Ionicons
                name="ribbon-outline"
                size={13}
                color={selected ? "#FFFFFF" : "#0B3D5C"}
              />
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{name}</Text>
            </Pressable>
          );
        })}
      </View>

      <CountryPickerModal
        visible={isCountryPickerVisible}
        onClose={() => setIsCountryPickerVisible(false)}
        onSelect={(code) => onUpdate({ homeCountryCode: code })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    shadowColor: "#021019",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  bioInput: {
    fontSize: 14,
    color: "#344054",
    lineHeight: 20,
    minHeight: 60,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  countryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F2F6FC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
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
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EAF6FA",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipSelected: {
    backgroundColor: "#0B3D5C",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0B3D5C",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
});

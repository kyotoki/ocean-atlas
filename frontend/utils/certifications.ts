export interface CertificationOption {
  value: string;
  label: string;
}

// Single source of truth for certification values, shared between the inline
// chips in ProfileCoreCard.tsx and the dedicated CertificationsModal.tsx - both
// read/write the same LocalProfileFields.certifications array, so they must
// agree on the exact stored string per certification or a checkbox toggled in
// one surface won't show as selected in the other.
export const CERTIFICATIONS: CertificationOption[] = [
  { value: "Open Water", label: "Open Water (OW)" },
  { value: "Advanced Open Water", label: "Advanced Open Water (AOW)" },
  { value: "Rescue Diver", label: "Rescue Diver" },
  { value: "Divemaster", label: "Divemaster (DM)" },
  { value: "Freediver Level 1", label: "FreeDiver Level 1" },
];

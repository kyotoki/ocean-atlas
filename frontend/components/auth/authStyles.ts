import { StyleSheet } from "react-native";

export const DIVE_CYAN = "#06B6D4";
// Lightened from #6E93A8 - against the OceanAuthLayout gradient's lightest
// stop (#0B3D5C, blended under the input's translucent white fill) the old
// color measured only 2.75:1, below WCAG AA's 4.5:1 for normal text. This
// value holds >=4.5:1 across the gradient's full range (computed via actual
// relative-luminance contrast math), not just at its darkest stop.
export const PLACEHOLDER_COLOR = "#A4BBC8";

export const authStyles = StyleSheet.create({
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#FFFFFF",
    marginBottom: 12,
  },
  helperText: {
    color: "#8FB8CE",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  error: {
    color: "#FF9A8A",
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    backgroundColor: DIVE_CYAN,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#04202D",
    fontSize: 16,
    fontWeight: "700",
  },
  footerText: {
    color: "#8FB8CE",
    fontSize: 14,
  },
  footerLink: {
    color: DIVE_CYAN,
    fontSize: 14,
    fontWeight: "700",
  },
});

import { Alert, AlertButton, Platform } from "react-native";

// RN Web's Alert.alert is a hardcoded no-op (it never shows a dialog and
// never invokes any button's onPress), so every "confirm before doing X"
// flow built on it - delete, log out, etc. - silently does nothing when
// tapped on web, and every plain info/error alert silently shows nothing at
// all. This is a drop-in replacement for Alert.alert that falls back to
// window.alert/window.confirm on web, so callers don't have to special-case
// Platform.OS themselves at every call site.
export function showAlert(title: string, message?: string, buttons?: AlertButton[]): void {
  if (Platform.OS !== "web") {
    Alert.alert(title, message, buttons);
    return;
  }

  const combined = [title, message].filter(Boolean).join("\n\n");
  const list: AlertButton[] = buttons && buttons.length > 0 ? buttons : [{ text: "OK" }];

  // A single-button alert is purely informational - window.alert blocks
  // until dismissed, which is the right web equivalent.
  if (list.length === 1) {
    window.alert(combined);
    list[0].onPress?.();
    return;
  }

  // Multi-button alerts are a confirm/cancel choice. window.confirm can't
  // show custom button labels, but OK maps to the non-cancel (often
  // destructive) action and Cancel maps to the "cancel"-styled button.
  const cancelButton = list.find((b) => b.style === "cancel");
  const confirmButton = list.find((b) => b !== cancelButton) ?? list[list.length - 1];

  if (window.confirm(combined)) {
    confirmButton.onPress?.();
  } else {
    cancelButton?.onPress?.();
  }
}

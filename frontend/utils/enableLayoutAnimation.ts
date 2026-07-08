import { Platform, UIManager } from "react-native";

// LayoutAnimation is opt-in on Android; iOS and web (a documented no-op there
// - RN Web's UIManager.configureNextLayoutAnimation just resolves its
// callback immediately) don't need this. Side-effect-only: import for effect.
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// The bottom tab bar is now absolutely positioned (so its blur background can
// float over content) rather than reserving its own layout space, so screens
// need to add this much bottom padding themselves to avoid their lowest
// content sitting behind the floating bar. Keep this in sync with the
// `height` set on tabBarStyle in app/(tabs)/_layout.tsx.
export const TAB_BAR_HEIGHT = 60;

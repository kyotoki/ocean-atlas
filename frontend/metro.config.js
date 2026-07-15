const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// This Expo/Metro version (SDK 52) doesn't turn on package.json "exports"
// map resolution by default (confirmed: @expo/metro-config never sets this
// itself here) - posthog-react-native imports "@posthog/core/surveys",
// which only exists via that package's exports map (no literal
// node_modules/@posthog/core/surveys.js file), so it's unresolvable
// without this. Not a version mismatch or a stale lockfile - the package
// and its dependency were always correctly installed; Metro just wasn't
// looking at the map that declares the subpath.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;

// react-native-maps renders Apple Maps on iOS out of the box, but Android
// requires a Google Maps API key or the map surface stays blank. Set
// GOOGLE_MAPS_ANDROID_API_KEY in the environment before building for Android.
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY ?? "",
      },
    },
  },
});

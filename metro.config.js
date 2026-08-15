const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = withNativeWind(getDefaultConfig(__dirname), {
  input: "./global.css",
});

/**
 * Expo Go SDK 57 on some Android devices hard-crashes (SIGSEGV in libworklets)
 * when react-native-worklets initializes. Stubbing the JS package avoids the
 * native init path so Expo Go can load. See: github.com/expo/expo/issues/48390
 *
 * Apply AFTER withNativeWind so NativeWind does not overwrite this resolver.
 * Skip the stub on EAS / explicit native builds so Reanimated worklets work in APKs.
 */
const shouldStubWorklets =
  process.env.EAS_BUILD !== "true" &&
  process.env.EXPO_NO_WORKLETS_STUB !== "1";

const baseResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (shouldStubWorklets && moduleName === "react-native-worklets") {
    return { type: "empty" };
  }
  return baseResolveRequest
    ? baseResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

/**
 * Expo Go SDK 57 on some Android devices hard-crashes (SIGSEGV in libworklets)
 * when react-native-worklets initializes. Stubbing the JS package avoids the
 * native init path so Expo Go can load. See: github.com/expo/expo/issues/48390
 *
 * Remove this stub for development builds / production APKs where worklets
 * should run normally.
 */
const baseResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react-native-worklets") {
    return { type: "empty" };
  }
  return baseResolveRequest
    ? baseResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

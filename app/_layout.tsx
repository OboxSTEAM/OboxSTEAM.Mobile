import "../global.css";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: "#FAFAF5" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            animation: "none",
            contentStyle: { backgroundColor: "#000000" },
          }}
        />
        <Stack.Screen name="(guest)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </>
  );
}

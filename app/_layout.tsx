import "../global.css";

import { AuthProvider } from "@/lib/auth/auth-context";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
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
        <Stack.Screen name="(app)" />
        <Stack.Screen name="blocked" />
      </Stack>
    </AuthProvider>
  );
}

import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#FAFAF5" },
          headerTintColor: "#2D2D2D",
          contentStyle: { backgroundColor: "#FAFAF5" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "OboxSTEAM Parent", headerShown: true }}
        />
      </Stack>
    </>
  );
}

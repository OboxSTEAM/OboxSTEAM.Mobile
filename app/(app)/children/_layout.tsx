import { colors } from "@/lib/tokens/colors";
import { Stack } from "expo-router";

export default function ChildrenLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[studentId]/index"
        options={{ title: "Tiến độ của con" }}
      />
      <Stack.Screen
        name="[studentId]/enrollments/[enrollmentId]"
        options={{ title: "Chi tiết chương trình" }}
      />
    </Stack>
  );
}

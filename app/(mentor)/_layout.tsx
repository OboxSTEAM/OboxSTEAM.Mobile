import { useAuth } from "@/lib/auth/auth-context";
import {
  getHomeHrefForRole,
  isMentorRole,
} from "@/lib/auth/roles";
import { colors } from "@/lib/tokens/colors";
import { Redirect, Stack } from "expo-router";

export default function MentorLayout() {
  const { status, user } = useAuth();

  if (status === "guest") {
    return <Redirect href="/welcome" />;
  }
  if (status === "blocked") {
    return <Redirect href="/blocked" />;
  }
  if (status !== "authenticated") {
    return null;
  }
  if (!isMentorRole(user?.role)) {
    return <Redirect href={getHomeHrefForRole(user?.role)} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="today" />
      <Stack.Screen name="qr/[sessionId]" />
      <Stack.Screen name="capture/[sessionId]" />
    </Stack>
  );
}

import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth/auth-context";

export default function AppLayout() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "guest") {
      router.replace("/welcome");
    } else if (status === "blocked") {
      router.replace("/blocked");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FAFAF5" },
        headerTintColor: "#2D2D2D",
        contentStyle: { backgroundColor: "#FAFAF5" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Con của bạn" }} />
    </Stack>
  );
}

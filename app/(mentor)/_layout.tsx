import { AnimatedDock } from "@/components/animated-dock";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getHomeHrefForRole,
  isMentorRole,
} from "@/lib/auth/roles";
import { colors } from "@/lib/tokens/colors";
import { Redirect } from "expo-router";
import { Tabs } from "expo-router/js-tabs";

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
    <Tabs
      tabBar={(props) => <AnimatedDock {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Hôm nay",
          tabBarLabel: "Hôm nay",
        }}
      />
    </Tabs>
  );
}

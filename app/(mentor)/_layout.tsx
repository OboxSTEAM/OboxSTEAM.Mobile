import { RoleDock } from "@/components/role-dock";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getHomeHrefForRole,
  isMentorRole,
} from "@/lib/auth/roles";
import { colors } from "@/lib/tokens/colors";
import { Redirect } from "expo-router";
import { Tabs, type BottomTabBarProps } from "expo-router/js-tabs";
import { useCallback } from "react";

export default function MentorLayout() {
  const { status, user } = useAuth();

  const renderTabBar = useCallback((props: BottomTabBarProps) => {
    const focused = props.state.routes[props.state.index]?.name ?? "";
    if (focused.startsWith("qr")) return null;
    return <RoleDock {...props} />;
  }, []);

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
      tabBar={renderTabBar}
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
      <Tabs.Screen
        name="qr/[sessionId]"
        options={{
          href: null,
          title: "QR điểm danh",
        }}
      />
    </Tabs>
  );
}

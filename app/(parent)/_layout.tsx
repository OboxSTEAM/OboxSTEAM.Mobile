import { RoleDock } from "@/components/role-dock";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getHomeHrefForRole,
  isParentRole,
} from "@/lib/auth/roles";
import { NotificationsProvider } from "@/lib/notifications/notifications-context";
import { ChildrenProvider } from "@/lib/parent/children-context";
import { colors } from "@/lib/tokens/colors";
import { Redirect } from "expo-router";
import { Tabs } from "expo-router/js-tabs";

export default function ParentLayout() {
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
  if (!isParentRole(user?.role)) {
    return <Redirect href={getHomeHrefForRole(user?.role)} />;
  }

  return (
    <ChildrenProvider>
      <NotificationsProvider>
        <Tabs
          tabBar={(props) => <RoleDock {...props} />}
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: colors.background },
          }}
        >
          <Tabs.Screen
            name="children"
            options={{
              title: "Con của bạn",
              tabBarLabel: "Con",
            }}
          />
          <Tabs.Screen
            name="schedule"
            options={{
              title: "Lịch",
              tabBarLabel: "Lịch",
            }}
          />
          <Tabs.Screen
            name="notifications"
            options={{
              title: "Thông báo",
              tabBarLabel: "Thông báo",
            }}
          />
        </Tabs>
      </NotificationsProvider>
    </ChildrenProvider>
  );
}

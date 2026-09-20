import { RoleDock } from "@/components/role-dock";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getHomeHrefForRole,
  isStudentRole,
} from "@/lib/auth/roles";
import { colors } from "@/lib/tokens/colors";
import { Redirect } from "expo-router";
import { Tabs } from "expo-router/js-tabs";

export default function StudentLayout() {
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
  if (!isStudentRole(user?.role)) {
    return <Redirect href={getHomeHrefForRole(user?.role)} />;
  }

  return (
    <Tabs
      tabBar={(props) => <RoleDock {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Lịch",
          tabBarLabel: "Lịch",
        }}
      />
      <Tabs.Screen
        name="check-in"
        options={{
          title: "Check-in",
          tabBarLabel: "Check-in",
        }}
      />
    </Tabs>
  );
}

import { AnimatedDock } from "@/components/animated-dock";
import { useAuth } from "@/lib/auth/auth-context";
import { ChildrenProvider } from "@/lib/parent/children-context";
import { colors } from "@/lib/tokens/colors";
import { Redirect } from "expo-router";
import { Tabs } from "expo-router/js-tabs";

export default function AppLayout() {
  const { status } = useAuth();

  if (status === "guest") {
    return <Redirect href="/welcome" />;
  }
  if (status === "blocked") {
    return <Redirect href="/blocked" />;
  }
  if (status !== "authenticated") {
    return null;
  }

  return (
    <ChildrenProvider>
      <Tabs
        tabBar={(props) => <AnimatedDock {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.background },
        }}
      >
        <Tabs.Screen
          name="children"
          options={{
            title: "Con của bạn",
            tabBarLabel: "Con của bạn",
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: "Thông báo",
            tabBarLabel: "Thông báo",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Tài khoản",
            tabBarLabel: "Tài khoản",
          }}
        />
      </Tabs>
    </ChildrenProvider>
  );
}

import { DOCK_CONTENT_PADDING } from "@/components/animated-dock";
import { ChildAvatar } from "@/components/child-avatar";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const name = user?.fullName?.trim() || user?.email?.trim() || "Phụ huynh";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View
        className="flex-1 px-4 pt-2"
        style={{ paddingBottom: DOCK_CONTENT_PADDING }}
      >
        <Text className="text-xl font-bold text-foreground">Tài khoản</Text>

        <View className="mt-4 flex-row items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4">
          <ChildAvatar name={name} avatarUrl={user?.avatarUrl} size={56} />
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">
              {name}
            </Text>
            {user?.email ? (
              <Text className="mt-0.5 text-sm text-muted-foreground">
                {user.email}
              </Text>
            ) : null}
            {user?.role ? (
              <Text className="mt-1 text-xs text-muted-foreground">
                Vai trò: {user.role}
              </Text>
            ) : null}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Đăng xuất"
          onPress={async () => {
            await signOut();
            router.replace("/welcome");
          }}
          className="mt-6 h-14 items-center justify-center rounded-lg bg-primary active:opacity-90"
        >
          <Text className="text-base font-semibold text-primary-foreground">
            Đăng xuất
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

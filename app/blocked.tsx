import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Non-Parent roles after login / session restore. */
export default function BlockedRoleScreen() {
  const { user, blockReason, signOut } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View className="flex-1 justify-center px-6">
        <Text className="text-center text-2xl font-bold text-foreground">
          Vai trò không được hỗ trợ
        </Text>
        <Text className="mt-3 text-center text-base leading-6 text-muted-foreground">
          {blockReason ??
            "Ứng dụng di động hiện chỉ hỗ trợ tài khoản Parent. Vui lòng dùng website."}
        </Text>
        {user?.role ? (
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            Vai trò hiện tại: {user.role}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Đăng xuất"
          onPress={async () => {
            await signOut();
            router.replace("/welcome");
          }}
          className="mt-8 h-14 items-center justify-center rounded-lg bg-primary active:opacity-90"
        >
          <Text className="text-base font-semibold text-primary-foreground">
            Đăng xuất
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

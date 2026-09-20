import { DOCK_CONTENT_PADDING } from "@/components/animated-dock";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Mentor today placeholder — session QR / capture ship in later slices. */
export default function MentorTodayScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const name = user?.fullName?.trim() || user?.email?.trim() || "Mentor";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <StatusBar style="dark" />
      <View
        className="flex-1 px-4 pt-2"
        style={{ paddingBottom: DOCK_CONTENT_PADDING }}
      >
        <Text className="text-xl font-bold text-foreground">Hôm nay</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          Xin chào, {name}
        </Text>
        <View className="mt-6 rounded-2xl border border-border bg-card px-4 py-5">
          <Text className="text-base font-semibold text-foreground">
            Buổi học sắp tới
          </Text>
          <Text className="mt-2 text-sm leading-5 text-muted-foreground">
            Danh sách buổi hôm nay, QR điểm danh và chụp khoảnh khắc lớp sẽ xuất
            hiện tại đây.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Đăng xuất"
          onPress={async () => {
            await signOut();
            router.replace("/welcome");
          }}
          className="mt-8 h-14 items-center justify-center rounded-lg border border-border bg-card active:opacity-90"
        >
          <Text className="text-base font-semibold text-foreground">
            Đăng xuất
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

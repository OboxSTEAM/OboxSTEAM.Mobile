import { DOCK_CONTENT_PADDING } from "@/components/animated-dock";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Student QR check-in placeholder — scan flow ships in Slice 2. */
export default function StudentCheckInScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <StatusBar style="dark" />
      <View
        className="flex-1 px-4 pt-2"
        style={{ paddingBottom: DOCK_CONTENT_PADDING }}
      >
        <Text className="text-xl font-bold text-foreground">Check-in</Text>
        <View className="mt-6 rounded-2xl border border-border bg-card px-4 py-5">
          <Text className="text-base font-semibold text-foreground">
            Quét mã điểm danh
          </Text>
          <Text className="mt-2 text-sm leading-5 text-muted-foreground">
            Tính năng quét QR / nhập mã 6 số sẽ sớm khả dụng. Mentor sẽ hiển thị
            mã tại buổi học offline.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

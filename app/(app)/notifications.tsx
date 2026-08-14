import { DOCK_CONTENT_PADDING } from "@/components/animated-dock";
import { ScreenState } from "@/components/screen-state";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsPlaceholderScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View
        className="flex-1 px-4 pt-2"
        style={{ paddingBottom: DOCK_CONTENT_PADDING }}
      >
        <Text className="text-xl font-bold text-foreground">Thông báo</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          Hộp thư thông báo sẽ cập nhật theo thời gian thực ở bước tiếp theo.
        </Text>
        <View className="mt-8 flex-1">
          <ScreenState
            kind="empty"
            title="Sắp ra mắt"
            message="Hiện tại bạn vẫn xem được tiến độ học của con. Inbox SignalR + REST sẽ được nối sau."
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

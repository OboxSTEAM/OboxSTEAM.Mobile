import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

/**
 * Auth placeholder — Parent login lands in the next phase.
 */
export default function LoginPlaceholderScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View className="flex-1 justify-between px-6 py-4">
        <View className="pt-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            onPress={() => router.back()}
            className="self-start py-2"
          >
            <Text className="text-base text-primary">← Quay lại</Text>
          </Pressable>
        </View>

        <View className="items-center px-4">
          <Text className="text-center text-2xl font-bold text-foreground">
            Đăng nhập
          </Text>
          <Text className="mt-3 text-center text-base leading-6 text-muted-foreground">
            Màn hình đăng nhập Parent sẽ được triển khai ở giai đoạn tiếp theo.
          </Text>
        </View>

        <View className="h-10" />
      </View>
    </SafeAreaView>
  );
}

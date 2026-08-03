import { BRAND_LOGO, BRAND_NAME } from "@/lib/brand";
import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const LOGO_SIZE = 112;

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View className="flex-1 px-6">
        <View className="flex-1 items-center justify-center pt-8">
          <View className="overflow-hidden rounded-3xl">
            <Image
              source={BRAND_LOGO}
              style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
              resizeMode="contain"
              accessibilityLabel={`${BRAND_NAME} logo`}
            />
          </View>
          <Text className="mt-6 text-center text-3xl font-bold text-foreground">
            {BRAND_NAME}
          </Text>
          <Text className="mt-3 max-w-sm text-center text-base leading-6 text-muted-foreground">
            Ứng dụng dành cho phụ huynh và cố vấn OboxSTEAM.
          </Text>
        </View>

        <View className="pb-2">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đăng nhập"
            onPress={() => router.push("/login")}
            className="h-14 items-center justify-center rounded-lg bg-primary active:opacity-90"
          >
            <Text className="text-base font-semibold text-primary-foreground">
              Đăng nhập
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

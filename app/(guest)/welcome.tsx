import { BRAND_LOGO, BRAND_NAME } from "@/lib/brand";
import { colors } from "@/lib/tokens/colors";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Bell,
  CreditCard,
  Users,
  type LucideIcon,
} from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LOGO_SIZE = 72;

type Highlight = {
  title: string;
  detail: string;
  Icon: LucideIcon;
  tint: string;
};

const HIGHLIGHTS: Highlight[] = [
  {
    title: "Theo dõi tiến độ học",
    detail: "Xem hành trình STEAM của con đã liên kết.",
    Icon: Users,
    tint: colors.steam.technology,
  },
  {
    title: "Thanh toán khi cần",
    detail: "Xử lý yêu cầu học phí / học phần từ nhà trường.",
    Icon: CreditCard,
    tint: colors.steam.science,
  },
  {
    title: "Thông báo kịp thời",
    detail: "Nhận cập nhật liên kết, thanh toán và học tập.",
    Icon: Bell,
    tint: colors.steam.engineering,
  },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <StatusBar style="dark" />

      <View className="flex-1 overflow-hidden px-6">
        {/* Soft STEAM atmosphere — decorative only */}
        <View
          pointerEvents="none"
          className="absolute -right-10 -top-6 h-40 w-40 rounded-full opacity-25"
          style={{ backgroundColor: colors.steam.science }}
        />
        <View
          pointerEvents="none"
          className="absolute -left-12 top-36 h-32 w-32 rounded-full opacity-20"
          style={{ backgroundColor: colors.steam.engineering }}
        />
        <View
          pointerEvents="none"
          className="absolute -bottom-8 right-4 h-36 w-36 rounded-full opacity-20"
          style={{ backgroundColor: colors.steam.technology }}
        />
        <View
          pointerEvents="none"
          className="absolute bottom-40 -left-8 h-24 w-24 rounded-full opacity-15"
          style={{ backgroundColor: colors.steam.mathematics }}
        />

        {/* Brand + pitch */}
        <View className="items-center pt-3">
          <View className="overflow-hidden rounded-2xl">
            <Image
              source={BRAND_LOGO}
              style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
              resizeMode="contain"
              accessibilityLabel={`${BRAND_NAME} logo`}
            />
          </View>
          <Text className="mt-3 text-center text-2xl font-bold text-foreground">
            {BRAND_NAME}
          </Text>
          <Text className="mt-1.5 text-center text-base font-semibold text-foreground">
            Đồng hành cùng hành trình STEAM
          </Text>
          <Text className="mt-1.5 max-w-sm text-center text-sm leading-5 text-muted-foreground">
            Dành cho phụ huynh và cố vấn — theo dõi học tập, thanh toán và thông
            báo trên cùng một ứng dụng.
          </Text>
        </View>

        {/* Product highlights — one panel, three rows */}
        <View className="mt-5 flex-1 justify-center">
          <View className="rounded-2xl border border-border bg-card px-4 py-2">
            {HIGHLIGHTS.map((item, index) => (
              <View
                key={item.title}
                className={`flex-row items-center gap-3 py-3 ${
                  index < HIGHLIGHTS.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <View
                  className="h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${item.tint}22` }}
                >
                  <item.Icon color={item.tint} size={22} />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-semibold text-foreground">
                    {item.title}
                  </Text>
                  <Text className="mt-0.5 text-sm leading-5 text-muted-foreground">
                    {item.detail}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <Text className="mt-3 text-center text-xs leading-4 text-muted-foreground">
            Nền tảng học STEAM Việt Nam · Parent & Mentor
          </Text>
        </View>

        {/* Primary CTA — always in viewport */}
        <View className="pb-2 pt-3">
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

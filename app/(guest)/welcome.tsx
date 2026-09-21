import { PressableScale } from "@/components/pressable-scale";
import { BRAND_LOGO, BRAND_NAME } from "@/lib/brand";
import { colors } from "@/lib/tokens/colors";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowRight,
  GraduationCap,
  Presentation,
  Users,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, Easing, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LOGO_SIZE = 220;

type Highlight = {
  title: string;
  detail: string;
  Icon: LucideIcon;
  tint: string;
};

const HIGHLIGHTS: Highlight[] = [
  {
    title: "Phụ huynh",
    detail: "Theo dõi tiến độ và lịch học của con.",
    Icon: Users,
    tint: colors.steam.technology,
  },
  {
    title: "Học viên",
    detail: "Xem lịch tuần, check-in bằng QR.",
    Icon: GraduationCap,
    tint: colors.steam.engineering,
  },
  {
    title: "Mentor",
    detail: "Điểm danh QR, lưu khoảnh khắc lớp.",
    Icon: Presentation,
    tint: colors.steam.mathematics,
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  const enterStyle = {
    opacity: enter,
    transform: [
      {
        translateY: enter.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <StatusBar style="dark" />

      <View className="flex-1 overflow-hidden px-6">
        <View
          pointerEvents="none"
          className="absolute -right-16 -top-8 h-56 w-56 rounded-full"
          style={{ backgroundColor: `${colors.primary}14` }}
        />
        <View
          pointerEvents="none"
          className="absolute -left-20 top-48 h-44 w-44 rounded-full"
          style={{ backgroundColor: `${colors.steam.engineering}18` }}
        />

        <Animated.View style={[{ flex: 1 }, enterStyle]}>
          <View className="relative overflow-visible pt-8">
            <Image
              source={BRAND_LOGO}
              style={{
                position: "absolute",
                right: -36,
                top: -12,
                width: LOGO_SIZE,
                height: LOGO_SIZE,
                opacity: 0.18,
              }}
              resizeMode="contain"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />

            <Text className="relative z-10 text-sm font-medium text-muted-foreground">
              {BRAND_NAME}
            </Text>
            <Text className="relative z-10 mt-1 max-w-[280px] text-[32px] font-bold leading-[38px] text-foreground">
              Nền tảng STEAM cho mọi vai trò.
            </Text>
            <Text className="relative z-10 mt-2 max-w-[280px] text-base leading-6 text-muted-foreground">
              Phụ huynh, Học viên và Mentor — một ứng dụng chung.
            </Text>
          </View>

          <View className="mt-10 flex-1 justify-center gap-3">
            {HIGHLIGHTS.map((item, index) => (
              <Animated.View
                key={item.title}
                style={{
                  opacity: enter,
                  transform: [
                    {
                      translateY: enter.interpolate({
                        inputRange: [0, 1],
                        outputRange: [18 + index * 8, 0],
                      }),
                    },
                  ],
                }}
              >
                <View
                  className="min-h-[88px] flex-row items-center rounded-2xl border border-border bg-card px-5 py-4"
                  style={CARD_SHADOW}
                >
                  <View
                    className="h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${item.tint}22` }}
                  >
                    <item.Icon color={item.tint} size={24} />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {item.title}
                    </Text>
                    <Text className="mt-0.5 text-[15px] leading-5 text-muted-foreground">
                      {item.detail}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <View className="pb-2 pt-4">
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Đăng nhập"
            onPress={() => router.push("/login")}
          >
            <View className="h-14 flex-row items-center justify-between rounded-lg bg-primary pl-6 pr-1.5">
              <Text className="text-base font-semibold text-primary-foreground">
                Đăng nhập
              </Text>
              <View className="h-11 w-11 items-center justify-center rounded-md bg-white/20">
                <ArrowRight color={colors.primaryForeground} size={18} />
              </View>
            </View>
          </PressableScale>
          <Text className="mt-3 text-center text-xs leading-4 text-muted-foreground">
            Dành cho Phụ huynh, Học viên và Mentor OboxSTEAM
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const CARD_SHADOW = {
  shadowColor: colors.foreground,
  shadowOpacity: 0.04,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 1,
};

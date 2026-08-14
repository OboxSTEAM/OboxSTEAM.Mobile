import { colors } from "@/lib/tokens/colors";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { Bell, UserRound, Users, type LucideIcon } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  type LayoutChangeEvent,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DOCK_HEIGHT = 64;
const DOCK_HORIZONTAL = 16;
const DOCK_BOTTOM_GAP = 8;

/** Extra bottom padding so scroll content clears the floating dock. */
export const DOCK_CONTENT_PADDING = DOCK_HEIGHT + DOCK_BOTTOM_GAP + 12;

const TAB_META: Record<string, { label: string; Icon: LucideIcon }> = {
  children: { label: "Con của bạn", Icon: Users },
  notifications: { label: "Thông báo", Icon: Bell },
  profile: { label: "Tài khoản", Icon: UserRound },
};

export function AnimatedDock({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [trackWidth, setTrackWidth] = useState(0);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const itemScales = useRef<Animated.Value[]>([]);

  const routes = state.routes;
  const activeIndex = Math.max(0, state.index);
  const itemWidth =
    routes.length > 0 && trackWidth > 0 ? trackWidth / routes.length : 0;

  useEffect(() => {
    while (itemScales.current.length < routes.length) {
      itemScales.current.push(new Animated.Value(1));
    }
  }, [routes.length]);

  useEffect(() => {
    if (itemWidth <= 0) return;

    Animated.spring(indicatorX, {
      toValue: activeIndex * itemWidth,
      useNativeDriver: true,
      friction: 8,
      tension: 80,
    }).start();

    routes.forEach((_, index) => {
      const scale = itemScales.current[index];
      if (!scale) return;
      Animated.spring(scale, {
        toValue: index === activeIndex ? 1.08 : 1,
        useNativeDriver: true,
        friction: 7,
        tension: 120,
      }).start();
    });
  }, [activeIndex, indicatorX, itemWidth, routes]);

  const onTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      pointerEvents="box-none"
      className="absolute left-0 right-0"
      style={{ bottom: Math.max(insets.bottom, 8) }}
    >
      <View
        className="overflow-hidden rounded-2xl border border-border bg-card"
        style={{
          height: DOCK_HEIGHT,
          marginHorizontal: DOCK_HORIZONTAL,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <View className="relative flex-1 flex-row" onLayout={onTrackLayout}>
          {itemWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              className="absolute bottom-2 top-2 rounded-xl"
              style={{
                width: itemWidth - 8,
                marginLeft: 4,
                backgroundColor: `${colors.primary}14`,
                transform: [{ translateX: indicatorX }],
              }}
            />
          ) : null}

          {routes.map((route, index) => {
            const isFocused = state.index === index;
            const meta = TAB_META[route.name] ?? {
              label: route.name,
              Icon: Users,
            };
            const options = descriptors[route.key]?.options;
            const label =
              typeof options?.tabBarLabel === "string"
                ? options.tabBarLabel
                : typeof options?.title === "string"
                  ? options.title
                  : meta.label;
            const color = isFocused ? colors.primary : colors.mutedForeground;
            const scale = itemScales.current[index] ?? new Animated.Value(1);

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={label}
                onPress={() => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name, route.params);
                  }
                }}
                className="flex-1 items-center justify-center"
                style={{ minHeight: 44 }}
              >
                <Animated.View
                  className="items-center justify-center"
                  style={{ transform: [{ scale }] }}
                >
                  <meta.Icon color={color} size={22} />
                  <Text
                    className="mt-1 text-[11px] font-medium"
                    style={{ color }}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

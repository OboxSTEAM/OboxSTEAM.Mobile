import { getTabMeta } from "@/components/tab-meta";
import { useOptionalNotifications } from "@/lib/notifications/notifications-context";
import { colors } from "@/lib/tokens/colors";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  type LayoutChangeEvent,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DOCK_HEIGHT = 72;
const DOCK_HORIZONTAL = 20;
const DOCK_BOTTOM_GAP = 10;
const PILL_INSET = 6;
const ICON_WELL = 36;

/** Extra bottom padding so scroll content clears the floating dock. */
export const DOCK_CONTENT_PADDING = DOCK_HEIGHT + DOCK_BOTTOM_GAP + 14;

const SNAPPY = { friction: 7, tension: 240, useNativeDriver: true } as const;

function triggerLightHaptic() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
    // Expo Go / unsupported — ignore.
  });
}

type DockItemProps = {
  label: string;
  Icon: ReturnType<typeof getTabMeta>["Icon"];
  isFocused: boolean;
  showBadge: boolean;
  unreadCount: number;
  reduceMotion: boolean;
  onPress: () => void;
};

function DockItem({
  label,
  Icon,
  isFocused,
  showBadge,
  unreadCount,
  reduceMotion,
  onPress,
}: DockItemProps) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const wellProgress = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const badgeScale = useRef(new Animated.Value(showBadge ? 1 : 0)).current;
  const wasBadgeVisible = useRef(showBadge);

  useEffect(() => {
    if (reduceMotion) {
      wellProgress.setValue(isFocused ? 1 : 0);
      return;
    }
    Animated.spring(wellProgress, {
      toValue: isFocused ? 1 : 0,
      ...SNAPPY,
    }).start();
  }, [isFocused, reduceMotion, wellProgress]);

  useEffect(() => {
    if (showBadge === wasBadgeVisible.current && showBadge) return;
    wasBadgeVisible.current = showBadge;
    if (reduceMotion) {
      badgeScale.setValue(showBadge ? 1 : 0);
      return;
    }
    if (showBadge) {
      badgeScale.setValue(0);
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 5,
        tension: 280,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(badgeScale, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start();
    }
  }, [badgeScale, reduceMotion, showBadge]);

  const iconColor = isFocused
    ? colors.primaryForeground
    : colors.mutedForeground;
  const labelColor = isFocused ? colors.primary : colors.mutedForeground;

  const wellScale = wellProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1],
  });
  const wellOpacity = wellProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const labelOpacity = wellProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1],
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={
        showBadge ? `${label}, ${unreadCount} chưa đọc` : label
      }
      onPressIn={() => {
        if (reduceMotion) {
          pressScale.setValue(0.92);
          return;
        }
        Animated.spring(pressScale, { toValue: 0.92, ...SNAPPY }).start();
      }}
      onPressOut={() => {
        if (reduceMotion) {
          pressScale.setValue(1);
          return;
        }
        Animated.spring(pressScale, { toValue: 1, ...SNAPPY }).start();
      }}
      onPress={onPress}
      className="flex-1 items-center justify-center"
      style={{ minHeight: 48 }}
    >
      <Animated.View
        className="items-center justify-center"
        style={{ transform: [{ scale: pressScale }] }}
      >
        <View
          className="items-center justify-center"
          style={{ width: ICON_WELL, height: ICON_WELL }}
        >
          <Animated.View
            pointerEvents="none"
            className="absolute rounded-full bg-primary"
            style={{
              width: ICON_WELL,
              height: ICON_WELL,
              opacity: wellOpacity,
              transform: [{ scale: wellScale }],
            }}
          />
          <View>
            <Icon
              color={iconColor}
              size={isFocused ? 20 : 22}
              strokeWidth={isFocused ? 2.5 : 2}
            />
            {showBadge ? (
              <Animated.View
                className="absolute -right-2 -top-1.5 min-w-[16px] items-center rounded-full border-2 border-card bg-primary px-1"
                style={{
                  transform: [{ scale: badgeScale }],
                  opacity: badgeScale,
                }}
              >
                <Text className="text-[9px] font-bold leading-[12px] text-primary-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </Animated.View>
            ) : null}
          </View>
        </View>
        <Animated.Text
          className={`mt-1 text-[10px] ${isFocused ? "font-bold" : "font-medium"}`}
          style={{ color: labelColor, opacity: labelOpacity }}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

/**
 * Shared floating tab bar for Parent / Student / Mentor.
 * Pill shell + primary icon chip on the active tab.
 */
export function RoleDock({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const notifications = useOptionalNotifications();
  const unreadCount = notifications?.unreadCount ?? 0;
  const [trackWidth, setTrackWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const pillX = useRef(new Animated.Value(0)).current;

  const routes = state.routes;
  const activeIndex = Math.max(0, state.index);
  const itemWidth =
    routes.length > 0 && trackWidth > 0 ? trackWidth / routes.length : 0;

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener?.(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (itemWidth <= 0) return;
    const nextX = activeIndex * itemWidth;
    if (reduceMotion) {
      pillX.setValue(nextX);
      return;
    }
    Animated.spring(pillX, { toValue: nextX, ...SNAPPY }).start();
  }, [activeIndex, itemWidth, pillX, reduceMotion]);

  const onTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      pointerEvents="box-none"
      className="absolute left-0 right-0"
      style={{ bottom: Math.max(insets.bottom, DOCK_BOTTOM_GAP) }}
    >
      <View
        className="overflow-hidden rounded-full border border-border bg-card"
        style={{
          height: DOCK_HEIGHT,
          marginHorizontal: DOCK_HORIZONTAL,
          shadowColor: colors.foreground,
          shadowOpacity: 0.1,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        }}
      >
        <View
          className="relative flex-1 flex-row px-1"
          onLayout={onTrackLayout}
        >
          {itemWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              className="absolute bottom-1.5 top-1.5 rounded-full"
              style={{
                width: itemWidth - PILL_INSET * 2,
                marginLeft: PILL_INSET,
                backgroundColor: colors.secondary,
                transform: [{ translateX: pillX }],
              }}
            />
          ) : null}

          {routes.map((route, index) => {
            const isFocused = state.index === index;
            const meta = getTabMeta(route.name);
            const options = descriptors[route.key]?.options;
            const label =
              typeof options?.tabBarLabel === "string"
                ? options.tabBarLabel
                : typeof options?.title === "string"
                  ? options.title
                  : meta.label;
            const showBadge =
              route.name === "notifications" && unreadCount > 0;

            return (
              <DockItem
                key={route.key}
                label={label}
                Icon={meta.Icon}
                isFocused={isFocused}
                showBadge={showBadge}
                unreadCount={unreadCount}
                reduceMotion={reduceMotion}
                onPress={() => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    triggerLightHaptic();
                    navigation.navigate(route.name, route.params);
                  }
                }}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

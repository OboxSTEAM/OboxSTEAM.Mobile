import { getTabMeta } from "@/components/tab-meta";
import { useOptionalNotifications } from "@/lib/notifications/notifications-context";
import { colors } from "@/lib/tokens/colors";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DOCK_HEIGHT = 72;
const DOCK_HORIZONTAL = 20;
const DOCK_BOTTOM_GAP = 10;
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
    if (showBadge === wasBadgeVisible.current) return;
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
  const pillOpacity = wellProgress.interpolate({
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
      style={styles.item}
    >
      {/* No className on Animated.* — NativeWind css-interop + animated styles can infinite-loop. */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.itemPill,
          { backgroundColor: colors.secondary, opacity: pillOpacity },
        ]}
      />

      <Animated.View
        style={[styles.itemContent, { transform: [{ scale: pressScale }] }]}
      >
        <View style={styles.iconWell}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.iconWellFill,
              {
                backgroundColor: colors.primary,
                opacity: wellOpacity,
                transform: [{ scale: wellScale }],
              },
            ]}
          />
          <View>
            <Icon
              color={iconColor}
              size={isFocused ? 20 : 22}
              strokeWidth={isFocused ? 2.5 : 2}
            />
            {showBadge ? (
              <Animated.View
                style={[
                  styles.badge,
                  {
                    borderColor: colors.card,
                    backgroundColor: colors.primary,
                    transform: [{ scale: badgeScale }],
                    opacity: badgeScale,
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </Animated.View>
            ) : null}
          </View>
        </View>
        <Animated.Text
          style={[
            styles.label,
            {
              color: labelColor,
              opacity: labelOpacity,
              fontWeight: isFocused ? "700" : "500",
            },
          ]}
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
  const [reduceMotion, setReduceMotion] = useState(false);

  const routes = state.routes.filter((route) => {
    const href = (
      descriptors[route.key]?.options as { href?: unknown } | undefined
    )?.href;
    return href !== null;
  });
  const focusedKey = state.routes[state.index]?.key;

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

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.dockWrap,
        { bottom: Math.max(insets.bottom, DOCK_BOTTOM_GAP) },
      ]}
    >
      <View
        style={[
          styles.dockShell,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            shadowColor: colors.foreground,
          },
        ]}
      >
        <View style={styles.dockRow}>
          {routes.map((route) => {
            const isFocused = route.key === focusedKey;
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

const styles = StyleSheet.create({
  dockWrap: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  dockShell: {
    height: DOCK_HEIGHT,
    marginHorizontal: DOCK_HORIZONTAL,
    overflow: "hidden",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  dockRow: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 4,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    position: "relative",
  },
  itemContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  itemPill: {
    position: "absolute",
    top: 6,
    bottom: 6,
    left: 4,
    right: 4,
    borderRadius: 999,
  },
  iconWell: {
    width: ICON_WELL,
    height: ICON_WELL,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWellFill: {
    position: "absolute",
    width: ICON_WELL,
    height: ICON_WELL,
    borderRadius: ICON_WELL / 2,
  },
  badge: {
    position: "absolute",
    right: -8,
    top: -6,
    minWidth: 16,
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
    lineHeight: 12,
    color: colors.primaryForeground,
  },
  label: {
    marginTop: 4,
    fontSize: 10,
    textAlign: "center",
  },
});

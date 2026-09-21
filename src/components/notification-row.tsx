import { memo, useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

import { UnreadDot } from "@/components/motion/effects";
import { PressableScale } from "@/components/pressable-scale";
import type { Notification } from "@/lib/api/entities/notification";
import { formatRelativeVi } from "@/lib/format/date";
import { motion } from "@/lib/motion/tokens";
import { useReduceMotion } from "@/lib/motion/use-reduce-motion";
import {
  notificationTitle,
  notificationVisual,
} from "@/lib/notifications/labels";
import { colors } from "@/lib/tokens/colors";

type NotificationRowProps = {
  item: Notification;
  onPress: (item: Notification) => void;
};

function NotificationRowComponent({ item, onPress }: NotificationRowProps) {
  const isUnread = !item.readAt;
  const visual = notificationVisual(item.type);
  const title = notificationTitle(item.title, item.type);
  const body = item.body?.trim() ?? "";
  const reduceMotion = useReduceMotion();
  const enter = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      enter.setValue(1);
      return;
    }
    Animated.timing(enter, {
      toValue: 1,
      duration: motion.duration.fast,
      easing: motion.easeSmoothOut,
      useNativeDriver: true,
    }).start();
  }, [enter, reduceMotion]);

  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [
          {
            translateY: enter.interpolate({
              inputRange: [0, 1],
              outputRange: [motion.distance.base, 0],
            }),
          },
        ],
      }}
    >
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={() => onPress(item)}
        className="mb-2 rounded-2xl border border-border bg-card px-4 py-3.5 active:opacity-95"
        style={{
          minHeight: 72,
          shadowColor: colors.foreground,
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}
      >
        <View className="flex-row items-start gap-3">
          <View
            className="mt-0.5 h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${visual.tone}18` }}
          >
            <visual.Icon color={visual.tone} size={20} />
          </View>

          <View className="min-w-0 flex-1">
            <View className="flex-row items-start gap-2">
              <Text
                className={`min-w-0 flex-1 text-base leading-5 text-foreground ${
                  isUnread ? "font-semibold" : "font-medium"
                }`}
                numberOfLines={2}
              >
                {title}
              </Text>
              <UnreadDot visible={isUnread} />
            </View>

            {body ? (
              <Text
                className="mt-1 text-sm leading-5 text-muted-foreground"
                numberOfLines={2}
              >
                {body}
              </Text>
            ) : null}

            <Text className="mt-2 text-xs text-muted-foreground">
              {formatRelativeVi(item.createdAt)}
            </Text>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

export const NotificationRow = memo(NotificationRowComponent);

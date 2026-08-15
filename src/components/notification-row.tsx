import { memo } from "react";
import { Text, View } from "react-native";

import { PressableScale } from "@/components/pressable-scale";
import type { Notification } from "@/lib/api/entities/notification";
import { formatRelativeVi } from "@/lib/format/date";
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

  return (
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
            {isUnread ? (
              <View className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
            ) : null}
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
  );
}

export const NotificationRow = memo(NotificationRowComponent);

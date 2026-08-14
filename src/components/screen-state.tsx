import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { colors } from "@/lib/tokens/colors";

type ScreenStateProps = {
  kind: "loading" | "empty" | "error";
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ScreenState({
  kind,
  title,
  message,
  actionLabel = "Thử lại",
  onAction,
}: ScreenStateProps) {
  if (kind === "loading") {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <ActivityIndicator color={colors.primary} size="large" />
        {message ? (
          <Text className="mt-3 text-center text-sm text-muted-foreground">
            {message}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-6">
      {title ? (
        <Text className="text-center text-lg font-semibold text-foreground">
          {title}
        </Text>
      ) : null}
      {message ? (
        <Text className="mt-2 text-center text-base leading-6 text-muted-foreground">
          {message}
        </Text>
      ) : null}
      {onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          className="mt-5 h-12 min-w-[140px] items-center justify-center rounded-lg bg-primary px-4 active:opacity-90"
        >
          <Text className="font-semibold text-primary-foreground">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

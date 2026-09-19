import { ChevronRight } from "lucide-react-native";
import { Text, View } from "react-native";

import { ChildAvatar } from "@/components/child-avatar";
import { PressableScale } from "@/components/pressable-scale";
import { StatusPill } from "@/components/status-pill";
import { formatPercent } from "@/lib/parent/labels";
import { colors } from "@/lib/tokens/colors";

type ChildProgressCardProps = {
  name: string;
  avatarUrl?: string | null;
  verified: boolean;
  isLoading: boolean;
  statusLine: string;
  percent: number | null;
  newCount: number;
  onPress: () => void;
};

export function ChildProgressCard({
  name,
  avatarUrl,
  verified,
  isLoading,
  statusLine,
  percent,
  newCount,
  onPress,
}: ChildProgressCardProps) {
  const line = !verified
    ? "Chờ xác minh liên kết"
    : isLoading
      ? "Đang tải tiến độ…"
      : statusLine;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${name}. ${line}`}
      disabled={!verified}
      onPress={onPress}
      className="mb-3"
      style={{ minHeight: 72 }}
    >
      <View
        className={`flex-row items-center rounded-2xl border border-border bg-card px-4 py-3 ${verified ? "" : "opacity-60"}`}
        style={CARD_SHADOW}
      >
        <ChildAvatar name={name} avatarUrl={avatarUrl} size={48} radius={14} />

        <View className="ml-3 min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className="flex-shrink text-base font-semibold text-foreground"
              numberOfLines={1}
            >
              {name}
            </Text>
            {newCount > 0 ? (
              <View className="rounded-full bg-primary px-2 py-0.5">
                <Text className="text-[11px] font-semibold text-primary-foreground">
                  +{newCount} mới
                </Text>
              </View>
            ) : null}
          </View>

          <Text
            className="mt-0.5 text-sm text-muted-foreground"
            numberOfLines={1}
          >
            {line}
          </Text>
        </View>

        <View className="ml-2 flex-row items-center gap-1.5">
          {!verified ? (
            <StatusPill label="Chờ xác minh" tone="warning" />
          ) : percent != null && !isLoading ? (
            <Text
              className="text-base font-bold text-foreground"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {formatPercent(percent)}
            </Text>
          ) : null}
          {verified ? (
            <View className="h-8 w-8 items-center justify-center rounded-full bg-secondary">
              <ChevronRight color={colors.foreground} size={18} />
            </View>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
}

const CARD_SHADOW = {
  shadowColor: colors.foreground,
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
  elevation: 1,
};

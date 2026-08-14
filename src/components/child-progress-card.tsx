import { ChevronRight } from "lucide-react-native";
import { Text, View } from "react-native";

import { ChildAvatar } from "@/components/child-avatar";
import { PressableScale } from "@/components/pressable-scale";
import { ProgressRing } from "@/components/progress-ring";
import { formatPercent, type ProgressPreview } from "@/lib/parent/labels";
import { colors } from "@/lib/tokens/colors";

type ChildProgressCardProps = {
  name: string;
  avatarUrl?: string | null;
  verified: boolean;
  isLoading: boolean;
  preview: ProgressPreview | null;
  newCount: number;
  onPress: () => void;
};

export function ChildProgressCard({
  name,
  avatarUrl,
  verified,
  isLoading,
  preview,
  newCount,
  onPress,
}: ChildProgressCardProps) {
  const subtitle = !verified
    ? "Chờ xác minh liên kết"
    : isLoading
      ? "Đang tải tiến độ…"
      : preview?.programName ?? "Chưa có chương trình đang học";

  const detail =
    verified && preview?.moduleName ? preview.moduleName : null;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${name}. ${subtitle}`}
      disabled={!verified}
      onPress={onPress}
      className="mb-3"
      style={{ minHeight: 88 }}
    >
      <View className={verified ? undefined : "opacity-60"}>
        <View className="rounded-[24px] bg-secondary p-1.5">
          <View
            className="flex-row items-center rounded-[18px] bg-card px-3.5 py-3.5"
            style={CARD_SHADOW}
          >
            <ProgressRing percent={verified ? (preview?.percent ?? 0) : 0}>
              <ChildAvatar
                name={name}
                avatarUrl={avatarUrl}
                size={56}
                radius={16}
              />
            </ProgressRing>

            <View className="ml-3 flex-1">
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
                {subtitle}
              </Text>

              {verified && preview?.percent != null ? (
                <Text
                  className="mt-1 text-sm font-semibold"
                  style={{
                    color: colors.steam.technology,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {formatPercent(preview.percent)}
                  {detail ? ` · ${detail}` : ""}
                </Text>
              ) : null}
            </View>

            {verified ? (
              <View className="h-9 w-9 items-center justify-center rounded-full bg-secondary">
                <ChevronRight color={colors.foreground} size={18} />
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const CARD_SHADOW = {
  shadowColor: colors.foreground,
  shadowOpacity: 0.05,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
};

import { Text, View } from "react-native";

import { colors } from "@/lib/tokens/colors";

type ScoreBarProps = {
  score?: number | null;
  maxPoints?: number | null;
  passScore?: number | null;
  color?: string;
  trackColor?: string;
  showPassLabel?: boolean;
};

export function ScoreBar({
  score,
  maxPoints,
  passScore,
  color = colors.steam.technology,
  trackColor = colors.secondary,
  showPassLabel = true,
}: ScoreBarProps) {
  if (maxPoints == null || maxPoints <= 0) return null;

  const filled = Math.max(0, Math.min(100, ((score ?? 0) / maxPoints) * 100));
  const passPct =
    passScore != null && !Number.isNaN(passScore)
      ? Math.max(0, Math.min(100, (passScore / maxPoints) * 100))
      : null;

  return (
    <View>
      <View
        className="relative w-full overflow-hidden rounded-full"
        style={{ height: 6, backgroundColor: trackColor }}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: Math.round(maxPoints),
          now: Math.round(score ?? 0),
        }}
      >
        <View
          className="h-full rounded-full"
          style={{ width: `${filled}%`, backgroundColor: color }}
        />
        {passPct != null ? (
          <View
            pointerEvents="none"
            className="absolute top-0 bottom-0 w-0.5"
            style={{
              left: `${passPct}%`,
              marginLeft: -1,
              backgroundColor: colors.foreground,
              opacity: 0.35,
            }}
          />
        ) : null}
      </View>
      {showPassLabel && passScore != null ? (
        <Text className="mt-1 text-[11px] text-muted-foreground">
          Đạt từ {formatCompact(passScore)}
          {maxPoints != null ? `/${formatCompact(maxPoints)}` : ""}
        </Text>
      ) : null}
    </View>
  );
}

function formatCompact(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

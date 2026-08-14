import { View } from "react-native";

import { colors } from "@/lib/tokens/colors";

type ProgressBarProps = {
  percent?: number | null;
  color?: string;
  trackColor?: string;
  height?: number;
};

export function ProgressBar({
  percent,
  color = colors.steam.technology,
  trackColor = colors.secondary,
  height = 8,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent ?? 0));

  return (
    <View
      className="w-full overflow-hidden rounded-full"
      style={{ height, backgroundColor: trackColor }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
    >
      <View
        className="h-full rounded-full"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </View>
  );
}

import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

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
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: clamped / 100,
      duration: 700,
      easing: Easing.bezier(0.32, 0.72, 0, 1),
      useNativeDriver: true,
    }).start();
  }, [clamped, progress]);

  return (
    <View
      className="w-full overflow-hidden rounded-full"
      style={{ height, backgroundColor: trackColor }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
    >
      <Animated.View
        className="h-full w-full rounded-full"
        style={{
          backgroundColor: color,
          transformOrigin: "0% 50%",
          transform: [{ scaleX: progress }],
        }}
      />
    </View>
  );
}

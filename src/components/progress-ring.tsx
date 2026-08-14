import type { ReactNode } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { colors } from "@/lib/tokens/colors";

type ProgressRingProps = {
  percent?: number | null;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children: ReactNode;
};

export function ProgressRing({
  percent,
  size = 72,
  strokeWidth = 3.5,
  color = colors.steam.technology,
  trackColor = colors.secondary,
  children,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, percent ?? 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {clamped > 0 ? (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        ) : null}
      </Svg>
      <View className="flex-1 items-center justify-center">{children}</View>
    </View>
  );
}

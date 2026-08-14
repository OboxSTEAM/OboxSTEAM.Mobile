import type { ReactNode } from "react";
import { Text, View } from "react-native";

import type { LucideIcon } from "lucide-react-native";

import { colors } from "@/lib/tokens/colors";

type StatTileProps = {
  label: string;
  value: string;
  icon?: LucideIcon;
  accentColor?: string;
  emphasize?: boolean;
};

export function StatTile({
  label,
  value,
  icon: Icon,
  accentColor,
  emphasize = false,
}: StatTileProps) {
  const valueColor = emphasize
    ? accentColor ?? colors.primary
    : colors.foreground;

  return (
    <View
      className="flex-1 rounded-[20px] bg-card px-3.5 py-3.5"
      style={TILE_SHADOW}
    >
      {Icon ? (
        <View
          className="mb-2 h-8 w-8 items-center justify-center rounded-full"
          style={{
            backgroundColor: `${accentColor ?? colors.steam.engineering}18`,
          }}
        >
          <Icon color={accentColor ?? colors.steam.engineering} size={16} />
        </View>
      ) : null}
      <Text
        className="text-2xl font-bold"
        style={{ color: valueColor, fontVariant: ["tabular-nums"] }}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text className="mt-0.5 text-xs text-muted-foreground" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

type StatTileRowProps = {
  children: ReactNode;
};

export function StatTileRow({ children }: StatTileRowProps) {
  return <View className="flex-row gap-2">{children}</View>;
}

const TILE_SHADOW = {
  shadowColor: colors.foreground,
  shadowOpacity: 0.04,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 1,
};

import { Text, View } from "react-native";

import type { LucideIcon } from "lucide-react-native";

import { colors } from "@/lib/tokens/colors";

type InfoRowProps = {
  icon?: LucideIcon;
  label: string;
  value: string;
  valueColor?: string;
};

export function InfoRow({
  icon: Icon,
  label,
  value,
  valueColor = colors.foreground,
}: InfoRowProps) {
  return (
    <View className="flex-row items-center justify-between gap-3 py-1.5">
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        {Icon ? <Icon color={colors.mutedForeground} size={16} /> : null}
        <Text className="text-sm text-muted-foreground" numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text
        className="max-w-[55%] text-right text-sm font-medium"
        style={{ color: valueColor }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

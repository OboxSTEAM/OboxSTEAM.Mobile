import { Text, View } from "react-native";

type StatTileProps = {
  label: string;
  value: string;
};

export function StatTile({ label, value }: StatTileProps) {
  return (
    <View className="flex-1 rounded-2xl border border-border bg-card px-3 py-3">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="mt-1 text-base font-semibold text-foreground" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

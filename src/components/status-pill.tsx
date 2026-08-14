import { Text, View } from "react-native";

import { toneHex, type LabelTone } from "@/lib/parent/labels";

type StatusPillProps = {
  label: string;
  tone?: LabelTone;
};

export function StatusPill({ label, tone = "neutral" }: StatusPillProps) {
  const hex = toneHex(tone);

  return (
    <View
      className="self-start rounded-full px-2.5 py-1"
      style={{ backgroundColor: `${hex}22` }}
    >
      <Text className="text-xs font-semibold" style={{ color: hex }}>
        {label}
      </Text>
    </View>
  );
}

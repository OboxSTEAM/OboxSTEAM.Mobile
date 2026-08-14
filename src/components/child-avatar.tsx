import { Image, Text, View } from "react-native";

import { colors } from "@/lib/tokens/colors";

type ChildAvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  radius?: number;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function ChildAvatar({
  name,
  avatarUrl,
  size = 48,
  radius,
}: ChildAvatarProps) {
  const borderRadius = radius ?? size / 2;

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: size, height: size, borderRadius }}
        accessibilityLabel={`Ảnh đại diện ${name}`}
      />
    );
  }

  return (
    <View
      className="items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: `${colors.steam.engineering}22`,
      }}
      accessibilityLabel={`Ảnh đại diện ${name}`}
    >
      <Text
        className="font-semibold"
        style={{
          color: colors.steam.engineering,
          fontSize: Math.round(size * 0.34),
        }}
      >
        {initials(name)}
      </Text>
    </View>
  );
}

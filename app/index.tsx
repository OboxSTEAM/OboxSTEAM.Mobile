import { Text, View } from "react-native";

/** Setup smoke only — proves NativeWind brand tokens (not a product screen). */
export default function HomeScreen() {
  return (
    <View className="flex-1 justify-center bg-steam-technology px-6">
      <View className="rounded-2xl border border-border bg-background p-6">
        <Text className="mb-2 text-center text-2xl font-bold text-primary">
          OboxSTEAM Parent
        </Text>
        <Text className="mb-4 text-center text-base text-muted-foreground">
          Outer green = Steam Technology. Inner cream panel = bg-background
          (#FAFAF5). Reload if styles look wrong.
        </Text>
        <View className="flex-row justify-between gap-2">
          <View className="h-10 flex-1 rounded-lg bg-primary" />
          <View className="h-10 flex-1 rounded-lg bg-accent" />
          <View className="h-10 flex-1 rounded-lg bg-steam-arts" />
          <View className="h-10 flex-1 rounded-lg bg-steam-mathematics" />
        </View>
      </View>
    </View>
  );
}

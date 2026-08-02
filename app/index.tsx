import { CheckCircle2, Users } from "lucide-react-native";
import { Text, View } from "react-native";

/**
 * Setup smoke only — proves lucide-react-native + react-native-svg.
 * Not a product screen.
 */
export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <View className="w-full items-center rounded-2xl border border-border bg-card p-6">
        <Text className="mb-4 text-center text-2xl font-bold text-primary">
          Lucide + SVG setup
        </Text>

        <View className="mb-4 flex-row items-center gap-4">
          <Users color="#E94B3C" size={28} />
          <CheckCircle2 color="#7CB342" size={28} />
        </View>

        <Text className="text-center text-base text-muted-foreground">
          If you see red Users + green Check icons above, lucide and
          react-native-svg are wired for Expo Go.
        </Text>
      </View>
    </View>
  );
}

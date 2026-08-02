import { getApiBaseUrl } from "@/lib/api/config";
import { getAuthSession } from "@/lib/auth/session";
import { CheckCircle2, Smartphone } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Check = {
  label: string;
  ok: boolean;
  detail: string;
};

export default function SetupSmokeScreen() {
  const [checks, setChecks] = useState<Check[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const next: Check[] = [];

      try {
        const baseUrl = getApiBaseUrl();
        next.push({
          label: "EXPO_PUBLIC_API_URL",
          ok: Boolean(baseUrl),
          detail: baseUrl,
        });
      } catch (error) {
        next.push({
          label: "EXPO_PUBLIC_API_URL",
          ok: false,
          detail: error instanceof Error ? error.message : "Missing or invalid",
        });
      }

      try {
        const session = await getAuthSession();
        next.push({
          label: "SecureStore session",
          ok: true,
          detail: session ? "Session present" : "Empty (ready for login)",
        });
      } catch (error) {
        next.push({
          label: "SecureStore session",
          ok: false,
          detail: error instanceof Error ? error.message : "SecureStore failed",
        });
      }

      next.push({
        label: "NativeWind",
        ok: true,
        detail: "className styles applied on this screen",
      });

      if (!cancelled) setChecks(next);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-6 px-6">
        <View className="items-center gap-3">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Smartphone color="#FFFFFF" size={32} />
          </View>
          <Text className="text-center text-2xl font-bold text-foreground">
            OboxSTEAM Mobile
          </Text>
          <Text className="text-center text-base text-muted-foreground">
            Phase 0 setup — Parent app scaffold is ready.
          </Text>
        </View>

        <View className="w-full gap-3 rounded-2xl border border-border bg-card p-4">
          {checks.map((check) => (
            <View key={check.label} className="flex-row items-start gap-3">
              <CheckCircle2
                color={check.ok ? "#7CB342" : "#E94B3C"}
                size={20}
              />
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">
                  {check.label}
                </Text>
                <Text className="text-xs text-muted-foreground" numberOfLines={2}>
                  {check.detail}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text className="text-center text-xs text-muted-foreground">
          Next: copy Parent API slice from FE, then build login / children /
          notifications screens.
        </Text>
      </View>
    </SafeAreaView>
  );
}

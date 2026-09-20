import { WeeklyScheduleView } from "@/components/schedule/weekly-schedule-view";
import { getWeeklySchedule, type WeeklySchedule } from "@/lib/api/schedules";
import { useAuth } from "@/lib/auth/auth-context";
import { resolveAppError } from "@/lib/errors/resolve-app-error";
import { getMondayOfWeek } from "@/lib/schedule/week";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StudentScheduleScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const name = user?.fullName?.trim() || user?.email?.trim() || "Học viên";

  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek());
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [loadState, setLoadState] = useState<
    "idle" | "loading" | "refreshing" | "ready" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(
    async (options?: { silent?: boolean }) => {
      setLoadState((prev) =>
        options?.silent || prev === "ready" ? "refreshing" : "loading",
      );
      setError(null);
      try {
        const value = await getWeeklySchedule({ weekStart });
        setSchedule(value.data ?? null);
        setLoadState("ready");
      } catch (err) {
        setError(resolveAppError(err).reason);
        setLoadState("error");
      }
    },
    [weekStart],
  );

  useEffect(() => {
    void fetchSchedule();
  }, [fetchSchedule]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <StatusBar style="dark" />
      <WeeklyScheduleView
        weekStart={weekStart}
        onWeekStartChange={setWeekStart}
        schedule={schedule}
        isLoading={loadState === "loading"}
        isRefreshing={loadState === "refreshing"}
        error={error}
        onRetry={() => void fetchSchedule()}
        onRefresh={() => void fetchSchedule({ silent: true })}
        emptyMessage="Ngày này bạn chưa có buổi học."
        headerSlot={
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground">Lịch học</Text>
              <Text className="mt-1 text-sm text-muted-foreground">
                Xin chào, {name}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đăng xuất"
              onPress={async () => {
                await signOut();
                router.replace("/welcome");
              }}
              className="rounded-full bg-secondary px-3 py-2 active:opacity-80"
            >
              <Text className="text-xs font-semibold text-foreground">
                Đăng xuất
              </Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

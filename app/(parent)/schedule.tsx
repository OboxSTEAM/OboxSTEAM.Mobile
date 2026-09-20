import { WeeklyScheduleView } from "@/components/schedule/weekly-schedule-view";
import { ScreenState } from "@/components/screen-state";
import { getWeeklySchedule, type WeeklySchedule } from "@/lib/api/schedules";
import { resolveAppError } from "@/lib/errors/resolve-app-error";
import { useChildren } from "@/lib/parent/children-context";
import { childDisplayName } from "@/lib/parent/labels";
import {
  loadSelectedScheduleStudentId,
  saveSelectedScheduleStudentId,
} from "@/lib/schedule/selected-child";
import { getMondayOfWeek } from "@/lib/schedule/week";
import { colors } from "@/lib/tokens/colors";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ParentScheduleScreen() {
  const { links, linksState, linksError, refreshLinks } = useChildren();
  const verifiedChildren = useMemo(
    () => links.filter((link) => link.isVerified === true),
    [links],
  );

  const [studentId, setStudentId] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(() => getMondayOfWeek());
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [loadState, setLoadState] = useState<
    "idle" | "loading" | "refreshing" | "ready" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const saved = await loadSelectedScheduleStudentId();
      if (cancelled) return;
      if (saved && verifiedChildren.some((c) => c.linkedUserId === saved)) {
        setStudentId(saved);
        return;
      }
      const first = verifiedChildren[0]?.linkedUserId ?? null;
      setStudentId(first);
    })();
    return () => {
      cancelled = true;
    };
  }, [verifiedChildren]);

  const selectChild = useCallback((id: string) => {
    setStudentId(id);
    void saveSelectedScheduleStudentId(id);
  }, []);

  const fetchSchedule = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!studentId) {
        setSchedule(null);
        setLoadState("idle");
        setError(null);
        return;
      }

      setLoadState((prev) =>
        options?.silent || prev === "ready" ? "refreshing" : "loading",
      );
      setError(null);
      try {
        const value = await getWeeklySchedule({
          weekStart,
          studentId,
        });
        setSchedule(value.data ?? null);
        setLoadState("ready");
      } catch (err) {
        setError(resolveAppError(err).reason);
        setLoadState("error");
      }
    },
    [studentId, weekStart],
  );

  useEffect(() => {
    void fetchSchedule();
  }, [fetchSchedule]);

  const linksLoading = linksState === "loading" && links.length === 0;
  const linksHardError = linksState === "error" && links.length === 0;

  if (linksLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (linksHardError) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <StatusBar style="dark" />
        <ScreenState
          kind="error"
          title="Không tải được danh sách con"
          message={linksError ?? "Vui lòng thử lại."}
          onAction={() => void refreshLinks({ force: true })}
        />
      </SafeAreaView>
    );
  }

  if (verifiedChildren.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="px-4 pt-2">
          <Text className="text-xl font-bold text-foreground">Lịch học</Text>
        </View>
        <ScreenState
          kind="empty"
          title="Chưa có con đã xác minh"
          message="Lịch tuần chỉ xem được cho học viên đã liên kết và xác minh."
        />
      </SafeAreaView>
    );
  }

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
        emptyMessage="Ngày này không có buổi học trong tuần của con."
        headerSlot={
          <View>
            <Text className="text-xl font-bold text-foreground">Lịch học</Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              Chọn con để xem thời khóa biểu tuần
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3"
              contentContainerStyle={{ gap: 8 }}
            >
              {verifiedChildren.map((child) => {
                const selected = child.linkedUserId === studentId;
                const name = childDisplayName(child);
                return (
                  <Pressable
                    key={child.linkedUserId}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => selectChild(child.linkedUserId)}
                    className="rounded-full px-3.5 py-2"
                    style={{
                      backgroundColor: selected
                        ? colors.primary
                        : colors.secondary,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{
                        color: selected
                          ? colors.primaryForeground
                          : colors.foreground,
                      }}
                    >
                      {name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
      />
    </SafeAreaView>
  );
}

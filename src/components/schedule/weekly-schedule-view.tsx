import { DOCK_CONTENT_PADDING } from "@/components/animated-dock";
import { ScheduleSessionRow } from "@/components/schedule/schedule-session-row";
import { ScreenState } from "@/components/screen-state";
import { FadeInContent, SkeletonBone } from "@/components/motion/skeleton";
import type { WeeklySchedule } from "@/lib/api/schedules";
import { motion } from "@/lib/motion/tokens";
import { useReduceMotion } from "@/lib/motion/use-reduce-motion";
import {
  buildWeekDates,
  dayNumberLabel,
  dayShortLabel,
  formatWeekRangeLabel,
  sessionsForDay,
  shiftWeek,
  todayIsoInHcm,
} from "@/lib/schedule/week";
import { colors } from "@/lib/tokens/colors";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";

type WeeklyScheduleViewProps = {
  weekStart: string;
  onWeekStartChange: (nextMonday: string) => void;
  schedule: WeeklySchedule | null;
  isLoading: boolean;
  isRefreshing?: boolean;
  error: string | null;
  onRetry: () => void;
  onRefresh?: () => void;
  headerSlot?: ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
};

export function WeeklyScheduleView({
  weekStart,
  onWeekStartChange,
  schedule,
  isLoading,
  isRefreshing = false,
  error,
  onRetry,
  onRefresh,
  headerSlot,
  emptyTitle = "Không có buổi học",
  emptyMessage = "Ngày này chưa có lịch trong tuần.",
}: WeeklyScheduleViewProps) {
  const reduceMotion = useReduceMotion();
  const weekDates = useMemo(() => buildWeekDates(weekStart), [weekStart]);
  const today = useMemo(() => todayIsoInHcm(), []);
  const defaultSelected =
    weekDates.find((d) => d === today) ?? weekDates[0] ?? weekStart;
  const [selectedDate, setSelectedDate] = useState(defaultSelected);
  const [dayWidth, setDayWidth] = useState(0);
  const pillX = useRef(new Animated.Value(0)).current;
  const listOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const next =
      weekDates.find((d) => d === today) ?? weekDates[0] ?? weekStart;
    setSelectedDate((prev) => (prev === next ? prev : next));
  }, [weekStart, weekDates, today]);

  const selectedIndex = Math.max(
    0,
    weekDates.findIndex((d) => d === selectedDate),
  );

  useEffect(() => {
    if (dayWidth <= 0) return;
    const gap = 6;
    const toValue = selectedIndex * (dayWidth + gap);
    if (reduceMotion) {
      pillX.setValue(toValue);
      return;
    }
    Animated.timing(pillX, {
      toValue,
      duration: motion.duration.fast,
      easing: motion.easeSmoothOut,
      useNativeDriver: true,
    }).start();
  }, [selectedIndex, dayWidth, reduceMotion, pillX]);

  useEffect(() => {
    if (reduceMotion) {
      listOpacity.setValue(1);
      return;
    }
    listOpacity.setValue(0);
    Animated.timing(listOpacity, {
      toValue: 1,
      duration: motion.duration.fast,
      easing: motion.easeSmoothOut,
      useNativeDriver: true,
    }).start();
  }, [selectedDate, reduceMotion, listOpacity]);

  const onDayStripLayout = (event: LayoutChangeEvent) => {
    const total = event.nativeEvent.layout.width;
    const gaps = 6 * 6;
    const width = Math.max((total - gaps) / 7, 0);
    setDayWidth(width);
    const gap = 6;
    pillX.setValue(selectedIndex * (width + gap));
  };

  const sessions = sessionsForDay(schedule, selectedDate);
  const rangeLabel = formatWeekRangeLabel(weekStart, schedule?.weekEnd);
  const showInitialLoading = isLoading && !schedule && !error;

  return (
    <View className="flex-1">
      <View className="px-4 pt-1">
        {headerSlot}

        <View className="mt-3 flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tuần trước"
            onPress={() => onWeekStartChange(shiftWeek(weekStart, -1))}
            className="h-10 w-10 items-center justify-center rounded-full bg-secondary active:opacity-80"
          >
            <ChevronLeft color={colors.foreground} size={22} />
          </Pressable>
          <Text className="text-sm font-semibold text-foreground">
            {rangeLabel}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tuần sau"
            onPress={() => onWeekStartChange(shiftWeek(weekStart, 1))}
            className="h-10 w-10 items-center justify-center rounded-full bg-secondary active:opacity-80"
          >
            <ChevronRight color={colors.foreground} size={22} />
          </Pressable>
        </View>

        <View
          className="relative mt-3 flex-row gap-1.5"
          onLayout={onDayStripLayout}
        >
          {dayWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: dayWidth,
                borderRadius: 16,
                backgroundColor: colors.primary,
                transform: [{ translateX: pillX }],
              }}
            />
          ) : null}

          {weekDates.map((iso) => {
            const isSelected = iso === selectedDate;
            const isToday = iso === today;
            const count = sessionsForDay(schedule, iso).length;
            return (
              <Pressable
                key={iso}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${dayShortLabel(iso)} ngày ${dayNumberLabel(iso)}`}
                onPress={() => setSelectedDate(iso)}
                className="z-10 flex-1 items-center rounded-2xl py-2"
                style={{
                  backgroundColor:
                    dayWidth > 0
                      ? "transparent"
                      : isSelected
                        ? colors.primary
                        : colors.secondary,
                }}
              >
                <Text
                  className="text-[11px] font-medium"
                  style={{
                    color: isSelected
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                  }}
                >
                  {dayShortLabel(iso)}
                </Text>
                <Text
                  className="mt-0.5 text-base font-bold"
                  style={{
                    color: isSelected
                      ? colors.primaryForeground
                      : colors.foreground,
                  }}
                >
                  {dayNumberLabel(iso)}
                </Text>
                {isToday && !isSelected ? (
                  <View
                    className="mt-1 h-1 w-1 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                ) : (
                  <View className="mt-1 h-1 w-1" />
                )}
                {count > 0 ? (
                  <Text
                    className="text-[9px] font-semibold"
                    style={{
                      color: isSelected
                        ? colors.primaryForeground
                        : colors.mutedForeground,
                    }}
                  >
                    {count} buổi
                  </Text>
                ) : (
                  <Text className="text-[9px] opacity-0">0 buổi</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {showInitialLoading ? (
        <View className="flex-1 px-4 pt-6">
          <SkeletonBone style={{ height: 20, width: 140, borderRadius: 8 }} />
          <SkeletonBone
            style={{ height: 88, borderRadius: 16, marginTop: 16 }}
          />
          <SkeletonBone
            style={{ height: 88, borderRadius: 16, marginTop: 12 }}
          />
          <SkeletonBone
            style={{ height: 88, borderRadius: 16, marginTop: 12 }}
          />
        </View>
      ) : error && !schedule ? (
        <ScreenState
          kind="error"
          title="Không tải được lịch"
          message={error}
          onAction={onRetry}
        />
      ) : (
        <FadeInContent style={{ flex: 1 }}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: DOCK_CONTENT_PADDING,
              flexGrow: 1,
            }}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                />
              ) : undefined
            }
          >
            {error ? (
              <Pressable
                onPress={onRetry}
                className="mb-3 rounded-xl border border-border bg-card px-3 py-2"
              >
                <Text className="text-sm text-primary">
                  {error} — chạm để thử lại
                </Text>
              </Pressable>
            ) : null}

            <Animated.View style={{ opacity: listOpacity }}>
              {sessions.length === 0 ? (
                <ScreenState
                  kind="empty"
                  title={emptyTitle}
                  message={emptyMessage}
                />
              ) : (
                <View className="gap-3">
                  {sessions.map((session) => (
                    <ScheduleSessionRow key={session.id} session={session} />
                  ))}
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </FadeInContent>
      )}
    </View>
  );
}

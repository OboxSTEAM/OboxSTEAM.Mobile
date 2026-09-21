import { DOCK_CONTENT_PADDING } from "@/components/animated-dock";
import { PopInText } from "@/components/motion/effects";
import { FadeInContent, SkeletonBone } from "@/components/motion/skeleton";
import { ModuleListItem } from "@/components/module-timeline-item";
import { ScreenState } from "@/components/screen-state";
import { StatusPill } from "@/components/status-pill";
import {
  getEnrollmentProgression,
  type ParentEnrollmentProgression,
} from "@/lib/api";
import { resolveAppError } from "@/lib/errors/resolve-app-error";
import { formatDateVi, formatRelativeVi } from "@/lib/format/date";
import {
  enrollmentStatusLabel,
  formatPercent,
} from "@/lib/parent/labels";
import {
  completedModuleCount,
  defaultExpandedModuleIndex,
  enrollmentScoreSummary,
} from "@/lib/parent/progress-insights";
import { colors } from "@/lib/tokens/colors";
import { Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

function EnrollmentSkeleton() {
  return (
    <View className="px-4 pt-2">
      <View className="items-center rounded-2xl border border-border bg-card px-4 py-5">
        <SkeletonBone style={{ height: 20, width: 192, borderRadius: 8 }} />
        <View className="mt-5 flex-row gap-8">
          <SkeletonBone style={{ height: 56, width: 56, borderRadius: 12 }} />
          <SkeletonBone style={{ height: 56, width: 56, borderRadius: 12 }} />
          <SkeletonBone style={{ height: 56, width: 56, borderRadius: 12 }} />
        </View>
        <SkeletonBone
          style={{
            height: 80,
            alignSelf: "stretch",
            borderRadius: 12,
            marginTop: 20,
          }}
        />
      </View>
      <SkeletonBone
        style={{ height: 20, width: 80, borderRadius: 8, marginTop: 20 }}
      />
      <SkeletonBone
        style={{ height: 80, borderRadius: 16, marginTop: 12 }}
      />
      <SkeletonBone
        style={{ height: 80, borderRadius: 16, marginTop: 12 }}
      />
      <SkeletonBone
        style={{ height: 80, borderRadius: 16, marginTop: 12 }}
      />
    </View>
  );
}

export default function EnrollmentDetailScreen() {
  const { studentId: rawStudentId, enrollmentId: rawEnrollmentId } =
    useLocalSearchParams<{
      studentId: string | string[];
      enrollmentId: string | string[];
    }>();

  const studentId = Array.isArray(rawStudentId)
    ? rawStudentId[0]
    : rawStudentId;
  const enrollmentId = Array.isArray(rawEnrollmentId)
    ? rawEnrollmentId[0]
    : rawEnrollmentId;

  const [data, setData] = useState<ParentEnrollmentProgression | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [didInitExpand, setDidInitExpand] = useState(false);

  const load = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!studentId || !enrollmentId) return;

      if (mode === "initial") setIsLoading(true);
      if (mode === "refresh") setIsRefreshing(true);
      setError(null);

      try {
        const value = await getEnrollmentProgression({
          studentId,
          enrollmentId,
        });
        setData(value.data ?? null);
      } catch (err) {
        setError(resolveAppError(err).reason);
        if (mode === "initial") setData(null);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [enrollmentId, studentId],
  );

  useEffect(() => {
    void load("initial");
  }, [load]);

  const modules = useMemo(
    () =>
      [...(data?.modules ?? [])].sort(
        (a, b) => (a.moduleOrder ?? 0) - (b.moduleOrder ?? 0),
      ),
    [data?.modules],
  );

  useEffect(() => {
    if (!data || didInitExpand || modules.length === 0) return;
    const index = defaultExpandedModuleIndex(modules);
    const target = modules[index];
    const id =
      target?.moduleId ?? target?.moduleEnrollmentId ?? `module-${index}`;
    setExpandedId(id);
    setDidInitExpand(true);
  }, [data, didInitExpand, modules]);

  if (!studentId || !enrollmentId) {
    return (
      <ScreenState
        kind="error"
        title="Thiếu thông tin"
        message="Không tìm thấy mã học viên hoặc chương trình."
      />
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-background">
        <EnrollmentSkeleton />
      </View>
    );
  }

  if (!data && error) {
    return (
      <ScreenState
        kind="error"
        title="Không tải được chi tiết"
        message={error}
        onAction={() => void load("initial")}
      />
    );
  }

  if (!data) {
    return (
      <ScreenState
        kind="empty"
        title="Chưa có dữ liệu"
        message="Không có chi tiết chương trình."
      />
    );
  }

  const header = data.enrollment;
  const status = enrollmentStatusLabel(header.status);
  const programTitle = header.programName?.trim() || "Chương trình";
  const moduleCounts = completedModuleCount(modules);
  const scoreSummary = enrollmentScoreSummary(modules);

  const metaCells: { label: string; value: string }[] = [];
  if (data.classInfo?.className) {
    metaCells.push({ label: "Lớp", value: data.classInfo.className });
  }
  if (data.classInfo?.mentorName) {
    metaCells.push({ label: "Mentor", value: data.classInfo.mentorName });
  }
  if (scoreSummary.averageGrade != null) {
    metaCells.push({
      label: "Điểm TB",
      value: formatCompact(scoreSummary.averageGrade),
    });
  }
  if (scoreSummary.totalAssignments > 0) {
    metaCells.push({
      label: "Đã chấm",
      value: `${scoreSummary.gradedCount}/${scoreSummary.totalAssignments}`,
    });
  }
  metaCells.push({
    label: "Truy cập",
    value: formatRelativeVi(header.lastAccessedAt),
  });
  if (header.enrolledAt) {
    metaCells.push({
      label: "Ghi danh",
      value: formatDateVi(header.enrolledAt),
    });
  }
  if (header.startedAt) {
    metaCells.push({
      label: "Bắt đầu",
      value: formatDateVi(header.startedAt),
    });
  }
  if (header.completedAt) {
    metaCells.push({
      label: "Hoàn thành",
      value: formatDateVi(header.completedAt),
    });
  }

  return (
    <>
      <Stack.Screen options={{ title: programTitle }} />
      <FadeInContent style={{ flex: 1 }}>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: DOCK_CONTENT_PADDING,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void load("refresh")}
            tintColor={colors.primary}
          />
        }
      >
        <View className="mb-4 rounded-2xl border border-border bg-card px-4 py-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1">
              <Text
                className="text-lg font-bold text-foreground"
                numberOfLines={2}
              >
                {programTitle}
              </Text>
              {header.programCode ? (
                <Text className="mt-0.5 text-sm text-muted-foreground">
                  {header.programCode}
                </Text>
              ) : null}
            </View>
            <StatusPill label={status.label} tone={status.tone} />
          </View>

          <View className="mt-5 flex-row items-start justify-center">
            <HeroStat
              value={formatPercent(header.progressPercent)}
              label="hoàn thành"
            />
            <View className="mx-2 h-12 w-px self-center bg-border" />
            <HeroStat
              value={`${moduleCounts.completed}/${moduleCounts.total}`}
              label="module"
            />
            <View className="mx-2 h-12 w-px self-center bg-border" />
            <HeroStat
              value={`${scoreSummary.attentionCount}`}
              label="cần chú ý"
              emphasize={scoreSummary.attentionCount > 0}
            />
          </View>

          {metaCells.length > 0 ? (
            <View className="mt-5 flex-row flex-wrap border-t border-border pt-3">
              {metaCells.map((cell) => (
                <MetaCell
                  key={cell.label}
                  label={cell.label}
                  value={cell.value}
                />
              ))}
            </View>
          ) : null}
        </View>

        <Text className="mb-2 text-base font-semibold text-foreground">
          Module
        </Text>
        {modules.length === 0 ? (
          <View className="rounded-2xl border border-border bg-card px-4 py-6">
            <Text className="text-center text-sm text-muted-foreground">
              Chưa có module.
            </Text>
          </View>
        ) : (
          modules.map((module, index) => {
            const id =
              module.moduleId ??
              module.moduleEnrollmentId ??
              `module-${index}`;
            return (
              <ModuleListItem
                key={id}
                module={module}
                index={index}
                expanded={expandedId === id}
                onToggle={() =>
                  setExpandedId((current) => (current === id ? null : id))
                }
              />
            );
          })
        )}

        {error ? (
          <Text className="mt-3 text-sm text-primary">{error}</Text>
        ) : null}
      </ScrollView>
      </FadeInContent>
    </>
  );
}

function HeroStat({
  value,
  label,
  emphasize = false,
}: {
  value: string;
  label: string;
  emphasize?: boolean;
}) {
  return (
    <View className="min-w-[72px] flex-1 items-center px-1">
      <PopInText
        value={value}
        className="text-[28px] font-bold leading-8"
        style={{
          color: emphasize ? colors.primary : colors.foreground,
          fontVariant: ["tabular-nums"],
        }}
      />
      <Text className="mt-1 text-center text-xs text-muted-foreground">
        {label}
      </Text>
    </View>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-3 w-1/2 pr-3">
      <Text className="text-[11px] text-muted-foreground">{label}</Text>
      <Text
        className="mt-0.5 text-sm font-medium text-foreground"
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function formatCompact(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

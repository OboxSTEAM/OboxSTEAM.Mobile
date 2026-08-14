import { DOCK_CONTENT_PADDING } from "@/components/animated-dock";
import { ModuleListItem } from "@/components/module-timeline-item";
import { ProgressBar } from "@/components/progress-bar";
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
      <View className="h-28 rounded-2xl bg-secondary" />
      <View className="mt-4 h-10 rounded-xl bg-secondary" />
      <View className="mt-5 h-5 w-24 rounded-lg bg-secondary" />
      <View className="mt-3 h-24 rounded-2xl bg-secondary" />
      <View className="mt-3 h-24 rounded-2xl bg-secondary" />
      <View className="mt-3 h-24 rounded-2xl bg-secondary" />
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
  const averageText =
    scoreSummary.averageGrade != null
      ? formatCompact(scoreSummary.averageGrade)
      : "—";

  return (
    <>
      <Stack.Screen options={{ title: programTitle }} />
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
        <View className="mb-4 rounded-2xl border border-border bg-card px-4 py-3">
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1">
              <Text className="text-lg font-bold text-foreground">
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

          <View className="mt-3">
            <View className="mb-1.5 flex-row items-center justify-between">
              <Text className="text-xs text-muted-foreground">Tiến độ</Text>
              <Text
                className="text-xs font-medium text-foreground"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {formatPercent(header.progressPercent)}
              </Text>
            </View>
            <ProgressBar percent={header.progressPercent} />
          </View>

          <Text className="mt-2 text-xs text-muted-foreground">
            {moduleCounts.completed}/{moduleCounts.total} module hoàn thành
            {" · "}
            Truy cập {formatRelativeVi(header.lastAccessedAt)}
          </Text>

          {(data.classInfo?.className || data.classInfo?.mentorName) && (
            <Text className="mt-1 text-xs text-muted-foreground">
              {[
                data.classInfo.className,
                data.classInfo.mentorName
                  ? `Mentor: ${data.classInfo.mentorName}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          )}

          {(header.enrolledAt || header.startedAt || header.completedAt) && (
            <Text className="mt-1 text-xs text-muted-foreground">
              {[
                header.enrolledAt
                  ? `Ghi danh ${formatDateVi(header.enrolledAt)}`
                  : null,
                header.startedAt
                  ? `Bắt đầu ${formatDateVi(header.startedAt)}`
                  : null,
                header.completedAt
                  ? `Hoàn thành ${formatDateVi(header.completedAt)}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          )}
        </View>

        <View className="mb-4 flex-row rounded-2xl border border-border bg-card px-3 py-3">
          <SummaryCell label="Điểm TB" value={averageText} />
          <View className="mx-2 w-px self-stretch bg-border" />
          <SummaryCell
            label="Đã chấm"
            value={`${scoreSummary.gradedCount}/${scoreSummary.totalAssignments}`}
          />
          <View className="mx-2 w-px self-stretch bg-border" />
          <SummaryCell
            label="Cần chú ý"
            value={`${scoreSummary.attentionCount}`}
            emphasize={scoreSummary.attentionCount > 0}
          />
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
    </>
  );
}

function SummaryCell({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <View className="flex-1 items-center px-1">
      <Text
        className="text-base font-semibold"
        style={{
          color: emphasize ? colors.primary : colors.foreground,
          fontVariant: ["tabular-nums"],
        }}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text className="mt-0.5 text-center text-[11px] text-muted-foreground">
        {label}
      </Text>
    </View>
  );
}

function formatCompact(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

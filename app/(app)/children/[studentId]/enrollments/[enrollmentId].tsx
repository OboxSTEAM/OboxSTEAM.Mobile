import { DOCK_CONTENT_PADDING } from "@/components/animated-dock";
import { ProgressBar } from "@/components/progress-bar";
import { ScreenState } from "@/components/screen-state";
import { StatusPill } from "@/components/status-pill";
import {
  getEnrollmentProgression,
  type ParentAssignmentOutcome,
  type ParentEnrollmentProgression,
  type ParentModuleProgress,
} from "@/lib/api";
import { resolveAppError } from "@/lib/errors/resolve-app-error";
import { formatDateVi, formatRelativeVi } from "@/lib/format/date";
import {
  assignmentTypeLabel,
  enrollmentStatusLabel,
  formatPercent,
  moduleTypeLabel,
  outcomeLabel,
} from "@/lib/parent/labels";
import { colors } from "@/lib/tokens/colors";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

function AssignmentRow({ assignment }: { assignment: ParentAssignmentOutcome }) {
  const typeLabel = assignmentTypeLabel(assignment.assignmentType);
  const scoreText =
    assignment.score != null && assignment.maxPoints != null
      ? `${assignment.score}/${assignment.maxPoints}`
      : assignment.score != null
        ? `${assignment.score}`
        : null;

  return (
    <View className="mt-2 rounded-xl bg-secondary px-3 py-2">
      <Text className="text-sm font-medium text-foreground">
        {assignment.title?.trim() || "Bài tập"}
      </Text>
      <Text className="mt-0.5 text-xs text-muted-foreground">
        {typeLabel}
        {assignment.status ? ` · ${assignment.status}` : ""}
        {scoreText ? ` · ${scoreText}` : ""}
      </Text>
      {assignment.dueDate ? (
        <Text className="mt-0.5 text-xs text-muted-foreground">
          Hạn: {formatDateVi(assignment.dueDate)}
        </Text>
      ) : null}
    </View>
  );
}

function ModuleCard({ module }: { module: ParentModuleProgress }) {
  const status = enrollmentStatusLabel(module.status);
  const outcome = outcomeLabel(module.outcomeLabel);
  const completed = module.activityStats?.completed ?? 0;
  const total = module.activityStats?.total ?? 0;
  const assignments = module.assignments ?? [];

  return (
    <View className="mb-3 rounded-2xl border border-border bg-card px-4 py-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xs text-muted-foreground">
            Module {module.moduleOrder ?? "—"} · {moduleTypeLabel(module.moduleType)}
          </Text>
          <Text className="mt-0.5 text-base font-semibold text-foreground">
            {module.moduleName?.trim() || "Module"}
          </Text>
        </View>
        <StatusPill
          label={module.outcomeLabel ? outcome.label : status.label}
          tone={module.outcomeLabel ? outcome.tone : status.tone}
        />
      </View>

      {module.isLocked ? (
        <Text className="mt-2 text-sm text-muted-foreground">
          {module.lockReason?.trim() || "Module đang bị khóa"}
        </Text>
      ) : null}

      <View className="mt-3">
        <View className="mb-1.5 flex-row items-center justify-between">
          <Text className="text-xs text-muted-foreground">Tiến độ</Text>
          <Text className="text-xs font-medium text-foreground">
            {formatPercent(module.progressPercent)}
          </Text>
        </View>
        <ProgressBar percent={module.progressPercent} />
      </View>

      <Text className="mt-2 text-xs text-muted-foreground">
        Hoạt động: {completed}/{total}
        {module.attemptNumber != null ? ` · Lần thử ${module.attemptNumber}` : ""}
        {module.finalGrade != null ? ` · Điểm ${module.finalGrade}` : ""}
      </Text>

      {module.completedAt ? (
        <Text className="mt-1 text-xs text-muted-foreground">
          Hoàn thành: {formatRelativeVi(module.completedAt)}
        </Text>
      ) : module.startedAt ? (
        <Text className="mt-1 text-xs text-muted-foreground">
          Bắt đầu: {formatRelativeVi(module.startedAt)}
        </Text>
      ) : null}

      {assignments.length > 0 ? (
        <View className="mt-2">
          <Text className="text-xs font-medium text-foreground">Bài tập</Text>
          {assignments.map((assignment, index) => (
            <AssignmentRow
              key={assignment.assignmentId ?? `assignment-${index}`}
              assignment={assignment}
            />
          ))}
        </View>
      ) : null}
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
    return <ScreenState kind="loading" message="Đang tải chi tiết…" />;
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
  const modules = [...(data.modules ?? [])].sort(
    (a, b) => (a.moduleOrder ?? 0) - (b.moduleOrder ?? 0),
  );

  return (
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
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground">
              {header.programName?.trim() || "Chương trình"}
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
            <Text className="text-xs font-medium text-foreground">
              {formatPercent(header.progressPercent)}
            </Text>
          </View>
          <ProgressBar percent={header.progressPercent} />
        </View>

        <Text className="mt-2 text-xs text-muted-foreground">
          Truy cập gần nhất: {formatRelativeVi(header.lastAccessedAt)}
        </Text>
      </View>

      {data.classInfo?.className || data.classInfo?.mentorName ? (
        <View className="mb-4 rounded-2xl border border-border bg-card px-4 py-3">
          <Text className="text-sm font-semibold text-foreground">Lớp học</Text>
          {data.classInfo.className ? (
            <Text className="mt-1 text-sm text-foreground">
              {data.classInfo.className}
            </Text>
          ) : null}
          {data.classInfo.mentorName ? (
            <Text className="mt-0.5 text-sm text-muted-foreground">
              Mentor: {data.classInfo.mentorName}
            </Text>
          ) : null}
        </View>
      ) : null}

      <Text className="mb-2 text-base font-semibold text-foreground">
        Timeline module
      </Text>
      {modules.length === 0 ? (
        <View className="rounded-2xl border border-border bg-card px-4 py-6">
          <Text className="text-center text-sm text-muted-foreground">
            Chưa có module.
          </Text>
        </View>
      ) : (
        modules.map((module, index) => (
          <ModuleCard
            key={module.moduleId ?? `module-${index}`}
            module={module}
          />
        ))
      )}

      {error ? (
        <Text className="mt-3 text-sm text-primary">{error}</Text>
      ) : null}
    </ScrollView>
  );
}

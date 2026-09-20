import { DOCK_CONTENT_PADDING } from "@/components/animated-dock";
import { ChildAvatar } from "@/components/child-avatar";
import { PressableScale } from "@/components/pressable-scale";
import { ProgressBar } from "@/components/progress-bar";
import { ScreenState } from "@/components/screen-state";
import { StatusPill } from "@/components/status-pill";
import type { ParentEnrollmentBrief, ParentProgressEvent } from "@/lib/api";
import { formatRelativeVi } from "@/lib/format/date";
import { useChildren } from "@/lib/parent/children-context";
import {
  blockerLabel,
  childDisplayName,
  enrollmentStatusLabel,
  formatPercent,
  PARENT_SECTIONS,
  programsSectionTitle,
  progressEventLabel,
  toneHex,
  visibleBlockers,
  visibleEnrollments,
} from "@/lib/parent/labels";
import { overallProgressPercent } from "@/lib/parent/progress-insights";
import { colors } from "@/lib/tokens/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Lock,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

const RECENT_PREVIEW = 3;

function EnrollmentCard({
  enrollment,
  onPress,
}: {
  enrollment: ParentEnrollmentBrief;
  onPress: () => void;
}) {
  const status = enrollmentStatusLabel(enrollment.status);
  const blockers = visibleBlockers(enrollment.blockers);
  const module = enrollment.currentModule;
  const moduleName = module?.moduleName?.trim();
  const activityName = enrollment.currentActivity?.activityName?.trim();
  const nextLine = moduleName
    ? module?.moduleOrder != null
      ? `Tiếp theo: Module ${module.moduleOrder} · ${moduleName}`
      : `Tiếp theo: ${moduleName}`
    : null;
  const primaryBlocker = blockers[0];

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={enrollment.programName ?? "Chương trình"}
      onPress={onPress}
      className="mb-3"
    >
      <View
        className="rounded-2xl border border-border bg-card px-4 py-3.5"
        style={CARD_SHADOW}
      >
        <View className="flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1">
            <Text
              className="text-base font-semibold text-foreground"
              numberOfLines={2}
            >
              {enrollment.programName?.trim() || "Chương trình"}
            </Text>
            <View className="mt-2">
              <StatusPill label={status.label} tone={status.tone} />
            </View>
          </View>
          <View className="h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <ChevronRight color={colors.foreground} size={18} />
          </View>
        </View>

        {nextLine ? (
          <Text
            className="mt-3 text-sm text-muted-foreground"
            numberOfLines={2}
          >
            {nextLine}
            {activityName ? ` · ${activityName}` : ""}
          </Text>
        ) : (
          <Text className="mt-3 text-sm text-muted-foreground" numberOfLines={1}>
            Truy cập gần nhất: {formatRelativeVi(enrollment.lastAccessedAt)}
          </Text>
        )}

        <View className="mt-3">
          <View className="mb-1.5 flex-row items-center justify-between">
            <Text className="text-xs text-muted-foreground">Tiến độ</Text>
            <Text
              className="text-xs font-semibold text-foreground"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {formatPercent(enrollment.progressPercent)}
            </Text>
          </View>
          <ProgressBar percent={enrollment.progressPercent} />
        </View>

        {primaryBlocker ? (
          <InlineBlocker
            message={
              primaryBlocker.message?.trim() ||
              blockerLabel(primaryBlocker.code).label
            }
            code={primaryBlocker.code}
            extraCount={blockers.length - 1}
          />
        ) : null}
      </View>
    </PressableScale>
  );
}

function InlineBlocker({
  message,
  code,
  extraCount,
}: {
  message: string;
  code?: string | null;
  extraCount: number;
}) {
  const mapped = blockerLabel(code);
  const hex = toneHex(mapped.tone);
  const Icon = code === "ModuleLocked" ? Lock : AlertTriangle;
  const label =
    extraCount > 0 ? `${message} (+${extraCount})` : message;

  return (
    <View
      className="mt-3 flex-row items-start gap-2 rounded-xl px-3 py-2"
      style={{ backgroundColor: `${hex}14` }}
    >
      <Icon color={hex} size={14} style={{ marginTop: 2 }} />
      <Text className="flex-1 text-xs font-medium" style={{ color: hex }}>
        {label}
      </Text>
    </View>
  );
}

function MilestoneRow({
  event,
  isLast,
}: {
  event: ParentProgressEvent;
  isLast: boolean;
}) {
  const { Icon } = milestoneIcon(event.type);
  const tone = milestoneTone(event.type);
  const hex = toneHex(tone);

  return (
    <View className="flex-row">
      <View className="mr-3 w-8 items-center">
        <View
          className="z-10 h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: `${hex}22` }}
        >
          <Icon color={hex} size={14} />
        </View>
        {!isLast ? (
          <View
            className="mt-1 w-0.5 flex-1"
            style={{ backgroundColor: colors.border, minHeight: 20 }}
          />
        ) : null}
      </View>

      <View
        className={`min-w-0 flex-1 rounded-2xl border border-border bg-card px-3.5 py-3 ${isLast ? "" : "mb-2"}`}
      >
        <Text className="text-sm font-semibold text-foreground">
          {event.title?.trim() || progressEventLabel(event.type)}
        </Text>
        {event.subtitle ? (
          <Text className="mt-0.5 text-sm text-muted-foreground">
            {event.subtitle}
          </Text>
        ) : null}
        <Text className="mt-1 text-xs text-muted-foreground">
          {formatRelativeVi(event.occurredAt)}
        </Text>
      </View>
    </View>
  );
}

function ProgressSkeleton() {
  return (
    <View className="px-4 pt-2">
      <View className="rounded-2xl border border-border bg-card px-4 py-3.5">
        <View className="flex-row items-center">
          <View className="h-14 w-14 rounded-[16px] bg-secondary" />
          <View className="ml-3 flex-1">
            <View className="h-5 w-36 rounded-lg bg-secondary" />
            <View className="mt-2 h-3 w-24 rounded-full bg-secondary" />
          </View>
          <View className="h-8 w-12 rounded-lg bg-secondary" />
        </View>
        <View className="mt-3 h-3 w-40 rounded-full bg-secondary" />
      </View>
      <View className="mt-5 h-5 w-40 rounded-lg bg-secondary" />
      <View className="mt-3 h-32 rounded-2xl bg-secondary" />
      <View className="mt-3 h-32 rounded-2xl bg-secondary" />
      <View className="mt-5 h-5 w-24 rounded-lg bg-secondary" />
      <View className="mt-3 h-16 rounded-2xl bg-secondary" />
      <View className="mt-2 h-16 rounded-2xl bg-secondary" />
    </View>
  );
}

export default function ChildProgressionScreen() {
  const router = useRouter();
  const { studentId: rawStudentId } = useLocalSearchParams<{
    studentId: string | string[];
  }>();
  const studentId = Array.isArray(rawStudentId)
    ? rawStudentId[0]
    : rawStudentId;

  const {
    links,
    getProgression,
    refreshProgression,
    markChildSeen,
  } = useChildren();

  const link = links.find((item) => item.linkedUserId === studentId);
  const entry = studentId ? getProgression(studentId) : null;
  const [showAllRecent, setShowAllRecent] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    void refreshProgression(studentId);
  }, [refreshProgression, studentId]);

  useEffect(() => {
    if (!studentId || entry?.state !== "ready") return;
    markChildSeen(studentId);
  }, [entry?.state, markChildSeen, studentId]);

  const data = entry?.data;
  const enrollments = useMemo(
    () => visibleEnrollments(data?.enrollments),
    [data?.enrollments],
  );

  if (!studentId) {
    return (
      <ScreenState
        kind="error"
        title="Thiếu thông tin học viên"
        message="Không tìm thấy mã học viên."
      />
    );
  }

  if (link && link.isVerified === false) {
    return (
      <ScreenState
        kind="empty"
        title="Chưa xác minh"
        message="Liên kết này chưa được xác minh nên chưa xem được tiến độ."
      />
    );
  }

  const isInitialLoading =
    !entry?.data &&
    (entry?.state === "loading" || entry?.state === "idle");

  if (isInitialLoading) {
    return (
      <View className="flex-1 bg-background">
        <ProgressSkeleton />
      </View>
    );
  }

  if (!entry?.data && entry?.state === "error") {
    return (
      <ScreenState
        kind="error"
        title="Không tải được tiến độ"
        message={entry.error ?? "Vui lòng thử lại."}
        onAction={() => void refreshProgression(studentId, { force: true })}
      />
    );
  }

  if (!data) {
    return (
      <ScreenState
        kind="empty"
        title="Chưa có dữ liệu"
        message="Chưa có thông tin tiến độ cho học viên này."
      />
    );
  }

  const student = data.student;
  const name = childDisplayName(student);
  const summary = data.summary;
  const allMilestones = data.recentMilestones ?? [];
  const milestones = showAllRecent
    ? allMilestones
    : allMilestones.slice(0, RECENT_PREVIEW);
  const hasMoreRecent = allMilestones.length > RECENT_PREVIEW;
  const overall = overallProgressPercent(enrollments);
  const activeCount =
    summary?.activeEnrollmentCount ??
    enrollments.filter((item) => item.status === "Active").length;

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
          refreshing={entry.state === "refreshing"}
          onRefresh={() =>
            void refreshProgression(studentId, { force: true })
          }
          tintColor={colors.primary}
        />
      }
    >
      <View
        className="mb-4 rounded-2xl border border-border bg-card px-4 py-3.5"
        style={CARD_SHADOW}
      >
        <View className="flex-row items-center gap-3">
          <ChildAvatar
            name={name}
            avatarUrl={student.avatarUrl}
            size={56}
            radius={16}
          />
          <View className="min-w-0 flex-1">
            <Text
              className="text-[22px] font-bold leading-7 text-foreground"
              numberOfLines={2}
            >
              {name}
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-1.5">
              {student.code ? (
                <StatusPill label={student.code} tone="neutral" />
              ) : null}
              <StatusPill
                label={student.isVerified ? "Đã xác minh" : "Chưa xác minh"}
                tone={student.isVerified ? "success" : "warning"}
              />
            </View>
          </View>
          <View className="items-end">
            <Text
              className="text-[28px] font-bold leading-8 text-foreground"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {formatPercent(overall)}
            </Text>
          </View>
        </View>

        <View className="mt-2.5 flex-row items-center gap-1.5">
          <Clock3 color={colors.mutedForeground} size={14} />
          <Text className="text-xs text-muted-foreground">
            Truy cập gần nhất: {formatRelativeVi(summary?.lastAccessedAt)}
          </Text>
        </View>
      </View>

      <Text className="mb-2 text-base font-semibold text-foreground">
        {programsSectionTitle(activeCount)}
      </Text>
      {enrollments.length === 0 ? (
        <View className="mb-4 rounded-2xl border border-border bg-card px-4 py-6">
          <Text className="text-center text-sm text-muted-foreground">
            Chưa có chương trình đang học.
          </Text>
        </View>
      ) : (
        enrollments.map((enrollment) => (
          <EnrollmentCard
            key={enrollment.enrollmentId}
            enrollment={enrollment}
            onPress={() => {
              router.push({
                pathname:
                  "/(parent)/children/[studentId]/enrollments/[enrollmentId]",
                params: {
                  studentId,
                  enrollmentId: enrollment.enrollmentId,
                },
              });
            }}
          />
        ))
      )}

      <Text className="mb-2 mt-2 text-base font-semibold text-foreground">
        {PARENT_SECTIONS.recent}
      </Text>
      {allMilestones.length === 0 ? (
        <View className="rounded-2xl border border-border bg-card px-4 py-6">
          <Text className="text-center text-sm text-muted-foreground">
            Chưa có cập nhật gần đây.
          </Text>
        </View>
      ) : (
        <>
          {milestones.map((event, index) => (
            <MilestoneRow
              key={event.id ?? `${event.type ?? "event"}-${index}`}
              event={event}
              isLast={index === milestones.length - 1}
            />
          ))}
          {hasMoreRecent && !showAllRecent ? (
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Xem thêm cập nhật gần đây"
              onPress={() => setShowAllRecent(true)}
              className="mt-1 min-h-11 items-center justify-center rounded-xl bg-secondary px-4"
            >
              <Text className="text-sm font-medium text-foreground">
                Xem thêm ({allMilestones.length - RECENT_PREVIEW})
              </Text>
            </PressableScale>
          ) : null}
        </>
      )}

      {entry.error ? (
        <Text className="mt-3 text-sm text-primary">{entry.error}</Text>
      ) : null}
    </ScrollView>
  );
}

function milestoneIcon(type?: string | null): { Icon: LucideIcon } {
  switch (type) {
    case "AssignmentPassed":
    case "ModuleCompleted":
    case "EnrollmentCompleted":
    case "ActivityCompleted":
      return { Icon: CheckCircle2 };
    case "AssignmentFailed":
    case "ModuleFailed":
      return { Icon: AlertTriangle };
    case "AssignmentSubmitted":
      return { Icon: BookOpen };
    default:
      return { Icon: Clock3 };
  }
}

function milestoneTone(
  type?: string | null,
): "success" | "danger" | "info" | "muted" | "warning" {
  switch (type) {
    case "AssignmentPassed":
    case "ModuleCompleted":
    case "EnrollmentCompleted":
    case "ActivityCompleted":
      return "success";
    case "AssignmentFailed":
    case "ModuleFailed":
      return "danger";
    case "AssignmentSubmitted":
      return "info";
    default:
      return "muted";
  }
}

const CARD_SHADOW = {
  shadowColor: colors.foreground,
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
  elevation: 1,
};

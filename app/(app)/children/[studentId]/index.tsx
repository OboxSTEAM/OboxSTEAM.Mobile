import { DOCK_CONTENT_PADDING } from "@/components/animated-dock";
import { ChildAvatar } from "@/components/child-avatar";
import { PressableScale } from "@/components/pressable-scale";
import { ProgressBar } from "@/components/progress-bar";
import { ProgressRing } from "@/components/progress-ring";
import { ScreenState } from "@/components/screen-state";
import { StatTile } from "@/components/stat-tile";
import { StatusPill } from "@/components/status-pill";
import type { ParentEnrollmentBrief, ParentProgressEvent } from "@/lib/api";
import { formatRelativeVi } from "@/lib/format/date";
import { useChildren } from "@/lib/parent/children-context";
import {
  blockerLabel,
  childDisplayName,
  enrollmentStatusLabel,
  formatPercent,
  levelLabel,
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
  Play,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

function EnrollmentCard({
  enrollment,
  onPress,
}: {
  enrollment: ParentEnrollmentBrief;
  onPress: () => void;
}) {
  const status = enrollmentStatusLabel(enrollment.status);
  const moduleName =
    enrollment.currentModule?.moduleName?.trim() || "Chưa có module hiện tại";
  const activityName = enrollment.currentActivity?.activityName?.trim();
  const blockers = visibleBlockers(enrollment.blockers);
  const level = enrollment.level ? levelLabel(enrollment.level) : null;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={enrollment.programName ?? "Chương trình"}
      onPress={onPress}
      className="mb-3"
    >
      <View className="rounded-[24px] bg-secondary p-1.5">
        <View className="rounded-[18px] bg-card px-3.5 py-3.5" style={CARD_SHADOW}>
          <View className="flex-row items-start gap-3">
            <ProgressRing
              percent={enrollment.progressPercent}
              size={64}
              strokeWidth={4}
              color={toneHex(status.tone === "muted" ? "info" : status.tone)}
            >
              <Text
                className="text-sm font-bold text-foreground"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {formatPercent(enrollment.progressPercent)}
              </Text>
            </ProgressRing>

            <View className="min-w-0 flex-1">
              <View className="flex-row items-start justify-between gap-2">
                <View className="min-w-0 flex-1">
                  <Text
                    className="text-base font-semibold text-foreground"
                    numberOfLines={2}
                  >
                    {enrollment.programName?.trim() || "Chương trình"}
                  </Text>
                  {enrollment.programCode ? (
                    <Text className="mt-0.5 text-xs text-muted-foreground">
                      {enrollment.programCode}
                    </Text>
                  ) : null}
                </View>
                <View className="h-9 w-9 items-center justify-center rounded-full bg-secondary">
                  <ChevronRight color={colors.foreground} size={18} />
                </View>
              </View>

              <View className="mt-2 flex-row flex-wrap gap-1.5">
                <StatusPill label={status.label} tone={status.tone} />
                {level && level !== "—" ? (
                  <StatusPill label={level} tone="neutral" />
                ) : null}
              </View>
            </View>
          </View>

          <View className="mt-3 rounded-xl bg-secondary px-3 py-2.5">
            <View className="flex-row items-center gap-2">
              <BookOpen color={colors.steam.engineering} size={16} />
              <Text
                className="flex-1 text-sm font-medium text-foreground"
                numberOfLines={2}
              >
                {moduleName}
              </Text>
            </View>
            {activityName ? (
              <View className="mt-1.5 flex-row items-center gap-2">
                <Play color={colors.mutedForeground} size={14} />
                <Text
                  className="flex-1 text-xs text-muted-foreground"
                  numberOfLines={1}
                >
                  {activityName}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="mt-3">
            <View className="mb-1.5 flex-row items-center justify-between">
              <Text className="text-xs text-muted-foreground">Tiến độ</Text>
              <Text
                className="text-xs font-semibold"
                style={{
                  color: colors.steam.technology,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {formatPercent(enrollment.progressPercent)}
              </Text>
            </View>
            <ProgressBar percent={enrollment.progressPercent} />
          </View>

          <View className="mt-2.5 flex-row items-center gap-1.5">
            <Clock3 color={colors.mutedForeground} size={14} />
            <Text className="text-xs text-muted-foreground">
              Truy cập gần nhất: {formatRelativeVi(enrollment.lastAccessedAt)}
            </Text>
          </View>

          {blockers.length > 0 ? (
            <View className="mt-3 gap-1.5">
              {blockers.map((blocker, index) => {
                const mapped = blockerLabel(blocker.code);
                const hex = toneHex(mapped.tone);
                const Icon =
                  blocker.code === "ModuleLocked" ? Lock : AlertTriangle;
                return (
                  <View
                    key={`${blocker.code ?? "blocker"}-${index}`}
                    className="flex-row items-start gap-2 rounded-xl px-3 py-2"
                    style={{ backgroundColor: `${hex}14` }}
                  >
                    <Icon color={hex} size={14} style={{ marginTop: 2 }} />
                    <Text
                      className="flex-1 text-xs font-medium"
                      style={{ color: hex }}
                    >
                      {blocker.message?.trim() || mapped.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
      </View>
    </PressableScale>
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
      <View className="flex-row items-center gap-3 rounded-[24px] bg-secondary p-1.5">
        <View className="h-[88px] flex-1 flex-row items-center rounded-[18px] bg-card px-4">
          <View className="h-16 w-16 rounded-full bg-secondary" />
          <View className="ml-3 flex-1">
            <View className="h-5 w-36 rounded-lg bg-secondary" />
            <View className="mt-2 h-3 w-24 rounded-full bg-secondary" />
          </View>
        </View>
      </View>
      <View className="mt-4 flex-row gap-2">
        <View className="h-20 flex-1 rounded-[20px] bg-secondary" />
        <View className="h-20 flex-1 rounded-[20px] bg-secondary" />
        <View className="h-20 flex-1 rounded-[20px] bg-secondary" />
      </View>
      <View className="mt-5 h-5 w-28 rounded-lg bg-secondary" />
      <View className="mt-3 h-36 rounded-[24px] bg-secondary" />
      <View className="mt-3 h-36 rounded-[24px] bg-secondary" />
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

  useEffect(() => {
    if (!studentId) return;
    void refreshProgression(studentId);
  }, [refreshProgression, studentId]);

  useEffect(() => {
    if (!studentId || entry?.state !== "ready") return;
    markChildSeen(studentId);
  }, [entry?.state, markChildSeen, studentId]);

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

  const data = entry?.data;
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
  const enrollments = visibleEnrollments(data.enrollments);
  const milestones = (data.recentMilestones ?? []).slice(0, 5);
  const overall = overallProgressPercent(enrollments);
  const milestoneTotal = (data.recentMilestones ?? []).length;

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
      <View className="mb-4 rounded-[24px] bg-secondary p-1.5">
        <View
          className="flex-row items-center rounded-[18px] bg-card px-3.5 py-3.5"
          style={CARD_SHADOW}
        >
          <ProgressRing
            percent={overall}
            size={80}
            strokeWidth={4}
            color={colors.steam.technology}
          >
            <ChildAvatar
              name={name}
              avatarUrl={student.avatarUrl}
              size={62}
              radius={18}
            />
          </ProgressRing>

          <View className="ml-3 min-w-0 flex-1">
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
            <View className="mt-2 flex-row items-center gap-1.5">
              <Clock3 color={colors.mutedForeground} size={14} />
              <Text className="text-xs text-muted-foreground">
                Truy cập gần nhất:{" "}
                {formatRelativeVi(summary?.lastAccessedAt)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mb-5 flex-row gap-2">
        <StatTile
          label="Đang học"
          value={`${summary?.activeEnrollmentCount ?? 0}`}
          icon={BookOpen}
          accentColor={colors.steam.engineering}
        />
        <StatTile
          label="Hoàn thành"
          value={`${summary?.completedEnrollmentCount ?? 0}`}
          icon={CheckCircle2}
          accentColor={colors.steam.technology}
        />
        <StatTile
          label="Cột mốc"
          value={`${milestoneTotal}`}
          icon={Clock3}
          accentColor={colors.steam.arts}
        />
      </View>

      <Text className="mb-2 text-base font-semibold text-foreground">
        Chương trình
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
                  "/children/[studentId]/enrollments/[enrollmentId]",
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
        Cột mốc gần đây
      </Text>
      {milestones.length === 0 ? (
        <View className="rounded-2xl border border-border bg-card px-4 py-6">
          <Text className="text-center text-sm text-muted-foreground">
            Chưa có cột mốc gần đây.
          </Text>
        </View>
      ) : (
        milestones.map((event, index) => (
          <MilestoneRow
            key={event.id ?? `${event.type ?? "event"}-${index}`}
            event={event}
            isLast={index === milestones.length - 1}
          />
        ))
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
  shadowOpacity: 0.05,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
};

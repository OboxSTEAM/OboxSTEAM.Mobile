import { DOCK_CONTENT_PADDING } from "@/components/animated-dock";
import { ChildAvatar } from "@/components/child-avatar";
import { ProgressBar } from "@/components/progress-bar";
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
  progressEventLabel,
} from "@/lib/parent/labels";
import { colors } from "@/lib/tokens/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Pressable,
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
  const blockers = enrollment.blockers ?? [];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={enrollment.programName ?? "Chương trình"}
      onPress={onPress}
      className="mb-3 rounded-2xl border border-border bg-card px-4 py-3 active:opacity-90"
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">
            {enrollment.programName?.trim() || "Chương trình"}
          </Text>
          {enrollment.programCode ? (
            <Text className="mt-0.5 text-xs text-muted-foreground">
              {enrollment.programCode}
            </Text>
          ) : null}
        </View>
        <StatusPill label={status.label} tone={status.tone} />
      </View>

      <View className="mt-3">
        <View className="mb-1.5 flex-row items-center justify-between">
          <Text className="text-xs text-muted-foreground">Tiến độ</Text>
          <Text className="text-xs font-medium text-foreground">
            {formatPercent(enrollment.progressPercent)}
          </Text>
        </View>
        <ProgressBar percent={enrollment.progressPercent} />
      </View>

      <Text className="mt-3 text-sm text-foreground" numberOfLines={2}>
        Module: {moduleName}
      </Text>
      {activityName ? (
        <Text className="mt-0.5 text-sm text-muted-foreground" numberOfLines={1}>
          Hoạt động: {activityName}
        </Text>
      ) : null}
      <Text className="mt-1 text-xs text-muted-foreground">
        Truy cập gần nhất: {formatRelativeVi(enrollment.lastAccessedAt)}
      </Text>

      {blockers.length > 0 ? (
        <View className="mt-3 gap-1.5">
          {blockers.map((blocker, index) => {
            const mapped = blockerLabel(blocker.code);
            return (
              <View
                key={`${blocker.code ?? "blocker"}-${index}`}
                className="rounded-lg bg-secondary px-3 py-2"
              >
                <Text className="text-xs font-medium text-foreground">
                  {blocker.message?.trim() || mapped.label}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </Pressable>
  );
}

function MilestoneRow({ event }: { event: ParentProgressEvent }) {
  return (
    <View className="mb-2 rounded-2xl border border-border bg-card px-4 py-3">
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
    return <ScreenState kind="loading" message="Đang tải tiến độ…" />;
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
  const enrollments = data.enrollments ?? [];
  const milestones = (data.recentMilestones ?? []).slice(0, 5);

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
      <View className="mb-4 flex-row items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
        <ChildAvatar name={name} avatarUrl={student.avatarUrl} size={56} />
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground">{name}</Text>
          {student.code ? (
            <Text className="mt-0.5 text-sm text-muted-foreground">
              {student.code}
            </Text>
          ) : null}
          <Text className="mt-1 text-xs text-muted-foreground">
            {student.isVerified ? "Đã xác minh" : "Chưa xác minh"}
          </Text>
        </View>
      </View>

      <View className="mb-4 flex-row gap-2">
        <StatTile
          label="Đang học"
          value={`${summary?.activeEnrollmentCount ?? 0}`}
        />
        <StatTile
          label="Hoàn thành"
          value={`${summary?.completedEnrollmentCount ?? 0}`}
        />
        <StatTile
          label="Truy cập gần nhất"
          value={formatRelativeVi(summary?.lastAccessedAt)}
        />
      </View>

      <Text className="mb-2 text-base font-semibold text-foreground">
        Chương trình
      </Text>
      {enrollments.length === 0 ? (
        <View className="mb-4 rounded-2xl border border-border bg-card px-4 py-6">
          <Text className="text-center text-sm text-muted-foreground">
            Chưa có chương trình.
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
          />
        ))
      )}

      {entry.error ? (
        <Text className="mt-3 text-sm text-primary">{entry.error}</Text>
      ) : null}
    </ScrollView>
  );
}

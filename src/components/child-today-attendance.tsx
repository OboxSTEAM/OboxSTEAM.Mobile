import { StatusPill } from "@/components/status-pill";
import type { ScheduleSession } from "@/lib/api/schedules";
import {
  attendanceStatusLabel,
  attendanceStatusTone,
  formatSessionTimeRange,
  sessionKindLabel,
} from "@/lib/schedule/week";
import { colors } from "@/lib/tokens/colors";
import { Text, View } from "react-native";

type ChildTodayAttendanceProps = {
  sessions: ScheduleSession[];
  isLoading?: boolean;
  error?: string | null;
};

const CARD_SHADOW = {
  shadowColor: colors.foreground,
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
  elevation: 1,
};

function SessionRow({
  session,
  showDivider,
}: {
  session: ScheduleSession;
  showDivider: boolean;
}) {
  const title =
    session.className?.trim() ||
    session.classCode?.trim() ||
    "Buổi học";
  const timeRange = formatSessionTimeRange(session.startTime, session.endTime);
  const kind = sessionKindLabel(session.sessionKind);
  const attendance = attendanceStatusLabel(session.attendanceStatus);
  const tone = attendanceStatusTone(session.attendanceStatus);

  return (
    <View className={showDivider ? "border-t border-border pt-3" : undefined}>
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Text
            className="text-sm font-semibold text-foreground"
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text className="mt-0.5 text-xs text-muted-foreground">
            {kind} · {timeRange}
          </Text>
        </View>
        {attendance ? (
          <StatusPill label={attendance} tone={tone} />
        ) : (
          <StatusPill label="Chưa có" tone="muted" />
        )}
      </View>
    </View>
  );
}

/** Compact “Hôm nay” attendance strip for Parent child detail. */
export function ChildTodayAttendance({
  sessions,
  isLoading,
  error,
}: ChildTodayAttendanceProps) {
  if (isLoading && sessions.length === 0) {
    return (
      <View className="mb-4">
        <Text className="mb-2 text-base font-semibold text-foreground">
          Hôm nay
        </Text>
        <View
          className="rounded-2xl border border-border bg-card px-4 py-4"
          style={CARD_SHADOW}
        >
          <View className="h-4 w-40 rounded-full bg-secondary" />
          <View className="mt-3 h-3 w-28 rounded-full bg-secondary" />
        </View>
      </View>
    );
  }

  return (
    <View className="mb-4">
      <Text className="mb-2 text-base font-semibold text-foreground">
        Hôm nay
      </Text>
      <View
        className="rounded-2xl border border-border bg-card px-4 py-3.5"
        style={CARD_SHADOW}
      >
        {error && sessions.length === 0 ? (
          <Text className="text-sm text-primary">{error}</Text>
        ) : sessions.length === 0 ? (
          <Text className="text-sm text-muted-foreground">
            Không có buổi Offline / trực tuyến hôm nay.
          </Text>
        ) : (
          <View className="gap-3">
            {sessions.map((session, index) => (
              <SessionRow
                key={session.id}
                session={session}
                showDivider={index > 0}
              />
            ))}
          </View>
        )}
        {error && sessions.length > 0 ? (
          <Text className="mt-3 text-xs text-primary">{error}</Text>
        ) : null}
      </View>
    </View>
  );
}

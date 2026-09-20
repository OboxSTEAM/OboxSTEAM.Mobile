import type { ScheduleSession } from "@/lib/api/schedules";
import {
  attendanceStatusLabel,
  formatSessionTimeRange,
  sessionKindLabel,
} from "@/lib/schedule/week";
import { colors } from "@/lib/tokens/colors";
import * as Linking from "expo-linking";
import { MapPin, Video } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

type ScheduleSessionRowProps = {
  session: ScheduleSession;
};

export function ScheduleSessionRow({ session }: ScheduleSessionRowProps) {
  const title =
    session.className?.trim() ||
    session.classCode?.trim() ||
    "Buổi học";
  const kind = sessionKindLabel(session.sessionKind);
  const timeRange = formatSessionTimeRange(session.startTime, session.endTime);
  const attendance = attendanceStatusLabel(session.attendanceStatus);
  const place =
    session.sessionKind === "LiveOnline"
      ? session.meetingUrl
        ? "Online"
        : "Trực tuyến"
      : session.location?.trim() || null;
  const canOpenMeeting =
    Boolean(session.meetingUrl) && session.sessionKind === "LiveOnline";

  return (
    <View className="rounded-2xl border border-border bg-card px-4 py-3.5">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground" numberOfLines={2}>
            {title}
          </Text>
          <Text className="mt-1 text-sm text-muted-foreground">{timeRange}</Text>
        </View>
        <View
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: `${colors.accent}22` }}
        >
          <Text className="text-[11px] font-semibold" style={{ color: colors.accent }}>
            {kind}
          </Text>
        </View>
      </View>

      {place ? (
        <View className="mt-2.5 flex-row items-center gap-1.5">
          {session.sessionKind === "LiveOnline" ? (
            <Video color={colors.mutedForeground} size={14} />
          ) : (
            <MapPin color={colors.mutedForeground} size={14} />
          )}
          <Text className="flex-1 text-sm text-muted-foreground" numberOfLines={1}>
            {place}
          </Text>
        </View>
      ) : null}

      {attendance ? (
        <Text className="mt-2 text-xs font-medium text-foreground">
          Điểm danh: {attendance}
        </Text>
      ) : null}

      {canOpenMeeting && session.meetingUrl ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Mở phòng học online"
          onPress={() => void Linking.openURL(session.meetingUrl!)}
          className="mt-3 h-10 items-center justify-center rounded-lg bg-secondary active:opacity-90"
        >
          <Text className="text-sm font-semibold text-foreground">
            Mở phòng học
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

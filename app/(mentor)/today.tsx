import { FadeInContent, SkeletonBone } from "@/components/motion/skeleton";
import { ScreenState } from "@/components/screen-state";
import { useAuth } from "@/lib/auth/auth-context";
import { resolveAppError } from "@/lib/errors/resolve-app-error";
import {
  groupMentorSessionsByProgram,
  isOfflineSession,
  mentorSessionSubtitle,
  mentorSessionTitle,
  getMentorSessionsForDay,
  type MentorDaySession,
  type MentorProgramGroup,
} from "@/lib/mentor/today-sessions";
import { colors } from "@/lib/tokens/colors";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QrCode, Camera } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function OfflineSessionActions({
  onOpenQr,
  onOpenCapture,
}: {
  onOpenQr: () => void;
  onOpenCapture: () => void;
}) {
  return (
    <View className="mt-4 gap-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mở QR điểm danh"
        onPress={onOpenQr}
        className="h-12 flex-row items-center justify-center gap-2 rounded-lg bg-primary active:opacity-90"
      >
        <QrCode color={colors.primaryForeground} size={18} />
        <Text className="text-base font-semibold text-primary-foreground">
          QR điểm danh
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Chụp khoảnh khắc"
        onPress={onOpenCapture}
        className="h-12 flex-row items-center justify-center gap-2 rounded-lg bg-secondary active:opacity-90"
      >
        <Camera color={colors.foreground} size={18} />
        <Text className="text-base font-semibold text-foreground">
          Chụp khoảnh khắc
        </Text>
      </Pressable>
    </View>
  );
}

function SessionCard({
  session,
  onOpenQr,
  onOpenCapture,
}: {
  session: MentorDaySession;
  onOpenQr: () => void;
  onOpenCapture: () => void;
}) {
  const showActions = isOfflineSession(session.sessionKind);

  return (
    <View className="rounded-2xl border border-border bg-card px-4 py-4">
      <Text className="text-base font-semibold text-foreground">
        {mentorSessionTitle(session)}
      </Text>
      <Text className="mt-1 text-sm text-muted-foreground">
        {mentorSessionSubtitle(session)}
      </Text>
      {session.location ? (
        <Text className="mt-1 text-sm text-muted-foreground">
          {session.location}
        </Text>
      ) : null}
      {showActions ? (
        <OfflineSessionActions
          onOpenQr={onOpenQr}
          onOpenCapture={onOpenCapture}
        />
      ) : null}
    </View>
  );
}

function ProgramSection({
  group,
  onOpenQr,
  onOpenCapture,
}: {
  group: MentorProgramGroup;
  onOpenQr: (session: MentorDaySession) => void;
  onOpenCapture: (session: MentorDaySession) => void;
}) {
  return (
    <View className="gap-3">
      <Text className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {group.programName}
      </Text>
      {group.sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onOpenQr={() => onOpenQr(session)}
          onOpenCapture={() => onOpenCapture(session)}
        />
      ))}
    </View>
  );
}

export default function MentorTodayScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const name = user?.fullName?.trim() || user?.email?.trim() || "Mentor";

  const [sessions, setSessions] = useState<MentorDaySession[]>([]);
  const [loadState, setLoadState] = useState<
    "idle" | "loading" | "refreshing" | "ready" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const programGroups = useMemo(
    () => groupMentorSessionsByProgram(sessions),
    [sessions],
  );

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!user?.id) return;
      setLoadState((prev) =>
        options?.silent || prev === "ready" ? "refreshing" : "loading",
      );
      setError(null);
      try {
        const next = await getMentorSessionsForDay(user.id);
        setSessions(next);
        setLoadState("ready");
      } catch (err) {
        setError(resolveAppError(err).reason);
        setLoadState("error");
      }
    },
    [user?.id],
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const isInitialLoading = loadState === "loading" && sessions.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View className="px-4 pt-2">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground">Hôm nay</Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              Xin chào, {name}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đăng xuất"
            onPress={async () => {
              await signOut();
              router.replace("/welcome");
            }}
            className="rounded-full bg-secondary px-3 py-2 active:opacity-80"
          >
            <Text className="text-xs font-semibold text-foreground">
              Đăng xuất
            </Text>
          </Pressable>
        </View>
      </View>

      {isInitialLoading ? (
        <View className="flex-1 px-4 pt-6">
          <SkeletonBone style={{ height: 20, width: 160, borderRadius: 8 }} />
          <SkeletonBone
            style={{ height: 120, borderRadius: 16, marginTop: 16 }}
          />
          <SkeletonBone
            style={{ height: 120, borderRadius: 16, marginTop: 12 }}
          />
        </View>
      ) : loadState === "error" && sessions.length === 0 ? (
        <ScreenState
          kind="error"
          title="Không tải được buổi học"
          message={error ?? "Vui lòng thử lại."}
          onAction={() => void load()}
        />
      ) : (
        <FadeInContent style={{ flex: 1 }}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 24,
              flexGrow: 1,
            }}
            refreshControl={
              <RefreshControl
                refreshing={loadState === "refreshing"}
                onRefresh={() => void load({ silent: true })}
                tintColor={colors.primary}
              />
            }
          >
            {error ? (
              <Pressable
                onPress={() => void load()}
                className="mb-3 rounded-xl border border-border bg-card px-3 py-2"
              >
                <Text className="text-sm text-primary">
                  {error} — chạm để thử lại
                </Text>
              </Pressable>
            ) : null}

            {sessions.length === 0 ? (
              <ScreenState
                kind="empty"
                title="Không có buổi hôm nay"
                message="Khi có buổi Offline / trực tuyến trong ngày, chúng sẽ hiện theo từng chương trình tại đây."
              />
            ) : (
              <View className="gap-8">
                {programGroups.map((group) => (
                  <ProgramSection
                    key={
                      group.programId ??
                      group.sessions[0]?.classId ??
                      group.programName
                    }
                    group={group}
                    onOpenQr={(session) =>
                      router.push({
                        pathname: "/(mentor)/qr/[sessionId]",
                        params: {
                          sessionId: session.id,
                          title: mentorSessionTitle(session),
                        },
                      })
                    }
                    onOpenCapture={(session) =>
                      router.push({
                        pathname: "/(mentor)/capture/[sessionId]",
                        params: {
                          sessionId: session.id,
                          classId: session.classId,
                          title: mentorSessionTitle(session),
                        },
                      })
                    }
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </FadeInContent>
      )}
    </SafeAreaView>
  );
}

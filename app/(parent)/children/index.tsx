import { DOCK_CONTENT_PADDING } from "@/components/animated-dock";
import { ChildProgressCard } from "@/components/child-progress-card";
import { PressableScale } from "@/components/pressable-scale";
import { ScreenState } from "@/components/screen-state";
import { useAuth } from "@/lib/auth/auth-context";
import { useNotifications } from "@/lib/notifications/notifications-context";
import { useChildren } from "@/lib/parent/children-context";
import {
  childDisplayName,
  givenName,
  progressPreview,
  progressStatusLine,
} from "@/lib/parent/labels";
import { colors } from "@/lib/tokens/colors";
import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import { useMemo } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChildrenListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const {
    links,
    linksState,
    linksError,
    refreshLinks,
    progressions,
    progressSummaryFor,
    newMilestoneCount,
  } = useChildren();

  const isInitialLoading = linksState === "loading" && links.length === 0;
  const isHardError = linksState === "error" && links.length === 0;

  const snapshot = useMemo(() => {
    const newUpdates = links.reduce((sum, link) => {
      if (!link.isVerified) return sum;
      return sum + newMilestoneCount(link.linkedUserId);
    }, 0);
    return {
      childCount: links.length,
      newUpdates,
    };
  }, [links, newMilestoneCount]);

  if (isInitialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <HomeSkeleton />
      </SafeAreaView>
    );
  }

  if (isHardError) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <ScreenState
          kind="error"
          title="Không tải được danh sách"
          message={linksError ?? "Vui lòng thử lại."}
          onAction={() => void refreshLinks({ force: true })}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View
        pointerEvents="none"
        className="absolute -right-16 -top-10 h-52 w-52 rounded-full"
        style={{ backgroundColor: `${colors.primary}12` }}
      />
      <FlatList
        data={links}
        keyExtractor={(item) => item.linkedUserId}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: DOCK_CONTENT_PADDING,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={linksState === "refreshing"}
            onRefresh={() => void refreshLinks({ force: true })}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <HomeHeader
            displayName={givenName(user?.fullName, "Phụ huynh")}
            childCount={snapshot.childCount}
            newUpdates={snapshot.newUpdates}
            unreadCount={unreadCount}
            linksError={linksError}
            onOpenNotifications={() => router.push("/(parent)/notifications")}
          />
        }
        ListEmptyComponent={
          <ScreenState
            kind="empty"
            title="Chưa có học viên liên kết"
            message="Khi con gửi yêu cầu liên kết và được xác minh, tiến độ học sẽ hiện tại đây."
          />
        }
        renderItem={({ item }) => {
          const name = childDisplayName(item);
          const verified = item.isVerified === true;
          const entry = progressions[item.linkedUserId];
          const progression = verified
            ? progressSummaryFor(item.linkedUserId)
            : null;
          const isLoading =
            verified &&
            !entry?.data &&
            (entry?.state === "loading" ||
              entry?.state === "idle" ||
              entry == null);
          const preview = verified ? progressPreview(progression) : null;

          return (
            <ChildProgressCard
              name={name}
              avatarUrl={item.avatarUrl}
              verified={verified}
              isLoading={isLoading}
              statusLine={
                verified ? progressStatusLine(progression) : "Chờ xác minh liên kết"
              }
              percent={preview?.percent ?? null}
              newCount={verified ? newMilestoneCount(item.linkedUserId) : 0}
              onPress={() => {
                if (!verified) return;
                router.push({
                  pathname: "/(parent)/children/[studentId]",
                  params: { studentId: item.linkedUserId },
                });
              }}
            />
          );
        }}
      />
    </SafeAreaView>
  );
}

function HomeHeader({
  displayName,
  childCount,
  newUpdates,
  unreadCount,
  linksError,
  onOpenNotifications,
}: {
  displayName: string;
  childCount: number;
  newUpdates: number;
  unreadCount: number;
  linksError: string | null;
  onOpenNotifications: () => void;
}) {
  return (
    <View className="mb-5">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 pr-2">
          <Text className="text-sm text-muted-foreground">
            {timeGreeting()}
          </Text>
          <Text
            className="mt-0.5 text-[28px] font-bold leading-[34px] text-foreground"
            numberOfLines={1}
          >
            {displayName}
          </Text>
          <Text className="mt-1 text-sm leading-5 text-muted-foreground">
            Theo dõi tiến độ học của con.
          </Text>
        </View>

        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Mở thông báo"
          onPress={onOpenNotifications}
          className="h-11 w-11 items-center justify-center rounded-full bg-card"
          style={{
            minHeight: 44,
            minWidth: 44,
            shadowColor: colors.foreground,
            shadowOpacity: 0.06,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
          }}
        >
          <View className="h-11 w-11 items-center justify-center rounded-full bg-card">
            <Bell color={colors.foreground} size={20} />
            {unreadCount > 0 ? (
              <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />
            ) : null}
          </View>
        </PressableScale>
      </View>

      {newUpdates > 0 ? (
        <View
          className="mt-4 rounded-2xl px-4 py-3"
          style={{ backgroundColor: `${colors.primary}14` }}
        >
          <Text className="text-sm font-medium text-primary">
            {newUpdates} cập nhật tiến độ mới
          </Text>
        </View>
      ) : null}

      {linksError ? (
        <Text className="mt-2 text-sm text-primary">{linksError}</Text>
      ) : null}

      {childCount > 0 ? (
        <Text className="mb-3 mt-6 text-base font-semibold text-foreground">
          Con của bạn
        </Text>
      ) : null}
    </View>
  );
}

function HomeSkeleton() {
  return (
    <View className="px-4 pt-3">
      <View className="h-4 w-28 rounded-full bg-secondary" />
      <View className="mt-2 h-8 w-40 rounded-xl bg-secondary" />
      <View className="mt-2 h-4 w-56 rounded-full bg-secondary" />
      <View className="mt-6 h-5 w-24 rounded-lg bg-secondary" />
      <View className="mt-3 h-[72px] flex-row items-center rounded-2xl border border-border bg-card px-4">
        <View className="h-12 w-12 rounded-[14px] bg-secondary" />
        <View className="ml-3 flex-1">
          <View className="h-4 w-32 rounded-full bg-secondary" />
          <View className="mt-2 h-3 w-48 rounded-full bg-secondary" />
        </View>
      </View>
      <View className="mt-3 h-[72px] flex-row items-center rounded-2xl border border-border bg-card px-4">
        <View className="h-12 w-12 rounded-[14px] bg-secondary" />
        <View className="ml-3 flex-1">
          <View className="h-4 w-28 rounded-full bg-secondary" />
          <View className="mt-2 h-3 w-40 rounded-full bg-secondary" />
        </View>
      </View>
    </View>
  );
}

function timeGreeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

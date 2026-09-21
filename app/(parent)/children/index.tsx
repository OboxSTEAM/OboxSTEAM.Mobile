import { DOCK_CONTENT_PADDING } from "@/components/animated-dock";
import { ChildProgressCard } from "@/components/child-progress-card";
import { FadeInContent, SkeletonBone } from "@/components/motion/skeleton";
import { ScreenState } from "@/components/screen-state";
import { useAuth } from "@/lib/auth/auth-context";
import { useChildren } from "@/lib/parent/children-context";
import {
  childDisplayName,
  givenName,
  progressPreview,
  progressStatusLine,
} from "@/lib/parent/labels";
import { colors } from "@/lib/tokens/colors";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChildrenListScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
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
      <FadeInContent style={{ flex: 1 }}>
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
            email={user?.email?.trim() || null}
            phone={user?.phone?.trim() || null}
            childCount={snapshot.childCount}
            newUpdates={snapshot.newUpdates}
            linksError={linksError}
            onSignOut={async () => {
              await signOut();
              router.replace("/welcome");
            }}
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
      </FadeInContent>
    </SafeAreaView>
  );
}

function HomeHeader({
  displayName,
  email,
  phone,
  childCount,
  newUpdates,
  linksError,
  onSignOut,
}: {
  displayName: string;
  email: string | null;
  phone: string | null;
  childCount: number;
  newUpdates: number;
  linksError: string | null;
  onSignOut: () => void | Promise<void>;
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
          {email ? (
            <Text
              className="mt-1 text-sm leading-5 text-muted-foreground"
              numberOfLines={1}
            >
              {email}
            </Text>
          ) : null}
          {phone ? (
            <Text
              className="mt-0.5 text-sm leading-5 text-muted-foreground"
              numberOfLines={1}
            >
              {phone}
            </Text>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Đăng xuất"
          onPress={() => void onSignOut()}
          className="rounded-full bg-secondary px-3 py-2 active:opacity-80"
        >
          <Text className="text-xs font-semibold text-foreground">
            Đăng xuất
          </Text>
        </Pressable>
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
      <SkeletonBone style={{ height: 16, width: 112, borderRadius: 999 }} />
      <SkeletonBone
        style={{ height: 32, width: 160, borderRadius: 12, marginTop: 8 }}
      />
      <SkeletonBone
        style={{ height: 16, width: 224, borderRadius: 999, marginTop: 8 }}
      />
      <SkeletonBone
        style={{ height: 20, width: 96, borderRadius: 8, marginTop: 24 }}
      />
      <SkeletonBone
        style={{ height: 72, borderRadius: 16, marginTop: 12 }}
      />
      <SkeletonBone
        style={{ height: 72, borderRadius: 16, marginTop: 12 }}
      />
    </View>
  );
}

function timeGreeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Chào buổi sáng";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

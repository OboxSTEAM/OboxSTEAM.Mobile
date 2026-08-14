import { ChildAvatar } from "@/components/child-avatar";
import { DOCK_CONTENT_PADDING } from "@/components/animated-dock";
import { ScreenState } from "@/components/screen-state";
import { useAuth } from "@/lib/auth/auth-context";
import { useChildren } from "@/lib/parent/children-context";
import {
  childDisplayName,
  progressSummaryLine,
} from "@/lib/parent/labels";
import { colors } from "@/lib/tokens/colors";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
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
  const { user } = useAuth();
  const {
    links,
    linksState,
    linksError,
    refreshLinks,
    progressSummaryFor,
    newMilestoneCount,
  } = useChildren();

  const isInitialLoading = linksState === "loading" && links.length === 0;
  const isHardError = linksState === "error" && links.length === 0;

  if (isInitialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <ScreenState kind="loading" message="Đang tải danh sách con…" />
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
      <FlatList
        data={links}
        keyExtractor={(item) => item.linkedUserId}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
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
          <View className="mb-4">
            <Text className="text-sm text-muted-foreground">Xin chào</Text>
            <Text
              className="mt-0.5 text-xl font-bold text-foreground"
              numberOfLines={1}
            >
              {user?.fullName || user?.email || "Phụ huynh"}
            </Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              Chạm vào con để xem tiến độ học.
            </Text>
            {linksError ? (
              <Text className="mt-2 text-sm text-primary">{linksError}</Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <ScreenState
            kind="empty"
            title="Chưa có học viên liên kết"
            message="Khi con gửi yêu cầu liên kết và được xác minh, danh sách sẽ hiện tại đây."
          />
        }
        renderItem={({ item }) => {
          const name = childDisplayName(item);
          const verified = item.isVerified === true;
          const progression = progressSummaryFor(item.linkedUserId);
          const summary = verified
            ? progressSummaryLine(progression)
            : "Chưa xác minh — chưa xem được tiến độ";
          const newCount = verified
            ? newMilestoneCount(item.linkedUserId)
            : 0;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${name}. ${summary}`}
              disabled={!verified}
              onPress={() => {
                if (!verified) return;
                router.push({
                  pathname: "/children/[studentId]",
                  params: { studentId: item.linkedUserId },
                });
              }}
              className={`mb-3 flex-row items-center rounded-2xl border border-border bg-card px-4 py-3 ${
                verified ? "active:opacity-90" : "opacity-60"
              }`}
              style={{ minHeight: 72 }}
            >
              <ChildAvatar
                name={name}
                avatarUrl={item.avatarUrl}
                size={52}
              />
              <View className="ml-3 flex-1">
                <View className="flex-row items-center gap-2">
                  <Text
                    className="flex-shrink text-base font-semibold text-foreground"
                    numberOfLines={1}
                  >
                    {name}
                  </Text>
                  {verified ? (
                    <View className="rounded-full bg-secondary px-2 py-0.5">
                      <Text className="text-[11px] font-medium text-steam-technology">
                        Đã xác minh
                      </Text>
                    </View>
                  ) : null}
                  {newCount > 0 ? (
                    <View className="rounded-full bg-primary px-2 py-0.5">
                      <Text className="text-[11px] font-semibold text-primary-foreground">
                        +{newCount} mới
                      </Text>
                    </View>
                  ) : null}
                </View>
                {item.code ? (
                  <Text className="mt-0.5 text-xs text-muted-foreground">
                    {item.code}
                  </Text>
                ) : null}
                <Text
                  className="mt-1 text-sm text-muted-foreground"
                  numberOfLines={2}
                >
                  {summary}
                </Text>
              </View>
              {verified ? (
                <ChevronRight color={colors.mutedForeground} size={20} />
              ) : null}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

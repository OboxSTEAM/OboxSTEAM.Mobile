import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { DOCK_CONTENT_PADDING } from "@/components/animated-dock";
import { NotificationRow } from "@/components/notification-row";
import { ScreenState } from "@/components/screen-state";
import type { Notification } from "@/lib/api/entities/notification";
import { useChildren } from "@/lib/parent/children-context";
import { useNotifications } from "@/lib/notifications/notifications-context";
import {
  navigateNotificationRoute,
  resolveNotificationRoute,
} from "@/lib/notifications/navigate";
import { colors } from "@/lib/tokens/colors";

export default function NotificationsScreen() {
  const router = useRouter();
  const { links } = useChildren();
  const {
    items,
    unreadCount,
    listState,
    listError,
    hasNext,
    unreadOnly,
    isStale,
    setUnreadOnly,
    refresh,
    loadMore,
    markRead,
    markAllRead,
  } = useNotifications();

  const isInitialLoading = listState === "loading" && items.length === 0;
  const isHardError = listState === "error" && items.length === 0;

  const onPressItem = useCallback(
    (item: Notification) => {
      void markRead(item.id);
      const route = resolveNotificationRoute(item, links);
      navigateNotificationRoute(router, route);
    },
    [links, markRead, router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => (
      <NotificationRow item={item} onPress={onPressItem} />
    ),
    [onPressItem],
  );

  if (isInitialLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <InboxSkeleton />
      </SafeAreaView>
    );
  }

  if (isHardError) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <ScreenState
          kind="error"
          title="Không tải được thông báo"
          message={listError ?? "Vui lòng thử lại."}
          onAction={() => void refresh({ force: true })}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 4,
          paddingBottom: DOCK_CONTENT_PADDING,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={listState === "refreshing"}
            onRefresh={() => void refresh({ force: true })}
            tintColor={colors.primary}
          />
        }
        onEndReached={() => {
          if (hasNext) void loadMore();
        }}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <InboxHeader
            unreadCount={unreadCount}
            unreadOnly={unreadOnly}
            isStale={isStale}
            listError={listError}
            onToggleUnreadOnly={() => setUnreadOnly(!unreadOnly)}
            onMarkAll={() => void markAllRead()}
          />
        }
        ListEmptyComponent={
          <ScreenState
            kind="empty"
            title={unreadOnly ? "Không có chưa đọc" : "Chưa có thông báo"}
            message={
              unreadOnly
                ? "Bạn đã đọc hết thông báo hiện tại."
                : "Khi có cập nhật học tập hoặc thanh toán, thông báo sẽ hiện tại đây."
            }
          />
        }
        ListFooterComponent={
          hasNext && listState !== "refreshing" ? (
            <View className="items-center py-4">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function InboxHeader({
  unreadCount,
  unreadOnly,
  isStale,
  listError,
  onToggleUnreadOnly,
  onMarkAll,
}: {
  unreadCount: number;
  unreadOnly: boolean;
  isStale: boolean;
  listError: string | null;
  onToggleUnreadOnly: () => void;
  onMarkAll: () => void;
}) {
  return (
    <View className="mb-4">
      <Text className="text-xl font-bold text-foreground">Thông báo</Text>
      <Text className="mt-1 text-sm text-muted-foreground">
        {unreadCount > 0
          ? `${unreadCount} thông báo chưa đọc`
          : "Bạn đã đọc hết thông báo."}
      </Text>

      {isStale ? (
        <View
          className="mt-3 rounded-xl px-3 py-2.5"
          style={{ backgroundColor: `${colors.steam.arts}33` }}
        >
          <Text className="text-sm text-foreground">
            Đang hiển thị bản đã lưu. Sẽ đồng bộ khi có mạng.
          </Text>
        </View>
      ) : null}

      {listError && !isStale ? (
        <Text className="mt-2 text-sm text-primary">{listError}</Text>
      ) : null}

      <View className="mt-4 flex-row flex-wrap items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: unreadOnly }}
          onPress={onToggleUnreadOnly}
          className={`h-11 items-center justify-center rounded-lg px-3 ${
            unreadOnly ? "bg-primary" : "bg-secondary"
          }`}
          style={{ minHeight: 44 }}
        >
          <Text
            className={`text-sm font-medium ${
              unreadOnly ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            Chưa đọc
          </Text>
        </Pressable>

        {unreadCount > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đánh dấu tất cả đã đọc"
            onPress={onMarkAll}
            className="h-11 items-center justify-center rounded-lg bg-secondary px-3"
            style={{ minHeight: 44 }}
          >
            <Text className="text-sm font-medium text-foreground">
              Đánh dấu tất cả đã đọc
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function InboxSkeleton() {
  return (
    <View className="px-4 pt-3">
      <View className="h-7 w-36 rounded-xl bg-secondary" />
      <View className="mt-2 h-4 w-48 rounded-full bg-secondary" />
      <View className="mt-5 h-20 rounded-2xl bg-secondary" />
      <View className="mt-2 h-20 rounded-2xl bg-secondary" />
      <View className="mt-2 h-20 rounded-2xl bg-secondary" />
    </View>
  );
}

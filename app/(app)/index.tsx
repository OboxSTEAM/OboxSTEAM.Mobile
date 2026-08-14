import { getParentLinks, type ParentLink } from "@/lib/api";
import { useAuth } from "@/lib/auth/auth-context";
import { resolveAppError } from "@/lib/errors/resolve-app-error";
import { childDisplayName } from "@/lib/parent/labels";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

export default function ChildrenHomeScreen() {
  const { user, signOut } = useAuth();
  const [links, setLinks] = useState<ParentLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const value = await getParentLinks();
      setLinks(value.data ?? []);
    } catch (err) {
      setError(resolveAppError(err).reason);
      setLinks([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View className="flex-1 bg-background px-4 pt-2">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-sm text-muted-foreground">Xin chào</Text>
          <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
            {user?.fullName || user?.email || "Parent"}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Đăng xuất"
          onPress={() => void signOut()}
          className="rounded-lg bg-secondary px-3 py-2"
        >
          <Text className="text-sm font-medium text-foreground">Đăng xuất</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#E94B3C" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-center text-base text-muted-foreground">
            {error}
          </Text>
          <Pressable
            onPress={() => {
              setIsLoading(true);
              void load();
            }}
            className="mt-4 rounded-lg bg-primary px-4 py-3"
          >
            <Text className="font-semibold text-primary-foreground">Thử lại</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={links}
          keyExtractor={(item) => item.linkedUserId}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                void load();
              }}
              tintColor="#E94B3C"
            />
          }
          ListEmptyComponent={
            <View className="items-center px-4 pt-16">
              <Text className="text-center text-base text-muted-foreground">
                Chưa có học viên liên kết. Khi con gửi yêu cầu liên kết, danh
                sách sẽ hiện tại đây.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="mb-3 rounded-2xl border border-border bg-card px-4 py-3">
              <Text className="text-base font-semibold text-foreground">
                {childDisplayName(item)}
              </Text>
              {item.code ? (
                <Text className="mt-1 text-sm text-muted-foreground">
                  {item.code}
                </Text>
              ) : null}
              <Text className="mt-1 text-sm text-muted-foreground">
                {item.isVerified ? "Đã xác minh" : "Chưa xác minh"}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

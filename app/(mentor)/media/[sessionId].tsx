import { FadeInContent, SkeletonBone } from "@/components/motion/skeleton";
import { ScreenState } from "@/components/screen-state";
import {
  deleteMedia,
  getMediaByClassSession,
  type MediaAsset,
} from "@/lib/api/media";
import { resolveAppError } from "@/lib/errors/resolve-app-error";
import {
  mediaFileTypeLabel,
  resolveMediaSourceLabel,
} from "@/lib/mentor/media-source";
import { colors } from "@/lib/tokens/colors";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Camera, Trash2 } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function MediaRow({
  item,
  sessionTitle,
  sessionTime,
  onOpen,
  onDelete,
  isDeleting,
}: {
  item: MediaAsset;
  sessionTitle?: string | null;
  sessionTime?: string | null;
  onOpen: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const source = resolveMediaSourceLabel(item, sessionTitle, sessionTime);
  const isVideo = (item.fileType ?? "").toLowerCase().includes("video");
  const url = item.fileUrl?.trim();

  return (
    <Pressable
      onPress={onOpen}
      className="flex-row gap-3 rounded-2xl border border-border bg-card p-3 active:opacity-90"
    >
      <View className="h-20 w-20 overflow-hidden rounded-xl bg-secondary">
        {url && !isVideo ? (
          <Image
            source={{ uri: url }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-xs font-semibold text-muted-foreground">
              {mediaFileTypeLabel(item.fileType)}
            </Text>
          </View>
        )}
      </View>
      <View className="min-w-0 flex-1 justify-center">
        <Text className="text-sm font-semibold text-foreground">
          {mediaFileTypeLabel(item.fileType)}
          {item.statusLabel ? ` · ${item.statusLabel}` : ""}
        </Text>
        <Text className="mt-1 text-xs font-medium text-primary">
          Nguồn · {source.title}
        </Text>
        {source.detail ? (
          <Text
            className="mt-0.5 text-xs text-muted-foreground"
            numberOfLines={2}
          >
            {source.detail}
          </Text>
        ) : null}
        {item.uploadedAt ? (
          <Text className="mt-1 text-xs text-muted-foreground">
            {item.uploadedAt}
          </Text>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Xóa media"
        disabled={isDeleting}
        onPress={(e) => {
          e.stopPropagation?.();
          onDelete();
        }}
        className="h-10 w-10 items-center justify-center self-center rounded-lg bg-secondary active:opacity-80 disabled:opacity-50"
      >
        {isDeleting ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Trash2 color={colors.primary} size={16} />
        )}
      </Pressable>
    </Pressable>
  );
}

export default function MentorSessionMediaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sessionId: string;
    classId: string;
    title?: string;
    subtitle?: string;
  }>();
  const sessionId = Array.isArray(params.sessionId)
    ? params.sessionId[0]
    : params.sessionId;
  const classId = Array.isArray(params.classId)
    ? params.classId[0]
    : params.classId;
  const titleParam = Array.isArray(params.title) ? params.title[0] : params.title;
  const subtitleParam = Array.isArray(params.subtitle)
    ? params.subtitle[0]
    : params.subtitle;

  const [items, setItems] = useState<MediaAsset[]>([]);
  const [loadState, setLoadState] = useState<
    "idle" | "loading" | "refreshing" | "ready" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [detail, setDetail] = useState<MediaAsset | null>(null);

  const load = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!sessionId) return;
      setLoadState((prev) =>
        options?.silent || prev === "ready" ? "refreshing" : "loading",
      );
      setError(null);
      try {
        const value = await getMediaByClassSession({ classSessionId: sessionId });
        setItems(value.data ?? []);
        setLoadState("ready");
      } catch (err) {
        setError(resolveAppError(err).reason);
        setLoadState("error");
      }
    },
    [sessionId],
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const confirmDelete = (item: MediaAsset) => {
    Alert.alert(
      "Xóa minh chứng?",
      "Media sẽ bị gỡ khỏi buổi học và storage.",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => void handleDelete(item.id),
        },
      ],
    );
  };

  const handleDelete = async (mediaId: string) => {
    setDeletingId(mediaId);
    try {
      await deleteMedia(mediaId);
      setItems((prev) => prev.filter((m) => m.id !== mediaId));
      if (detail?.id === mediaId) setDetail(null);
    } catch (err) {
      setError(resolveAppError(err).reason);
    } finally {
      setDeletingId(null);
    }
  };

  if (!sessionId || !classId) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        <ScreenState
          kind="error"
          title="Thiếu thông tin buổi học"
          message="Không mở được danh sách minh chứng."
          onAction={() => router.back()}
          actionLabel="Quay lại"
        />
      </SafeAreaView>
    );
  }

  const isInitialLoading = loadState === "loading" && items.length === 0;
  const detailSource = detail
    ? resolveMediaSourceLabel(detail, titleParam, subtitleParam)
    : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View className="px-4 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          onPress={() => router.back()}
          className="self-start py-2"
        >
          <Text className="text-base text-primary">← Quay lại</Text>
        </Pressable>
        <Text className="mt-1 text-xl font-bold text-foreground">
          Minh chứng buổi học
        </Text>
        {titleParam ? (
          <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={2}>
            {titleParam}
            {subtitleParam ? ` · ${subtitleParam}` : ""}
          </Text>
        ) : null}
      </View>

      {isInitialLoading ? (
        <View className="flex-1 px-4 pt-6">
          <SkeletonBone style={{ height: 96, borderRadius: 16 }} />
          <SkeletonBone
            style={{ height: 96, borderRadius: 16, marginTop: 12 }}
          />
        </View>
      ) : loadState === "error" && items.length === 0 ? (
        <ScreenState
          kind="error"
          title="Không tải được minh chứng"
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

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Chụp minh chứng"
              onPress={() =>
                router.push({
                  pathname: "/(mentor)/capture/[sessionId]",
                  params: {
                    sessionId,
                    classId,
                    title: titleParam ?? "",
                    subtitle: subtitleParam ?? "",
                  },
                })
              }
              className="mb-4 h-12 flex-row items-center justify-center gap-2 rounded-lg bg-primary active:opacity-90"
            >
              <Camera color={colors.primaryForeground} size={18} />
              <Text className="font-semibold text-primary-foreground">
                Chụp minh chứng
              </Text>
            </Pressable>

            {items.length === 0 ? (
              <ScreenState
                kind="empty"
                title="Chưa có minh chứng"
                message="Ảnh/video tải lên với buổi học này sẽ hiện tại đây (Nguồn: Minh chứng buổi học)."
              />
            ) : (
              <View className="gap-3">
                {items.map((item) => (
                  <MediaRow
                    key={item.id}
                    item={item}
                    sessionTitle={titleParam}
                    sessionTime={subtitleParam}
                    onOpen={() => setDetail(item)}
                    onDelete={() => confirmDelete(item)}
                    isDeleting={deletingId === item.id}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </FadeInContent>
      )}

      <Modal
        visible={detail != null}
        transparent
        animationType="fade"
        onRequestClose={() => setDetail(null)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setDetail(null)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation?.()}
            className="rounded-t-3xl border border-border bg-card px-4 pb-8 pt-4"
          >
            <Text className="text-lg font-bold text-foreground">Chi tiết</Text>
            {detail && detailSource ? (
              <View className="mt-3 gap-2">
                <Text className="text-sm text-foreground">
                  Loại: {mediaFileTypeLabel(detail.fileType)}
                </Text>
                {detail.statusLabel ? (
                  <Text className="text-sm text-muted-foreground">
                    Trạng thái: {detail.statusLabel}
                  </Text>
                ) : null}
                <Text className="text-sm font-semibold text-primary">
                  Nguồn: {detailSource.title}
                </Text>
                {detailSource.detail ? (
                  <Text className="text-sm text-muted-foreground">
                    {detailSource.detail}
                  </Text>
                ) : null}
                {detail.uploadedAt ? (
                  <Text className="text-sm text-muted-foreground">
                    Tải lên: {detail.uploadedAt}
                  </Text>
                ) : null}
                {Array.isArray(detail.tags) && detail.tags.length > 0 ? (
                  <Text className="text-sm text-muted-foreground">
                    Tags:{" "}
                    {detail.tags
                      .map((t) => t.studentName?.trim() || "Học viên")
                      .join(", ")}
                  </Text>
                ) : (
                  <Text className="text-sm text-muted-foreground">
                    Chưa có tag khuôn mặt (hoặc đang xử lý).
                  </Text>
                )}
                {detail.fileUrl ? (
                  <Image
                    source={{ uri: detail.fileUrl }}
                    style={{
                      width: "100%",
                      height: 220,
                      borderRadius: 16,
                      marginTop: 8,
                    }}
                    resizeMode="cover"
                  />
                ) : null}
              </View>
            ) : null}
            <Pressable
              onPress={() => setDetail(null)}
              className="mt-4 h-12 items-center justify-center rounded-lg bg-secondary"
            >
              <Text className="font-semibold text-foreground">Đóng</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

import { rotateCheckInToken, type CheckInToken } from "@/lib/api/class-sessions";
import { PopInText } from "@/components/motion/effects";
import { resolveAppError } from "@/lib/errors/resolve-app-error";
import { secondsUntil } from "@/lib/mentor/today-sessions";
import { colors } from "@/lib/tokens/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MIN_ROTATE_GAP_MS = 2500;

export default function MentorQrScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sessionId: string;
    title?: string;
  }>();
  const sessionId = Array.isArray(params.sessionId)
    ? params.sessionId[0]
    : params.sessionId;
  const titleParam = Array.isArray(params.title) ? params.title[0] : params.title;

  const [token, setToken] = useState<CheckInToken | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const rotateInFlight = useRef(false);
  const lastRotateAt = useRef(0);
  const expiresAtRef = useRef<string | null>(null);

  const rotate = useCallback(async (force = false) => {
    if (!sessionId || rotateInFlight.current) return;
    const now = Date.now();
    if (!force && now - lastRotateAt.current < MIN_ROTATE_GAP_MS) return;

    rotateInFlight.current = true;
    lastRotateAt.current = now;
    setIsRotating(true);
    setError(null);
    try {
      const value = await rotateCheckInToken({ sessionId });
      const data = value.data;
      if (!data?.token) {
        throw new Error("Không nhận được mã QR từ máy chủ.");
      }
      const dataUrl = await QRCode.toDataURL(data.token, {
        width: 440,
        margin: 1,
        color: {
          dark: colors.foreground,
          light: colors.card,
        },
      });
      expiresAtRef.current = data.expiresAt;
      setToken(data);
      setQrDataUrl(dataUrl);
      const left = secondsUntil(data.expiresAt);
      setSecondsLeft(left ?? 60);
      if (left == null) {
        setError("Không đọc được thời hạn mã — dùng «Làm mới ngay» nếu cần.");
      }
    } catch (err) {
      setError(resolveAppError(err).reason);
    } finally {
      rotateInFlight.current = false;
      setIsRotating(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void rotate(true);
  }, [rotate]);

  useEffect(() => {
    if (!token?.expiresAt) return;
    let stopped = false;

    const tick = () => {
      if (stopped) return;
      const left = secondsUntil(expiresAtRef.current ?? token.expiresAt);
      if (left == null) {
        // Unparseable expiry — stop auto-rotate to avoid a setState storm.
        stopped = true;
        setSecondsLeft(0);
        return;
      }
      setSecondsLeft((prev) => (prev === left ? prev : left));
      if (left <= 0) {
        void rotate(false);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [token?.expiresAt, rotate]);

  if (!sessionId) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-muted-foreground">
            Thiếu mã buổi học.
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-4 h-12 items-center justify-center rounded-lg bg-primary px-6"
          >
            <Text className="font-semibold text-primary-foreground">Quay lại</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View className="flex-1 px-4 pt-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          onPress={() => router.back()}
          className="self-start py-2"
        >
          <Text className="text-base text-primary">← Quay lại</Text>
        </Pressable>

        <Text className="mt-2 text-xl font-bold text-foreground">
          QR điểm danh
        </Text>
        {titleParam ? (
          <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={2}>
            {titleParam}
          </Text>
        ) : null}

        <View className="mt-6 flex-1 items-center">
          <View className="items-center rounded-3xl border border-border bg-card px-6 py-8">
            {qrDataUrl ? (
              <Image
                source={{ uri: qrDataUrl }}
                style={{ width: 220, height: 220 }}
                accessibilityLabel="Mã QR điểm danh"
              />
            ) : (
              <View className="h-[220px] w-[220px] items-center justify-center">
                <ActivityIndicator color={colors.primary} size="large" />
              </View>
            )}

            <Text className="mt-5 text-sm text-muted-foreground">
              Mã dự phòng (6 số)
            </Text>
            <PopInText
              value={token?.code ?? "------"}
              className="mt-1 text-3xl font-bold tracking-[6px] text-foreground"
            />

            <View className="mt-4 flex-row items-center justify-center">
              <Text className="text-sm font-semibold text-primary">Còn </Text>
              <PopInText
                value={String(secondsLeft)}
                className="text-sm font-semibold text-primary"
                style={{ fontVariant: ["tabular-nums"] }}
              />
              <Text className="text-sm font-semibold text-primary">
                s · tự làm mới
              </Text>
            </View>
          </View>

          {error ? (
            <Text className="mt-4 text-center text-sm text-primary">{error}</Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Làm mới mã ngay"
            disabled={isRotating}
            onPress={() => void rotate(true)}
            className="mt-6 h-12 min-w-[180px] items-center justify-center rounded-lg bg-secondary px-5 active:opacity-90 disabled:opacity-60"
          >
            {isRotating ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text className="font-semibold text-foreground">Làm mới ngay</Text>
            )}
          </Pressable>

          <Text className="mt-4 px-4 text-center text-xs leading-5 text-muted-foreground">
            Học viên quét QR hoặc nhập mã 6 số. Mã hết hạn sau khoảng 60 giây.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

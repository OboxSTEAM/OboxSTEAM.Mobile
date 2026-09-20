import { DOCK_CONTENT_PADDING } from "@/components/animated-dock";
import { checkInByToken } from "@/lib/api/class-sessions";
import { resolveAppError } from "@/lib/errors/resolve-app-error";
import {
  checkInCodeSchema,
  type CheckInCodeInput,
} from "@/lib/validations/check-in";
import { colors } from "@/lib/tokens/colors";
import { zodResolver } from "@hookform/resolvers/zod";
import { CameraView, useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CheckInSuccess = {
  status: string;
  checkedInAt?: string | null;
};

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

export default function StudentCheckInScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<"scan" | "code">("scan");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CheckInSuccess | null>(null);
  const scanLock = useRef(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CheckInCodeInput>({
    resolver: zodResolver(checkInCodeSchema),
    defaultValues: { code: "" },
  });

  const submitToken = useCallback(async (token: string) => {
    if (scanLock.current || isSubmitting) return;
    scanLock.current = true;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const value = await checkInByToken({ token: token.trim() });
      setSuccess({
        status: value.data?.status ?? "Present",
        checkedInAt: value.data?.checkedInAt,
      });
    } catch (err) {
      setError(resolveAppError(err).reason);
      scanLock.current = false;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  const submitCode = handleSubmit(async (values) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const value = await checkInByToken({ code: values.code.trim() });
      setSuccess({
        status: value.data?.status ?? "Present",
        checkedInAt: value.data?.checkedInAt,
      });
      reset({ code: "" });
    } catch (err) {
      setError(resolveAppError(err).reason);
    } finally {
      setIsSubmitting(false);
    }
  });

  const resetFlow = () => {
    scanLock.current = false;
    setSuccess(null);
    setError(null);
    setMode("scan");
  };

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <StatusBar style="dark" />
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ paddingBottom: DOCK_CONTENT_PADDING }}
        >
          <View className="w-full rounded-3xl border border-border bg-card px-5 py-8">
            <Text className="text-center text-2xl font-bold text-foreground">
              Điểm danh thành công
            </Text>
            <Text className="mt-2 text-center text-base text-muted-foreground">
              Trạng thái: {success.status === "Present" ? "Có mặt" : success.status}
            </Text>
            {success.checkedInAt ? (
              <Text className="mt-1 text-center text-sm text-muted-foreground">
                Lúc {success.checkedInAt}
              </Text>
            ) : null}
            <Pressable
              onPress={resetFlow}
              className="mt-6 h-12 items-center justify-center rounded-lg bg-primary active:opacity-90"
            >
              <Text className="font-semibold text-primary-foreground">
                Quét tiếp
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <StatusBar style="dark" />
      <View className="px-4 pt-2">
        <Text className="text-xl font-bold text-foreground">Check-in</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          Quét QR mentor hoặc nhập mã 6 số
        </Text>

        <View className="mt-3 flex-row gap-2">
          <Pressable
            onPress={() => setMode("scan")}
            className="flex-1 items-center rounded-full py-2.5"
            style={{
              backgroundColor:
                mode === "scan" ? colors.primary : colors.secondary,
            }}
          >
            <Text
              className="text-sm font-semibold"
              style={{
                color:
                  mode === "scan"
                    ? colors.primaryForeground
                    : colors.foreground,
              }}
            >
              Quét QR
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode("code")}
            className="flex-1 items-center rounded-full py-2.5"
            style={{
              backgroundColor:
                mode === "code" ? colors.primary : colors.secondary,
            }}
          >
            <Text
              className="text-sm font-semibold"
              style={{
                color:
                  mode === "code"
                    ? colors.primaryForeground
                    : colors.foreground,
              }}
            >
              Nhập mã
            </Text>
          </Pressable>
        </View>
      </View>

      <View
        className="flex-1 px-4 pt-4"
        style={{ paddingBottom: DOCK_CONTENT_PADDING }}
      >
        {mode === "scan" ? (
          <View className="flex-1 overflow-hidden rounded-3xl border border-border bg-card">
            {!permission?.granted ? (
              <View className="flex-1 items-center justify-center px-6">
                <Text className="text-center text-base text-muted-foreground">
                  Cần quyền camera để quét mã điểm danh.
                </Text>
                <Pressable
                  onPress={() => void requestPermission()}
                  className="mt-4 h-12 items-center justify-center rounded-lg bg-primary px-5"
                >
                  <Text className="font-semibold text-primary-foreground">
                    Cho phép camera
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View className="flex-1">
                <CameraView
                  style={{ flex: 1 }}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                  onBarcodeScanned={({ data }) => {
                    if (!data || scanLock.current || isSubmitting) return;
                    const raw = data.trim();
                    if (!isUuidLike(raw)) {
                      setError("Mã QR không hợp lệ. Hãy quét mã từ mentor.");
                      return;
                    }
                    void submitToken(raw);
                  }}
                />
                {isSubmitting ? (
                  <View className="absolute inset-0 items-center justify-center bg-black/40">
                    <ActivityIndicator color="#fff" size="large" />
                  </View>
                ) : null}
              </View>
            )}
          </View>
        ) : (
          <View className="rounded-3xl border border-border bg-card px-4 py-5">
            <Text className="mb-2 text-sm font-medium text-foreground">
              Mã 6 số
            </Text>
            <Controller
              control={control}
              name="code"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="000000"
                  placeholderTextColor={colors.mutedForeground}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className="h-14 rounded-xl border border-border bg-background px-4 text-center text-2xl font-bold tracking-[8px] text-foreground"
                />
              )}
            />
            {errors.code ? (
              <Text className="mt-2 text-sm text-primary">
                {errors.code.message}
              </Text>
            ) : null}
            <Pressable
              disabled={isSubmitting}
              onPress={submitCode}
              className="mt-4 h-12 items-center justify-center rounded-lg bg-primary active:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text className="font-semibold text-primary-foreground">
                  Điểm danh
                </Text>
              )}
            </Pressable>
          </View>
        )}

        {error ? (
          <Text className="mt-3 text-center text-sm text-primary">{error}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

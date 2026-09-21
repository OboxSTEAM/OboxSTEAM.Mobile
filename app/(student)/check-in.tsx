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
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
  type TextInput as TextInputType,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CODE_LENGTH = 6;

/** transitions.dev tokens adapted for RN */
const DURATION_FAST = 250;
const DURATION_VERY_SLOW = 500;
const DIGIT_STAGGER = 40;
const EASE_SMOOTH_OUT = Easing.bezier(0.22, 1, 0.36, 1);
const EASE_BOUNCE = Easing.bezier(0.34, 1.45, 0.64, 1);

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
  const [isCodeFocused, setIsCodeFocused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [tabWidth, setTabWidth] = useState(0);
  const scanLock = useRef(false);
  const codeInputRef = useRef<TextInputType>(null);

  const pillX = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentX = useRef(new Animated.Value(0)).current;
  const otpShakeX = useRef(new Animated.Value(0)).current;
  const successEnter = useRef(new Animated.Value(0)).current;
  const digitScales = useRef(
    Array.from({ length: CODE_LENGTH }, () => new Animated.Value(1)),
  ).current;
  const prevDigits = useRef("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CheckInCodeInput>({
    resolver: zodResolver(checkInCodeSchema),
    defaultValues: { code: "" },
  });

  const codeValue = watch("code") ?? "";

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener?.(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (mode !== "code") return;
    const timer = setTimeout(() => codeInputRef.current?.focus(), 120);
    return () => clearTimeout(timer);
  }, [mode]);

  useEffect(() => {
    if (tabWidth <= 0) return;
    const toValue = mode === "code" ? tabWidth : 0;
    if (reduceMotion) {
      pillX.setValue(toValue);
      return;
    }
    Animated.timing(pillX, {
      toValue,
      duration: DURATION_FAST,
      easing: EASE_SMOOTH_OUT,
      useNativeDriver: true,
    }).start();
  }, [mode, tabWidth, reduceMotion, pillX]);

  useEffect(() => {
    if (reduceMotion) {
      contentOpacity.setValue(1);
      contentX.setValue(0);
      return;
    }
    contentOpacity.setValue(0);
    contentX.setValue(mode === "code" ? 12 : -12);
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: DURATION_FAST,
        easing: EASE_SMOOTH_OUT,
        useNativeDriver: true,
      }),
      Animated.timing(contentX, {
        toValue: 0,
        duration: DURATION_FAST,
        easing: EASE_SMOOTH_OUT,
        useNativeDriver: true,
      }),
    ]).start();
  }, [mode, reduceMotion, contentOpacity, contentX]);

  useEffect(() => {
    const prev = prevDigits.current;
    for (let i = 0; i < CODE_LENGTH; i += 1) {
      const nextDigit = codeValue[i] ?? "";
      const prevDigit = prev[i] ?? "";
      if (nextDigit && nextDigit !== prevDigit) {
        const scale = digitScales[i];
        if (reduceMotion) {
          scale.setValue(1);
          continue;
        }
        scale.setValue(0.55);
        Animated.timing(scale, {
          toValue: 1,
          duration: DURATION_VERY_SLOW,
          delay: DIGIT_STAGGER,
          easing: EASE_BOUNCE,
          useNativeDriver: true,
        }).start();
      }
    }
    prevDigits.current = codeValue;
  }, [codeValue, digitScales, reduceMotion]);

  useEffect(() => {
    if (!error && !errors.code) return;
    if (reduceMotion) return;
    otpShakeX.setValue(0);
    Animated.sequence([
      Animated.timing(otpShakeX, {
        toValue: -8,
        duration: 80,
        easing: EASE_SMOOTH_OUT,
        useNativeDriver: true,
      }),
      Animated.timing(otpShakeX, {
        toValue: 6,
        duration: 60,
        easing: EASE_SMOOTH_OUT,
        useNativeDriver: true,
      }),
      Animated.timing(otpShakeX, {
        toValue: -4,
        duration: 60,
        easing: EASE_SMOOTH_OUT,
        useNativeDriver: true,
      }),
      Animated.timing(otpShakeX, {
        toValue: 0,
        duration: 80,
        easing: EASE_SMOOTH_OUT,
        useNativeDriver: true,
      }),
    ]).start();
  }, [error, errors.code, otpShakeX, reduceMotion]);

  useEffect(() => {
    if (!success) {
      successEnter.setValue(0);
      return;
    }
    if (reduceMotion) {
      successEnter.setValue(1);
      return;
    }
    successEnter.setValue(0);
    Animated.timing(successEnter, {
      toValue: 1,
      duration: DURATION_VERY_SLOW,
      easing: EASE_SMOOTH_OUT,
      useNativeDriver: true,
    }).start();
  }, [success, reduceMotion, successEnter]);

  const onTabBarLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    const half = Math.max((width - 6) / 2, 0);
    setTabWidth(half);
    pillX.setValue(mode === "code" ? half : 0);
  };

  const submitToken = useCallback(
    async (token: string) => {
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
    },
    [isSubmitting],
  );

  const submitCodeValue = useCallback(
    async (code: string) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      try {
        const value = await checkInByToken({ code: code.trim() });
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
    },
    [isSubmitting, reset],
  );

  const submitCode = handleSubmit(async (values) => {
    await submitCodeValue(values.code);
  });

  const onCodeChange = useCallback(
    (raw: string) => {
      const digits = raw.replace(/\D/g, "").slice(0, CODE_LENGTH);
      setValue("code", digits, {
        shouldValidate: digits.length === CODE_LENGTH,
      });
      setError(null);
      if (digits.length === CODE_LENGTH) {
        void submitCodeValue(digits);
      }
    },
    [setValue, submitCodeValue],
  );

  const resetFlow = () => {
    scanLock.current = false;
    setSuccess(null);
    setError(null);
    setMode("scan");
  };

  if (success) {
    const successStyle = {
      opacity: successEnter,
      transform: [
        {
          translateY: successEnter.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          }),
        },
        {
          scale: successEnter.interpolate({
            inputRange: [0, 1],
            outputRange: [0.96, 1],
          }),
        },
      ],
    };

    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <StatusBar style="dark" />
        <View
          className="flex-1 items-center justify-center px-6"
          style={{ paddingBottom: DOCK_CONTENT_PADDING }}
        >
          <Animated.View
            style={[
              {
                width: "100%",
                borderRadius: 24,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                paddingHorizontal: 20,
                paddingVertical: 32,
              },
              successStyle,
            ]}
          >
            <Text className="text-center text-2xl font-bold text-foreground">
              Điểm danh thành công
            </Text>
            <Text className="mt-2 text-center text-base text-muted-foreground">
              Trạng thái:{" "}
              {success.status === "Present" ? "Có mặt" : success.status}
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
          </Animated.View>
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

        <View
          className="relative mt-3 flex-row rounded-full p-[3px]"
          style={{ backgroundColor: colors.secondary }}
          onLayout={onTabBarLayout}
        >
          {tabWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 3,
                bottom: 3,
                left: 3,
                width: tabWidth,
                borderRadius: 999,
                backgroundColor: colors.primary,
                transform: [{ translateX: pillX }],
              }}
            />
          ) : null}

          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === "scan" }}
            onPress={() => setMode("scan")}
            className="z-10 flex-1 items-center py-2.5"
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
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === "code" }}
            onPress={() => setMode("code")}
            className="z-10 flex-1 items-center py-2.5"
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
        <Animated.View
          style={{
            flex: 1,
            opacity: contentOpacity,
            transform: [{ translateX: contentX }],
          }}
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
            <View className="flex-1 items-center justify-center">
              <Text className="text-center text-base font-medium text-foreground">
                Nhập mã 6 số từ mentor
              </Text>
              <Text className="mt-1 text-center text-sm text-muted-foreground">
                Mã hết hạn sau khoảng 60 giây
              </Text>

              <Animated.View style={{ transform: [{ translateX: otpShakeX }] }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Nhập mã điểm danh"
                  onPress={() => codeInputRef.current?.focus()}
                  className="relative mt-8"
                >
                  <View className="flex-row items-center justify-center gap-2.5">
                    {Array.from({ length: CODE_LENGTH }, (_, index) => {
                      const digit = codeValue[index] ?? "";
                      const isActive =
                        isCodeFocused &&
                        index ===
                          Math.min(codeValue.length, CODE_LENGTH - 1);
                      return (
                        <Animated.View
                          key={index}
                          style={{
                            height: 56,
                            width: 44,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 12,
                            borderWidth: isActive ? 2 : 1,
                            borderColor: isActive
                              ? colors.primary
                              : colors.border,
                            backgroundColor: colors.card,
                            transform: [{ scale: digitScales[index] }],
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 24,
                              fontWeight: "700",
                              color: colors.foreground,
                            }}
                          >
                            {digit}
                          </Text>
                        </Animated.View>
                      );
                    })}
                  </View>

                  <Controller
                    control={control}
                    name="code"
                    render={({ field: { value } }) => (
                      <TextInput
                        ref={codeInputRef}
                        value={value}
                        onChangeText={onCodeChange}
                        onFocus={() => setIsCodeFocused(true)}
                        onBlur={() => setIsCodeFocused(false)}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        autoComplete="one-time-code"
                        maxLength={CODE_LENGTH}
                        caretHidden
                        style={{
                          position: "absolute",
                          opacity: 0.02,
                          height: 56,
                          width: "100%",
                        }}
                      />
                    )}
                  />
                </Pressable>
              </Animated.View>

              {errors.code || error ? (
                <Text className="mt-3 text-center text-sm text-primary">
                  {errors.code?.message ?? error}
                </Text>
              ) : null}

              <Pressable
                disabled={
                  isSubmitting || codeValue.length < CODE_LENGTH
                }
                onPress={submitCode}
                className="mt-8 h-12 w-full items-center justify-center rounded-lg bg-primary active:opacity-90 disabled:opacity-60"
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
        </Animated.View>

        {mode === "scan" && error ? (
          <Text className="mt-3 text-center text-sm text-primary">{error}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

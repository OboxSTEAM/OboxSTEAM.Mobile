import { PressableScale } from "@/components/pressable-scale";
import { IconSwapSlot } from "@/components/motion/effects";
import { BRAND_LOGO, BRAND_NAME } from "@/lib/brand";
import { formatAuthError, useAuth } from "@/lib/auth/auth-context";
import { getHomeHrefForRole } from "@/lib/auth/roles";
import { runErrorShake } from "@/lib/motion/shake";
import { useReduceMotion } from "@/lib/motion/use-reduce-motion";
import { colors } from "@/lib/tokens/colors";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LOGO_SIZE = 220;

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, status, user } = useAuth();
  const reduceMotion = useReduceMotion();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null,
  );
  const emailShake = useRef(new Animated.Value(0)).current;
  const passwordShake = useRef(new Animated.Value(0)).current;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(getHomeHrefForRole(user?.role));
    } else if (status === "blocked") {
      router.replace("/blocked");
    }
  }, [status, user?.role, router]);

  useEffect(() => {
    if (errors.email) runErrorShake(emailShake, reduceMotion);
  }, [errors.email, emailShake, reduceMotion]);

  useEffect(() => {
    if (errors.password) runErrorShake(passwordShake, reduceMotion);
  }, [errors.password, passwordShake, reduceMotion]);

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await signIn(values.email.trim(), values.password);
    } catch (error) {
      Alert.alert("Đăng nhập thất bại", formatAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View className="flex-1 overflow-hidden px-6">
          <View
            pointerEvents="none"
            className="absolute -right-16 -top-8 h-56 w-56 rounded-full"
            style={{ backgroundColor: `${colors.primary}14` }}
          />
          <View
            pointerEvents="none"
            className="absolute -left-20 top-40 h-44 w-44 rounded-full"
            style={{ backgroundColor: `${colors.steam.engineering}18` }}
          />
          <View
            pointerEvents="none"
            className="absolute -right-10 bottom-28 h-36 w-36 rounded-full"
            style={{ backgroundColor: `${colors.steam.technology}16` }}
          />
          <View
            pointerEvents="none"
            className="absolute -left-12 bottom-8 h-28 w-28 rounded-full"
            style={{ backgroundColor: `${colors.steam.mathematics}14` }}
          />

          <Image
            source={BRAND_LOGO}
            style={{
              position: "absolute",
              right: -36,
              top: 72,
              width: LOGO_SIZE,
              height: LOGO_SIZE,
              opacity: 0.18,
            }}
            resizeMode="contain"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            onPress={() => router.back()}
            className="relative z-10 mt-4 h-11 w-11 items-center justify-center rounded-full border border-border bg-card"
          >
            <ArrowLeft color={colors.foreground} size={20} />
          </Pressable>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "flex-start",
              paddingTop: 28,
              paddingBottom: 24,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <View className="relative z-10 items-center">
              <Text className="text-sm font-medium text-muted-foreground">
                {BRAND_NAME}
              </Text>
              <Text className="mt-2 text-3xl font-bold text-foreground">
                Đăng nhập
              </Text>
            </View>

            <View className="relative z-10 mt-8 gap-4">
              <View>
                <Text className="mb-1.5 text-sm font-medium text-foreground">
                  Email
                </Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Animated.View
                      style={{ transform: [{ translateX: emailShake }] }}
                    >
                      <View
                        className={`h-14 flex-row items-center rounded-xl border bg-card px-3 ${
                          errors.email
                            ? "border-primary"
                            : focusedField === "email"
                              ? "border-primary"
                              : "border-border"
                        }`}
                      >
                        <Mail color={colors.mutedForeground} size={20} />
                        <TextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          keyboardType="email-address"
                          textContentType="emailAddress"
                          placeholder="email@example.com"
                          placeholderTextColor={colors.mutedForeground}
                          onFocus={() => setFocusedField("email")}
                          onBlur={() => {
                            setFocusedField(null);
                            onBlur();
                          }}
                          onChangeText={onChange}
                          value={value}
                          className="ml-3 flex-1 text-base text-foreground"
                        />
                      </View>
                    </Animated.View>
                  )}
                />
                {errors.email ? (
                  <Text className="mt-1 text-sm text-primary">
                    {errors.email.message}
                  </Text>
                ) : null}
              </View>

              <View>
                <Text className="mb-1.5 text-sm font-medium text-foreground">
                  Mật khẩu
                </Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Animated.View
                      style={{ transform: [{ translateX: passwordShake }] }}
                    >
                      <View
                        className={`h-14 flex-row items-center rounded-xl border bg-card px-3 ${
                          errors.password
                            ? "border-primary"
                            : focusedField === "password"
                              ? "border-primary"
                              : "border-border"
                        }`}
                      >
                        <Lock color={colors.mutedForeground} size={20} />
                        <TextInput
                          secureTextEntry={!isPasswordVisible}
                          textContentType="password"
                          placeholder="••••••••"
                          placeholderTextColor={colors.mutedForeground}
                          onFocus={() => setFocusedField("password")}
                          onBlur={() => {
                            setFocusedField(null);
                            onBlur();
                          }}
                          onChangeText={onChange}
                          value={value}
                          className="ml-3 flex-1 text-base text-foreground"
                        />
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={
                            isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                          }
                          onPress={() => setIsPasswordVisible((prev) => !prev)}
                          className="h-10 w-10 items-center justify-center"
                          hitSlop={8}
                        >
                          <IconSwapSlot swapKey={isPasswordVisible}>
                            {isPasswordVisible ? (
                              <EyeOff
                                color={colors.mutedForeground}
                                size={20}
                              />
                            ) : (
                              <Eye color={colors.mutedForeground} size={20} />
                            )}
                          </IconSwapSlot>
                        </Pressable>
                      </View>
                    </Animated.View>
                  )}
                />
                {errors.password ? (
                  <Text className="mt-1 text-sm text-primary">
                    {errors.password.message}
                  </Text>
                ) : null}
              </View>
            </View>

            <PressableScale
              accessibilityRole="button"
              accessibilityLabel="Đăng nhập"
              disabled={isSubmitting}
              onPress={onSubmit}
              className="relative z-10 mt-8"
            >
              <View
                className={`h-14 items-center justify-center rounded-lg bg-primary ${
                  isSubmitting ? "opacity-60" : ""
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <Text className="text-base font-semibold text-primary-foreground">
                    Đăng nhập
                  </Text>
                )}
              </View>
            </PressableScale>
          </ScrollView>

          <Text className="pb-2 text-center text-xs leading-4 text-muted-foreground">
            Vai trò Quản lý/Chuyên gia vui lòng dùng website.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

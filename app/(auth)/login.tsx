import { formatAuthError, useAuth } from "@/lib/auth/auth-context";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, status } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      router.replace("/children");
    } else if (status === "blocked") {
      router.replace("/blocked");
    }
  }, [status, router]);

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
      <View className="flex-1 px-6 py-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          onPress={() => router.back()}
          className="self-start py-2"
        >
          <Text className="text-base text-primary">← Quay lại</Text>
        </Pressable>

        <View className="mt-8">
          <Text className="text-3xl font-bold text-foreground">Đăng nhập</Text>
          <Text className="mt-2 text-base text-muted-foreground">
            Dùng email và mật khẩu tài khoản Parent OboxSTEAM.
          </Text>
        </View>

        <View className="mt-8 gap-4">
          <View>
            <Text className="mb-1.5 text-sm font-medium text-foreground">
              Email
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  placeholder="email@example.com"
                  placeholderTextColor="#6B6B6B"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className="h-12 rounded-lg border border-border bg-card px-3 text-base text-foreground"
                />
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
                <TextInput
                  secureTextEntry
                  textContentType="password"
                  placeholder="••••••••"
                  placeholderTextColor="#6B6B6B"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className="h-12 rounded-lg border border-border bg-card px-3 text-base text-foreground"
                />
              )}
            />
            {errors.password ? (
              <Text className="mt-1 text-sm text-primary">
                {errors.password.message}
              </Text>
            ) : null}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Đăng nhập"
          disabled={isSubmitting}
          onPress={onSubmit}
          className="mt-8 h-14 items-center justify-center rounded-lg bg-primary active:opacity-90 disabled:opacity-60"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-base font-semibold text-primary-foreground">
              Đăng nhập
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

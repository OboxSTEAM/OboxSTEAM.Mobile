import { uploadMedia } from "@/lib/api/media";
import { SuccessCheckEnter } from "@/components/motion/effects";
import { resolveAppError } from "@/lib/errors/resolve-app-error";
import { colors } from "@/lib/tokens/colors";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Camera, Check, RotateCcw, Upload } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CapturePhase = "camera" | "preview" | "success";

function guessMimeAndName(uri: string): { name: string; type: string } {
  const lower = uri.toLowerCase();
  if (lower.includes(".png")) return { name: "moment.png", type: "image/png" };
  if (lower.includes(".webp")) {
    return { name: "moment.webp", type: "image/webp" };
  }
  return { name: "moment.jpg", type: "image/jpeg" };
}

export default function MentorCaptureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sessionId: string;
    classId: string;
    title?: string;
  }>();
  const sessionId = Array.isArray(params.sessionId)
    ? params.sessionId[0]
    : params.sessionId;
  const classId = Array.isArray(params.classId)
    ? params.classId[0]
    : params.classId;
  const titleParam = Array.isArray(params.title) ? params.title[0] : params.title;

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [phase, setPhase] = useState<CapturePhase>("camera");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const onCapture = useCallback(async () => {
    if (!cameraRef.current || isCapturing || isUploading) return;
    setIsCapturing(true);
    setError(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });
      if (!photo?.uri) {
        throw new Error("Không chụp được ảnh. Thử lại.");
      }
      setPhotoUri(photo.uri);
      setPhase("preview");
    } catch (err) {
      setError(resolveAppError(err).reason);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, isUploading]);

  const onRetake = () => {
    setPhotoUri(null);
    setError(null);
    setStatusMessage(null);
    setPhase("camera");
  };

  const onUpload = useCallback(async () => {
    if (!photoUri || !classId || !sessionId || isUploading) return;
    setIsUploading(true);
    setError(null);
    try {
      const { name, type } = guessMimeAndName(photoUri);
      const value = await uploadMedia({
        classId,
        classSessionId: sessionId,
        file: { uri: photoUri, name, type },
      });
      setStatusMessage(
        value.message?.trim() ||
          (value.data?.isReady === false
            ? "Đã gửi — hệ thống đang xử lý nhận diện."
            : "Đã tải lên khoảnh khắc lớp học."),
      );
      setPhase("success");
    } catch (err) {
      setError(resolveAppError(err).reason);
    } finally {
      setIsUploading(false);
    }
  }, [photoUri, classId, sessionId, isUploading]);

  if (!sessionId || !classId) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-muted-foreground">
            Thiếu thông tin buổi học để chụp khoảnh khắc.
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

  if (phase === "success") {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center px-6">
          <SuccessCheckEnter>
            <View className="items-center">
              <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-steam-technology/20">
                <Check color={colors.steam.technology} size={28} />
              </View>
              <Text className="text-center text-2xl font-bold text-foreground">
                Đã tải lên
              </Text>
              <Text className="mt-2 text-center text-base text-muted-foreground">
                {statusMessage}
              </Text>
              <Pressable
                onPress={onRetake}
                className="mt-6 h-12 w-full items-center justify-center rounded-lg bg-primary active:opacity-90"
              >
                <Text className="font-semibold text-primary-foreground">
                  Chụp thêm
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.back()}
                className="mt-3 h-12 w-full items-center justify-center rounded-lg bg-secondary active:opacity-90"
              >
                <Text className="font-semibold text-foreground">Xong</Text>
              </Pressable>
            </View>
          </SuccessCheckEnter>
        </View>
      </SafeAreaView>
    );
  }

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
          Chụp khoảnh khắc
        </Text>
        {titleParam ? (
          <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={2}>
            {titleParam}
          </Text>
        ) : null}
      </View>

      <View className="mt-4 flex-1 px-4 pb-4">
        <View className="flex-1 overflow-hidden rounded-3xl border border-border bg-card">
          {phase === "preview" && photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={{ flex: 1 }}
              resizeMode="cover"
              accessibilityLabel="Ảnh vừa chụp"
            />
          ) : !permission?.granted ? (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-center text-base text-muted-foreground">
                Cần quyền camera để chụp khoảnh khắc lớp học.
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
            <CameraView
              ref={cameraRef}
              style={{ flex: 1 }}
              facing="back"
              mode="picture"
            />
          )}
        </View>

        {error ? (
          <Text className="mt-3 text-center text-sm text-primary">{error}</Text>
        ) : null}

        <Text className="mt-3 text-center text-xs leading-5 text-muted-foreground">
          Ảnh gửi vào pipeline nhận diện khuôn mặt của lớp — không phải bằng
          chứng buổi học trên web.
        </Text>

        {phase === "preview" ? (
          <View className="mt-4 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Chụp lại"
              disabled={isUploading}
              onPress={onRetake}
              className="h-14 flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-secondary active:opacity-90 disabled:opacity-60"
            >
              <RotateCcw color={colors.foreground} size={18} />
              <Text className="font-semibold text-foreground">Chụp lại</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tải lên"
              disabled={isUploading}
              onPress={() => void onUpload()}
              className="h-14 flex-1 flex-row items-center justify-center gap-2 rounded-lg bg-primary active:opacity-90 disabled:opacity-60"
            >
              {isUploading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <>
                  <Upload color={colors.primaryForeground} size={18} />
                  <Text className="font-semibold text-primary-foreground">
                    Tải lên
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chụp ảnh"
            disabled={!permission?.granted || isCapturing}
            onPress={() => void onCapture()}
            className="mt-4 h-14 flex-row items-center justify-center gap-2 rounded-lg bg-primary active:opacity-90 disabled:opacity-60"
          >
            {isCapturing ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <>
                <Camera color={colors.primaryForeground} size={20} />
                <Text className="font-semibold text-primary-foreground">
                  Chụp ảnh
                </Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

import { BRAND_LOGO, BRAND_NAME } from "@/lib/brand";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { Animated, Easing, Image, View } from "react-native";

const LOGO_SIZE = 148;
const HOLD_MS = 1300;
const FADE_OUT_MS = 320;

/**
 * Cold-start branded intro — plays on every launch, then routes to Welcome.
 * Uses RN Animated (not Reanimated) for Expo Go compatibility.
 */
export default function IntroScreen() {
  const router = useRouter();
  const hasAdvanced = useRef(false);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.86)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordTranslateY = useRef(new Animated.Value(12)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;

    const advance = () => {
      if (!isMounted || hasAdvanced.current) return;
      hasAdvanced.current = true;

      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && isMounted) {
          router.replace("/welcome");
        }
      });
    };

    const runIntro = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch {
        // Splash may already be hidden on fast refresh.
      }

      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      Animated.parallel([
        Animated.timing(wordOpacity, {
          toValue: 1,
          duration: 450,
          delay: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(wordTranslateY, {
          toValue: 0,
          duration: 450,
          delay: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();

      holdTimer = setTimeout(advance, 350 + 450 + HOLD_MS);
    };

    void runIntro();

    return () => {
      isMounted = false;
      if (holdTimer) clearTimeout(holdTimer);
    };
  }, [
    logoOpacity,
    logoScale,
    router,
    screenOpacity,
    wordOpacity,
    wordTranslateY,
  ]);

  return (
    <View className="flex-1 bg-black">
      <Animated.View
        className="flex-1 items-center justify-center px-8"
        style={{ opacity: screenOpacity }}
      >
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        >
          <Image
            source={BRAND_LOGO}
            style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
            resizeMode="contain"
            accessibilityLabel={`${BRAND_NAME} logo`}
          />
        </Animated.View>

        <Animated.Text
          className="mt-7 text-center text-3xl font-semibold tracking-wide text-white"
          style={{
            opacity: wordOpacity,
            transform: [{ translateY: wordTranslateY }],
          }}
        >
          {BRAND_NAME}
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

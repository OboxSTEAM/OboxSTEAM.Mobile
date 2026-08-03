import { BRAND_LOGO, BRAND_NAME } from "@/lib/brand";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Image, View } from "react-native";

const LOGO_SIZE = 148;
const LETTERS = BRAND_NAME.split("");

const LOGO_POP_IN_MS = 620;
const LOGO_POP_OUT_MS = 420;
const GAP_AFTER_LOGO_MS = 380;
const LETTER_STAGGER_MS = 95;
const LETTER_REVEAL_MS = 420;
const HOLD_MS = 1600;
const LETTER_OUT_STAGGER_MS = 55;
const LETTER_OUT_MS = 280;

type LetterAnim = {
  opacity: Animated.Value;
  translateY: Animated.Value;
  blur: Animated.Value;
};

function createLetterAnim(): LetterAnim {
  return {
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(8),
    blur: new Animated.Value(14),
  };
}

/**
 * Cold-start intro: logo pops, then each letter of OboxSTEAM
 * soft-reveals (blur → sharp), then exits and opens Welcome.
 */
export default function IntroScreen() {
  const router = useRouter();
  const hasAdvanced = useRef(false);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;

  const letterAnims = useMemo(
    () => LETTERS.map(() => createLetterAnim()),
    [],
  );

  useEffect(() => {
    let isMounted = true;

    const popInLogo = () =>
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: LOGO_POP_IN_MS * 0.75,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: LOGO_POP_IN_MS,
          easing: Easing.out(Easing.back(1.55)),
          useNativeDriver: true,
        }),
      ]);

    const popOutLogo = () =>
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: LOGO_POP_OUT_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.78,
          duration: LOGO_POP_OUT_MS,
          easing: Easing.in(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]);

    /** Soft blur-to-sharp letter reveal — not a scale pop. */
    const revealLetter = (anim: LetterAnim) =>
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: LETTER_REVEAL_MS * 0.85,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: LETTER_REVEAL_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(anim.blur, {
          toValue: 0,
          duration: LETTER_REVEAL_MS,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      ]);

    const hideLetter = (anim: LetterAnim) =>
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 0,
          duration: LETTER_OUT_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(anim.blur, {
          toValue: 10,
          duration: LETTER_OUT_MS,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(anim.translateY, {
          toValue: -4,
          duration: LETTER_OUT_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: false,
        }),
      ]);

    const advance = () => {
      if (!isMounted || hasAdvanced.current) return;
      hasAdvanced.current = true;
      router.replace("/welcome");
    };

    const runIntro = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch {
        // Splash may already be hidden on fast refresh.
      }

      if (!isMounted) return;

      Animated.sequence([
        popInLogo(),
        Animated.delay(GAP_AFTER_LOGO_MS),
        Animated.stagger(
          LETTER_STAGGER_MS,
          letterAnims.map((anim) => revealLetter(anim)),
        ),
        Animated.delay(HOLD_MS),
        Animated.stagger(
          LETTER_OUT_STAGGER_MS,
          [...letterAnims].reverse().map((anim) => hideLetter(anim)),
        ),
        Animated.delay(120),
        popOutLogo(),
        Animated.delay(140),
      ]).start(({ finished }) => {
        if (finished) advance();
      });
    };

    void runIntro();

    return () => {
      isMounted = false;
      logoOpacity.stopAnimation();
      logoScale.stopAnimation();
      for (const anim of letterAnims) {
        anim.opacity.stopAnimation();
        anim.translateY.stopAnimation();
        anim.blur.stopAnimation();
      }
    };
  }, [letterAnims, logoOpacity, logoScale, router]);

  return (
    <View className="flex-1 bg-black">
      <View className="flex-1 items-center justify-center px-8">
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

        <View
          className="mt-7 flex-row items-center justify-center"
          accessibilityLabel={BRAND_NAME}
        >
          {LETTERS.map((letter, index) => {
            const anim = letterAnims[index];
            return (
              <Animated.Text
                key={`${letter}-${index}`}
                className="text-3xl font-semibold text-white"
                style={{
                  opacity: anim.opacity,
                  transform: [{ translateY: anim.translateY }],
                  textShadowColor: "rgba(255,255,255,0.95)",
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: anim.blur,
                }}
              >
                {letter}
              </Animated.Text>
            );
          })}
        </View>
      </View>
    </View>
  );
}

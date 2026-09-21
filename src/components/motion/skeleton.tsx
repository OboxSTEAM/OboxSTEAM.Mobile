import { useEffect, useRef, type ReactNode } from "react";
import { Animated, View, type StyleProp, type ViewStyle } from "react-native";

import { useReduceMotion } from "@/lib/motion/use-reduce-motion";
import { motion } from "@/lib/motion/tokens";
import { colors } from "@/lib/tokens/colors";

/** Pulsing placeholder bone — skeleton-reveal pulse phase. */
export function SkeletonBone({
  className,
  style,
}: {
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const reduceMotion = useReduceMotion();
  const pulse = useRef(new Animated.Value(reduceMotion ? 1 : 0.45)).current;

  useEffect(() => {
    if (reduceMotion) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: motion.duration.slow,
          easing: motion.easeSmoothOut,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: motion.duration.slow,
          easing: motion.easeSmoothOut,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion]);

  return (
    <Animated.View
      className={className}
      style={[
        { backgroundColor: colors.secondary, opacity: pulse },
        style,
      ]}
    />
  );
}

/** Cross-fade content in after skeleton (transitions-dev 14 reveal). */
export function FadeInContent({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateY = useRef(
    new Animated.Value(reduceMotion ? 0 : motion.distance.base),
  ).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.duration.slow,
        easing: motion.easeSmoothOut,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: motion.duration.slow,
        easing: motion.easeSmoothOut,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, reduceMotion, translateY]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

/** Convenience: pulsing row of bones matching common list skeletons. */
export function SkeletonListPlaceholder({
  rows = 3,
  rowHeight = 72,
}: {
  rows?: number;
  rowHeight?: number;
}) {
  return (
    <View>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonBone
          key={i}
          style={{
            height: rowHeight,
            borderRadius: 16,
            marginTop: i === 0 ? 0 : 8,
          }}
        />
      ))}
    </View>
  );
}

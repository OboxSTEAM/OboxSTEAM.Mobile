import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Text, View } from "react-native";

import { useReduceMotion } from "@/lib/motion/use-reduce-motion";
import { motion } from "@/lib/motion/tokens";
import { colors } from "@/lib/tokens/colors";

/** Number / digit pop-in — transitions-dev 02. */
export function PopInText({
  value,
  className,
  style,
}: {
  value: string;
  className?: string;
  style?: object;
}) {
  const reduceMotion = useReduceMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    if (reduceMotion) {
      scale.setValue(1);
      opacity.setValue(1);
      return;
    }
    scale.setValue(0.7);
    opacity.setValue(0.4);
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: motion.duration.verySlow,
        easing: motion.easeBounce,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.duration.fast,
        easing: motion.easeSmoothOut,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value, reduceMotion, scale, opacity]);

  return (
    <Animated.Text
      className={className}
      style={[{ opacity, transform: [{ scale }] }, style]}
    >
      {value}
    </Animated.Text>
  );
}

/** Badge appear spring — transitions-dev 03. */
export function PopInBadge({
  visible,
  children,
}: {
  visible: boolean;
  children: ReactNode;
}) {
  const reduceMotion = useReduceMotion();
  const progress = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(visible ? 1 : 0);
      return;
    }
    if (visible) {
      progress.setValue(0);
      Animated.spring(progress, {
        toValue: 1,
        friction: 5,
        tension: 280,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration: motion.duration.quick,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, reduceMotion, progress]);

  if (!visible && reduceMotion) return null;

  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [{ scale: progress }],
      }}
    >
      {children}
    </Animated.View>
  );
}

/** Icon cross-fade/scale in a fixed slot — transitions-dev 09. */
export function IconSwapSlot({
  swapKey,
  children,
}: {
  swapKey: string | boolean;
  children: ReactNode;
}) {
  const reduceMotion = useReduceMotion();
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: motion.duration.fast,
      easing: motion.easeSmoothOut,
      useNativeDriver: true,
    }).start();
  }, [swapKey, reduceMotion, progress]);

  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [
          {
            scale: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.85, 1],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

/** Success check enter — transitions-dev 10 (fade + scale + Y bob). */
export function SuccessCheckEnter({ children }: { children: ReactNode }) {
  const reduceMotion = useReduceMotion();
  const progress = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: motion.duration.verySlow,
      easing: motion.easeSmoothOut,
      useNativeDriver: true,
    }).start();
  }, [progress, reduceMotion]);

  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [motion.distance.large, 0],
            }),
          },
          {
            scale: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.85, 1],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

/** Unread dot with pop — notification-badge mini. */
export function UnreadDot({ visible }: { visible: boolean }) {
  return (
    <PopInBadge visible={visible}>
      <View
        style={{
          marginTop: 6,
          height: 8,
          width: 8,
          borderRadius: 999,
          backgroundColor: colors.primary,
        }}
      />
    </PopInBadge>
  );
}

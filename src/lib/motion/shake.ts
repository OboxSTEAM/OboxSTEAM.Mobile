import { Animated } from "react-native";

import { motion } from "@/lib/motion/tokens";

/** Error-state shake — transitions-dev 12 (percussive L/R). */
export function runErrorShake(
  value: Animated.Value,
  reduceMotion: boolean,
): void {
  if (reduceMotion) {
    value.setValue(0);
    return;
  }
  value.setValue(0);
  Animated.sequence([
    Animated.timing(value, {
      toValue: -motion.distance.base,
      duration: motion.duration.micro,
      easing: motion.easeSmoothOut,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: motion.distance.small,
      duration: 60,
      easing: motion.easeSmoothOut,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: -motion.distance.small + 2,
      duration: 60,
      easing: motion.easeSmoothOut,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 0,
      duration: motion.duration.micro,
      easing: motion.easeSmoothOut,
      useNativeDriver: true,
    }),
  ]).start();
}

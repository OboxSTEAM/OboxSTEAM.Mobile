import type { ReactNode } from "react";
import { useRef } from "react";
import {
  Animated,
  Pressable,
  type PressableProps,
} from "react-native";

type PressableScaleProps = PressableProps & {
  children: ReactNode;
};

export function PressableScale({
  children,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      disabled={disabled}
      onPressIn={(event) => {
        if (!disabled) {
          Animated.spring(scale, {
            toValue: 0.97,
            useNativeDriver: true,
            friction: 7,
            tension: 140,
          }).start();
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
          tension: 120,
        }).start();
        onPressOut?.(event);
      }}
      {...rest}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </Pressable>
  );
}

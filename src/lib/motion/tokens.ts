/**
 * Motion tokens — RN literals of transitions-polish / transitions-dev scale.
 */
import { Easing } from "react-native";

export const motion = {
  duration: {
    stagger: 40,
    micro: 80,
    quick: 150,
    /** Accordion, icon swap, tabs, page slide */
    fast: 250,
    medium: 350,
    slow: 400,
    verySlow: 500,
  },
  distance: {
    micro: 4,
    small: 6,
    base: 8,
    medium: 12,
    large: 30,
  },
  /** cubic-bezier(0.22, 1, 0.36, 1) — --ease-smooth-out */
  easeSmoothOut: Easing.bezier(0.22, 1, 0.36, 1),
  /** cubic-bezier(0.34, 1.45, 0.64, 1) — number pop / badge bounce */
  easeBounce: Easing.bezier(0.34, 1.45, 0.64, 1),
} as const;

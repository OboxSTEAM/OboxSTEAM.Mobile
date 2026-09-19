/**
 * Motion tokens — RN literals of transitions-polish / transitions-dev scale.
 * Accordion (21): expand/collapse/chevron 250ms, ease smooth-out.
 */
import { Easing } from "react-native";

export const motion = {
  duration: {
    stagger: 40,
    micro: 80,
    quick: 150,
    /** Accordion, icon swap, page slide */
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
  /** cubic-bezier(0.22, 1, 0.36, 1) — --ease-smooth-out / --acc-ease */
  easeSmoothOut: Easing.bezier(0.22, 1, 0.36, 1),
} as const;

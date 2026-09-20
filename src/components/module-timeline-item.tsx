import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Check,
  ChevronDown,
  Circle,
  Lock,
  Play,
} from "lucide-react-native";

import { AssignmentCard } from "@/components/assignment-card";
import { StatusPill } from "@/components/status-pill";
import type { ParentModuleProgress } from "@/lib/api";
import { formatRelativeVi } from "@/lib/format/date";
import { motion } from "@/lib/motion/tokens";
import {
  enrollmentStatusLabel,
  formatPercent,
  formatScore,
  moduleTypeLabel,
  outcomeLabel,
} from "@/lib/parent/labels";
import { moduleAssignmentDigest } from "@/lib/parent/progress-insights";
import { colors } from "@/lib/tokens/colors";

/** Accordion layout — transitions-dev 21: 250ms / ease-in-out for height. */
export function configureModuleExpandAnimation(reduceMotion: boolean) {
  if (reduceMotion) return;
  LayoutAnimation.configureNext({
    duration: motion.duration.fast,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
    },
  });
}

type ModuleKind = "done" | "current" | "locked" | "todo";

type ModuleListItemProps = {
  module: ParentModuleProgress;
  index: number;
  expanded: boolean;
  onToggle: () => void;
};

/** Uniform card + status rail; accordion motion per transitions-dev 21. */
export function ModuleListItem({
  module,
  index,
  expanded,
  onToggle,
}: ModuleListItemProps) {
  const kind = moduleKind(module);
  const status = enrollmentStatusLabel(module.status);
  const outcome = outcomeLabel(module.outcomeLabel);
  const pill = module.outcomeLabel ? outcome : status;
  const digest = moduleAssignmentDigest(module);
  const assignments = module.assignments ?? [];
  const meta = moduleMetaLine(module, kind, digest.label);

  const [reduceMotion, setReduceMotion] = useState(false);
  const rotate = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const panelOpacity = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const panelTranslate = useRef(
    new Animated.Value(expanded ? 0 : motion.distance.base),
  ).current;

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener?.(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);

  useEffect(() => {
    const duration = reduceMotion ? 0 : motion.duration.fast;
    Animated.parallel([
      Animated.timing(rotate, {
        toValue: expanded ? 1 : 0,
        duration,
        easing: motion.easeSmoothOut,
        useNativeDriver: true,
      }),
      Animated.timing(panelOpacity, {
        toValue: expanded ? 1 : 0,
        duration,
        easing: motion.easeSmoothOut,
        useNativeDriver: true,
      }),
      Animated.timing(panelTranslate, {
        toValue: expanded ? 0 : motion.distance.base,
        duration,
        easing: motion.easeSmoothOut,
        useNativeDriver: true,
      }),
    ]).start();
  }, [expanded, panelOpacity, panelTranslate, reduceMotion, rotate]);

  const chevronFlip = rotate.interpolate({
    inputRange: [0, 1],
    // Collapsed = scaleY(1) → ChevronDown faces down; expanded = -1 → faces up.
    outputRange: [1, -1],
  });

  const pillLabel =
    kind === "locked"
      ? { label: "Khóa", tone: "muted" as const }
      : kind === "todo"
        ? { label: "Chưa bắt đầu", tone: "muted" as const }
        : pill;

  return (
    <View className="mb-3 overflow-hidden rounded-2xl border border-border bg-card">
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={module.moduleName ?? "Module"}
        onPress={
          module.isLocked
            ? undefined
            : () => {
                configureModuleExpandAnimation(reduceMotion);
                onToggle();
              }
        }
        disabled={!!module.isLocked}
        className="flex-row items-start gap-3 px-3.5 py-3 active:opacity-90"
      >
        <ModuleStatusIcon kind={kind} />

        <View className="min-w-0 flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <Text className="text-xs text-muted-foreground">
                Module {module.moduleOrder ?? index + 1} ·{" "}
                {moduleTypeLabel(module.moduleType)}
              </Text>
              <Text
                className="mt-0.5 text-sm font-semibold text-foreground"
                numberOfLines={2}
              >
                {module.moduleName?.trim() || "Module"}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <StatusPill label={pillLabel.label} tone={pillLabel.tone} />
              {!module.isLocked ? (
                <Animated.View
                  style={{ transform: [{ scaleY: chevronFlip }] }}
                >
                  <ChevronDown color={colors.mutedForeground} size={18} />
                </Animated.View>
              ) : null}
            </View>
          </View>

          {meta ? (
            <Text
              className="mt-1 text-xs text-muted-foreground"
              numberOfLines={2}
            >
              {meta}
            </Text>
          ) : null}
        </View>
      </Pressable>

      {!module.isLocked && expanded ? (
        <Animated.View
          style={{
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
            paddingHorizontal: 14,
            paddingBottom: 12,
            paddingTop: 8,
            opacity: panelOpacity,
            transform: [{ translateY: panelTranslate }],
          }}
        >
          {module.finalGrade != null ? (
            <Text
              className="mb-1.5 text-sm font-medium text-foreground"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              Điểm module: {formatCompact(module.finalGrade)}
              {module.attemptNumber != null
                ? ` · Lần thử ${module.attemptNumber}`
                : ""}
            </Text>
          ) : module.attemptNumber != null ? (
            <Text className="mb-1.5 text-xs text-muted-foreground">
              Lần thử {module.attemptNumber}
            </Text>
          ) : null}

          {assignments.length > 0 ? (
            <View>
              <Text className="mb-1.5 text-xs font-medium text-muted-foreground">
                Bài tập ({assignments.length})
              </Text>
              {assignments.map((assignment, assignmentIndex) => (
                <StaggeredAssignment
                  key={
                    assignment.assignmentId ?? `assignment-${assignmentIndex}`
                  }
                  index={assignmentIndex}
                  reduceMotion={reduceMotion}
                  assignment={assignment}
                />
              ))}
            </View>
          ) : (
            <Text className="py-2 text-center text-sm text-muted-foreground">
              Chưa có bài tập trong module này.
            </Text>
          )}
        </Animated.View>
      ) : null}
    </View>
  );
}

/** @deprecated Use ModuleListItem — kept as alias for any leftover imports. */
export const ModuleTimelineItem = ModuleListItem;

function StaggeredAssignment({
  assignment,
  index,
  reduceMotion,
}: {
  assignment: Parameters<typeof AssignmentCard>[0]["assignment"];
  index: number;
  reduceMotion: boolean;
}) {
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translate = useRef(
    new Animated.Value(reduceMotion ? 0 : motion.distance.micro),
  ).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      translate.setValue(0);
      return;
    }
    const delay = Math.min(index, 6) * motion.duration.stagger;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.duration.fast,
        delay,
        easing: motion.easeSmoothOut,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: motion.duration.fast,
        delay,
        easing: motion.easeSmoothOut,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, reduceMotion, translate]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY: translate }] }}>
      <AssignmentCard assignment={assignment} />
    </Animated.View>
  );
}

function ModuleStatusIcon({ kind }: { kind: ModuleKind }) {
  if (kind === "done") {
    return (
      <View
        className="mt-0.5 h-[22px] w-[22px] items-center justify-center rounded-full"
        style={{ backgroundColor: colors.steam.technology }}
      >
        <Check color={colors.primaryForeground} size={12} strokeWidth={3} />
      </View>
    );
  }
  if (kind === "current") {
    return (
      <View
        className="mt-0.5 h-[22px] w-[22px] items-center justify-center rounded-full"
        style={{ backgroundColor: colors.steam.engineering }}
      >
        <Play
          color={colors.primaryForeground}
          size={11}
          fill={colors.primaryForeground}
        />
      </View>
    );
  }
  if (kind === "locked") {
    return (
      <View className="mt-0.5 h-[22px] w-[22px] items-center justify-center rounded-full bg-secondary">
        <Lock color={colors.mutedForeground} size={12} />
      </View>
    );
  }
  return (
    <View className="mt-0.5 h-[22px] w-[22px] items-center justify-center">
      <Circle color={colors.border} size={18} strokeWidth={2} />
    </View>
  );
}

function moduleKind(module: ParentModuleProgress): ModuleKind {
  if (module.isLocked) return "locked";

  const isDone =
    module.status === "Completed" ||
    module.outcomeLabel === "Excellent" ||
    module.outcomeLabel === "Pass" ||
    module.completedAt != null;

  if (isDone) return "done";

  const isCurrent =
    module.status === "Active" ||
    module.status === "InProgress" ||
    module.outcomeLabel === "InProgress" ||
    module.startedAt != null ||
    (module.progressPercent != null && module.progressPercent > 0);

  if (isCurrent) return "current";
  return "todo";
}

function moduleMetaLine(
  module: ParentModuleProgress,
  kind: ModuleKind,
  digestLabel: string,
): string | null {
  if (kind === "locked") {
    return module.lockReason?.trim() || "Module đang bị khóa";
  }

  if (kind === "done") {
    const parts: string[] = [];
    if (module.finalGrade != null) {
      parts.push(formatScore(module.finalGrade));
    }
    if (digestLabel && digestLabel !== "Chưa có bài tập") {
      parts.push(digestLabel);
    }
    if (module.completedAt) {
      parts.push(`Hoàn thành ${formatRelativeVi(module.completedAt)}`);
    }
    return parts.length > 0 ? parts.join(" · ") : "Đã hoàn thành";
  }

  if (kind === "current") {
    const parts: string[] = [];
    if (module.progressPercent != null) {
      parts.push(formatPercent(module.progressPercent));
    }
    if (digestLabel) parts.push(digestLabel);
    return parts.join(" · ");
  }

  return "Chưa bắt đầu";
}

function formatCompact(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

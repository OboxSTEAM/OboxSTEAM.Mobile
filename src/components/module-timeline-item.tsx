import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  LayoutAnimation,
  Pressable,
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
import {
  enrollmentStatusLabel,
  formatPercent,
  formatScore,
  moduleTypeLabel,
  outcomeLabel,
} from "@/lib/parent/labels";
import { moduleAssignmentDigest } from "@/lib/parent/progress-insights";
import { colors } from "@/lib/tokens/colors";

const CHEVRON_MS = 220;

/** Native layout animation — avoids JS-thread height tweening. */
export function configureModuleExpandAnimation() {
  LayoutAnimation.configureNext({
    duration: 250,
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

/** Compact status-rail row — expand uses LayoutAnimation (native). */
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
  const isCurrent = kind === "current";

  const rotate = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotate, {
      toValue: expanded ? 1 : 0,
      duration: CHEVRON_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [expanded, rotate]);

  const chevronSpin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View
      className={`mb-1 overflow-hidden rounded-2xl ${
        isCurrent ? "border border-border bg-card" : ""
      }`}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={module.moduleName ?? "Module"}
        onPress={
          module.isLocked
            ? undefined
            : () => {
                configureModuleExpandAnimation();
                onToggle();
              }
        }
        disabled={!!module.isLocked}
        className="flex-row items-start gap-3 px-3 py-2.5 active:opacity-90"
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
              {kind !== "locked" && kind !== "todo" ? (
                <StatusPill label={pill.label} tone={pill.tone} />
              ) : null}
              {!module.isLocked ? (
                <Animated.View style={{ transform: [{ rotate: chevronSpin }] }}>
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
        <View className="border-t border-border px-3 pb-3 pt-2">
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
                <AssignmentCard
                  key={
                    assignment.assignmentId ?? `assignment-${assignmentIndex}`
                  }
                  assignment={assignment}
                />
              ))}
            </View>
          ) : (
            <Text className="py-2 text-center text-sm text-muted-foreground">
              Chưa có bài tập trong module này.
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

/** @deprecated Use ModuleListItem — kept as alias for any leftover imports. */
export const ModuleTimelineItem = ModuleListItem;

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
        <Play color={colors.primaryForeground} size={11} fill={colors.primaryForeground} />
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

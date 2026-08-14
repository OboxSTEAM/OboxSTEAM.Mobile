import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
} from "react-native";
import { ChevronDown, Lock } from "lucide-react-native";

import { AssignmentCard } from "@/components/assignment-card";
import { ProgressBar } from "@/components/progress-bar";
import { StatusPill } from "@/components/status-pill";
import type { ParentModuleProgress } from "@/lib/api";
import { formatRelativeVi } from "@/lib/format/date";
import {
  enrollmentStatusLabel,
  formatPercent,
  moduleTypeLabel,
  outcomeLabel,
} from "@/lib/parent/labels";
import { moduleAssignmentDigest } from "@/lib/parent/progress-insights";
import { colors } from "@/lib/tokens/colors";

const CHEVRON_MS = 220;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

type ModuleListItemProps = {
  module: ParentModuleProgress;
  index: number;
  expanded: boolean;
  onToggle: () => void;
};

/** Plain bordered accordion — expand uses LayoutAnimation (native). */
export function ModuleListItem({
  module,
  index,
  expanded,
  onToggle,
}: ModuleListItemProps) {
  const status = enrollmentStatusLabel(module.status);
  const outcome = outcomeLabel(module.outcomeLabel);
  const pill = module.outcomeLabel ? outcome : status;
  const digest = moduleAssignmentDigest(module);
  const assignments = module.assignments ?? [];
  const completed = module.activityStats?.completed ?? 0;
  const total = module.activityStats?.total ?? 0;

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
    <View className="mb-3 overflow-hidden rounded-2xl border border-border bg-card">
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
        className="px-4 py-3 active:opacity-90"
      >
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text className="text-xs text-muted-foreground">
              Module {module.moduleOrder ?? index + 1} ·{" "}
              {moduleTypeLabel(module.moduleType)}
            </Text>
            <Text
              className="mt-0.5 text-base font-semibold text-foreground"
              numberOfLines={2}
            >
              {module.moduleName?.trim() || "Module"}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            {module.isLocked ? (
              <Lock color={colors.mutedForeground} size={16} />
            ) : null}
            <StatusPill label={pill.label} tone={pill.tone} />
            {!module.isLocked ? (
              <Animated.View style={{ transform: [{ rotate: chevronSpin }] }}>
                <ChevronDown color={colors.mutedForeground} size={18} />
              </Animated.View>
            ) : null}
          </View>
        </View>

        {module.isLocked ? (
          <Text className="mt-2 text-sm text-muted-foreground">
            {module.lockReason?.trim() || "Module đang bị khóa"}
          </Text>
        ) : (
          <View className="mt-3">
            <View className="mb-1.5 flex-row items-center justify-between">
              <Text className="text-xs text-muted-foreground">Tiến độ</Text>
              <Text
                className="text-xs font-medium text-foreground"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {formatPercent(module.progressPercent)}
              </Text>
            </View>
            <ProgressBar percent={module.progressPercent} height={6} />
            <Text className="mt-2 text-xs text-muted-foreground">
              {digest.label}
              {total > 0 ? ` · Hoạt động ${completed}/${total}` : ""}
            </Text>
          </View>
        )}
      </Pressable>

      {!module.isLocked && expanded ? (
        <View className="border-t border-border px-4 pb-3 pt-3">
          {module.finalGrade != null ? (
            <Text
              className="mb-1 text-sm font-medium text-foreground"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              Điểm module: {formatCompact(module.finalGrade)}
              {module.attemptNumber != null
                ? ` · Lần thử ${module.attemptNumber}`
                : ""}
            </Text>
          ) : module.attemptNumber != null ? (
            <Text className="mb-1 text-xs text-muted-foreground">
              Lần thử {module.attemptNumber}
            </Text>
          ) : null}

          {module.completedAt ? (
            <Text className="mb-2 text-xs text-muted-foreground">
              Hoàn thành: {formatRelativeVi(module.completedAt)}
            </Text>
          ) : module.startedAt ? (
            <Text className="mb-2 text-xs text-muted-foreground">
              Bắt đầu: {formatRelativeVi(module.startedAt)}
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

function formatCompact(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

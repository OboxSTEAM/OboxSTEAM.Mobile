import { Text, View } from "react-native";

import type { ParentAssignmentOutcome } from "@/lib/api";
import { ScoreBar } from "@/components/score-bar";
import { formatDateVi } from "@/lib/format/date";
import { assignmentTypeLabel, toneHex } from "@/lib/parent/labels";
import { assignmentOutcome } from "@/lib/parent/progress-insights";
import { colors } from "@/lib/tokens/colors";

type AssignmentCardProps = {
  assignment: ParentAssignmentOutcome;
};

/**
 * Inset secondary surface — reads as nested detail inside a module card,
 * not as another white bordered box.
 */
export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const outcome = assignmentOutcome(assignment);
  const toneColor = toneHex(outcome.tone);
  const typeLabel = assignmentTypeLabel(assignment.assignmentType);
  const scoreColor = outcome.isGraded ? toneColor : colors.foreground;

  const attemptText =
    assignment.attemptUsed != null
      ? assignment.maxAttempts != null
        ? `${assignment.attemptUsed}/${assignment.maxAttempts}`
        : `${assignment.attemptUsed}`
      : null;

  return (
    <View className="mb-2 rounded-xl bg-secondary px-3 py-2.5">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-medium text-foreground">
            {assignment.title?.trim() || "Bài tập"}
          </Text>
          <Text className="mt-0.5 text-xs text-muted-foreground">
            {typeLabel}
            {assignment.isRequiredForModulePass ? " · Bắt buộc" : ""}
          </Text>
        </View>
        <Text
          className="text-xs font-semibold"
          style={{ color: toneColor }}
        >
          {outcome.label}
        </Text>
      </View>

      {outcome.hasScore || outcome.isGraded ? (
        <View className="mt-2.5">
          <View className="mb-1.5 flex-row items-baseline justify-between">
            <View className="flex-row items-baseline gap-1">
              <Text
                className="text-xl font-bold leading-none"
                style={{
                  color: scoreColor,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {assignment.score != null
                  ? formatCompact(assignment.score)
                  : "—"}
              </Text>
              {assignment.maxPoints != null ? (
                <Text
                  className="text-sm text-muted-foreground"
                  style={{ fontVariant: ["tabular-nums"] }}
                >
                  /{formatCompact(assignment.maxPoints)}
                </Text>
              ) : null}
            </View>
            {assignment.passScore != null ? (
              <Text className="text-[11px] text-muted-foreground">
                Đạt từ {formatCompact(assignment.passScore)}
              </Text>
            ) : null}
          </View>
          <ScoreBar
            score={assignment.score}
            maxPoints={assignment.maxPoints}
            passScore={assignment.passScore}
            color={scoreColor}
            trackColor={colors.card}
            showPassLabel={false}
          />
        </View>
      ) : assignment.maxPoints != null ? (
        <Text className="mt-2 text-xs text-muted-foreground">
          Thang điểm {formatCompact(assignment.maxPoints)}
          {assignment.passScore != null
            ? ` · Đạt từ ${formatCompact(assignment.passScore)}`
            : ""}
        </Text>
      ) : null}

      <View className="mt-2 flex-row flex-wrap gap-x-3 gap-y-0.5">
        {assignment.dueDate ? (
          <Text
            className="text-xs"
            style={{
              color: outcome.isOverdue
                ? colors.primary
                : colors.mutedForeground,
            }}
          >
            Hạn {formatDateVi(assignment.dueDate)}
          </Text>
        ) : null}
        {assignment.submittedAt ? (
          <Text className="text-xs text-muted-foreground">
            Nộp {formatDateVi(assignment.submittedAt)}
          </Text>
        ) : null}
        {assignment.gradedAt ? (
          <Text className="text-xs text-muted-foreground">
            Chấm {formatDateVi(assignment.gradedAt)}
          </Text>
        ) : null}
        {attemptText ? (
          <Text className="text-xs text-muted-foreground">
            Lần thử {attemptText}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function formatCompact(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

import { Text, View } from "react-native";

import { StatusPill } from "@/components/status-pill";
import type { ParentAssignmentOutcome } from "@/lib/api";
import { formatDateVi } from "@/lib/format/date";
import { assignmentTypeLabel, formatScore } from "@/lib/parent/labels";
import { assignmentOutcome } from "@/lib/parent/progress-insights";
import { colors } from "@/lib/tokens/colors";

type AssignmentCardProps = {
  assignment: ParentAssignmentOutcome;
};

type MetaCell = {
  label: string;
  value: string;
  danger?: boolean;
};

/**
 * Layout B — score hero + result pill; meta as a 2×2 grid (2 cells per row).
 */
export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const outcome = assignmentOutcome(assignment);
  const typeLabel = assignmentTypeLabel(assignment.assignmentType);

  const attemptText =
    assignment.attemptUsed != null
      ? assignment.maxAttempts != null
        ? `${assignment.attemptUsed}/${assignment.maxAttempts}`
        : `${assignment.attemptUsed}`
      : null;

  const hasScore = outcome.hasScore || outcome.isGraded;
  const scoreText = hasScore
    ? formatScore(assignment.score, assignment.maxPoints)
    : null;

  const metaCells: MetaCell[] = [];
  if (assignment.dueDate) {
    metaCells.push({
      label: "Hạn",
      value: formatDateVi(assignment.dueDate),
      danger: outcome.isOverdue,
    });
  }
  if (assignment.submittedAt) {
    metaCells.push({
      label: "Nộp",
      value: formatDateVi(assignment.submittedAt),
    });
  }
  if (assignment.gradedAt) {
    metaCells.push({
      label: "Chấm",
      value: formatDateVi(assignment.gradedAt),
    });
  }
  if (attemptText) {
    metaCells.push({ label: "Lần", value: attemptText });
  }

  const metaRows: MetaCell[][] = [];
  for (let i = 0; i < metaCells.length; i += 2) {
    metaRows.push(metaCells.slice(i, i + 2));
  }

  return (
    <View className="mb-2 rounded-xl bg-secondary px-3.5 py-3.5">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text
            className="text-sm font-medium leading-5 text-foreground"
            numberOfLines={2}
          >
            {assignment.title?.trim() || "Bài tập"}
          </Text>
          <Text className="mt-1 text-xs leading-4 text-muted-foreground" numberOfLines={1}>
            {typeLabel}
            {assignment.isRequiredForModulePass ? " · Bắt buộc" : ""}
          </Text>
        </View>

        <View className="items-end gap-1.5">
          {scoreText ? (
            <Text
              className="text-lg font-bold leading-5 text-foreground"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {scoreText}
            </Text>
          ) : null}
          <StatusPill label={outcome.label} tone={outcome.tone} />
        </View>
      </View>

      {metaRows.length > 0 ? (
        <View className="mt-3 border-t border-border pt-3">
          {metaRows.map((row, rowIndex) => (
            <View
              key={`meta-row-${rowIndex}`}
              className={`flex-row gap-3 ${rowIndex > 0 ? "mt-2.5" : ""}`}
            >
              {row.map((cell) => (
                <View key={cell.label} className="min-w-0 flex-1">
                  <Text className="text-[10px] leading-3 text-muted-foreground">
                    {cell.label}
                  </Text>
                  <Text
                    className="mt-0.5 text-xs font-medium leading-4"
                    style={{
                      color: cell.danger ? colors.primary : colors.foreground,
                      fontVariant: ["tabular-nums"],
                    }}
                    numberOfLines={1}
                  >
                    {cell.value}
                  </Text>
                </View>
              ))}
              {row.length === 1 ? <View className="flex-1" /> : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

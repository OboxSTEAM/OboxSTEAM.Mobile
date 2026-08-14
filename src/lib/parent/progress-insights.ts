import type {
  ParentAssignmentOutcome,
  ParentEnrollmentBrief,
  ParentModuleProgress,
} from "@/lib/api";
import { parseApiDate } from "@/lib/format/date";
import {
  assignmentStatusLabel,
  type LabelTone,
} from "@/lib/parent/labels";

export type AssignmentOutcomeView = {
  tone: LabelTone;
  label: string;
  isOverdue: boolean;
  isGraded: boolean;
  hasScore: boolean;
};

export function assignmentOutcome(
  assignment: ParentAssignmentOutcome,
): AssignmentOutcomeView {
  const hasScore = assignment.score != null;
  const isGraded =
    assignment.status === "Graded" ||
    assignment.gradedAt != null ||
    (hasScore && assignment.passed != null);

  const due = parseApiDate(assignment.dueDate);
  const isOverdue =
    !isGraded &&
    assignment.submittedAt == null &&
    due != null &&
    due.getTime() < Date.now();

  if (isOverdue) {
    return {
      tone: "danger",
      label: "Quá hạn",
      isOverdue: true,
      isGraded: false,
      hasScore,
    };
  }

  if (assignment.passed === true) {
    return {
      tone: "success",
      label: "Đạt",
      isOverdue: false,
      isGraded: true,
      hasScore,
    };
  }

  if (assignment.passed === false) {
    return {
      tone: "danger",
      label: "Chưa đạt",
      isOverdue: false,
      isGraded: true,
      hasScore,
    };
  }

  if (assignment.status === "TurnedIn") {
    return {
      tone: "info",
      label: "Đã nộp, chờ chấm",
      isOverdue: false,
      isGraded: false,
      hasScore,
    };
  }

  if (assignment.status === "ReturnedForRevision") {
    return {
      tone: "warning",
      label: "Cần sửa lại",
      isOverdue: false,
      isGraded: false,
      hasScore,
    };
  }

  const status = assignmentStatusLabel(assignment.status);
  return {
    tone: status.tone,
    label: status.label === "—" ? "Chưa nộp" : status.label,
    isOverdue: false,
    isGraded: false,
    hasScore,
  };
}

export type ModuleAssignmentDigest = {
  total: number;
  passed: number;
  failed: number;
  pending: number;
  overdue: number;
  label: string;
};

export function moduleAssignmentDigest(
  module: ParentModuleProgress,
): ModuleAssignmentDigest {
  const assignments = module.assignments ?? [];
  let passed = 0;
  let failed = 0;
  let pending = 0;
  let overdue = 0;

  for (const assignment of assignments) {
    const outcome = assignmentOutcome(assignment);
    if (outcome.isOverdue) {
      overdue += 1;
      continue;
    }
    if (assignment.passed === true) {
      passed += 1;
      continue;
    }
    if (assignment.passed === false) {
      failed += 1;
      continue;
    }
    pending += 1;
  }

  const total = assignments.length;
  let label = "Chưa có bài tập";
  if (total > 0) {
    if (overdue > 0) {
      label = `${overdue} bài quá hạn`;
    } else if (failed > 0) {
      label = `${failed} bài chưa đạt`;
    } else if (passed > 0) {
      label = `${passed}/${total} bài đạt`;
    } else {
      label = `${total} bài tập`;
    }
  }

  return { total, passed, failed, pending, overdue, label };
}

export type EnrollmentScoreSummary = {
  averageGrade: number | null;
  gradedCount: number;
  totalAssignments: number;
  attentionCount: number;
};

export function enrollmentScoreSummary(
  modules?: ParentModuleProgress[] | null,
): EnrollmentScoreSummary {
  const list = modules ?? [];
  const grades: number[] = [];
  let gradedCount = 0;
  let totalAssignments = 0;
  let attentionCount = 0;

  for (const module of list) {
    if (module.finalGrade != null && !Number.isNaN(module.finalGrade)) {
      grades.push(module.finalGrade);
    }

    for (const assignment of module.assignments ?? []) {
      totalAssignments += 1;
      const outcome = assignmentOutcome(assignment);
      if (outcome.isGraded || assignment.score != null) {
        gradedCount += 1;
      }
      if (outcome.isOverdue || assignment.passed === false) {
        attentionCount += 1;
      }
    }
  }

  const averageGrade =
    grades.length > 0
      ? grades.reduce((sum, value) => sum + value, 0) / grades.length
      : null;

  return {
    averageGrade,
    gradedCount,
    totalAssignments,
    attentionCount,
  };
}

/** Mean progress across enrollments that report a percent. */
export function overallProgressPercent(
  enrollments?: ParentEnrollmentBrief[] | null,
): number | null {
  const values = (enrollments ?? [])
    .map((item) => item.progressPercent)
    .filter((value): value is number => value != null && !Number.isNaN(value));

  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function completedModuleCount(
  modules?: ParentModuleProgress[] | null,
): { completed: number; total: number } {
  const list = modules ?? [];
  const completed = list.filter(
    (module) =>
      module.status === "Completed" ||
      module.outcomeLabel === "Excellent" ||
      module.outcomeLabel === "Pass" ||
      module.completedAt != null,
  ).length;
  return { completed, total: list.length };
}

/** Index of the first module that is not completed and not locked; else 0. */
export function defaultExpandedModuleIndex(
  modules: ParentModuleProgress[],
): number {
  const index = modules.findIndex(
    (module) =>
      !module.isLocked &&
      module.status !== "Completed" &&
      module.outcomeLabel !== "Excellent" &&
      module.outcomeLabel !== "Pass" &&
      module.completedAt == null,
  );
  return index >= 0 ? index : 0;
}

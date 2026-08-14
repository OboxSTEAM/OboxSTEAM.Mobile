import type {
  ParentChildProgression,
  ParentEnrollmentBrief,
  ParentLink,
} from "@/lib/api";
import { colors } from "@/lib/tokens/colors";

export type LabelTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted";

const TONE_HEX: Record<LabelTone, string> = {
  neutral: colors.foreground,
  success: colors.steam.technology,
  warning: colors.steam.arts,
  danger: colors.primary,
  info: colors.steam.engineering,
  muted: colors.mutedForeground,
};

export function toneHex(tone: LabelTone): string {
  return TONE_HEX[tone];
}

const ENROLLMENT_STATUS: Record<string, { label: string; tone: LabelTone }> = {
  PendingPayment: { label: "Chờ thanh toán", tone: "warning" },
  Active: { label: "Đang học", tone: "info" },
  Deferred: { label: "Tạm dừng", tone: "muted" },
  Completed: { label: "Hoàn thành", tone: "success" },
  Failed: { label: "Chưa đạt", tone: "danger" },
  Dropped: { label: "Đã hủy", tone: "muted" },
};

const MODULE_TYPE: Record<string, string> = {
  Theory: "Lý thuyết",
  Experiential: "Trải nghiệm",
  Research: "Nghiên cứu",
};

const ACTIVITY_TYPE: Record<string, string> = {
  SelfPaced: "Tự học",
  LiveOnline: "Trực tuyến",
  Offline: "Trực tiếp",
};

const LEVEL: Record<string, string> = {
  Beginner: "Cơ bản",
  Intermediate: "Trung cấp",
  Advanced: "Nâng cao",
  AllLevels: "Mọi cấp độ",
};

const OUTCOME: Record<string, { label: string; tone: LabelTone }> = {
  Excellent: { label: "Xuất sắc", tone: "success" },
  Pass: { label: "Đạt", tone: "success" },
  NeedsImprovement: { label: "Cần cải thiện", tone: "warning" },
  Failed: { label: "Chưa đạt", tone: "danger" },
  InProgress: { label: "Đang học", tone: "info" },
  NotStarted: { label: "Chưa bắt đầu", tone: "muted" },
};

const BLOCKER: Record<string, { label: string; tone: LabelTone }> = {
  ModuleLocked: { label: "Module bị khóa", tone: "muted" },
  PrerequisiteFailed: { label: "Chưa đạt điều kiện", tone: "danger" },
  PendingPayment: { label: "Chờ thanh toán", tone: "warning" },
  AssignmentOverdue: { label: "Bài tập quá hạn", tone: "danger" },
  ModuleFailed: { label: "Module chưa đạt", tone: "danger" },
};

const PROGRESS_EVENT: Record<string, string> = {
  ActivityCompleted: "Hoàn thành hoạt động",
  AssignmentSubmitted: "Đã nộp bài",
  AssignmentPassed: "Bài tập đạt",
  AssignmentFailed: "Bài tập chưa đạt",
  ModuleCompleted: "Hoàn thành module",
  ModuleFailed: "Module chưa đạt",
  EnrollmentCompleted: "Hoàn thành chương trình",
};

const ASSIGNMENT_TYPE: Record<string, string> = {
  Retrospective: "Nhật ký / phản ánh",
  FileUpload: "Nộp tệp",
  Quiz: "Trắc nghiệm",
};

const ASSIGNMENT_STATUS: Record<string, { label: string; tone: LabelTone }> = {
  Pending: { label: "Chưa nộp", tone: "muted" },
  TurnedIn: { label: "Đã nộp", tone: "info" },
  Graded: { label: "Đã chấm", tone: "success" },
  ReturnedForRevision: { label: "Cần sửa lại", tone: "warning" },
};

function lookupLabel(
  map: Record<string, string>,
  value?: string | null,
  fallback = "—",
): string {
  if (!value) return fallback;
  return map[value] ?? value;
}

function lookupLabeledTone(
  map: Record<string, { label: string; tone: LabelTone }>,
  value?: string | null,
): { label: string; tone: LabelTone } {
  if (!value) return { label: "—", tone: "muted" };
  return map[value] ?? { label: value, tone: "neutral" };
}

export function enrollmentStatusLabel(value?: string | null) {
  return lookupLabeledTone(ENROLLMENT_STATUS, value);
}

export function moduleTypeLabel(value?: string | null) {
  return lookupLabel(MODULE_TYPE, value);
}

export function activityTypeLabel(value?: string | null) {
  return lookupLabel(ACTIVITY_TYPE, value);
}

export function levelLabel(value?: string | null) {
  return lookupLabel(LEVEL, value);
}

export function outcomeLabel(value?: string | null) {
  return lookupLabeledTone(OUTCOME, value);
}

export function blockerLabel(value?: string | null) {
  return lookupLabeledTone(BLOCKER, value);
}

export function progressEventLabel(value?: string | null) {
  return lookupLabel(PROGRESS_EVENT, value, "Cập nhật");
}

export function assignmentTypeLabel(value?: string | null) {
  return lookupLabel(ASSIGNMENT_TYPE, value);
}

export function assignmentStatusLabel(value?: string | null) {
  return lookupLabeledTone(ASSIGNMENT_STATUS, value);
}

/** "8/10" or "8" or "—" when nothing to show. */
export function formatScore(
  score?: number | null,
  maxPoints?: number | null,
): string {
  if (score == null || Number.isNaN(score)) return "—";
  if (maxPoints != null && !Number.isNaN(maxPoints)) {
    return `${formatNumber(score)}/${formatNumber(maxPoints)}`;
  }
  return formatNumber(score);
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

export function childDisplayName(
  child: Pick<ParentLink, "fullName" | "email" | "code">,
): string {
  return (
    child.fullName?.trim() ||
    child.email?.trim() ||
    child.code?.trim() ||
    "Học viên"
  );
}

/** Vietnamese given name is the last token. */
export function givenName(
  fullName?: string | null,
  fallback = "Phụ huynh",
): string {
  const trimmed = fullName?.trim();
  if (!trimmed) return fallback;
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? fallback;
}

const PAYMENT_SCOPE = "PendingPayment";

export function visibleEnrollments(
  enrollments?: ParentEnrollmentBrief[] | null,
): ParentEnrollmentBrief[] {
  return (enrollments ?? []).filter((item) => item.status !== PAYMENT_SCOPE);
}

export function visibleBlockers<T extends { code?: string | null }>(
  blockers?: T[] | null,
): T[] {
  return (blockers ?? []).filter((item) => item.code !== PAYMENT_SCOPE);
}

export function formatPercent(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  const rounded = Math.round(value);
  return `${rounded}%`;
}

/** Prefer active enrollments; otherwise the highest-progress one. */
function pickPreviewEnrollment(
  enrollments: ParentEnrollmentBrief[] | null | undefined,
): ParentEnrollmentBrief | null {
  if (!enrollments?.length) return null;

  const active = enrollments.filter((item) => item.status === "Active");
  const pool = active.length > 0 ? active : enrollments;
  return [...pool].sort(
    (a, b) => (b.progressPercent ?? 0) - (a.progressPercent ?? 0),
  )[0]!;
}

export type ProgressPreview = {
  programName: string;
  percent: number | null;
  moduleName: string | null;
};

export function progressPreview(
  progression?: ParentChildProgression | null,
): ProgressPreview | null {
  if (!progression) return null;

  const preview = pickPreviewEnrollment(
    visibleEnrollments(progression.enrollments),
  );
  if (!preview) return null;

  return {
    programName: preview.programName?.trim() || "Chương trình",
    percent: preview.progressPercent ?? null,
    moduleName: preview.currentModule?.moduleName?.trim() || null,
  };
}

/**
 * One-line home-card summary:
 * "Đang học: Robotics Foundation · 62%" or "Chưa có chương trình đang học".
 */
export function progressSummaryLine(
  progression?: ParentChildProgression | null,
): string {
  if (!progression) return "Đang tải tiến độ…";

  const enrollments = visibleEnrollments(progression.enrollments);
  if (enrollments.length === 0) return "Chưa có chương trình đang học";

  const preview = pickPreviewEnrollment(enrollments);
  if (!preview) return "Chưa có chương trình đang học";

  const name = preview.programName?.trim() || "Chương trình";
  const percent = formatPercent(preview.progressPercent);
  const status = enrollmentStatusLabel(preview.status).label;

  if (preview.status === "Active") {
    return `Đang học: ${name} · ${percent}`;
  }
  if (preview.status === "Completed") {
    return `Hoàn thành: ${name}`;
  }
  return `${status}: ${name} · ${percent}`;
}

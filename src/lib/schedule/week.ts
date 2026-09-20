import type {
  ScheduleAttendanceStatus,
  ScheduleDay,
  ScheduleSession,
  ScheduleSessionKind,
  WeeklySchedule,
} from "@/lib/api/schedules";

export const SCHEDULE_TIMEZONE = "Asia/Ho_Chi_Minh";

const DAY_SHORT_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] as const;

/** Format a Date as `YYYY-MM-DD` in Asia/Ho_Chi_Minh. */
export function formatDateInHcm(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SCHEDULE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Monday (`YYYY-MM-DD`) of the HCM week containing `date` (default: now). */
export function getMondayOfWeek(date: Date = new Date()): string {
  const todayIso = formatDateInHcm(date);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: SCHEDULE_TIMEZONE,
    weekday: "short",
  }).format(date);

  const weekdayOffset: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  const offset = weekdayOffset[weekday] ?? 0;
  const noon = new Date(`${todayIso}T12:00:00+07:00`);
  noon.setUTCDate(noon.getUTCDate() - offset);
  return formatDateInHcm(noon);
}

export function addDaysToIsoDate(isoDate: string, days: number): string {
  const base = new Date(`${isoDate}T12:00:00+07:00`);
  base.setUTCDate(base.getUTCDate() + days);
  return formatDateInHcm(base);
}

export function shiftWeek(weekStart: string, deltaWeeks: number): string {
  return addDaysToIsoDate(weekStart, deltaWeeks * 7);
}

export function buildWeekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDaysToIsoDate(weekStart, i));
}

export function dayShortLabel(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00+07:00`);
  return DAY_SHORT_VI[d.getDay()] ?? "";
}

export function dayNumberLabel(isoDate: string): string {
  return isoDate.slice(8, 10).replace(/^0/, "") || isoDate.slice(8, 10);
}

export function formatWeekRangeLabel(weekStart: string, weekEnd?: string | null): string {
  const end = weekEnd ?? addDaysToIsoDate(weekStart, 6);
  const startLabel = formatViShortDate(weekStart);
  const endLabel = formatViShortDate(end);
  return `${startLabel} – ${endLabel}`;
}

function formatViShortDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${Number(d)}/${Number(m)}`;
}

/** Extract `HH:mm` from BE strings like `15/06/2026 14:30:00`. */
export function formatSessionClock(raw: string): string {
  const match = raw.match(/(\d{1,2}):(\d{2})/);
  if (!match) return raw;
  const hour = match[1].padStart(2, "0");
  return `${hour}:${match[2]}`;
}

export function formatSessionTimeRange(
  startTime: string,
  endTime: string,
): string {
  return `${formatSessionClock(startTime)} – ${formatSessionClock(endTime)}`;
}

export function sessionKindLabel(kind: ScheduleSessionKind): string {
  switch (kind) {
    case "LiveOnline":
      return "Trực tuyến";
    case "Offline":
      return "Offline";
    case "AssignmentWindow":
      return "Bài tập";
    default:
      return kind;
  }
}

export function attendanceStatusLabel(
  status: ScheduleAttendanceStatus | null | undefined,
): string | null {
  if (!status) return null;
  switch (status) {
    case "Expected":
      return "Chờ điểm danh";
    case "Present":
      return "Có mặt";
    case "Absent":
      return "Vắng";
    case "Excused":
      return "Có phép";
    case "Late":
      return "Đi muộn";
    default:
      return status;
  }
}

/** Offline / live sessions — same filter as Mentor QR / Parent check-in strip. */
export function isLiveSessionKind(
  kind: ScheduleSessionKind | null | undefined,
): boolean {
  return kind === "Offline" || kind === "LiveOnline";
}

export function attendanceStatusTone(
  status: ScheduleAttendanceStatus | null | undefined,
): "success" | "warning" | "danger" | "info" | "muted" | "neutral" {
  switch (status) {
    case "Present":
      return "success";
    case "Late":
      return "warning";
    case "Absent":
      return "danger";
    case "Excused":
      return "info";
    case "Expected":
      return "muted";
    default:
      return "neutral";
  }
}

export function findDay(
  schedule: WeeklySchedule | null,
  isoDate: string,
): ScheduleDay | null {
  if (!schedule?.days?.length) return null;
  return schedule.days.find((day) => day.date === isoDate) ?? null;
}

export function sessionsForDay(
  schedule: WeeklySchedule | null,
  isoDate: string,
): ScheduleSession[] {
  const day = findDay(schedule, isoDate);
  return day?.sessions ?? [];
}

export function todayIsoInHcm(): string {
  return formatDateInHcm(new Date());
}

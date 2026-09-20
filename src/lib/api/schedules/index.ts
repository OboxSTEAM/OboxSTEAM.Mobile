import { createApiGetWith } from "@/lib/api/create-endpoint";
import { createApiValueSchema } from "@/lib/api/schemas";
import {
  weeklyScheduleSchema,
  type WeeklySchedule,
} from "@/lib/api/schedules/schemas";

const weeklyScheduleValueSchema = createApiValueSchema(weeklyScheduleSchema);

export type GetWeeklyScheduleParams = {
  /** Monday of the week as `YYYY-MM-DD`. Omit for current week (BE default). */
  weekStart?: string;
  /** Required for Parent (verified linked child). Omit for Student (own schedule). */
  studentId?: string;
};

function buildWeeklySchedulePath({
  weekStart,
  studentId,
}: GetWeeklyScheduleParams): string {
  const query = new URLSearchParams();
  if (weekStart) query.set("weekStart", weekStart);
  if (studentId) query.set("studentId", studentId);
  const qs = query.toString();
  return qs ? `/api/schedules/weekly?${qs}` : "/api/schedules/weekly";
}

/** `GET /api/schedules/weekly` */
export const getWeeklySchedule = createApiGetWith({
  path: buildWeeklySchedulePath,
  value: weeklyScheduleValueSchema,
});

export type { WeeklySchedule };
export type {
  ScheduleAttendanceStatus,
  ScheduleDay,
  ScheduleSession,
  ScheduleSessionKind,
} from "@/lib/api/schedules/schemas";

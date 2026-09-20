import { z } from "zod";

import { createPaginationSchema } from "@/lib/api/entities/pagination";
import { scheduleSessionKindSchema } from "@/lib/api/schedules/schemas";

export const classStatusSchema = z.enum([
  "Draft",
  "Open",
  "InProgress",
  "Completed",
  "Cancelled",
  "ReadyForMentor",
]);

export const classSessionStatusSchema = z.enum([
  "Scheduled",
  "InProgress",
  "Completed",
  "Cancelled",
]);

export const classSummarySchema = z
  .object({
    id: z.string(),
    code: z.string().nullish(),
    name: z.string().nullish(),
    programId: z.string().nullish(),
    mentorId: z.string().nullish(),
    status: classStatusSchema.nullish(),
    scheduleSummary: z.string().nullish(),
  })
  .passthrough();

export const classSessionSchema = z
  .object({
    id: z.string(),
    classId: z.string(),
    moduleId: z.string().nullish(),
    activityId: z.string().nullish(),
    assignmentId: z.string().nullish(),
    sessionKind: scheduleSessionKindSchema,
    title: z.string().nullish(),
    description: z.string().nullish(),
    startTime: z.string(),
    endTime: z.string(),
    location: z.string().nullish(),
    meetingUrl: z.string().nullish(),
    requiresAttendance: z.boolean().nullish(),
    requiresMentorCheckIn: z.boolean().nullish(),
    status: classSessionStatusSchema.nullish(),
  })
  .passthrough();

export const checkInTokenSchema = z
  .object({
    classSessionId: z.string(),
    token: z.string(),
    code: z.string().nullish(),
    expiresAt: z.string(),
  })
  .passthrough();

export const checkInRequestSchema = z
  .object({
    token: z.string().uuid().nullish(),
    code: z.string().max(6).nullish(),
  })
  .passthrough();

export const sessionAttendanceSchema = z
  .object({
    id: z.string().nullish(),
    classSessionId: z.string().nullish(),
    studentId: z.string().nullish(),
    status: z
      .enum(["Expected", "Present", "Absent", "Excused", "Late"])
      .nullish(),
    checkedInAt: z.string().nullish(),
  })
  .passthrough();

export const classPaginationSchema = createPaginationSchema(classSummarySchema);
export const classSessionPaginationSchema =
  createPaginationSchema(classSessionSchema);

export type ClassSummary = z.infer<typeof classSummarySchema>;
export type ClassSession = z.infer<typeof classSessionSchema>;
export type CheckInToken = z.infer<typeof checkInTokenSchema>;
export type CheckInRequest = z.infer<typeof checkInRequestSchema>;
export type SessionAttendance = z.infer<typeof sessionAttendanceSchema>;

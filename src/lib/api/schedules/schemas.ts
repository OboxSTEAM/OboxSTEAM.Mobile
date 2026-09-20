import { z } from "zod";

export const scheduleSessionKindSchema = z.enum([
  "LiveOnline",
  "Offline",
  "AssignmentWindow",
]);

export const scheduleSessionStatusSchema = z.enum([
  "Scheduled",
  "InProgress",
  "Completed",
  "Cancelled",
]);

export const scheduleAttendanceStatusSchema = z.enum([
  "Expected",
  "Present",
  "Absent",
  "Excused",
  "Late",
]);

export const scheduleDayOfWeekSchema = z.enum([
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]);

export const scheduleSessionSchema = z
  .object({
    id: z.string(),
    classId: z.string(),
    classCode: z.string().nullish(),
    className: z.string().nullish(),
    programId: z.string().nullish(),
    mentorId: z.string().nullish(),
    moduleId: z.string().nullish(),
    activityId: z.string().nullish(),
    sessionKind: scheduleSessionKindSchema,
    startTime: z.string(),
    endTime: z.string(),
    location: z.string().nullish(),
    meetingUrl: z.string().nullish(),
    status: scheduleSessionStatusSchema.nullish(),
    isCompleted: z.boolean().nullish(),
    attendanceStatus: scheduleAttendanceStatusSchema.nullish(),
  })
  .passthrough();

export const scheduleDaySchema = z
  .object({
    date: z.string(),
    dayOfWeek: scheduleDayOfWeekSchema.nullish(),
    sessions: z.array(scheduleSessionSchema).nullish(),
  })
  .passthrough();

export const weeklyScheduleSchema = z
  .object({
    studentId: z.string().nullish(),
    weekStart: z.string(),
    weekEnd: z.string().nullish(),
    timezone: z.string().nullish(),
    days: z.array(scheduleDaySchema).nullish(),
  })
  .passthrough();

export type ScheduleSessionKind = z.infer<typeof scheduleSessionKindSchema>;
export type ScheduleAttendanceStatus = z.infer<
  typeof scheduleAttendanceStatusSchema
>;
export type ScheduleSession = z.infer<typeof scheduleSessionSchema>;
export type ScheduleDay = z.infer<typeof scheduleDaySchema>;
export type WeeklySchedule = z.infer<typeof weeklyScheduleSchema>;

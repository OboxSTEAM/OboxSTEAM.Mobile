import { parentLinkedStudentSchema } from "@/lib/api/entities/linked-account";

import { z } from "zod";

/**
 * Response schemas for the two parent progression endpoints.
 *
 * Backend enum fields stay plain strings on purpose: a value the app has never
 * seen must render as-is (see `src/lib/parent/labels.ts`) instead of failing the
 * whole parse and blanking the screen.
 */
const apiDate = z.string().nullish();
const enumValue = z.string().nullish();

export const parentProgressionSummarySchema = z
  .object({
    activeEnrollmentCount: z.number().nullish(),
    completedEnrollmentCount: z.number().nullish(),
    lastAccessedAt: apiDate,
  })
  .passthrough();

export const parentCurrentModuleSchema = z
  .object({
    moduleId: z.string().nullish(),
    moduleEnrollmentId: z.string().nullish(),
    moduleName: z.string().nullish(),
    moduleOrder: z.number().nullish(),
    moduleType: enumValue,
    status: enumValue,
    progressPercent: z.number().nullish(),
  })
  .passthrough();

export const parentCurrentActivitySchema = z
  .object({
    activityId: z.string().nullish(),
    activityName: z.string().nullish(),
    activityType: enumValue,
  })
  .passthrough();

export const parentBlockerSchema = z
  .object({
    code: enumValue,
    message: z.string().nullish(),
    moduleId: z.string().nullish(),
    enrollmentId: z.string().nullish(),
  })
  .passthrough();

export const parentEnrollmentBriefSchema = z
  .object({
    enrollmentId: z.string(),
    programId: z.string().nullish(),
    programName: z.string().nullish(),
    programCode: z.string().nullish(),
    thumbnailUrl: z.string().nullish(),
    level: enumValue,
    status: enumValue,
    progressPercent: z.number().nullish(),
    enrolledAt: apiDate,
    startedAt: apiDate,
    completedAt: apiDate,
    currentModule: parentCurrentModuleSchema.nullish(),
    currentActivity: parentCurrentActivitySchema.nullish(),
    lastAccessedAt: apiDate,
    blockers: z.array(parentBlockerSchema).nullish(),
  })
  .passthrough();

export const parentProgressEventSchema = z
  .object({
    id: z.string().nullish(),
    occurredAt: apiDate,
    type: enumValue,
    title: z.string().nullish(),
    subtitle: z.string().nullish(),
    enrollmentId: z.string().nullish(),
    moduleId: z.string().nullish(),
  })
  .passthrough();

export const parentChildProgressionSchema = z
  .object({
    student: parentLinkedStudentSchema,
    summary: parentProgressionSummarySchema.nullish(),
    enrollments: z.array(parentEnrollmentBriefSchema).nullish(),
    recentMilestones: z.array(parentProgressEventSchema).nullish(),
  })
  .passthrough();

export const parentEnrollmentHeaderSchema = z
  .object({
    enrollmentId: z.string(),
    programId: z.string().nullish(),
    programName: z.string().nullish(),
    programCode: z.string().nullish(),
    thumbnailUrl: z.string().nullish(),
    status: enumValue,
    progressPercent: z.number().nullish(),
    enrolledAt: apiDate,
    startedAt: apiDate,
    completedAt: apiDate,
    lastAccessedAt: apiDate,
  })
  .passthrough();

export const parentClassInfoSchema = z
  .object({
    classId: z.string().nullish(),
    className: z.string().nullish(),
    mentorName: z.string().nullish(),
  })
  .passthrough();

export const parentActivityStatsSchema = z
  .object({
    total: z.number().nullish(),
    completed: z.number().nullish(),
  })
  .passthrough();

export const parentAssignmentOutcomeSchema = z
  .object({
    assignmentId: z.string().nullish(),
    title: z.string().nullish(),
    assignmentType: enumValue,
    isRequiredForModulePass: z.boolean().nullish(),
    dueDate: apiDate,
    status: enumValue,
    score: z.number().nullish(),
    maxPoints: z.number().nullish(),
    passScore: z.number().nullish(),
    passed: z.boolean().nullish(),
    submittedAt: apiDate,
    gradedAt: apiDate,
    attemptUsed: z.number().nullish(),
    maxAttempts: z.number().nullish(),
  })
  .passthrough();

export const parentModuleProgressSchema = z
  .object({
    moduleId: z.string().nullish(),
    moduleEnrollmentId: z.string().nullish(),
    moduleName: z.string().nullish(),
    moduleOrder: z.number().nullish(),
    moduleType: enumValue,
    isLocked: z.boolean().nullish(),
    lockReason: z.string().nullish(),
    status: enumValue,
    progressPercent: z.number().nullish(),
    attemptNumber: z.number().nullish(),
    finalGrade: z.number().nullish(),
    outcomeLabel: enumValue,
    startedAt: apiDate,
    completedAt: apiDate,
    activityStats: parentActivityStatsSchema.nullish(),
    assignments: z.array(parentAssignmentOutcomeSchema).nullish(),
  })
  .passthrough();

export const parentEnrollmentProgressionSchema = z
  .object({
    studentId: z.string().nullish(),
    enrollment: parentEnrollmentHeaderSchema,
    classInfo: parentClassInfoSchema.nullish(),
    modules: z.array(parentModuleProgressSchema).nullish(),
  })
  .passthrough();

export type ParentProgressionSummary = z.infer<
  typeof parentProgressionSummarySchema
>;
export type ParentBlocker = z.infer<typeof parentBlockerSchema>;
export type ParentEnrollmentBrief = z.infer<typeof parentEnrollmentBriefSchema>;
export type ParentProgressEvent = z.infer<typeof parentProgressEventSchema>;
export type ParentChildProgression = z.infer<
  typeof parentChildProgressionSchema
>;
export type ParentEnrollmentHeader = z.infer<
  typeof parentEnrollmentHeaderSchema
>;
export type ParentClassInfo = z.infer<typeof parentClassInfoSchema>;
export type ParentAssignmentOutcome = z.infer<
  typeof parentAssignmentOutcomeSchema
>;
export type ParentModuleProgress = z.infer<typeof parentModuleProgressSchema>;
export type ParentEnrollmentProgression = z.infer<
  typeof parentEnrollmentProgressionSchema
>;

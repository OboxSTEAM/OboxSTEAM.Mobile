import { authTokensSchema } from "@/lib/api/auth";
import {
  createApiGet,
  createApiGetWith,
  createApiPost,
} from "@/lib/api/create-endpoint";
import { parentLinkSchema } from "@/lib/api/entities/linked-account";
import {
  parentChildProgressionSchema,
  parentEnrollmentProgressionSchema,
} from "@/lib/api/parent/schemas";
import {
  apiValueMessageOnlySchema,
  createApiValueSchema,
} from "@/lib/api/schemas";
import {
  approveParentLinkSchema,
  completeParentProfileSchema,
  parentMagicLoginSchema,
  requestParentLinkSchema,
} from "@/lib/validations/parent";

import { z } from "zod";
const authTokensValueSchema = createApiValueSchema(authTokensSchema);
const parentLinksValueSchema = createApiValueSchema(z.array(parentLinkSchema));
const childProgressionValueSchema = createApiValueSchema(
  parentChildProgressionSchema,
);
const enrollmentProgressionValueSchema = createApiValueSchema(
  parentEnrollmentProgressionSchema,
);

/** `POST /api/parent/magic-login` — skipAuth; returns JWT pair like login. */
export const parentMagicLogin = createApiPost({
  path: "/api/parent/magic-login",
  input: parentMagicLoginSchema,
  value: authTokensValueSchema,
  skipAuth: true,
});

export const completeParentProfile = createApiPost({
  path: "/api/parent/complete-profile",
  input: completeParentProfileSchema,
  value: apiValueMessageOnlySchema,
});

export const requestParentLink = createApiPost({
  path: "/api/parent/request-link",
  input: requestParentLinkSchema,
  value: apiValueMessageOnlySchema,
});

export const approveParentLink = createApiPost({
  path: "/api/parent/approve-link",
  input: approveParentLinkSchema,
  value: apiValueMessageOnlySchema,
  skipAuth: true,
});

export const getParentLinks = createApiGet({
  path: "/api/parent/links",
  value: parentLinksValueSchema,
});

/** `GET /api/parent/children/{studentId}/progression` */
export const getChildProgression = createApiGetWith({
  path: ({ studentId }: { studentId: string }) =>
    `/api/parent/children/${encodeURIComponent(studentId)}/progression`,
  value: childProgressionValueSchema,
});

/** `GET /api/parent/children/{studentId}/enrollments/{enrollmentId}/progression` */
export const getEnrollmentProgression = createApiGetWith({
  path: ({
    studentId,
    enrollmentId,
  }: {
    studentId: string;
    enrollmentId: string;
  }) =>
    `/api/parent/children/${encodeURIComponent(studentId)}/enrollments/${encodeURIComponent(enrollmentId)}/progression`,
  value: enrollmentProgressionValueSchema,
});

export type { ParentLink } from "@/lib/api/entities/linked-account";
export type {
  ParentAssignmentOutcome,
  ParentBlocker,
  ParentChildProgression,
  ParentClassInfo,
  ParentEnrollmentBrief,
  ParentEnrollmentHeader,
  ParentEnrollmentProgression,
  ParentModuleProgress,
  ParentProgressEvent,
  ParentProgressionSummary,
} from "@/lib/api/parent/schemas";

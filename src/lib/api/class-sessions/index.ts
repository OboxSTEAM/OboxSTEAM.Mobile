import {
  createApiGetWith,
  createApiPost,
  createApiPostWith,
} from "@/lib/api/create-endpoint";
import { createApiValueSchema } from "@/lib/api/schemas";
import {
  checkInRequestSchema,
  checkInTokenSchema,
  classPaginationSchema,
  classSessionPaginationSchema,
  sessionAttendanceSchema,
  type CheckInRequest,
  type CheckInToken,
  type ClassSession,
  type ClassSummary,
  type SessionAttendance,
} from "@/lib/api/class-sessions/schemas";

const classPaginationValueSchema = createApiValueSchema(classPaginationSchema);
const classSessionPaginationValueSchema = createApiValueSchema(
  classSessionPaginationSchema,
);
const checkInTokenValueSchema = createApiValueSchema(checkInTokenSchema);
const sessionAttendanceValueSchema = createApiValueSchema(
  sessionAttendanceSchema,
);

export type ListClassesParams = {
  mentorId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  search?: string;
};

function buildClassesPath(params: ListClassesParams): string {
  const query = new URLSearchParams();
  if (params.mentorId) query.set("mentorId", params.mentorId);
  if (params.status) query.set("status", params.status);
  if (params.page != null) query.set("page", String(params.page));
  if (params.pageSize != null) query.set("pageSize", String(params.pageSize));
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  return qs ? `/api/classes?${qs}` : "/api/classes";
}

/** `GET /api/classes` */
export const listClasses = createApiGetWith({
  path: buildClassesPath,
  value: classPaginationValueSchema,
});

export type ListClassSessionsParams = {
  classId: string;
  from?: string;
  to?: string;
  sessionKind?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  isDescending?: boolean;
};

function buildClassSessionsPath(params: ListClassSessionsParams): string {
  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.sessionKind) query.set("sessionKind", params.sessionKind);
  if (params.status) query.set("status", params.status);
  if (params.page != null) query.set("page", String(params.page));
  if (params.pageSize != null) query.set("pageSize", String(params.pageSize));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.isDescending != null) {
    query.set("isDescending", String(params.isDescending));
  }
  const qs = query.toString();
  const base = `/api/classes/${encodeURIComponent(params.classId)}/sessions`;
  return qs ? `${base}?${qs}` : base;
}

/** `GET /api/classes/{classId}/sessions` */
export const listClassSessions = createApiGetWith({
  path: buildClassSessionsPath,
  value: classSessionPaginationValueSchema,
});

/** `POST /api/class-sessions/{id}/checkin-token` — rotate QR + 6-digit code. */
export const rotateCheckInToken = createApiPostWith({
  path: ({ sessionId }: { sessionId: string }) =>
    `/api/class-sessions/${encodeURIComponent(sessionId)}/checkin-token`,
  value: checkInTokenValueSchema,
});

/** `POST /api/class-sessions/checkin-by-token` — Student scan-first check-in. */
export const checkInByToken = createApiPost({
  path: "/api/class-sessions/checkin-by-token",
  input: checkInRequestSchema,
  value: sessionAttendanceValueSchema,
});

export type {
  CheckInRequest,
  CheckInToken,
  ClassSession,
  ClassSummary,
  SessionAttendance,
};

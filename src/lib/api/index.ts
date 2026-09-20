export { getApiBaseUrl } from "@/lib/api/config";
export { apiFetch } from "@/lib/api/client";
export { ApiRequestError, ApiResponseError } from "@/lib/api/errors";

export { login, refreshToken } from "@/lib/api/auth";
export type { AuthTokens } from "@/lib/api/auth";

export { getCurrentUser } from "@/lib/api/account";
export type { UserProfile } from "@/lib/api/account";

export {
  approveParentLink,
  completeParentProfile,
  getChildProgression,
  getEnrollmentProgression,
  getParentLinks,
  parentMagicLogin,
  requestParentLink,
} from "@/lib/api/parent";
export type {
  ParentAssignmentOutcome,
  ParentBlocker,
  ParentChildProgression,
  ParentClassInfo,
  ParentEnrollmentBrief,
  ParentEnrollmentHeader,
  ParentEnrollmentProgression,
  ParentLink,
  ParentModuleProgress,
  ParentProgressEvent,
  ParentProgressionSummary,
} from "@/lib/api/parent";

export {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
export type {
  Notification,
  NotificationUnreadCount,
} from "@/lib/api/notifications";

export { getWeeklySchedule } from "@/lib/api/schedules";
export type {
  ScheduleAttendanceStatus,
  ScheduleDay,
  ScheduleSession,
  ScheduleSessionKind,
  WeeklySchedule,
} from "@/lib/api/schedules";

export {
  checkInByToken,
  listClasses,
  listClassSessions,
  rotateCheckInToken,
} from "@/lib/api/class-sessions";
export type {
  CheckInRequest,
  CheckInToken,
  ClassSession,
  ClassSummary,
  SessionAttendance,
} from "@/lib/api/class-sessions";

export { uploadMedia } from "@/lib/api/media";
export type { MediaAsset, UploadMediaFile, UploadMediaParams } from "@/lib/api/media";

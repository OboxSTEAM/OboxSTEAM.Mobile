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

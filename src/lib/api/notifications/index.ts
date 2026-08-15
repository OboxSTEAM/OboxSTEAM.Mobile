import {
  createApiGet,
  createApiGetWith,
  createApiPatch,
  createApiPatchWith,
} from "@/lib/api/create-endpoint";
import {
  notificationSchema,
  notificationUnreadCountSchema,
} from "@/lib/api/entities/notification";
import { createPaginationSchema } from "@/lib/api/entities/pagination";
import {
  apiValueMessageOnlySchema,
  createApiValueSchema,
} from "@/lib/api/schemas";
import {
  notificationIdParamSchema,
  notificationListQuerySchema,
  type NotificationListQuery,
} from "@/lib/validations/notifications";

const notificationsPageSchema = createPaginationSchema(notificationSchema);
const notificationsValueSchema = createApiValueSchema(notificationsPageSchema);
const unreadCountValueSchema = createApiValueSchema(
  notificationUnreadCountSchema,
);

function buildNotificationsQuery(params: NotificationListQuery): string {
  const parsed = notificationListQuerySchema.parse(params);
  const search = new URLSearchParams();
  if (parsed.page != null) search.set("page", String(parsed.page));
  if (parsed.pageSize != null) search.set("pageSize", String(parsed.pageSize));
  if (parsed.unreadOnly != null) {
    search.set("unreadOnly", String(parsed.unreadOnly));
  }
  const qs = search.toString();
  return qs ? `/api/notifications?${qs}` : "/api/notifications";
}

/** `GET /api/notifications` — paginated inbox for the current user. */
export const getNotifications = createApiGetWith({
  path: (params: NotificationListQuery) => buildNotificationsQuery(params),
  value: notificationsValueSchema,
});

/** `GET /api/notifications/unread-count` */
export const getUnreadNotificationCount = createApiGet({
  path: "/api/notifications/unread-count",
  value: unreadCountValueSchema,
});

/** `PATCH /api/notifications/{id}/read` */
export const markNotificationRead = createApiPatchWith({
  path: (params: { id: string }) => {
    const { id } = notificationIdParamSchema.parse(params);
    return `/api/notifications/${encodeURIComponent(id)}/read`;
  },
  value: apiValueMessageOnlySchema,
});

/** `PATCH /api/notifications/read-all` */
export const markAllNotificationsRead = createApiPatch({
  path: "/api/notifications/read-all",
  value: apiValueMessageOnlySchema,
});

export type {
  Notification,
  NotificationUnreadCount,
} from "@/lib/api/entities/notification";
export type { Pagination } from "@/lib/api/entities/pagination";

import { router as expoRouter } from "expo-router";

import type { Notification } from "@/lib/api/entities/notification";
import type { ParentLink } from "@/lib/api/entities/linked-account";
import { parseNotificationPayload } from "@/lib/notifications/labels";

export type NotificationRoute =
  | { kind: "child"; studentId: string }
  | { kind: "enrollment"; studentId: string; enrollmentId: string }
  | { kind: "none" };

type RouterLike = Pick<typeof expoRouter, "push">;

/**
 * Resolve in-app navigation for a notification.
 * Only routes that exist today (children / enrollment detail) are returned.
 */
export function resolveNotificationRoute(
  notification: Notification,
  links: ParentLink[],
): NotificationRoute {
  const payload = parseNotificationPayload(notification.payloadJson);
  const studentId =
    payload?.studentId?.trim() ||
    (notification.entityType === "Student" ? notification.entityId : null) ||
    null;

  if (!studentId) return { kind: "none" };

  const link = links.find((item) => item.linkedUserId === studentId);
  if (!link?.isVerified) return { kind: "none" };

  const enrollmentId = payload?.enrollmentId?.trim() || null;
  if (enrollmentId) {
    return { kind: "enrollment", studentId, enrollmentId };
  }

  return { kind: "child", studentId };
}

export function navigateNotificationRoute(
  router: RouterLike,
  route: NotificationRoute,
): boolean {
  if (route.kind === "child") {
    router.push({
      pathname: "/children/[studentId]",
      params: { studentId: route.studentId },
    });
    return true;
  }

  if (route.kind === "enrollment") {
    router.push({
      pathname: "/children/[studentId]/enrollments/[enrollmentId]",
      params: {
        studentId: route.studentId,
        enrollmentId: route.enrollmentId,
      },
    });
    return true;
  }

  return false;
}

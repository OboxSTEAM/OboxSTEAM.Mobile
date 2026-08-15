import { z } from "zod";

/**
 * Backend notification type is a large enum. Keep as plain string so an
 * unknown value still renders instead of failing the whole inbox parse.
 */
export const notificationSchema = z
  .object({
    id: z.string(),
    recipientUserId: z.string().nullish(),
    type: z.string().nullish(),
    title: z.string().nullish(),
    body: z.string().nullish(),
    payloadJson: z.string().nullish(),
    readAt: z.string().nullish(),
    actorUserId: z.string().nullish(),
    entityType: z.string().nullish(),
    entityId: z.string().nullish(),
    createdAt: z.string().nullish(),
  })
  .passthrough();

export const notificationUnreadCountSchema = z
  .object({
    count: z.number().int(),
  })
  .passthrough();

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationUnreadCount = z.infer<
  typeof notificationUnreadCountSchema
>;

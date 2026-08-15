import { z } from "zod";
import type { LucideIcon } from "lucide-react-native";
import {
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  CreditCard,
  Link2,
  PlayCircle,
  Video,
  XCircle,
} from "lucide-react-native";

import { colors } from "@/lib/tokens/colors";

export const notificationPayloadSchema = z
  .object({
    studentId: z.string().nullish(),
    classId: z.string().nullish(),
    classSessionId: z.string().nullish(),
    enrollmentId: z.string().nullish(),
    paymentId: z.string().nullish(),
  })
  .passthrough();

export type NotificationPayload = z.infer<typeof notificationPayloadSchema>;

export type NotificationVisual = {
  Icon: LucideIcon;
  tone: string;
  fallbackTitle: string;
};

const DEFAULT_VISUAL: NotificationVisual = {
  Icon: Bell,
  tone: colors.mutedForeground,
  fallbackTitle: "Thông báo",
};

const TYPE_VISUALS: Record<string, NotificationVisual> = {
  ParentLinkRequested: {
    Icon: Link2,
    tone: colors.accent,
    fallbackTitle: "Yêu cầu liên kết",
  },
  ParentLinkVerified: {
    Icon: CheckCircle2,
    tone: colors.steam.technology,
    fallbackTitle: "Liên kết đã xác minh",
  },
  ParentLinkApproved: {
    Icon: CheckCircle2,
    tone: colors.steam.technology,
    fallbackTitle: "Liên kết đã duyệt",
  },
  ParentPaymentRequested: {
    Icon: CreditCard,
    tone: colors.primary,
    fallbackTitle: "Yêu cầu thanh toán",
  },
  ParentModuleRetakeRequested: {
    Icon: CreditCard,
    tone: colors.primary,
    fallbackTitle: "Yêu cầu học lại module",
  },
  ProgramPendingPayment: {
    Icon: CreditCard,
    tone: colors.primary,
    fallbackTitle: "Chờ thanh toán chương trình",
  },
  ModuleRetakePendingPayment: {
    Icon: CreditCard,
    tone: colors.primary,
    fallbackTitle: "Chờ thanh toán học lại",
  },
  PaymentSucceeded: {
    Icon: CheckCircle2,
    tone: colors.steam.technology,
    fallbackTitle: "Thanh toán thành công",
  },
  PaymentFailed: {
    Icon: XCircle,
    tone: colors.primary,
    fallbackTitle: "Thanh toán thất bại",
  },
  PaymentCancelled: {
    Icon: XCircle,
    tone: colors.mutedForeground,
    fallbackTitle: "Thanh toán đã hủy",
  },
  PendingPaymentExpired: {
    Icon: XCircle,
    tone: colors.primary,
    fallbackTitle: "Thanh toán hết hạn",
  },
  ProgramActivated: {
    Icon: BookOpen,
    tone: colors.steam.technology,
    fallbackTitle: "Chương trình đã kích hoạt",
  },
  ModuleCompleted: {
    Icon: CheckCircle2,
    tone: colors.steam.technology,
    fallbackTitle: "Hoàn thành module",
  },
  ModuleUnlocked: {
    Icon: BookOpen,
    tone: colors.accent,
    fallbackTitle: "Mở khóa module",
  },
  ActivityCompleted: {
    Icon: CheckCircle2,
    tone: colors.steam.technology,
    fallbackTitle: "Hoàn thành hoạt động",
  },
  ClassUpdated: {
    Icon: Calendar,
    tone: colors.accent,
    fallbackTitle: "Lớp học cập nhật",
  },
  ClassStarted: {
    Icon: PlayCircle,
    tone: colors.steam.technology,
    fallbackTitle: "Lớp học bắt đầu",
  },
  ClassAutoStarted: {
    Icon: PlayCircle,
    tone: colors.steam.technology,
    fallbackTitle: "Lớp học tự động bắt đầu",
  },
  ClassCompleted: {
    Icon: CheckCircle2,
    tone: colors.steam.technology,
    fallbackTitle: "Lớp học kết thúc",
  },
  ClassSessionScheduled: {
    Icon: Calendar,
    tone: colors.accent,
    fallbackTitle: "Lịch buổi học mới",
  },
  ClassSessionRescheduled: {
    Icon: Calendar,
    tone: colors.steam.arts,
    fallbackTitle: "Đổi lịch buổi học",
  },
  ClassSessionCancelled: {
    Icon: XCircle,
    tone: colors.primary,
    fallbackTitle: "Hủy buổi học",
  },
  AssignmentPublished: {
    Icon: BookOpen,
    tone: colors.steam.mathematics,
    fallbackTitle: "Bài tập mới",
  },
  AttendanceMarkedPresent: {
    Icon: CheckCircle2,
    tone: colors.steam.technology,
    fallbackTitle: "Điểm danh: có mặt",
  },
  AttendanceMarkedLate: {
    Icon: Calendar,
    tone: colors.steam.arts,
    fallbackTitle: "Điểm danh: đi muộn",
  },
  AttendanceMarkedAbsent: {
    Icon: XCircle,
    tone: colors.primary,
    fallbackTitle: "Điểm danh: vắng",
  },
  AttendanceMarkedExcused: {
    Icon: Calendar,
    tone: colors.mutedForeground,
    fallbackTitle: "Điểm danh: có phép",
  },
  HighlightVideoReady: {
    Icon: Video,
    tone: colors.steam.mathematics,
    fallbackTitle: "Video highlight sẵn sàng",
  },
  MediaVideoReady: {
    Icon: Video,
    tone: colors.steam.mathematics,
    fallbackTitle: "Video sẵn sàng",
  },
};

export function notificationVisual(
  type?: string | null,
): NotificationVisual {
  if (!type) return DEFAULT_VISUAL;
  return TYPE_VISUALS[type] ?? DEFAULT_VISUAL;
}

export function notificationTitle(
  title?: string | null,
  type?: string | null,
): string {
  const trimmed = title?.trim();
  if (trimmed) return trimmed;
  return notificationVisual(type).fallbackTitle;
}

export function parseNotificationPayload(
  payloadJson?: string | null,
): NotificationPayload | null {
  if (!payloadJson?.trim()) return null;
  try {
    const raw: unknown = JSON.parse(payloadJson);
    const parsed = notificationPayloadSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

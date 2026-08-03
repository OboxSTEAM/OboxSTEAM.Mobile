import { ApiRequestError, ApiResponseError } from "@/lib/api/errors";

export type AppErrorView = {
  title: string;
  reason: string;
  action?: string;
};

export function resolveAppError(error: unknown): AppErrorView {
  if (error instanceof ApiResponseError) {
    return {
      title: "Không thể hoàn tất",
      reason: error.message,
      action: "Thử lại",
    };
  }

  if (error instanceof ApiRequestError) {
    if (error.status === 401) {
      return {
        title: "Phiên đăng nhập hết hạn",
        reason: "Vui lòng đăng nhập lại.",
        action: "Đăng nhập",
      };
    }
    if (error.status >= 500) {
      return {
        title: "Lỗi máy chủ",
        reason: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.",
        action: "Thử lại",
      };
    }
    return {
      title: "Yêu cầu thất bại",
      reason: error.message,
      action: "Thử lại",
    };
  }

  if (error instanceof Error && error.message) {
    return {
      title: "Đã xảy ra lỗi",
      reason: error.message,
      action: "Thử lại",
    };
  }

  return {
    title: "Đã xảy ra lỗi",
    reason: "Vui lòng thử lại.",
    action: "Thử lại",
  };
}

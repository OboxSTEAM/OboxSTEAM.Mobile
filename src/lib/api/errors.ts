import type { ApiErrorContent } from "@/lib/api/schemas";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.body = body;
  }
}

export class ApiResponseError extends Error {
  readonly code: string | null | undefined;
  readonly details: ApiErrorContent | null | undefined;

  constructor(message: string, code?: string | null, details?: ApiErrorContent | null) {
    super(message);
    this.name = "ApiResponseError";
    this.code = code;
    this.details = details;
  }
}

export function assertApiSuccess<T extends { isSuccess: boolean; value?: unknown; error?: ApiErrorContent | null }>(
  envelope: T,
  fallbackMessage = "Yêu cầu không thành công.",
): asserts envelope is T & { isSuccess: true } {
  if (envelope.isSuccess) return;

  const message =
    envelope.error?.message?.trim() ||
    (typeof envelope.value === "object" &&
    envelope.value &&
    "message" in envelope.value &&
    typeof (envelope.value as { message?: unknown }).message === "string"
      ? (envelope.value as { message: string }).message
      : null) ||
    fallbackMessage;

  throw new ApiResponseError(message, envelope.error?.code, envelope.error);
}

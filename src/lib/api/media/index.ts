import { apiFetch, parseJsonOrThrow } from "@/lib/api/client";
import { assertApiSuccess } from "@/lib/api/errors";
import {
  mediaAssetSchema,
  type MediaAsset,
} from "@/lib/api/media/schemas";
import {
  createApiResponseSchema,
  createApiValueSchema,
} from "@/lib/api/schemas";

const mediaAssetValueSchema = createApiValueSchema(mediaAssetSchema);
const mediaAssetResponseSchema = createApiResponseSchema(mediaAssetValueSchema);

export type UploadMediaFile = {
  uri: string;
  name: string;
  type: string;
};

export type UploadMediaParams = {
  file: UploadMediaFile;
  classId: string;
  classSessionId?: string;
};

/**
 * `POST /api/media/upload` — class-moment image/video (face pipeline).
 * Not session evidence (`POST /api/class-sessions/{id}/evidence`).
 */
export async function uploadMedia(
  params: UploadMediaParams,
  options?: { signal?: AbortSignal },
): Promise<{
  code?: string | null;
  message?: string | null;
  data?: MediaAsset;
}> {
  const query = new URLSearchParams();
  query.set("classId", params.classId);
  if (params.classSessionId) {
    query.set("classSessionId", params.classSessionId);
  }

  const formData = new FormData();
  // RN FormData file shape — cast for DOM FormData typings.
  formData.append("file", {
    uri: params.file.uri,
    name: params.file.name,
    type: params.file.type,
  } as unknown as Blob);

  const response = await apiFetch(`/api/media/upload?${query.toString()}`, {
    method: "POST",
    body: formData,
    signal: options?.signal,
  });
  const json = await parseJsonOrThrow(response);
  const envelope = mediaAssetResponseSchema.parse(json);
  assertApiSuccess(envelope);
  if (!envelope.value) {
    throw new Error("Phản hồi API thiếu value.");
  }
  return envelope.value;
}

export type { MediaAsset };
export { mediaAssetSchema } from "@/lib/api/media/schemas";

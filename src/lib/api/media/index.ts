import { apiFetch, parseJsonOrThrow } from "@/lib/api/client";
import { createApiGetWith } from "@/lib/api/create-endpoint";
import { assertApiSuccess } from "@/lib/api/errors";
import {
  mediaAssetSchema,
  type MediaAsset,
} from "@/lib/api/media/schemas";
import {
  apiValueMessageOnlySchema,
  createApiResponseSchema,
  createApiValueSchema,
} from "@/lib/api/schemas";
import { File } from "expo-file-system";
import { z } from "zod";

const mediaAssetValueSchema = createApiValueSchema(mediaAssetSchema);
const mediaAssetResponseSchema = createApiResponseSchema(mediaAssetValueSchema);
const mediaListValueSchema = createApiValueSchema(
  z.array(mediaAssetSchema).nullish(),
);
const messageOnlyResponseSchema = createApiResponseSchema(
  apiValueMessageOnlySchema,
);

export type UploadMediaFile = {
  uri: string;
  name: string;
  type: string;
};

export type UploadMediaParams = {
  file: UploadMediaFile;
  classId: string;
  /** When set, media is session evidence (“Minh chứng buổi học”). */
  classSessionId?: string;
};

/**
 * `POST /api/media/upload` — class media / session minh chứng (face pipeline).
 * Pass `classSessionId` for offline curriculum evidence (FE session panel).
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
  formData.append("file", new File(params.file.uri));

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

/** `GET /api/media/class-session/{classSessionId}` */
export const getMediaByClassSession = createApiGetWith({
  path: ({ classSessionId }: { classSessionId: string }) =>
    `/api/media/class-session/${encodeURIComponent(classSessionId)}`,
  value: mediaListValueSchema,
});

/** `DELETE /api/media/{mediaId}` */
export async function deleteMedia(
  mediaId: string,
  options?: { signal?: AbortSignal },
): Promise<{
  code?: string | null;
  message?: string | null;
}> {
  const response = await apiFetch(
    `/api/media/${encodeURIComponent(mediaId)}`,
    {
      method: "DELETE",
      signal: options?.signal,
    },
  );
  const json = await parseJsonOrThrow(response);
  const envelope = messageOnlyResponseSchema.parse(json);
  assertApiSuccess(envelope);
  if (!envelope.value) {
    throw new Error("Phản hồi API thiếu value.");
  }
  return envelope.value;
}

export type { MediaAsset };
export { mediaAssetSchema } from "@/lib/api/media/schemas";

export function unwrapMediaList(
  value: { data?: MediaAsset[] | null } | null | undefined,
): MediaAsset[] {
  return value?.data ?? [];
}

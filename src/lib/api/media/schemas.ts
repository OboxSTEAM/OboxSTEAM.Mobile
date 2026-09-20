import { z } from "zod";

export const mediaVideoStatusSchema = z.enum([
  "None",
  "Transcoding",
  "PendingTagging",
  "TaggingComplete",
  "Failed",
]);

export const mediaAssetSchema = z
  .object({
    id: z.string(),
    uploaderId: z.string().nullish(),
    classId: z.string().nullish(),
    classSessionId: z.string().nullish(),
    fileUrl: z.string().nullish(),
    fileType: z.string().nullish(),
    videoStatus: mediaVideoStatusSchema.nullish(),
    statusLabel: z.string().nullish(),
    isReady: z.boolean().nullish(),
    uploadedAt: z.string().nullish(),
  })
  .passthrough();

export type MediaAsset = z.infer<typeof mediaAssetSchema>;
export type MediaVideoStatus = z.infer<typeof mediaVideoStatusSchema>;

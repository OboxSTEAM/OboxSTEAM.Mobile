import type { MediaAsset } from "@/lib/api/media";

export type MediaSourceLabel = {
  kind: "class" | "session";
  title: string;
  detail: string | null;
};

/** Same labels as FE mentor media “Nguồn” column. */
export function resolveMediaSourceLabel(
  media: MediaAsset,
  sessionTitle?: string | null,
  sessionTime?: string | null,
): MediaSourceLabel {
  if (!media.classSessionId) {
    return {
      kind: "class",
      title: "Tải trực tiếp",
      detail: "Không gắn buổi học",
    };
  }

  const detailParts = [sessionTitle?.trim(), sessionTime?.trim()].filter(
    Boolean,
  ) as string[];

  return {
    kind: "session",
    title: "Minh chứng buổi học",
    detail: detailParts.length > 0 ? detailParts.join(" · ") : "Buổi học",
  };
}

export function mediaFileTypeLabel(fileType: string | null | undefined): string {
  const t = fileType?.toLowerCase() ?? "";
  if (t.includes("video")) return "Video";
  if (t.includes("image") || t.includes("photo")) return "Ảnh";
  return fileType?.trim() || "Media";
}

import { z } from "zod";

/** Shared paginated list shape used by notification (and similar) list endpoints. */
export function createPaginationSchema<T extends z.ZodType>(itemSchema: T) {
  return z
    .object({
      items: z.array(itemSchema).nullish(),
      currentPage: z.number().int().nullish(),
      totalPages: z.number().int().nullish(),
      pageSize: z.number().int().nullish(),
      totalCount: z.number().int().nullish(),
      hasPrevious: z.boolean().nullish(),
      hasNext: z.boolean().nullish(),
    })
    .passthrough();
}

export type Pagination<T> = {
  items?: T[] | null;
  currentPage?: number | null;
  totalPages?: number | null;
  pageSize?: number | null;
  totalCount?: number | null;
  hasPrevious?: boolean | null;
  hasNext?: boolean | null;
};

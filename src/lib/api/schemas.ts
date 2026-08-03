import { z } from "zod";

export const apiErrorContentSchema = z.object({
  code: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
});

export type ApiErrorContent = z.infer<typeof apiErrorContentSchema>;

export function createApiValueSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    code: z.string().nullable().optional(),
    message: z.string().nullable().optional(),
    data: dataSchema.optional(),
  });
}

export const apiValueMessageOnlySchema = z.object({
  code: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  data: z.unknown().nullable().optional(),
});

export function createApiResponseSchema<T extends z.ZodType>(valueSchema: T) {
  return z.object({
    isSuccess: z.boolean(),
    value: valueSchema.nullable().optional(),
    error: apiErrorContentSchema.nullable().optional(),
  });
}

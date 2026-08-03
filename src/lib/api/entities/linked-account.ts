import { z } from "zod";

/** Parent–student link row. Swagger leaves `/api/parent/links` untyped — keep loose. */
export const parentLinkSchema = z
  .object({
    id: z.string().optional(),
    studentId: z.string().optional(),
    studentCode: z.string().nullable().optional(),
    studentName: z.string().nullable().optional(),
    fullName: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    studentEmail: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    avatarUrl: z.string().nullable().optional(),
  })
  .passthrough();

export type ParentLink = z.infer<typeof parentLinkSchema>;

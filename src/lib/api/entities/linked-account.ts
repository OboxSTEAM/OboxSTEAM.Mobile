import { z } from "zod";

/**
 * Linked child row. Same shape from `GET /api/parent/links` (untyped in Swagger,
 * confirmed against the live response) and `student` in the progression brief.
 */
export const parentLinkedStudentSchema = z
  .object({
    linkedUserId: z.string(),
    code: z.string().nullish(),
    fullName: z.string().nullish(),
    email: z.string().nullish(),
    phone: z.string().nullish(),
    avatarUrl: z.string().nullish(),
    isVerified: z.boolean().nullish(),
    /** Swagger documents `linkedAt`; the links endpoint returns `createdAt`. */
    linkedAt: z.string().nullish(),
    createdAt: z.string().nullish(),
  })
  .passthrough();

export type ParentLinkedStudent = z.infer<typeof parentLinkedStudentSchema>;

export const parentLinkSchema = parentLinkedStudentSchema;
export type ParentLink = ParentLinkedStudent;

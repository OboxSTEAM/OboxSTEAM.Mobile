import { z } from "zod";

export const userRoleSchema = z.enum([
  "SuperAdmin",
  "Manager",
  "Mentor",
  "Parent",
  "Student",
]);

export const userStatusSchema = z.enum(["Active", "Locked"]);

export const registerRoleSchema = z.enum(["Student", "Parent", "Mentor"]);

export const userProfileSchema = z.object({
  id: z.string(),
  code: z.string().nullable().optional(),
  fullName: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  role: userRoleSchema,
  status: userStatusSchema,
  isEmailVerified: z.boolean().optional(),
  createdAt: z.string().optional(),
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type RegisterRole = z.infer<typeof registerRoleSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;

import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, "Họ tên là bắt buộc."),
  phone: z.string().min(1, "Số điện thoại là bắt buộc."),
});

export const userIdParamSchema = z.object({
  userId: z.uuid("User id không hợp lệ."),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;

import { z } from "zod";

export const checkInCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Mã điểm danh gồm đúng 6 chữ số."),
});

export type CheckInCodeInput = z.infer<typeof checkInCodeSchema>;

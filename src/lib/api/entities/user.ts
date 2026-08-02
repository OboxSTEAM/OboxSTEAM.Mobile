import { z } from "zod";

export const registerRoleSchema = z.enum(["Student", "Parent", "Mentor"]);

export type RegisterRole = z.infer<typeof registerRoleSchema>;

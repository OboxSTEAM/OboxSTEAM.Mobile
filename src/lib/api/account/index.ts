import { createApiGet } from "@/lib/api/create-endpoint";
import { userProfileSchema } from "@/lib/api/entities/user";
import { createApiValueSchema } from "@/lib/api/schemas";

const currentUserValueSchema = createApiValueSchema(userProfileSchema);

export const getCurrentUser = createApiGet({
  path: "/api/account/me",
  value: currentUserValueSchema,
});

export type { UserProfile } from "@/lib/api/entities/user";

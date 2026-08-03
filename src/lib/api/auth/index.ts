import { z } from "zod";

import { createApiPost } from "@/lib/api/create-endpoint";
import { createApiValueSchema } from "@/lib/api/schemas";
import {
  loginSchema,
  refreshTokenSchema,
} from "@/lib/validations/auth";

export const authTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export type AuthTokens = z.infer<typeof authTokensSchema>;

const authTokensValueSchema = createApiValueSchema(authTokensSchema);

export const login = createApiPost({
  path: "/api/auth/login",
  input: loginSchema,
  value: authTokensValueSchema,
  skipAuth: true,
});

export const refreshToken = createApiPost({
  path: "/api/auth/refresh-token",
  input: refreshTokenSchema,
  value: authTokensValueSchema,
  skipAuth: true,
});

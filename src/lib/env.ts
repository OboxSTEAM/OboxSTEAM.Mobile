import { z } from "zod";

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.url(
    "EXPO_PUBLIC_API_URL must be a valid URL (see .env.example).",
  ),
});

export type AppEnv = z.infer<typeof envSchema>;

/** Lazy parse — never throw at module import (avoids splash→crash on device). */
export function getEnv(): AppEnv {
  return envSchema.parse({
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  });
}

/** @deprecated Prefer getEnv() so import-time parse cannot crash the app. */
export const env = {
  get EXPO_PUBLIC_API_URL() {
    return getEnv().EXPO_PUBLIC_API_URL;
  },
};

import { z } from "zod";

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z
    .string()
    .url({ message: "EXPO_PUBLIC_API_URL must be a valid URL (see .env.example)." }),
});

export const env = envSchema.parse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
});

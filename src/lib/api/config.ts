import { env } from "@/lib/env";

export function getApiBaseUrl(): string {
  return env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
}

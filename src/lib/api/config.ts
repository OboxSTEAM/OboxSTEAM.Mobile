import { getEnv } from "@/lib/env";

export function getApiBaseUrl(): string {
  return getEnv().EXPO_PUBLIC_API_URL.replace(/\/$/, "");
}

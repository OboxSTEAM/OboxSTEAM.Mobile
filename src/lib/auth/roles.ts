import type { Href } from "expo-router";

function normalizeRole(role: string | undefined | null): string {
  return (role ?? "").trim().toLowerCase();
}

export function isParentRole(role: string | undefined | null): boolean {
  return normalizeRole(role) === "parent";
}

export function isStudentRole(role: string | undefined | null): boolean {
  return normalizeRole(role) === "student";
}

export function isMentorRole(role: string | undefined | null): boolean {
  return normalizeRole(role) === "mentor";
}

/** Roles allowed to use the mobile app (v2). */
export function isMobileSupportedRole(
  role: string | undefined | null,
): boolean {
  return isParentRole(role) || isStudentRole(role) || isMentorRole(role);
}

/**
 * Post-login / bootstrap home for a supported role.
 * Group-qualified paths are required: `(parent)/schedule` and
 * `(student)/schedule` both map to `/schedule` and ambiguous
 * `router.replace("/schedule")` can Redirect-loop across layouts.
 */
export function getHomeHrefForRole(
  role: string | undefined | null,
): Href {
  if (isParentRole(role)) return "/(parent)/children";
  if (isStudentRole(role)) return "/(student)/schedule";
  if (isMentorRole(role)) return "/(mentor)/today";
  return "/blocked";
}

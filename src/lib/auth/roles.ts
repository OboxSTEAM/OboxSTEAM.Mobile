/**
 * Parent-role helpers — full roles module will be copied from FE in the API slice step.
 */
export function isParentRole(role: string | undefined | null): boolean {
  if (!role) return false;
  return role.trim().toLowerCase() === "parent";
}

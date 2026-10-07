export type Role = "viewer" | "editor" | "reviewer" | "administrator";

const ROLE_HIERARCHY: Record<Role, number> = {
  viewer: 1,
  editor: 2,
  reviewer: 3,
  administrator: 4,
};

/**
 * Checks if a user's role meets or exceeds a required minimum role.
 */
export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Role capability checks
 */
export const permissions = {
  canView: (role: Role) => hasMinimumRole(role, "viewer"),
  canEdit: (role: Role) => hasMinimumRole(role, "editor"),
  canReviewTranslations: (role: Role) => hasMinimumRole(role, "reviewer"),
  canAdminister: (role: Role) => hasMinimumRole(role, "administrator"),
};

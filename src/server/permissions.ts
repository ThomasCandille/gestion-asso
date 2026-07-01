import {
  hasPoleIntersection,
  isOfficeRole,
  type MemberRole as Role,
  type Pole,
} from "../features/members/member-rules";

export type { Pole, Role };
export { isOfficeRole };

export type Permission =
  | "members:manage"
  | "events:manage"
  | "budget:manage"
  | "communication:manage"
  | "inventory:manage"
  | "documents:manage";

const permissionByRole: Record<Role, Permission[]> = {
  PRESIDENT: [
    "members:manage",
    "events:manage",
    "budget:manage",
    "communication:manage",
    "inventory:manage",
    "documents:manage",
  ],
  TREASURER: ["members:manage", "budget:manage", "documents:manage"],
  VICE_TREASURER: ["members:manage", "budget:manage", "documents:manage"],
  SECRETARY: ["members:manage", "events:manage", "documents:manage"],
  POLE_LEAD: ["members:manage", "events:manage", "documents:manage"],
  MEMBER: [],
};

export function hasPermission(role: Role, permission: Permission) {
  return permissionByRole[role].includes(permission);
}

export function canManagePole(
  role: Role,
  memberPoles: readonly Pole[],
  targetPole: Pole,
) {
  return (
    isOfficeRole(role) ||
    (role === "POLE_LEAD" && memberPoles.includes(targetPole))
  );
}

export function canManageMemberWithPoles(
  role: Role,
  memberPoles: readonly Pole[],
  targetPoles: readonly Pole[],
) {
  return (
    isOfficeRole(role) ||
    (role === "POLE_LEAD" && hasPoleIntersection(memberPoles, targetPoles))
  );
}

export const poleValues = ["INTERNE", "EXTERNE", "COMMUNICATION"] as const;
export const memberRoleValues = [
  "MEMBER",
  "POLE_LEAD",
  "PRESIDENT",
  "TREASURER",
  "VICE_TREASURER",
  "SECRETARY",
] as const;
export const memberStatusValues = ["ACTIVE", "INACTIVE", "ALUMNI"] as const;

export type Pole = (typeof poleValues)[number];
export type MemberRole = (typeof memberRoleValues)[number];
export type MemberStatus = (typeof memberStatusValues)[number];

export const poleLabels: Record<Pole, string> = {
  INTERNE: "Interne",
  EXTERNE: "Externe",
  COMMUNICATION: "Communication",
};

export const roleLabels: Record<MemberRole, string> = {
  MEMBER: "Membre",
  POLE_LEAD: "Responsable pole",
  PRESIDENT: "President",
  TREASURER: "Tresorier",
  VICE_TREASURER: "Vice-tresorier",
  SECRETARY: "Secretaire",
};

export const statusLabels: Record<MemberStatus, string> = {
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  ALUMNI: "Ancien",
};

export const officeRoles = [
  "PRESIDENT",
  "TREASURER",
  "VICE_TREASURER",
  "SECRETARY",
] as const satisfies readonly MemberRole[];

export function isOfficeRole(role: MemberRole) {
  return officeRoles.includes(role as (typeof officeRoles)[number]);
}

export function requiresAtLeastOnePole(role: MemberRole) {
  return !isOfficeRole(role);
}

export function canMemberRegisterForEvent(status: MemberStatus) {
  return status === "ACTIVE";
}

export function hasPoleIntersection(
  left: readonly Pole[],
  right: readonly Pole[],
) {
  return left.some((pole) => right.includes(pole));
}

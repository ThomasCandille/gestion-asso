export const poleValues = ["INTERNE", "EXTERNE", "COMMUNICATION"] as const;
export const yearValues = ["A1", "A2", "A3", "A4", "A5"] as const;
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
export type MemberYear = (typeof yearValues)[number];
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

export const roleStyles: Record<MemberRole, string> = {
  MEMBER: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  POLE_LEAD: "bg-amber-50 text-amber-700 ring-amber-200",
  PRESIDENT: "bg-purple-50 text-purple-700 ring-purple-200",
  TREASURER: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  VICE_TREASURER: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  SECRETARY: "bg-sky-50 text-sky-700 ring-sky-200",
};

export const statusStyles: Record<MemberStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  INACTIVE: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  ALUMNI: "bg-blue-50 text-blue-700 ring-blue-200",
};

export function memberFullName(member: { firstName: string; lastName: string }) {
  return `${member.firstName} ${member.lastName}`;
}

export function memberPoleText(member: { poles: Pole[] }) {
  return member.poles.length > 0
    ? member.poles.map((pole) => poleLabels[pole]).join(", ")
    : "Bureau";
}

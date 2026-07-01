import type { MemberRole, MemberStatus, MemberYear, Pole } from "./member-rules";

export type MemberView = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  year: MemberYear;
  status: MemberStatus;
  role: MemberRole;
  poles: Pole[];
  photoUrl?: string;
  joinedAt?: string;
  internalNotes?: string;
  discordUsername?: string;
};

export type MemberViewPayload = Omit<
  MemberView,
  "year" | "photoUrl" | "joinedAt" | "internalNotes" | "discordUsername"
> & {
  year: string;
  photoUrl?: string | null;
  joinedAt?: string | null;
  internalNotes?: string | null;
  discordUsername?: string | null;
};

export function normalizeMemberView(member: MemberViewPayload): MemberView {
  return {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone,
    year: member.year as MemberYear,
    status: member.status,
    role: member.role,
    poles: member.poles,
    photoUrl: member.photoUrl ?? undefined,
    joinedAt: member.joinedAt ? member.joinedAt.slice(0, 10) : undefined,
    internalNotes: member.internalNotes ?? undefined,
    discordUsername: member.discordUsername ?? undefined,
  };
}

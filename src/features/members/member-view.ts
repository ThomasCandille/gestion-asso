import type { MemberRole, MemberStatus, Pole } from "./member-rules";

export type MemberView = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  year: string;
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
  "photoUrl" | "joinedAt" | "internalNotes" | "discordUsername"
> & {
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
    year: member.year,
    status: member.status,
    role: member.role,
    poles: member.poles,
    photoUrl: member.photoUrl ?? undefined,
    joinedAt: member.joinedAt ? member.joinedAt.slice(0, 10) : undefined,
    internalNotes: member.internalNotes ?? undefined,
    discordUsername: member.discordUsername ?? undefined,
  };
}

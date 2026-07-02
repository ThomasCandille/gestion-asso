import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/client";
import {
  memberFiltersSchema,
  type MemberFilters,
} from "./member-schemas";
import type { MemberRole, MemberStatus, Pole } from "./member-rules";

export const memberInclude = {
  memberPoles: {
    select: {
      pole: true,
    },
  },
} satisfies Prisma.MemberInclude;

export type MemberWithPoles = Prisma.MemberGetPayload<{
  include: typeof memberInclude;
}>;

export type MemberDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  year: string;
  status: MemberStatus;
  role: MemberRole;
  poles: Pole[];
  photoUrl: string | null;
  joinedAt: string | null;
  internalNotes: string | null;
  discordUsername: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toMemberDto(member: MemberWithPoles): MemberDto {
  return {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone,
    year: member.year,
    status: member.status as MemberStatus,
    role: member.role as MemberRole,
    poles: member.memberPoles.map((memberPole) => memberPole.pole as Pole),
    photoUrl: member.photoUrl,
    joinedAt: member.joinedAt?.toISOString() ?? null,
    internalNotes: member.internalNotes,
    discordUsername: member.discordUsername,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  };
}

export function buildMemberWhere(filters: MemberFilters): Prisma.MemberWhereInput {
  const f = memberFiltersSchema.parse(filters);

  return {
    status: f.status,
    role: f.role,
    year: f.year,
    memberPoles: f.pole
      ? { some: { pole: f.pole } }
      : undefined,
    OR: f.search
      ? [
          { firstName: { contains: f.search, mode: "insensitive" } },
          { lastName: { contains: f.search, mode: "insensitive" } },
          { email: { contains: f.search, mode: "insensitive" } },
          { phone: { contains: f.search, mode: "insensitive" } },
        ]
      : undefined,
  };
}

export async function listMembers(filters: MemberFilters = {}) {
  const members = await prisma.member.findMany({
    where: buildMemberWhere(filters),
    include: memberInclude,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return members.map(toMemberDto);
}

export async function getMemberById(memberId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: memberInclude,
  });

  return member ? toMemberDto(member) : null;
}

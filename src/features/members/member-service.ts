import { createHash, randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/client";
import type { AppSession } from "@/server/auth/session";
import { hashPassword } from "@/server/auth/password";
import {
  appendMemberRow,
  removeMemberRow,
} from "@/server/integrations/members-sheet";
import {
  hasPoleIntersection,
  isOfficeRole,
  type MemberRole,
  type MemberStatus,
  type Pole,
} from "./member-rules";
import {
  memberFiltersSchema,
  memberFormSchema,
  memberSelfProfileSchema,
  type MemberFilters,
  type MemberFormInput,
} from "./member-schemas";
import { toOptionalDate } from "@/lib/formats";

const memberInclude = {
  memberPoles: {
    select: {
      pole: true,
    },
  },
} satisfies Prisma.MemberInclude;

type MemberWithPoles = Prisma.MemberGetPayload<{
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

export class MemberPermissionError extends Error {
  constructor(message = "Action membre non autorisee.") {
    super(message);
    this.name = "MemberPermissionError";
  }
}

export class MemberRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MemberRuleError";
  }
}

function toMemberDto(member: MemberWithPoles): MemberDto {
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

function assertCanCreateMember(actor: AppSession) {
  if (!isOfficeRole(actor.role)) {
    throw new MemberPermissionError(
      "Seuls les membres du bureau peuvent creer un membre.",
    );
  }
}

function assertCanManageMember(
  actor: AppSession,
  targetPoles: readonly Pole[],
) {
  if (isOfficeRole(actor.role)) {
    return;
  }

  if (
    actor.role === "POLE_LEAD" &&
    hasPoleIntersection(actor.poles, targetPoles)
  ) {
    return;
  }

  throw new MemberPermissionError();
}

function canManageMember(actor: AppSession, targetPoles: readonly Pole[]) {
  return (
    isOfficeRole(actor.role) ||
    (actor.role === "POLE_LEAD" &&
      hasPoleIntersection(actor.poles, targetPoles))
  );
}

async function assertPoleLeadLimit(
  input: MemberFormInput,
  memberIdToIgnore?: string,
) {
  if (input.role !== "POLE_LEAD") {
    return;
  }

  for (const pole of input.poles) {
    const count = await prisma.member.count({
      where: {
        role: "POLE_LEAD",
        id: memberIdToIgnore ? { not: memberIdToIgnore } : undefined,
        memberPoles: {
          some: {
            pole,
          },
        },
      },
    });

    if (count >= 2) {
      throw new MemberRuleError(`Le pole ${pole} a deja deux responsables.`);
    }
  }
}

function buildMemberWhere(filters: MemberFilters): Prisma.MemberWhereInput {
  const parsedFilters = memberFiltersSchema.parse(filters);

  return {
    status: parsedFilters.status,
    role: parsedFilters.role,
    year: parsedFilters.year,
    memberPoles: parsedFilters.pole
      ? {
          some: {
            pole: parsedFilters.pole,
          },
        }
      : undefined,
    OR: parsedFilters.search
      ? [
          {
            firstName: { contains: parsedFilters.search, mode: "insensitive" },
          },
          { lastName: { contains: parsedFilters.search, mode: "insensitive" } },
          { email: { contains: parsedFilters.search, mode: "insensitive" } },
          { phone: { contains: parsedFilters.search, mode: "insensitive" } },
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


export async function createMember(actor: AppSession, input: unknown) {
  assertCanCreateMember(actor);

  const parsedInput = memberFormSchema.parse(input);
  await assertPoleLeadLimit(parsedInput);

  const passwordHash = parsedInput.password
    ? await hashPassword(parsedInput.password)
    : undefined;

  const member = await prisma.member.create({
    data: {
      firstName: parsedInput.firstName,
      lastName: parsedInput.lastName,
      email: parsedInput.email,
      phone: parsedInput.phone,
      year: parsedInput.year,
      status: parsedInput.status,
      role: parsedInput.role,
      photoUrl: parsedInput.photoUrl || null,
      joinedAt: toOptionalDate(parsedInput.joinedAt),
      internalNotes: parsedInput.internalNotes || null,
      discordUsername: parsedInput.discordUsername || null,
      passwordHash,
      memberPoles: {
        create: parsedInput.poles.map((pole) => ({ pole })),
      },
    },
    include: memberInclude,
  });

  const dto = toMemberDto(member);
  await appendMemberRow(dto).catch((e) =>
    console.error("[sheet] appendMemberRow failed:", e),
  );
  return dto;
}

export async function updateMember(
  actor: AppSession,
  memberId: string,
  input: unknown,
) {
  const existingMember = await prisma.member.findUniqueOrThrow({
    where: { id: memberId },
    include: memberInclude,
  });

  const existingPoles = existingMember.memberPoles.map(
    (memberPole) => memberPole.pole as Pole,
  );

  if (!canManageMember(actor, existingPoles) && actor.memberId === memberId) {
    const parsedInput = memberSelfProfileSchema.parse(input);

    const member = await prisma.member.update({
      where: { id: memberId },
      data: {
        firstName: parsedInput.firstName,
        lastName: parsedInput.lastName,
        email: parsedInput.email,
        phone: parsedInput.phone,
        photoUrl: parsedInput.photoUrl || null,
        discordUsername: parsedInput.discordUsername || null,
      },
      include: memberInclude,
    });

    return toMemberDto(member);
  }

  assertCanManageMember(actor, existingPoles);

  const parsedInput = memberFormSchema.parse(input);
  assertCanManageMember(actor, parsedInput.poles);
  await assertPoleLeadLimit(parsedInput, memberId);

  const member = await prisma.member.update({
    where: { id: memberId },
    data: {
      firstName: parsedInput.firstName,
      lastName: parsedInput.lastName,
      email: parsedInput.email,
      phone: parsedInput.phone,
      year: parsedInput.year,
      status: parsedInput.status,
      role: parsedInput.role,
      photoUrl: parsedInput.photoUrl || null,
      joinedAt: toOptionalDate(parsedInput.joinedAt),
      internalNotes: parsedInput.internalNotes || null,
      discordUsername: parsedInput.discordUsername || null,
      memberPoles: {
        deleteMany: {},
        create: parsedInput.poles.map((pole) => ({ pole })),
      },
    },
    include: memberInclude,
  });

  return toMemberDto(member);
}

export async function deactivateMember(actor: AppSession, memberId: string) {
  const existingMember = await prisma.member.findUniqueOrThrow({
    where: { id: memberId },
    include: memberInclude,
  });

  assertCanManageMember(
    actor,
    existingMember.memberPoles.map((memberPole) => memberPole.pole as Pole),
  );

  const member = await prisma.member.update({
    where: { id: memberId },
    data: {
      status: "INACTIVE",
      deactivatedAt: new Date(),
    },
    include: memberInclude,
  });

  const dto = toMemberDto(member);
  await removeMemberRow(dto.id).catch((e) =>
    console.error("[sheet] removeMemberRow failed:", e),
  );
  return dto;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(email: string) {
  const member = await prisma.member.findUnique({
    where: { email },
  });

  if (!member) {
    return null;
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  await prisma.passwordResetToken.create({
    data: {
      memberId: member.id,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function confirmPasswordReset(token: string, password: string) {
  const tokenHash = hashToken(token);
  const passwordResetToken = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!passwordResetToken) {
    throw new MemberRuleError(
      "Le lien de reinitialisation est invalide ou expire.",
    );
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.member.update({
      where: { id: passwordResetToken.memberId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: passwordResetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);
}

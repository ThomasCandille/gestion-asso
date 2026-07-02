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
  type Pole,
} from "./member-rules";
import {
  memberFormSchema,
  memberSelfProfileSchema,
  type MemberFormInput,
} from "./member-schemas";
import { toOptionalDate } from "@/lib/formats";
import {
  memberInclude,
  toMemberDto,
  type MemberDto,
} from "./member-query";
import {
  MemberPermissionError,
  MemberRuleError,
} from "./member-errors";

export type { MemberDto } from "./member-query";
export { listMembers, getMemberById } from "./member-query";
export { requestPasswordReset, confirmPasswordReset } from "./member-password-service";
export { MemberPermissionError, MemberRuleError } from "./member-errors";

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
  if (isOfficeRole(actor.role)) return;
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
  if (input.role !== "POLE_LEAD") return;

  for (const pole of input.poles) {
    const count = await prisma.member.count({
      where: {
        role: "POLE_LEAD",
        id: memberIdToIgnore ? { not: memberIdToIgnore } : undefined,
        memberPoles: { some: { pole } },
      },
    });
    if (count >= 2) {
      throw new MemberRuleError(`Le pole ${pole} a deja deux responsables.`);
    }
  }
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

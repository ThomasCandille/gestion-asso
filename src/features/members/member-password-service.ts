import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/server/db/client";
import { hashPassword } from "@/server/auth/password";
import { MemberRuleError } from "./member-errors";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(email: string) {
  const member = await prisma.member.findUnique({ where: { email } });

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
      expiresAt: { gt: new Date() },
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

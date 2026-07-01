import { prisma } from "@/server/db/client";
import { env } from "@/server/env";
import type { Pole, Role } from "@/server/permissions";

export type AppSession = {
  memberId: string;
  email: string;
  role: Role;
  poles: Pole[];
};

export async function getCurrentSession(): Promise<AppSession | null> {
  if (
    process.env.NODE_ENV !== "production" &&
    env.ENABLE_DEV_SESSION === "true"
  ) {
    const member = await prisma.member.findUnique({
      where: { email: env.DEV_SESSION_EMAIL },
      include: {
        memberPoles: {
          select: {
            pole: true,
          },
        },
      },
    });

    if (!member) {
      return null;
    }

    return {
      memberId: member.id,
      email: member.email,
      role: member.role as Role,
      poles: member.memberPoles.map((memberPole) => memberPole.pole as Pole),
    };
  }

  return null;
}

import type { Pole, Role } from "@/server/permissions";

export type AppSession = {
  memberId: string;
  email: string;
  role: Role;
  poles: Pole[];
};

const OPEN_SESSION: AppSession = {
  memberId: "00000000-0000-0000-0000-000000000000",
  email: "system@iimpact.fr",
  role: "PRESIDENT",
  poles: ["INTERNE", "EXTERNE", "COMMUNICATION"],
};

export async function getCurrentSession(): Promise<AppSession | null> {
  return OPEN_SESSION;
}

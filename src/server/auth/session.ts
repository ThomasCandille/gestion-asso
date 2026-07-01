import { cookies } from "next/headers";
import type { Pole, Role } from "@/server/permissions";

export type AppSession = {
  memberId: string;
  email: string;
  role: Role;
  poles: Pole[];
};

const ALL_POLES: Pole[] = ["INTERNE", "EXTERNE", "COMMUNICATION"];

const DEMO_SESSIONS: Record<string, AppSession> = {
  bureau: {
    memberId: "00000000-0000-0000-0000-000000000001",
    email: "bureau@iimpact.fr",
    role: "PRESIDENT",
    poles: ALL_POLES,
  },
  responsable: {
    memberId: "00000000-0000-0000-0000-000000000002",
    email: "responsable@iimpact.fr",
    role: "POLE_LEAD",
    poles: ALL_POLES,
  },
  membre: {
    memberId: "00000000-0000-0000-0000-000000000003",
    email: "membre@iimpact.fr",
    role: "MEMBER",
    poles: ALL_POLES,
  },
};

export async function getCurrentSession(): Promise<AppSession | null> {
  const cookieStore = await cookies();
  const profile = cookieStore.get("demo-profile")?.value;
  return profile ? (DEMO_SESSIONS[profile] ?? null) : null;
}

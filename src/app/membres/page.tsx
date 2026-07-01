import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentSession } from "@/server/auth/session";
import { hasPermission } from "@/server/permissions";
import { MembersClient } from "@/features/members/members-client";
import { listMembers } from "@/features/members/member-service";
import { normalizeMemberView } from "@/features/members/member-dto";

export const metadata: Metadata = {
  title: "Membres - IIMPACT",
  description: "Gestion des membres de l'association IIMPACT",
};

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/auth/login");

  const canManage = hasPermission(session.role, "members:manage");
  const members = await listMembers();

  return (
    <MembersClient
      initialMembers={members.map(normalizeMemberView)}
      canManage={canManage}
    />
  );
}

import type { Metadata } from "next";
import { MembersClient } from "@/features/members/members-client";
import { listMembers } from "@/features/members/member-service";
import { normalizeMemberView } from "@/features/members/member-view";

export const metadata: Metadata = {
  title: "Membres - IIMPACT",
  description: "Gestion des membres de l'association IIMPACT",
};

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await listMembers();

  return <MembersClient initialMembers={members.map(normalizeMemberView)} />;
}

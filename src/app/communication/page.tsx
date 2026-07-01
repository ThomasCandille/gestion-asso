import { redirect } from "next/navigation";
import { getCurrentSession } from "@/server/auth/session";
import { hasPermission } from "@/server/permissions";
import { listCampaigns } from "@/features/communication/comm-service";
import { listEvents } from "@/features/events/event-service";
import { listMembers } from "@/features/members/member-service";
import { CommClient } from "@/features/communication/comm-client";

export const metadata = { title: "Communication — IIMPACT" };

export default async function CommunicationPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/auth/login");

  const canManage = hasPermission(session.role, "communication:manage");

  const [campaigns, events, members] = await Promise.all([
    listCampaigns(),
    listEvents(),
    listMembers({ status: "ACTIVE" }),
  ]);

  const eventOptions = events.map((e) => ({ id: e.id, title: e.title }));
  const memberOptions = members.map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
  }));

  return (
    <CommClient
      initialCampaigns={campaigns}
      eventOptions={eventOptions}
      memberOptions={memberOptions}
      canManage={canManage}
    />
  );
}

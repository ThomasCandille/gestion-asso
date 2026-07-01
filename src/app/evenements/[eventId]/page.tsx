import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { EventDashboardClient } from "@/features/events/event-dashboard-client";
import { getEventById } from "@/features/events/event-service";
import { normalizeEventView } from "@/features/events/event-dto";
import { listActivities } from "@/features/events/activity-service";
import { listMembers } from "@/features/members/member-service";
import { getCurrentSession } from "@/server/auth/session";
import { hasPermission } from "@/server/permissions";
import type { EventType } from "@/features/events/event-rules";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ eventId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params;
  const event = await getEventById(eventId);
  return {
    title: event ? `${event.title} - IIMPACT` : "Evenement - IIMPACT",
  };
}

export default async function EventDashboardPage({ params }: Props) {
  const { eventId } = await params;

  const [event, session] = await Promise.all([
    getEventById(eventId),
    getCurrentSession(),
  ]);

  if (!event) notFound();
  if (!session) redirect("/auth/login");

  const [activities, allMembers] = await Promise.all([
    listActivities(eventId),
    listMembers({ status: "ACTIVE" }),
  ]);
  const eventView = normalizeEventView(event);
  const members = allMembers.map((m) => ({
    id: m.id,
    firstName: m.firstName,
    lastName: m.lastName,
  }));

  const canManage =
    hasPermission(session.role, "events:manage") &&
    (session.role !== "POLE_LEAD" ||
      (event.type === "INTERNAL" && session.poles.includes("INTERNE")) ||
      (event.type === "EXTERNAL" && session.poles.includes("EXTERNE")));

  const canRegister =
    event.type === ("EXTERNAL" as EventType) ||
    hasPermission(session.role, "events:manage") ||
    session.poles.includes("INTERNE");

  return (
    <EventDashboardClient
      event={eventView}
      initialActivities={activities}
      members={members}
      currentMemberId={session.memberId}
      canManage={canManage}
      canRegister={canRegister}
    />
  );
}

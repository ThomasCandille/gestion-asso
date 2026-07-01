import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentSession } from "@/server/auth/session";
import { hasPermission } from "@/server/permissions";
import { EventsClient } from "@/features/events/events-client";
import { listEvents } from "@/features/events/event-service";
import { normalizeEventView } from "@/features/events/event-dto";

export const metadata: Metadata = {
  title: "Evenements - IIMPACT",
  description: "Gestion des evenements de l'association IIMPACT",
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/auth/login");

  const canManage = hasPermission(session.role, "events:manage");
  const events = await listEvents();

  return (
    <EventsClient
      initialEvents={events.map(normalizeEventView)}
      canManage={canManage}
    />
  );
}

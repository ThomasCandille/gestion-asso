import type { Metadata } from "next";
import { EventsClient } from "@/features/events/events-client";
import { listEvents } from "@/features/events/event-service";
import { normalizeEventView } from "@/features/events/event-view";

export const metadata: Metadata = {
  title: "Evenements - IIMPACT",
  description: "Gestion des evenements de l'association IIMPACT",
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await listEvents();
  return <EventsClient initialEvents={events.map(normalizeEventView)} />;
}

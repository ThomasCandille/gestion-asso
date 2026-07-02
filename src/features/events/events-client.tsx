"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { Modal } from "@/lib/modal";
import { readApiError } from "@/lib/api";
import {
  isTerminalStatus,
  type EventStatus,
  type EventType,
} from "./event-rules";
import { eventFormSchema } from "./event-schemas";
import {
  normalizeEventView,
  type EventView,
  type EventViewPayload,
} from "./event-dto";
import { EventFormSection, type EventFormState } from "./event-form";
import { EventListSection } from "./event-list-section";
import { EventSidePanel } from "./event-side-panel";

type EventsClientProps = {
  initialEvents: EventView[];
  canManage: boolean;
};

const emptyForm: EventFormState = {
  title: "",
  description: "",
  type: "EXTERNAL",
  status: "DRAFT",
  location: "",
  startsAt: "",
  endsAt: "",
};

function toFormState(event: EventView): EventFormState {
  return {
    title: event.title,
    description: event.description ?? "",
    type: event.type,
    status: event.status,
    location: event.location ?? "",
    startsAt: event.startsAt ?? "",
    endsAt: event.endsAt ?? "",
  };
}

export function EventsClient({ initialEvents, canManage }: EventsClientProps) {
  const [events, setEvents] = useState(initialEvents);
  const [selectedEventId, setSelectedEventId] = useState(
    initialEvents[0]?.id ?? null,
  );
  const [showForm, setShowForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormState>(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    type: "ALL" as EventType | "ALL",
    status: "ALL" as EventStatus | "ALL",
  });

  const stats = useMemo(
    () => ({
      total: events.length,
      inProgress: events.filter((e) => e.status === "IN_PROGRESS").length,
      planned: events.filter((e) => e.status === "PLANNED").length,
      done: events.filter((e) => e.status === "DONE").length,
    }),
    [events],
  );

  const filteredEvents = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return events.filter((event) => {
      const searchable = [event.title, event.location ?? ""].join(" ").toLowerCase();
      return (
        (!search || searchable.includes(search)) &&
        (filters.type === "ALL" || event.type === filters.type) &&
        (filters.status === "ALL" || event.status === filters.status)
      );
    });
  }, [filters, events]);

  const selectedEvent =
    events.find((e) => e.id === selectedEventId) ?? filteredEvents[0] ?? null;

  function startCreate() {
    setEditingEventId(null);
    setForm({ ...emptyForm });
    setErrors([]);
    setFeedback(null);
    setShowForm(true);
  }

  function startEdit(event: EventView) {
    setEditingEventId(event.id);
    setForm(toFormState(event));
    setSelectedEventId(event.id);
    setErrors([]);
    setFeedback(null);
    setShowForm(true);
  }

  function updateForm<K extends keyof EventFormState>(
    field: K,
    value: EventFormState[K],
  ) {
    setFeedback(null);
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submitEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = {
      ...form,
      description: form.description || undefined,
      location: form.location || undefined,
      startsAt: form.startsAt || undefined,
      endsAt: form.endsAt || undefined,
    };
    const parsed = eventFormSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((issue) => issue.message));
      setFeedback(null);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        editingEventId
          ? `/api/events/${encodeURIComponent(editingEventId)}`
          : "/api/events",
        {
          method: editingEventId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) throw new Error(await readApiError(response));

      const data = (await response.json()) as { event: EventViewPayload };
      const saved = normalizeEventView(data.event);

      setEvents((current) => {
        if (!editingEventId) return [...current, saved];
        return current.map((ev) => (ev.id === editingEventId ? saved : ev));
      });
      setSelectedEventId(saved.id);
      setErrors([]);
      setShowForm(false);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Enregistrement impossible."]);
      setFeedback(null);
    } finally {
      setIsSaving(false);
    }
  }

  async function cancelEventById(eventId: string) {
    const event = events.find((e) => e.id === eventId);
    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/events/${encodeURIComponent(eventId)}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error(await readApiError(response));

      const data = (await response.json()) as { event: EventViewPayload };
      const saved = normalizeEventView(data.event);

      setEvents((current) =>
        current.map((ev) => (ev.id === eventId ? saved : ev)),
      );
      if (event) setFeedback(`« ${event.title} » a ete annule.`);
      setErrors([]);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Annulation impossible."]);
      setFeedback(null);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
              IIMPACT
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-950">
              Gestion des evenements
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {canManage && (
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 active:translate-y-0"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Nouvel evenement
              </button>
            )}
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:translate-y-0"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.7fr)] lg:px-8">
        <EventListSection
          stats={stats}
          filters={filters}
          filteredEvents={filteredEvents}
          selectedEventId={selectedEventId}
          isSaving={isSaving}
          canManage={canManage}
          onSelectEvent={setSelectedEventId}
          onStartEdit={startEdit}
          onCancelEvent={cancelEventById}
          onFilterChange={(partial) =>
            setFilters((prev) => ({ ...prev, ...partial }))
          }
          onClearFilters={() =>
            setFilters({ search: "", type: "ALL", status: "ALL" })
          }
        />

        <aside>
          <EventSidePanel event={selectedEvent} />
        </aside>
      </div>

      {canManage && (
        <Modal
          open={showForm}
          title={editingEventId ? "Modifier l'evenement" : "Nouvel evenement"}
          onClose={() => setShowForm(false)}
        >
          <EventFormSection
            editingEventId={editingEventId}
            form={form}
            errors={errors}
            feedback={feedback}
            isSaving={isSaving}
            onClose={() => setShowForm(false)}
            onSubmit={submitEvent}
            onUpdateForm={updateForm}
          />
        </Modal>
      )}
    </main>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Ban,
  CalendarDays,
  Edit3,
  LayoutDashboard,
  MapPin,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";
import Link from "next/link";
import { Badge, controlClass, InfoItem, StatCard } from "@/lib/ui";
import { Modal } from "@/lib/modal";
import { readApiError } from "@/lib/api";
import {
  eventStatusLabels,
  eventStatusStyles,
  eventStatusValues,
  eventTypeLabels,
  eventTypeStyles,
  eventTypeValues,
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
import { formatBudget, formatDate } from "./event-formatters";
import { EventFormSection, type EventFormState } from "./event-form";

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
  budgetEuros: "0",
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
    budgetEuros: (event.budgetCents / 100).toFixed(2),
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

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.type !== "ALL" ||
    filters.status !== "ALL";

  const filteredEvents = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return events.filter((event) => {
      const searchable = [event.title, event.location ?? ""]
        .join(" ")
        .toLowerCase();
      return (
        (!search || searchable.includes(search)) &&
        (filters.type === "ALL" || event.type === filters.type) &&
        (filters.status === "ALL" || event.status === filters.status)
      );
    });
  }, [filters, events]);

  const selectedEvent =
    events.find((e) => e.id === selectedEventId) ??
    filteredEvents[0] ??
    null;

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

  function clearFilters() {
    setFilters({ search: "", type: "ALL", status: "ALL" });
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
      setErrors([
        err instanceof Error ? err.message : "Enregistrement impossible.",
      ]);
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
      setErrors([
        err instanceof Error ? err.message : "Annulation impossible.",
      ]);
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
        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="En cours" value={stats.inProgress} tone="amber" />
            <StatCard label="Planifies" value={stats.planned} tone="blue" />
            <StatCard label="Termines" value={stats.done} tone="emerald" />
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-zinc-950">Filtres</h2>
                <p className="text-sm text-zinc-500">Recherche par titre ou lieu.</p>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Reinitialiser
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
              <label className="relative">
                <span className="sr-only">Recherche</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  placeholder="Rechercher"
                  className={`${controlClass} pl-9`}
                />
              </label>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, type: e.target.value as EventType | "ALL" }))
                }
                className={controlClass}
              >
                <option value="ALL">Tous types</option>
                {eventTypeValues.map((type) => (
                  <option key={type} value={type}>
                    {eventTypeLabels[type]}
                  </option>
                ))}
              </select>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    status: e.target.value as EventStatus | "ALL",
                  }))
                }
                className={controlClass}
              >
                <option value="ALL">Tous statuts</option>
                {eventStatusValues.map((status) => (
                  <option key={status} value={status}>
                    {eventStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <div>
                <h2 className="font-semibold text-zinc-950">Liste</h2>
                <p className="text-xs text-zinc-500">
                  Cliquer sur une ligne affiche sa fiche detail.
                </p>
              </div>
              <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-sm font-medium text-zinc-600">
                {filteredEvents.length}{" "}
                {filteredEvents.length !== 1 ? "evenements" : "evenement"}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Evenement</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center">
                        <p className="font-medium text-zinc-800">
                          Aucun evenement ne correspond aux filtres.
                        </p>
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-3 text-sm font-medium text-blue-700 hover:text-blue-900"
                        >
                          Reinitialiser les filtres
                        </button>
                      </td>
                    </tr>
                  ) : null}
                  {filteredEvents.map((event) => {
                    const isSelected = selectedEvent?.id === event.id;
                    const isTerminal = isTerminalStatus(event.status);
                    return (
                      <tr
                        key={event.id}
                        onClick={() => setSelectedEventId(event.id)}
                        className={`group cursor-pointer transition ${
                          isSelected
                            ? "bg-blue-50/70 shadow-[inset_4px_0_0_#2563eb]"
                            : "bg-white hover:bg-zinc-50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEventId(event.id);
                            }}
                            className="rounded-md text-left outline-none transition focus-visible:ring-4 focus-visible:ring-blue-100"
                          >
                            <span className="block font-medium text-zinc-950 transition group-hover:text-blue-700">
                              {event.title}
                            </span>
                            {event.location ? (
                              <span className="flex items-center gap-1 text-xs text-zinc-500">
                                <MapPin className="h-3 w-3" aria-hidden />
                                {event.location}
                              </span>
                            ) : null}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={eventTypeStyles[event.type]}>
                            {eventTypeLabels[event.type]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={eventStatusStyles[event.status]}>
                            {eventStatusLabels[event.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-zinc-600">
                          {formatDate(event.startsAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Link
                              href={`/evenements/${encodeURIComponent(event.id)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 px-2 text-xs font-medium text-zinc-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
                            >
                              <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
                              Dashboard
                            </Link>
                            {canManage && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEdit(event);
                                  }}
                                  disabled={isTerminal}
                                  className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 px-2 text-xs font-medium text-zinc-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Edit3 className="h-3.5 w-3.5" aria-hidden />
                                  Modifier
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cancelEventById(event.id);
                                  }}
                                  disabled={isSaving || isTerminal}
                                  className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 px-2 text-xs font-medium text-zinc-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Ban className="h-3.5 w-3.5" aria-hidden />
                                  Annuler
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside>
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <CalendarDays className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-zinc-950">
                  {selectedEvent ? selectedEvent.title : "Aucun evenement"}
                </h2>
                <p className="text-sm text-zinc-500">
                  {selectedEvent
                    ? eventTypeLabels[selectedEvent.type]
                    : "Selectionner un evenement"}
                </p>
              </div>
            </div>

            {selectedEvent ? (
              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2 rounded-lg bg-zinc-50 px-3 py-2">
                  <dt className="text-zinc-500">Statut</dt>
                  <dd>
                    <Badge className={eventStatusStyles[selectedEvent.status]}>
                      {eventStatusLabels[selectedEvent.status]}
                    </Badge>
                  </dd>
                </div>
                <InfoItem label="Lieu" value={selectedEvent.location ?? "—"} />
                <InfoItem label="Debut" value={formatDate(selectedEvent.startsAt)} />
                <InfoItem label="Fin" value={formatDate(selectedEvent.endsAt)} />
                <InfoItem label="Budget" value={formatBudget(selectedEvent.budgetCents)} />
                {selectedEvent.description ? (
                  <div className="rounded-lg bg-zinc-50 p-3">
                    <dt className="text-zinc-500">Description</dt>
                    <dd className="mt-1 text-zinc-900">{selectedEvent.description}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </section>
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

"use client";

import { useState } from "react";
import { ArrowLeft, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { Badge, InfoItem } from "@/lib/ui";
import { Modal } from "@/lib/modal";
import { readApiError } from "@/lib/api";
import {
  eventStatusLabels,
  eventStatusStyles,
  eventTypeLabels,
  eventTypeStyles,
} from "./event-rules";
import { activityFormSchema } from "./activity-schemas";
import type { ActivityDto } from "./activity-service";
import type { EventView } from "./event-dto";
import { formatBudget, formatDate } from "./event-formatters";
import { ActivityCard, type MemberOption } from "./activity-card";
import { ActivityFormSection, type ActivityFormState } from "./activity-form";

type ActivityView = ActivityDto;

const emptyForm: ActivityFormState = {
  title: "",
  description: "",
  rules: "",
  prizes: "",
  budgetEuros: "0",
};

function toFormState(activity: ActivityView): ActivityFormState {
  return {
    title: activity.title,
    description: activity.description ?? "",
    rules: activity.rules ?? "",
    prizes: activity.prizes ?? "",
    budgetEuros: (activity.budgetCents / 100).toFixed(2),
  };
}

type Props = {
  event: EventView;
  initialActivities: ActivityView[];
  members: MemberOption[];
  currentMemberId: string;
  canManage: boolean;
  canRegister: boolean;
};

export function EventDashboardClient({
  event,
  initialActivities,
  members,
  currentMemberId,
  canManage,
  canRegister,
}: Props) {
  const [activities, setActivities] = useState(initialActivities);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ActivityFormState>(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMemberByActivity, setSelectedMemberByActivity] = useState<
    Record<string, string>
  >({});

  const baseUrl = `/api/events/${encodeURIComponent(event.id)}/activities`;

  function startCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setErrors([]);
    setFeedback(null);
    setShowForm(true);
  }

  function startEdit(activity: ActivityView) {
    setEditingId(activity.id);
    setForm(toFormState(activity));
    setErrors([]);
    setFeedback(null);
    setShowForm(true);
  }

  function updateForm<K extends keyof ActivityFormState>(
    field: K,
    value: ActivityFormState[K],
  ) {
    setFeedback(null);
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submitActivity(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = activityFormSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((i) => i.message));
      setFeedback(null);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        editingId
          ? `${baseUrl}/${encodeURIComponent(editingId)}`
          : baseUrl,
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      if (!response.ok) throw new Error(await readApiError(response));

      const data = (await response.json()) as { activity: ActivityView };
      setActivities((current) =>
        editingId
          ? current.map((a) => (a.id === editingId ? data.activity : a))
          : [...current, data.activity],
      );
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

  async function deleteActivityById(activityId: string) {
    const activity = activities.find((a) => a.id === activityId);
    setIsSaving(true);
    try {
      const response = await fetch(
        `${baseUrl}/${encodeURIComponent(activityId)}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error(await readApiError(response));

      setActivities((current) => current.filter((a) => a.id !== activityId));
      if (editingId === activityId) {
        setEditingId(null);
        setForm({ ...emptyForm });
      }
      if (activity) setFeedback(`« ${activity.title} » a ete supprimee.`);
      setErrors([]);
    } catch (err) {
      setErrors([
        err instanceof Error ? err.message : "Suppression impossible.",
      ]);
      setFeedback(null);
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleStaff(activity: ActivityView) {
    const isRegistered = activity.staff.some(
      (s) => s.memberId === currentMemberId,
    );
    const staffUrl = `${baseUrl}/${encodeURIComponent(activity.id)}/staff`;

    setIsSaving(true);
    try {
      const response = await fetch(staffUrl, {
        method: isRegistered ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: isRegistered
          ? JSON.stringify({ memberId: currentMemberId })
          : undefined,
      });
      if (!response.ok) throw new Error(await readApiError(response));

      const data = (await response.json()) as { activity: ActivityView };
      setActivities((current) =>
        current.map((a) => (a.id === activity.id ? data.activity : a)),
      );
      setFeedback(
        isRegistered
          ? `Desinscrit de « ${activity.title} ».`
          : `Inscrit comme staff sur « ${activity.title} ».`,
      );
      setErrors([]);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Operation impossible."]);
      setFeedback(null);
    } finally {
      setIsSaving(false);
    }
  }

  async function registerMember(activity: ActivityView, memberId: string) {
    const staffUrl = `${baseUrl}/${encodeURIComponent(activity.id)}/staff`;
    setIsSaving(true);
    try {
      const response = await fetch(staffUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      if (!response.ok) throw new Error(await readApiError(response));

      const data = (await response.json()) as { activity: ActivityView };
      setActivities((current) =>
        current.map((a) => (a.id === activity.id ? data.activity : a)),
      );
      setSelectedMemberByActivity((prev) => {
        const next = { ...prev };
        delete next[activity.id];
        return next;
      });
      const member = members.find((m) => m.id === memberId);
      const name = member
        ? `${member.firstName} ${member.lastName}`
        : "Le membre";
      setFeedback(`${name} inscrit comme staff sur « ${activity.title} ».`);
      setErrors([]);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Operation impossible."]);
      setFeedback(null);
    } finally {
      setIsSaving(false);
    }
  }

  async function unregisterMember(activity: ActivityView, memberId: string) {
    const staffUrl = `${baseUrl}/${encodeURIComponent(activity.id)}/staff`;
    setIsSaving(true);
    try {
      const response = await fetch(staffUrl, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      if (!response.ok) throw new Error(await readApiError(response));

      const data = (await response.json()) as { activity: ActivityView };
      setActivities((current) =>
        current.map((a) => (a.id === activity.id ? data.activity : a)),
      );
      const member = members.find((m) => m.id === memberId);
      const name = member
        ? `${member.firstName} ${member.lastName}`
        : "Le membre";
      setFeedback(`${name} retire du staff de « ${activity.title} ».`);
      setErrors([]);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Operation impossible."]);
      setFeedback(null);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                IIMPACT — Evenement
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-zinc-950">
                {event.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge className={eventTypeStyles[event.type]}>
                  {eventTypeLabels[event.type]}
                </Badge>
                <Badge className={eventStatusStyles[event.status]}>
                  {eventStatusLabels[event.status]}
                </Badge>
                {event.location ? (
                  <span className="flex items-center gap-1 text-sm text-zinc-500">
                    <MapPin className="h-3.5 w-3.5" aria-hidden />
                    {event.location}
                  </span>
                ) : null}
                {event.startsAt ? (
                  <span className="text-sm text-zinc-500">
                    {formatDate(event.startsAt)}
                    {event.endsAt ? ` → ${formatDate(event.endsAt)}` : ""}
                  </span>
                ) : null}
              </div>
            </div>
            <Link
              href="/evenements"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:translate-y-0"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Evenements
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">Activites</h2>
            <p className="text-sm text-zinc-500">
              {activities.length}{" "}
              {activities.length !== 1 ? "activites" : "activite"} planifiee
              {activities.length !== 1 ? "s" : ""}
            </p>
          </div>
          {canManage ? (
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 active:translate-y-0"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Nouvelle activite
            </button>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.8fr)]">
          <section className="space-y-3">
            {activities.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center">
                <p className="font-medium text-zinc-800">
                  Aucune activite pour cet evenement.
                </p>
                {canManage ? (
                  <button
                    type="button"
                    onClick={startCreate}
                    className="mt-3 text-sm font-medium text-blue-700 hover:text-blue-900"
                  >
                    Creer la premiere activite
                  </button>
                ) : null}
              </div>
            ) : null}

            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                currentMemberId={currentMemberId}
                isEditing={editingId === activity.id}
                canManage={canManage}
                canRegister={canRegister}
                isSaving={isSaving}
                members={members}
                selectedMemberId={selectedMemberByActivity[activity.id] ?? ""}
                onStartEdit={() => startEdit(activity)}
                onDelete={() => deleteActivityById(activity.id)}
                onToggleSelf={() => toggleStaff(activity)}
                onRegisterMember={(memberId) => registerMember(activity, memberId)}
                onUnregisterMember={(memberId) => unregisterMember(activity, memberId)}
                onSelectMember={(memberId) =>
                  setSelectedMemberByActivity((prev) => ({
                    ...prev,
                    [activity.id]: memberId,
                  }))
                }
              />
            ))}
          </section>

          <aside>
            <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-zinc-950">Infos evenement</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <InfoItem label="Lieu" value={event.location ?? "—"} />
                <InfoItem label="Debut" value={formatDate(event.startsAt)} />
                <InfoItem label="Fin" value={formatDate(event.endsAt)} />
                <InfoItem
                  label="Budget global"
                  value={formatBudget(event.budgetCents)}
                />
                {event.description ? (
                  <div className="rounded-lg bg-zinc-50 p-3">
                    <dt className="text-zinc-500">Description</dt>
                    <dd className="mt-1 text-zinc-900">{event.description}</dd>
                  </div>
                ) : null}
              </dl>
            </section>
          </aside>
        </div>
      </div>

      {canManage ? (
        <Modal
          open={showForm}
          title={editingId ? "Modifier l'activite" : "Nouvelle activite"}
          onClose={() => setShowForm(false)}
        >
          <ActivityFormSection
            editingId={editingId}
            form={form}
            errors={errors}
            feedback={feedback}
            isSaving={isSaving}
            onClose={() => setShowForm(false)}
            onSubmit={submitActivity}
            onUpdateForm={updateForm}
          />
        </Modal>
      ) : null}
    </main>
  );
}

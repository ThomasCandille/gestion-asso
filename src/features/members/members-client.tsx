"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Plus, UserRound } from "lucide-react";
import Link from "next/link";
import { Badge, InfoItem } from "@/lib/ui";
import { Modal } from "@/lib/modal";
import { readApiError } from "@/lib/api";
import {
  isOfficeRole,
  poleLabels,
  roleLabels,
  statusLabels,
  type MemberRole,
  type MemberStatus,
  type Pole,
} from "./member-rules";
import { memberFormSchema } from "./member-schemas";
import {
  normalizeMemberView,
  type MemberView,
  type MemberViewPayload,
} from "./member-dto";
import { MemberTable, type MemberFiltersState } from "./member-table";
import { MemberFormSection } from "./member-form";
import type { MemberFormInput } from "./member-schemas";

type MembersClientProps = {
  initialMembers: MemberView[];
  canManage: boolean;
};

const emptyForm: MemberFormInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  year: "",
  status: "ACTIVE",
  role: "MEMBER",
  poles: [],
  photoUrl: "",
  joinedAt: "",
  internalNotes: "",
  discordUsername: "",
  password: "",
};

const roleStyles: Record<MemberRole, string> = {
  MEMBER: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  POLE_LEAD: "bg-amber-50 text-amber-700 ring-amber-200",
  PRESIDENT: "bg-purple-50 text-purple-700 ring-purple-200",
  TREASURER: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  VICE_TREASURER: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  SECRETARY: "bg-sky-50 text-sky-700 ring-sky-200",
};

const statusStyles: Record<MemberStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  INACTIVE: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  ALUMNI: "bg-blue-50 text-blue-700 ring-blue-200",
};

function fullName(member: MemberView) {
  return `${member.firstName} ${member.lastName}`;
}

function poleText(member: MemberView) {
  return member.poles.length > 0
    ? member.poles.map((pole) => poleLabels[pole]).join(", ")
    : "Bureau";
}

function toFormState(member: MemberView): MemberFormInput {
  return {
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone,
    year: member.year,
    status: member.status,
    role: member.role,
    poles: member.poles,
    photoUrl: member.photoUrl ?? "",
    joinedAt: member.joinedAt ?? "",
    internalNotes: member.internalNotes ?? "",
    discordUsername: member.discordUsername ?? "",
    password: "",
  };
}

export function MembersClient({ initialMembers, canManage }: MembersClientProps) {
  const [members, setMembers] = useState(initialMembers);
  const [selectedMemberId, setSelectedMemberId] = useState(
    initialMembers[0]?.id ?? null,
  );
  const [showForm, setShowForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [form, setForm] = useState<MemberFormInput>(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [filters, setFilters] = useState<MemberFiltersState>({
    search: "",
    pole: "ALL",
    role: "ALL",
    status: "ALL",
    year: "ALL",
  });

  const years = useMemo(
    () => Array.from(new Set(members.map((m) => m.year))).sort(),
    [members],
  );

  const stats = useMemo(
    () => ({
      total: members.length,
      active: members.filter((m) => m.status === "ACTIVE").length,
      office: members.filter((m) => isOfficeRole(m.role)).length,
      leads: members.filter((m) => m.role === "POLE_LEAD").length,
    }),
    [members],
  );

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.pole !== "ALL" ||
    filters.role !== "ALL" ||
    filters.status !== "ALL" ||
    filters.year !== "ALL";

  const filteredMembers = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return members.filter((member) => {
      const searchable = [
        member.firstName,
        member.lastName,
        member.email,
        member.phone,
        member.year,
        member.discordUsername ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return (
        (!search || searchable.includes(search)) &&
        (filters.pole === "ALL" || member.poles.includes(filters.pole as Pole)) &&
        (filters.role === "ALL" || member.role === filters.role) &&
        (filters.status === "ALL" || member.status === filters.status) &&
        (filters.year === "ALL" || member.year === filters.year)
      );
    });
  }, [filters, members]);

  const selectedMember =
    members.find((m) => m.id === selectedMemberId) ??
    filteredMembers[0] ??
    null;

  function countPoleLeads(pole: Pole, ignoredMemberId?: string | null) {
    return members.filter(
      (m) =>
        m.id !== ignoredMemberId &&
        m.role === "POLE_LEAD" &&
        m.poles.includes(pole),
    ).length;
  }

  function startCreate() {
    setEditingMemberId(null);
    setForm({ ...emptyForm });
    setErrors([]);
    setFeedback(null);
    setShowForm(true);
  }

  function startEdit(member: MemberView) {
    setEditingMemberId(member.id);
    setForm(toFormState(member));
    setSelectedMemberId(member.id);
    setErrors([]);
    setFeedback(null);
    setShowForm(true);
  }

  function clearFilters() {
    setFilters({ search: "", pole: "ALL", role: "ALL", status: "ALL", year: "ALL" });
  }

  function updateForm<K extends keyof MemberFormInput>(
    field: K,
    value: MemberFormInput[K],
  ) {
    setFeedback(null);
    setForm((currentForm) => {
      if (field === "role" && isOfficeRole(value as MemberRole)) {
        return { ...currentForm, [field]: value, poles: [] };
      }
      return { ...currentForm, [field]: value };
    });
  }

  function togglePole(pole: Pole) {
    setFeedback(null);
    setForm((currentForm) => {
      const exists = currentForm.poles.includes(pole);
      return {
        ...currentForm,
        poles: exists
          ? currentForm.poles.filter((p) => p !== pole)
          : [...currentForm.poles, pole],
      };
    });
  }

  async function submitMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = memberFormSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((i) => i.message));
      setFeedback(null);
      return;
    }

    const input = parsed.data;
    const nextErrors =
      input.role === "POLE_LEAD"
        ? input.poles
            .filter((pole) => countPoleLeads(pole, editingMemberId) >= 2)
            .map(
              (pole) => `Le pole ${poleLabels[pole]} a deja deux responsables.`,
            )
        : [];

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      setFeedback(null);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        editingMemberId
          ? `/api/members/${encodeURIComponent(editingMemberId)}`
          : "/api/members",
        {
          method: editingMemberId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      if (!response.ok) throw new Error(await readApiError(response));

      const payload = (await response.json()) as { member: MemberViewPayload };
      const savedMember = normalizeMemberView(payload.member);

      setMembers((current) => {
        if (!editingMemberId) return [...current, savedMember];
        return current.map((m) => (m.id === editingMemberId ? savedMember : m));
      });
      setSelectedMemberId(savedMember.id);
      setErrors([]);
      setShowForm(false);
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : "Enregistrement impossible.",
      ]);
      setFeedback(null);
    } finally {
      setIsSaving(false);
    }
  }

  async function deactivateMember(memberId: string) {
    const member = members.find((m) => m.id === memberId);
    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/members/${encodeURIComponent(memberId)}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error(await readApiError(response));

      const payload = (await response.json()) as { member: MemberViewPayload };
      const savedMember = normalizeMemberView(payload.member);

      setMembers((current) =>
        current.map((m) => (m.id === memberId ? savedMember : m)),
      );
      if (member) setFeedback(`${fullName(member)} est maintenant inactif.`);
      setErrors([]);
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : "Desactivation impossible.",
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
              Gestion des membres
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
                Nouveau membre
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
        <MemberTable
          stats={stats}
          years={years}
          filteredMembers={filteredMembers}
          selectedMemberId={selectedMemberId}
          isSaving={isSaving}
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          canManage={canManage}
          onSelectMember={(id) => setSelectedMemberId(id)}
          onEdit={canManage ? startEdit : undefined}
          onDeactivate={canManage ? deactivateMember : undefined}
          onClearFilters={clearFilters}
          onFilterChange={(partial) =>
            setFilters((prev) => ({ ...prev, ...partial }))
          }
        />

        <aside>
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                <UserRound className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="font-semibold text-zinc-950">
                  {selectedMember ? fullName(selectedMember) : "Aucun membre"}
                </h2>
                <p className="text-sm text-zinc-500">
                  {selectedMember
                    ? selectedMember.email
                    : "Selectionner un membre"}
                </p>
              </div>
            </div>

            {selectedMember ? (
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <InfoItem label="Telephone" value={selectedMember.phone} />
                <InfoItem label="Annee" value={selectedMember.year} />
                <InfoItem label="Role" value={roleLabels[selectedMember.role]} />
                <InfoItem label="Statut" value={statusLabels[selectedMember.status]} />
                <div className="col-span-2 rounded-lg bg-zinc-50 p-3">
                  <dt className="text-zinc-500">Poles</dt>
                  <dd className="font-medium text-zinc-900">{poleText(selectedMember)}</dd>
                </div>
                {selectedMember.discordUsername ? (
                  <div className="col-span-2 rounded-lg bg-zinc-50 p-3">
                    <dt className="text-zinc-500">Discord</dt>
                    <dd className="font-medium text-zinc-900">{selectedMember.discordUsername}</dd>
                  </div>
                ) : null}
                <div className="col-span-2 flex gap-2">
                  <Badge className={roleStyles[selectedMember.role]}>
                    {roleLabels[selectedMember.role]}
                  </Badge>
                  <Badge className={statusStyles[selectedMember.status]}>
                    {statusLabels[selectedMember.status]}
                  </Badge>
                </div>
              </dl>
            ) : null}
          </section>
        </aside>
      </div>

      {canManage && <Modal
        open={showForm}
        title={editingMemberId ? "Modifier le membre" : "Nouveau membre"}
        onClose={() => setShowForm(false)}
      >
        <MemberFormSection
          editingMemberId={editingMemberId}
          form={form}
          errors={errors}
          feedback={feedback}
          isSaving={isSaving}
          onClose={() => setShowForm(false)}
          onSubmit={submitMember}
          onUpdateForm={updateForm}
          onTogglePole={togglePole}
        />
      </Modal>}
    </main>
  );
}

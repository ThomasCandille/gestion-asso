"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { Modal } from "@/lib/modal";
import { readApiError } from "@/lib/api";
import {
  isOfficeRole,
  memberFullName,
  poleLabels,
  type MemberRole,
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
import { MemberDetailPanel } from "./member-detail-panel";
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
  year: "A1",
  status: "ACTIVE",
  role: "MEMBER",
  poles: [],
  photoUrl: "",
  joinedAt: "",
  internalNotes: "",
  discordUsername: "",
  password: "",
};

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
      if (member) setFeedback(`${memberFullName(member)} est maintenant inactif.`);
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
          onClearFilters={() =>
            setFilters({ search: "", pole: "ALL", role: "ALL", status: "ALL", year: "ALL" })
          }
          onFilterChange={(partial) =>
            setFilters((prev) => ({ ...prev, ...partial }))
          }
        />

        <aside>
          <MemberDetailPanel member={selectedMember} />
        </aside>
      </div>

      {canManage && (
        <Modal
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
        </Modal>
      )}
    </main>
  );
}

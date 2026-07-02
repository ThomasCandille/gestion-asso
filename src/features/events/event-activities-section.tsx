import { Plus } from "lucide-react";
import { ActivityCard, type MemberOption } from "./activity-card";
import type { ActivityDto } from "./activity-service";

type ActivityView = ActivityDto;

type Props = {
  activities: ActivityView[];
  editingId: string | null;
  canManage: boolean;
  canRegister: boolean;
  currentMemberId: string;
  isSaving: boolean;
  members: MemberOption[];
  selectedMemberByActivity: Record<string, string>;
  onStartCreate: () => void;
  onStartEdit: (activity: ActivityView) => void;
  onDelete: (id: string) => void;
  onToggleSelf: (activity: ActivityView) => void;
  onRegisterMember: (activity: ActivityView, memberId: string) => void;
  onUnregisterMember: (activity: ActivityView, memberId: string) => void;
  onSelectMember: (activityId: string, memberId: string) => void;
};

export function EventActivitiesSection({
  activities,
  editingId,
  canManage,
  canRegister,
  currentMemberId,
  isSaving,
  members,
  selectedMemberByActivity,
  onStartCreate,
  onStartEdit,
  onDelete,
  onToggleSelf,
  onRegisterMember,
  onUnregisterMember,
  onSelectMember,
}: Props) {
  return (
    <div>
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
            onClick={onStartCreate}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 active:translate-y-0"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Nouvelle activite
          </button>
        ) : null}
      </div>

      <section className="space-y-3">
        {activities.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center">
            <p className="font-medium text-zinc-800">
              Aucune activite pour cet evenement.
            </p>
            {canManage ? (
              <button
                type="button"
                onClick={onStartCreate}
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
            onStartEdit={() => onStartEdit(activity)}
            onDelete={() => onDelete(activity.id)}
            onToggleSelf={() => onToggleSelf(activity)}
            onRegisterMember={(memberId) => onRegisterMember(activity, memberId)}
            onUnregisterMember={(memberId) => onUnregisterMember(activity, memberId)}
            onSelectMember={(memberId) => onSelectMember(activity.id, memberId)}
          />
        ))}
      </section>
    </div>
  );
}

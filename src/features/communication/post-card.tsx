"use client";

import { Pencil, Trash2, UserPlus, UserMinus } from "lucide-react";
import { Badge } from "@/lib/ui";
import {
  postStatusStyles,
  postTypeLabels,
  postTypeEmoji,
  communicationStatusLabels,
} from "./communication-rules";
import type { PostDto, MemberRef } from "./communication-service";

type MemberOption = { id: string; firstName: string; lastName: string };

type Props = {
  post: PostDto;
  canManage: boolean;
  memberOptions: MemberOption[];
  onEdit: (post: PostDto) => void;
  onDelete: (postId: string) => void;
  onAddAssignee: (postId: string, memberId: string) => void;
  onRemoveAssignee: (postId: string, memberId: string) => void;
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function memberName(m: MemberRef) {
  return `${m.firstName} ${m.lastName}`;
}

export function PostCard({
  post,
  canManage,
  memberOptions,
  onEdit,
  onDelete,
  onAddAssignee,
  onRemoveAssignee,
}: Props) {
  const assignedIds = new Set(post.assignees.map((a) => a.id));
  const availableToAdd = memberOptions.filter((m) => !assignedIds.has(m.id));

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-lg leading-none" aria-hidden>
            {postTypeEmoji[post.postType]}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-zinc-950">{post.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Badge className={postStatusStyles[post.status]}>
                {communicationStatusLabels[post.status]}
              </Badge>
              <Badge className="bg-zinc-100 text-zinc-600 ring-zinc-200">
                {postTypeLabels[post.postType]}
              </Badge>
              {post.scheduledAt ? (
                <span className="text-xs text-zinc-500">{formatDate(post.scheduledAt)}</span>
              ) : null}
            </div>
          </div>
        </div>

        {canManage ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(post)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
              aria-label="Modifier"
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onDelete(post.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
              aria-label="Supprimer"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>

      {post.content ? (
        <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-700 leading-relaxed">
          {post.content}
        </p>
      ) : null}

      {post.mediaDescription ? (
        <p className="mt-2 text-xs text-zinc-500 italic">{post.mediaDescription}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {post.author ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
            ✍️ {memberName(post.author)}
          </span>
        ) : null}

        {post.assignees.map((a) => (
          <span
            key={a.id}
            className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-violet-200"
          >
            {memberName(a)}
            {canManage ? (
              <button
                type="button"
                onClick={() => onRemoveAssignee(post.id, a.id)}
                className="ml-0.5 text-violet-400 transition hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-violet-500"
                aria-label={`Retirer ${memberName(a)}`}
              >
                <UserMinus className="h-3 w-3" aria-hidden />
              </button>
            ) : null}
          </span>
        ))}

        {canManage && availableToAdd.length > 0 ? (
          <select
            className="h-7 rounded-full border border-dashed border-violet-300 bg-transparent px-2 text-xs text-violet-600 outline-none transition hover:border-violet-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            value=""
            onChange={(e) => {
              if (e.target.value) onAddAssignee(post.id, e.target.value);
            }}
            aria-label="Ajouter un membre"
          >
            <option value="">+ Assigner</option>
            {availableToAdd.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName}
              </option>
            ))}
          </select>
        ) : null}

        {canManage && post.assignees.length === 0 && availableToAdd.length === 0 ? (
          <span className="text-xs text-zinc-400 flex items-center gap-1">
            <UserPlus className="h-3 w-3" aria-hidden />
            Aucun membre assigné
          </span>
        ) : null}
      </div>
    </article>
  );
}

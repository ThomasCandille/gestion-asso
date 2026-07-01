"use client";

import { ChevronDown, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/lib/ui";
import { campaignStatusStyles, communicationStatusLabels } from "./comm-rules";
import type { CampaignDto, PostDto } from "./comm-service";
import { PostCard } from "./post-card";

type MemberOption = { id: string; firstName: string; lastName: string };

type Props = {
  campaign: CampaignDto;
  expanded: boolean;
  canManage: boolean;
  memberOptions: MemberOption[];
  onToggle: () => void;
  onEditCampaign: (campaign: CampaignDto) => void;
  onDeleteCampaign: (campaignId: string) => void;
  onAddPost: (campaignId: string) => void;
  onEditPost: (post: PostDto) => void;
  onDeletePost: (postId: string) => void;
  onAddAssignee: (postId: string, memberId: string) => void;
  onRemoveAssignee: (postId: string, memberId: string) => void;
};

function formatEventDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const eventTypeLabels: Record<string, string> = {
  INTERNAL: "Interne",
  EXTERNAL: "Externe",
};

const eventTypeBadge: Record<string, string> = {
  INTERNAL: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  EXTERNAL: "bg-blue-50 text-blue-700 ring-blue-200",
};

export function CampaignCard({
  campaign,
  expanded,
  canManage,
  memberOptions,
  onToggle,
  onEditCampaign,
  onDeleteCampaign,
  onAddPost,
  onEditPost,
  onDeletePost,
  onAddAssignee,
  onRemoveAssignee,
}: Props) {
  const publishedCount = campaign.posts.filter((p) => p.status === "PUBLISHED").length;
  const totalCount = campaign.posts.length;

  return (
    <article className="rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300">
      <div className="flex items-center gap-3 px-5 py-4">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-3 flex-1 min-w-0 text-left transition hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-zinc-950 truncate">{campaign.title}</span>
              <Badge className={campaignStatusStyles[campaign.status]}>
                {communicationStatusLabels[campaign.status]}
              </Badge>
              <Badge className={eventTypeBadge[campaign.eventType] ?? "bg-zinc-100 text-zinc-600 ring-zinc-200"}>
                {eventTypeLabels[campaign.eventType] ?? campaign.eventType}
              </Badge>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
              <span className="truncate">{campaign.eventTitle}</span>
              {campaign.eventStartsAt ? (
                <span>{formatEventDate(campaign.eventStartsAt)}</span>
              ) : null}
              <span>
                {publishedCount}/{totalCount} publiés
              </span>
            </div>
          </div>
        </button>

        {canManage ? (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onAddPost(campaign.id)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs font-medium text-zinc-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Post
            </button>
            <button
              type="button"
              onClick={() => onEditCampaign(campaign)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
              aria-label="Modifier la campagne"
            >
              <Pencil className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onDeleteCampaign(campaign.id)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
              aria-label="Supprimer la campagne"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>

      {expanded ? (
        <div className="border-t border-zinc-100 px-5 pb-5 pt-4">
          {campaign.description ? (
            <p className="mb-4 text-sm text-zinc-600">{campaign.description}</p>
          ) : null}

          {campaign.posts.length === 0 ? (
            <p className="rounded-lg bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
              Aucun post pour cette campagne.
              {canManage ? " Cliquez sur « Post » pour en ajouter un." : ""}
            </p>
          ) : (
            <div className="space-y-3">
              {campaign.posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  canManage={canManage}
                  memberOptions={memberOptions}
                  onEdit={onEditPost}
                  onDelete={onDeletePost}
                  onAddAssignee={onAddAssignee}
                  onRemoveAssignee={onRemoveAssignee}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}

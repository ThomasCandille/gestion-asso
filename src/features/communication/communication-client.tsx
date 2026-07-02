"use client";

import { useState } from "react";
import { ArrowLeft, Megaphone, Plus } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/lib/ui";
import { Modal } from "@/lib/modal";
import type { CampaignDto, PostDto } from "./communication-service";
import type { CampaignFormInput, PostFormInput } from "./communication-schemas";
import { CampaignCard } from "./campaign-card";
import { CampaignForm } from "./campaign-form";
import { PostForm } from "./post-form";
import {
  apiAddAssignee,
  apiCreateCampaign,
  apiCreatePost,
  apiDeleteCampaign,
  apiDeletePost,
  apiRemoveAssignee,
  apiUpdateCampaign,
  apiUpdatePost,
} from "./communication-api";

type EventOption = { id: string; title: string };
type MemberOption = { id: string; firstName: string; lastName: string };

type Props = {
  initialCampaigns: CampaignDto[];
  eventOptions: EventOption[];
  memberOptions: MemberOption[];
  canManage: boolean;
};

const emptyCampaignForm: CampaignFormInput = {
  title: "",
  description: "",
  eventId: "",
  status: "DRAFT",
};

const emptyPostForm: PostFormInput = {
  title: "",
  postType: "POST",
  status: "IDEA",
  content: "",
  mediaDescription: "",
  scheduledAt: "",
  authorId: undefined,
};

export function CommClient({
  initialCampaigns,
  eventOptions,
  memberOptions,
  canManage,
}: Props) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [targetCampaignId, setTargetCampaignId] = useState<string | null>(null);

  const [campaignForm, setCampaignForm] = useState<CampaignFormInput>(emptyCampaignForm);
  const [postForm, setPostForm] = useState<PostFormInput>(emptyPostForm);

  const [campaignErrors, setCampaignErrors] = useState<string[]>([]);
  const [campaignFeedback, setCampaignFeedback] = useState<string | null>(null);
  const [postErrors, setPostErrors] = useState<string[]>([]);
  const [postFeedback, setPostFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const totalPosts = campaigns.reduce((sum, c) => sum + c.posts.length, 0);
  const publishedPosts = campaigns.reduce(
    (sum, c) => sum + c.posts.filter((p) => p.status === "PUBLISHED").length,
    0,
  );
  const activeCampaigns = campaigns.filter(
    (c) => c.status !== "CANCELLED" && c.status !== "PUBLISHED",
  ).length;

  function updateCampaignInState(updated: CampaignDto) {
    setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function updatePostInState(updated: PostDto) {
    setCampaigns((prev) =>
      prev.map((c) => ({
        ...c,
        posts: c.posts.map((p) => (p.id === updated.id ? updated : p)),
      })),
    );
  }

  function startCreateCampaign() {
    setEditingCampaignId(null);
    setCampaignForm(emptyCampaignForm);
    setCampaignErrors([]);
    setCampaignFeedback(null);
    setShowCampaignForm(true);
  }

  function startEditCampaign(campaign: CampaignDto) {
    setEditingCampaignId(campaign.id);
    setCampaignForm({
      title: campaign.title,
      description: campaign.description ?? "",
      eventId: campaign.eventId,
      status: campaign.status,
    });
    setCampaignErrors([]);
    setCampaignFeedback(null);
    setShowCampaignForm(true);
  }

  async function submitCampaign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setCampaignErrors([]);
    setCampaignFeedback(null);
    try {
      if (editingCampaignId) {
        const campaign = await apiUpdateCampaign(editingCampaignId, campaignForm);
        updateCampaignInState(campaign);
      } else {
        const campaign = await apiCreateCampaign(campaignForm);
        setCampaigns((prev) => [campaign, ...prev]);
        setExpandedId(campaign.id);
      }
      setShowCampaignForm(false);
    } catch (err) {
      setCampaignErrors([(err as Error).message]);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteCampaign(campaignId: string) {
    if (!confirm("Supprimer cette campagne et tous ses posts ?")) return;
    try {
      await apiDeleteCampaign(campaignId);
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    } catch (err) {
      setCampaignErrors([(err as Error).message]);
    }
  }

  function startCreatePost(campaignId: string) {
    setTargetCampaignId(campaignId);
    setEditingPostId(null);
    setPostForm(emptyPostForm);
    setPostErrors([]);
    setPostFeedback(null);
    setShowPostForm(true);
  }

  function startEditPost(post: PostDto) {
    setTargetCampaignId(post.campaignId);
    setEditingPostId(post.id);
    setPostForm({
      title: post.title,
      postType: post.postType,
      status: post.status,
      content: post.content ?? "",
      mediaDescription: post.mediaDescription ?? "",
      scheduledAt: post.scheduledAt ? post.scheduledAt.slice(0, 16) : "",
      authorId: post.author?.id,
    });
    setPostErrors([]);
    setPostFeedback(null);
    setShowPostForm(true);
  }

  async function submitPost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!targetCampaignId) return;
    setIsSaving(true);
    setPostErrors([]);
    setPostFeedback(null);
    try {
      if (editingPostId) {
        const post = await apiUpdatePost(targetCampaignId, editingPostId, postForm);
        updatePostInState(post);
      } else {
        const post = await apiCreatePost(targetCampaignId, postForm);
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === targetCampaignId ? { ...c, posts: [...c.posts, post] } : c,
          ),
        );
      }
      setShowPostForm(false);
    } catch (err) {
      setPostErrors([(err as Error).message]);
    } finally {
      setIsSaving(false);
    }
  }

  async function deletePost(postId: string) {
    if (!confirm("Supprimer ce post ?")) return;
    const post = campaigns.flatMap((c) => c.posts).find((p) => p.id === postId);
    if (!post) return;
    try {
      await apiDeletePost(post.campaignId, postId);
      setCampaigns((prev) =>
        prev.map((c) => ({
          ...c,
          posts: c.posts.filter((p) => p.id !== postId),
        })),
      );
    } catch (err) {
      setPostErrors([(err as Error).message]);
    }
  }

  async function addAssignee(postId: string, memberId: string) {
    const post = campaigns.flatMap((c) => c.posts).find((p) => p.id === postId);
    if (!post) return;
    try {
      const updated = await apiAddAssignee(post.campaignId, postId, memberId);
      updatePostInState(updated);
    } catch (err) {
      setPostErrors([(err as Error).message]);
    }
  }

  async function removeAssignee(postId: string, memberId: string) {
    const post = campaigns.flatMap((c) => c.posts).find((p) => p.id === postId);
    if (!post) return;
    try {
      const updated = await apiRemoveAssignee(post.campaignId, postId, memberId);
      updatePostInState(updated);
    } catch (err) {
      setPostErrors([(err as Error).message]);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-600 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Retour
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-zinc-950">Communication</h1>
              <p className="text-sm text-zinc-500">
                Campagnes Instagram @pulviimpact — publications liées aux événements
              </p>
            </div>
          </div>
          {canManage ? (
            <button
              type="button"
              onClick={startCreateCampaign}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 active:translate-y-0"
            >
              <Megaphone className="h-4 w-4" aria-hidden />
              Nouvelle campagne
            </button>
          ) : null}
        </div>

        <div className="mb-8 grid grid-cols-3 gap-4">
          <StatCard label="Campagnes actives" value={activeCampaigns} tone="violet" />
          <StatCard label="Posts total" value={totalPosts} tone="blue" />
          <StatCard label="Posts publiés" value={publishedPosts} tone="emerald" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-950">
              Campagnes ({campaigns.length})
            </h2>
            {canManage ? (
              <button
                type="button"
                onClick={startCreateCampaign}
                className="inline-flex h-8 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Nouvelle campagne
              </button>
            ) : null}
          </div>

          {campaigns.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
              <Megaphone className="mx-auto h-8 w-8 text-zinc-300" aria-hidden />
              <p className="mt-3 font-medium text-zinc-500">Aucune campagne</p>
              {canManage ? (
                <p className="mt-1 text-sm text-zinc-400">
                  Créez votre première campagne de communication.
                </p>
              ) : null}
            </div>
          ) : (
            campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                expanded={expandedId === campaign.id}
                canManage={canManage}
                memberOptions={memberOptions}
                onToggle={() =>
                  setExpandedId((prev) => (prev === campaign.id ? null : campaign.id))
                }
                onEditCampaign={startEditCampaign}
                onDeleteCampaign={deleteCampaign}
                onAddPost={startCreatePost}
                onEditPost={startEditPost}
                onDeletePost={deletePost}
                onAddAssignee={addAssignee}
                onRemoveAssignee={removeAssignee}
              />
            ))
          )}
        </div>
      </div>

      <Modal
        open={showCampaignForm}
        title={editingCampaignId ? "Modifier la campagne" : "Nouvelle campagne"}
        onClose={() => setShowCampaignForm(false)}
      >
        <CampaignForm
          editingId={editingCampaignId}
          form={campaignForm}
          errors={campaignErrors}
          feedback={campaignFeedback}
          isSaving={isSaving}
          eventOptions={eventOptions}
          onClose={() => setShowCampaignForm(false)}
          onSubmit={submitCampaign}
          onUpdateForm={(field, value) =>
            setCampaignForm((prev) => ({ ...prev, [field]: value }))
          }
        />
      </Modal>

      <Modal
        open={showPostForm}
        title={editingPostId ? "Modifier le post" : "Nouveau post"}
        onClose={() => setShowPostForm(false)}
      >
        <PostForm
          editingId={editingPostId}
          form={postForm}
          errors={postErrors}
          feedback={postFeedback}
          isSaving={isSaving}
          memberOptions={memberOptions}
          onClose={() => setShowPostForm(false)}
          onSubmit={submitPost}
          onUpdateForm={(field, value) =>
            setPostForm((prev) => ({ ...prev, [field]: value }))
          }
        />
      </Modal>
    </div>
  );
}

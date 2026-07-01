export type CommunicationStatus =
  | "IDEA"
  | "DRAFT"
  | "IN_REVIEW"
  | "SCHEDULED"
  | "PUBLISHED"
  | "CANCELLED";

export type PostType = "POST" | "REEL" | "STORY" | "CAROUSEL";

export const communicationStatusValues: CommunicationStatus[] = [
  "IDEA",
  "DRAFT",
  "IN_REVIEW",
  "SCHEDULED",
  "PUBLISHED",
  "CANCELLED",
];

export const postTypeValues: PostType[] = ["POST", "REEL", "STORY", "CAROUSEL"];

export const communicationStatusLabels: Record<CommunicationStatus, string> = {
  IDEA: "Idée",
  DRAFT: "Brouillon",
  IN_REVIEW: "En révision",
  SCHEDULED: "Planifié",
  PUBLISHED: "Publié",
  CANCELLED: "Annulé",
};

export const postTypeLabels: Record<PostType, string> = {
  POST: "Post",
  REEL: "Reel",
  STORY: "Story",
  CAROUSEL: "Carrousel",
};

export const postTypeEmoji: Record<PostType, string> = {
  POST: "🖼️",
  REEL: "🎬",
  STORY: "⏱️",
  CAROUSEL: "📚",
};

export const campaignStatusStyles: Record<CommunicationStatus, string> = {
  IDEA: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  DRAFT: "bg-blue-50 text-blue-700 ring-blue-200",
  IN_REVIEW: "bg-amber-50 text-amber-700 ring-amber-200",
  SCHEDULED: "bg-violet-50 text-violet-700 ring-violet-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 ring-red-200",
};

export const postStatusStyles: Record<CommunicationStatus, string> = {
  IDEA: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  DRAFT: "bg-blue-50 text-blue-700 ring-blue-200",
  IN_REVIEW: "bg-amber-50 text-amber-700 ring-amber-200",
  SCHEDULED: "bg-violet-50 text-violet-700 ring-violet-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 ring-red-200",
};

export const activeStatuses: CommunicationStatus[] = [
  "IDEA",
  "DRAFT",
  "IN_REVIEW",
  "SCHEDULED",
];

import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/client";
import type { AppSession } from "@/server/auth/session";
import { hasPermission } from "@/server/permissions";
import type { CommunicationStatus, PostType } from "./communication-rules";
import { campaignFormSchema, postFormSchema } from "./communication-schemas";
import { createCampaignSheet } from "@/server/integrations/communication-sheet";

export class CommPermissionError extends Error {
  constructor(message = "Action communication non autorisée.") {
    super(message);
    this.name = "CommPermissionError";
  }
}

function assertCanManage(actor: AppSession) {
  if (!hasPermission(actor.role, "communication:manage")) {
    throw new CommPermissionError();
  }
}

// ─── Selects ─────────────────────────────────────────────────────────────────

const postSelect = {
  id: true,
  campaignId: true,
  eventId: true,
  title: true,
  postType: true,
  content: true,
  mediaDescription: true,
  scheduledAt: true,
  publishedAt: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  author: { select: { id: true, firstName: true, lastName: true } },
  assignees: {
    select: {
      memberId: true,
      member: { select: { id: true, firstName: true, lastName: true } },
    },
  },
} satisfies Prisma.CommunicationPostSelect;

const campaignSelect = {
  id: true,
  eventId: true,
  title: true,
  description: true,
  status: true,
  sheetId: true,
  sheetUrl: true,
  createdAt: true,
  updatedAt: true,
  event: { select: { id: true, title: true, type: true, startsAt: true, status: true } },
  posts: { select: postSelect, orderBy: { scheduledAt: { sort: "asc", nulls: "last" } } },
} satisfies Prisma.CommunicationCampaignSelect;

// ─── DTOs ─────────────────────────────────────────────────────────────────────

type PostRow = Prisma.CommunicationPostGetPayload<{ select: typeof postSelect }>;
type CampaignRow = Prisma.CommunicationCampaignGetPayload<{ select: typeof campaignSelect }>;

export type MemberRef = { id: string; firstName: string; lastName: string };

export type PostDto = {
  id: string;
  campaignId: string;
  eventId: string;
  title: string;
  postType: PostType;
  content: string | null;
  mediaDescription: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  status: CommunicationStatus;
  createdAt: string;
  author: MemberRef | null;
  assignees: MemberRef[];
};

export type CampaignDto = {
  id: string;
  eventId: string;
  eventTitle: string;
  eventType: string;
  eventStartsAt: string | null;
  eventStatus: string;
  title: string;
  description: string | null;
  status: CommunicationStatus;
  sheetId: string | null;
  sheetUrl: string | null;
  createdAt: string;
  posts: PostDto[];
};

function toPostDto(row: PostRow): PostDto {
  return {
    id: row.id,
    campaignId: row.campaignId,
    eventId: row.eventId,
    title: row.title,
    postType: row.postType as PostType,
    content: row.content,
    mediaDescription: row.mediaDescription,
    scheduledAt: row.scheduledAt?.toISOString() ?? null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    status: row.status as CommunicationStatus,
    createdAt: row.createdAt.toISOString(),
    author: row.author ?? null,
    assignees: row.assignees.map((a) => a.member),
  };
}

function toCampaignDto(row: CampaignRow): CampaignDto {
  return {
    id: row.id,
    eventId: row.eventId,
    eventTitle: row.event.title,
    eventType: row.event.type,
    eventStartsAt: row.event.startsAt?.toISOString() ?? null,
    eventStatus: row.event.status,
    title: row.title,
    description: row.description,
    status: row.status as CommunicationStatus,
    sheetId: row.sheetId,
    sheetUrl: row.sheetUrl,
    createdAt: row.createdAt.toISOString(),
    posts: row.posts.map(toPostDto),
  };
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export async function listCampaigns(): Promise<CampaignDto[]> {
  const rows = await prisma.communicationCampaign.findMany({
    select: campaignSelect,
    orderBy: [{ event: { startsAt: { sort: "asc", nulls: "last" } } }, { createdAt: "desc" }],
  });
  return rows.map(toCampaignDto);
}

export async function createCampaign(actor: AppSession, input: unknown): Promise<CampaignDto> {
  assertCanManage(actor);
  const parsed = campaignFormSchema.parse(input);

  const row = await prisma.communicationCampaign.create({
    data: {
      eventId: parsed.eventId,
      title: parsed.title,
      description: parsed.description || null,
      status: parsed.status,
    },
    select: campaignSelect,
  });

  const dto = toCampaignDto(row);

  try {
    const sheet = await createCampaignSheet(dto);
    if (sheet) {
      await prisma.communicationCampaign.update({
        where: { id: row.id },
        data: { sheetId: sheet.sheetId, sheetUrl: sheet.sheetUrl },
      });
      dto.sheetId = sheet.sheetId;
      dto.sheetUrl = sheet.sheetUrl;
    }
  } catch {
    // L'échec de la création du Sheet ne bloque pas la création de la campagne
  }

  return dto;
}

export async function updateCampaign(
  actor: AppSession,
  campaignId: string,
  input: unknown,
): Promise<CampaignDto> {
  assertCanManage(actor);
  const parsed = campaignFormSchema.parse(input);

  const row = await prisma.communicationCampaign.update({
    where: { id: campaignId },
    data: {
      title: parsed.title,
      description: parsed.description || null,
      status: parsed.status,
    },
    select: campaignSelect,
  });
  return toCampaignDto(row);
}

export async function deleteCampaign(actor: AppSession, campaignId: string): Promise<void> {
  assertCanManage(actor);
  await prisma.communicationCampaign.delete({ where: { id: campaignId } });
}

// ─── Posts ────────────────────────────────────────────────────────────────────

async function getCampaignEventId(campaignId: string): Promise<string> {
  const c = await prisma.communicationCampaign.findUniqueOrThrow({
    where: { id: campaignId },
    select: { eventId: true },
  });
  return c.eventId;
}

async function refetchPost(postId: string): Promise<PostDto> {
  const row = await prisma.communicationPost.findUniqueOrThrow({
    where: { id: postId },
    select: postSelect,
  });
  return toPostDto(row);
}

export async function createPost(
  actor: AppSession,
  campaignId: string,
  input: unknown,
): Promise<PostDto> {
  assertCanManage(actor);
  const parsed = postFormSchema.parse(input);
  const eventId = await getCampaignEventId(campaignId);

  const createData: Prisma.CommunicationPostUncheckedCreateInput = {
    campaignId,
    eventId,
    title: parsed.title,
    postType: parsed.postType,
    status: parsed.status,
    content: parsed.content || null,
    mediaDescription: parsed.mediaDescription || null,
    scheduledAt: parsed.scheduledAt ? new Date(parsed.scheduledAt) : null,
    authorId: parsed.authorId ?? null,
  };

  const created = await prisma.communicationPost.create({ data: createData });
  return refetchPost(created.id);
}

export async function updatePost(
  actor: AppSession,
  postId: string,
  input: unknown,
): Promise<PostDto> {
  assertCanManage(actor);
  const parsed = postFormSchema.parse(input);

  const updateData: Prisma.CommunicationPostUncheckedUpdateInput = {
    title: parsed.title,
    postType: parsed.postType,
    status: parsed.status,
    content: parsed.content || null,
    mediaDescription: parsed.mediaDescription || null,
    scheduledAt: parsed.scheduledAt ? new Date(parsed.scheduledAt) : null,
    authorId: parsed.authorId ?? null,
    publishedAt: parsed.status === "PUBLISHED" ? new Date() : null,
  };

  await prisma.communicationPost.update({ where: { id: postId }, data: updateData });
  return refetchPost(postId);
}

export async function deletePost(actor: AppSession, postId: string): Promise<void> {
  assertCanManage(actor);
  await prisma.communicationPost.delete({ where: { id: postId } });
}

// ─── Assignees ────────────────────────────────────────────────────────────────

export async function addAssignee(
  actor: AppSession,
  postId: string,
  memberId: string,
): Promise<PostDto> {
  assertCanManage(actor);

  const existing = await prisma.postAssignee.findFirst({ where: { postId, memberId } });
  if (!existing) {
    await prisma.postAssignee.create({ data: { postId, memberId } });
  }
  return refetchPost(postId);
}

export async function removeAssignee(
  actor: AppSession,
  postId: string,
  memberId: string,
): Promise<PostDto> {
  assertCanManage(actor);
  await prisma.postAssignee.deleteMany({ where: { postId, memberId } });
  return refetchPost(postId);
}

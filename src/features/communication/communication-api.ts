import { readApiError } from "@/lib/api";
import type { CampaignDto, PostDto } from "./communication-service";
import type { CampaignFormInput, PostFormInput } from "./communication-schemas";

export async function apiCreateCampaign(form: CampaignFormInput): Promise<CampaignDto> {
  const payload = { ...form, description: form.description || undefined };
  const res = await fetch("/api/communication/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const { campaign } = (await res.json()) as { campaign: CampaignDto };
  return campaign;
}

export async function apiUpdateCampaign(
  id: string,
  form: CampaignFormInput,
): Promise<CampaignDto> {
  const payload = { ...form, description: form.description || undefined };
  const res = await fetch(`/api/communication/campaigns/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const { campaign } = (await res.json()) as { campaign: CampaignDto };
  return campaign;
}

export async function apiDeleteCampaign(id: string): Promise<void> {
  const res = await fetch(`/api/communication/campaigns/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await readApiError(res));
}

export async function apiCreatePost(
  campaignId: string,
  form: PostFormInput,
): Promise<PostDto> {
  const payload = {
    ...form,
    content: form.content || undefined,
    mediaDescription: form.mediaDescription || undefined,
    scheduledAt: form.scheduledAt || undefined,
  };
  const res = await fetch(`/api/communication/campaigns/${campaignId}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const { post } = (await res.json()) as { post: PostDto };
  return post;
}

export async function apiUpdatePost(
  campaignId: string,
  postId: string,
  form: PostFormInput,
): Promise<PostDto> {
  const payload = {
    ...form,
    content: form.content || undefined,
    mediaDescription: form.mediaDescription || undefined,
    scheduledAt: form.scheduledAt || undefined,
  };
  const res = await fetch(
    `/api/communication/campaigns/${campaignId}/posts/${postId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) throw new Error(await readApiError(res));
  const { post } = (await res.json()) as { post: PostDto };
  return post;
}

export async function apiDeletePost(campaignId: string, postId: string): Promise<void> {
  const res = await fetch(
    `/api/communication/campaigns/${campaignId}/posts/${postId}`,
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error(await readApiError(res));
}

export async function apiAddAssignee(
  campaignId: string,
  postId: string,
  memberId: string,
): Promise<PostDto> {
  const res = await fetch(
    `/api/communication/campaigns/${campaignId}/posts/${postId}/assignees`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    },
  );
  if (!res.ok) throw new Error(await readApiError(res));
  const { post } = (await res.json()) as { post: PostDto };
  return post;
}

export async function apiRemoveAssignee(
  campaignId: string,
  postId: string,
  memberId: string,
): Promise<PostDto> {
  const res = await fetch(
    `/api/communication/campaigns/${campaignId}/posts/${postId}/assignees`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    },
  );
  if (!res.ok) throw new Error(await readApiError(res));
  const { post } = (await res.json()) as { post: PostDto };
  return post;
}

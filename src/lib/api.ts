export async function readApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as {
      error?: string;
      details?: { message?: string }[];
    };
    const details = payload.details?.map((d) => d.message).filter(Boolean);
    if (details?.length) return details.join(" ");
    return payload.error ?? "Erreur serveur.";
  } catch {
    return "Erreur serveur.";
  }
}

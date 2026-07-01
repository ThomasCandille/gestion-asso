import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function routeErrorResponse(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation invalide.", details: error.issues },
      { status: 400 },
    );
  }
  if (error instanceof Error) {
    if (error.name.endsWith("PermissionError")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.name.endsWith("RuleError")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
  }
  return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
}

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

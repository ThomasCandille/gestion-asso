import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  createBudgetEntry,
  listBudgetEntries,
  BudgetPermissionError,
} from "@/features/budget/budget-service";
import { budgetFiltersSchema } from "@/features/budget/budget-schemas";
import { getCurrentSession } from "@/server/auth/session";

function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation invalide.", details: error.issues },
      { status: 400 },
    );
  }
  if (error instanceof BudgetPermissionError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
}

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  try {
    const sp = new URL(request.url).searchParams;
    const filters = budgetFiltersSchema.parse({
      type: sp.get("type") || undefined,
      eventId: sp.get("eventId") || undefined,
      from: sp.get("from") || undefined,
      to: sp.get("to") || undefined,
    });
    return NextResponse.json({ entries: await listBudgetEntries(filters) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  try {
    const entry = await createBudgetEntry(session, await request.json());
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  updateBudgetEntry,
  deleteBudgetEntry,
  BudgetPermissionError,
} from "@/features/budget/budget-service";
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

type Params = { params: Promise<{ entryId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const { entryId } = await params;
  try {
    const entry = await updateBudgetEntry(session, entryId, await request.json());
    return NextResponse.json({ entry });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const { entryId } = await params;
  try {
    await deleteBudgetEntry(session, entryId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

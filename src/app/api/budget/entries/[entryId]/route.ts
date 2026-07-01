import { NextResponse } from "next/server";
import { routeErrorResponse } from "@/lib/api";
import {
  updateBudgetEntry,
  deleteBudgetEntry,
} from "@/features/budget/budget-service";
import { getCurrentSession } from "@/server/auth/session";


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
    return routeErrorResponse(error);
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
    return routeErrorResponse(error);
  }
}

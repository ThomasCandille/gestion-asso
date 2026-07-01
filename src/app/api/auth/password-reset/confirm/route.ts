import { NextResponse } from "next/server";
import { z } from "zod";
import { confirmPasswordReset } from "@/features/members/member-service";

const confirmSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const { token, password } = confirmSchema.parse(await request.json());
  await confirmPasswordReset(token, password);

  return NextResponse.json({ ok: true });
}

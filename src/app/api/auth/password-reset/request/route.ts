import { NextResponse } from "next/server";
import { z } from "zod";
import { requestPasswordReset } from "@/features/members/member-service";

const requestSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const { email } = requestSchema.parse(await request.json());
  await requestPasswordReset(email);

  return NextResponse.json({
    ok: true,
    message: "Si un compte existe, un lien de reinitialisation sera envoye.",
  });
}

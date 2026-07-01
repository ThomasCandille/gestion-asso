"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type DemoProfile = "bureau" | "responsable" | "membre";

export async function login(profile: DemoProfile) {
  const cookieStore = await cookies();
  cookieStore.set("demo-profile", profile, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("demo-profile");
  redirect("/auth/login");
}

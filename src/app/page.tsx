import { redirect } from "next/navigation";
import {
  BadgeEuro,
  CalendarDays,
  FileText,
  LogOut,
  Megaphone,
  Package,
  Users,
} from "lucide-react";
import Link from "next/link";
import { getCurrentSession } from "@/server/auth/session";
import { logout } from "@/app/auth/login/actions";

export const dynamic = "force-dynamic";

const profileLabels: Record<string, string> = {
  PRESIDENT: "Bureau",
  POLE_LEAD: "Responsable",
  MEMBER: "Membre",
};

const modules = [
  {
    title: "Membres",
    value: "Roles et poles",
    icon: Users,
    accent: "bg-blue-50 text-blue-700 ring-blue-100",
    href: "/membres",
  },
  {
    title: "Evenements",
    value: "Interne / externe",
    icon: CalendarDays,
    accent: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    href: "/evenements",
  },
  {
    title: "Budget",
    value: "Recettes / depenses",
    icon: BadgeEuro,
    accent: "bg-amber-50 text-amber-700 ring-amber-100",
    href: "/budget",
  },
  {
    title: "Communication",
    value: "Planning editorial",
    icon: Megaphone,
    accent: "bg-rose-50 text-rose-700 ring-rose-100",
    href: "/communication",
  },
  {
    title: "Inventaire",
    value: "Stocks et commandes",
    icon: Package,
    accent: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    href: "/inventaire",
  },
  {
    title: "Documents",
    value: "Drive et Docs",
    icon: FileText,
    accent: "bg-violet-50 text-violet-700 ring-violet-100",
    href: "/documents",
  },
];

export default async function Home() {
  const session = await getCurrentSession();
  if (!session) redirect("/auth/login");

  const profileLabel = profileLabels[session.role] ?? session.role;

  return (
    <main className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
              IIMPACT
            </p>
            <h1 className="mt-1 text-xl font-semibold text-zinc-950">
              Gestion association
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
              {profileLabel}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.title}
                href={module.href}
                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1 ${module.accent}`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 font-semibold text-zinc-950">
                  {module.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-600">{module.value}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

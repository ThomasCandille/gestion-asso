import {
  BadgeEuro,
  CalendarDays,
  FileText,
  Megaphone,
  Package,
  Users,
} from "lucide-react";
import Link from "next/link";

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

export default function Home() {
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
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;

            const content = (
              <>
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1 ${module.accent}`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 font-semibold text-zinc-950">
                  {module.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-600">{module.value}</p>
              </>
            );

            return (
              <Link
                key={module.title}
                href={module.href}
                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

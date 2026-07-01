import { login } from "./actions";

const profiles = [
  {
    id: "bureau" as const,
    label: "Bureau",
    description: "Tous les droits",
    detail: "Membres, événements, budget, communication, inventaire, documents.",
    accent: "border-purple-200 bg-purple-50 hover:border-purple-300 hover:bg-purple-100",
    badge: "bg-purple-100 text-purple-700",
  },
  {
    id: "responsable" as const,
    label: "Responsable",
    description: "Événements & documents",
    detail: "Créer et modifier des événements. Consultation des membres. Pas d'accès au budget.",
    accent: "border-amber-200 bg-amber-50 hover:border-amber-300 hover:bg-amber-100",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    id: "membre" as const,
    label: "Membre",
    description: "Consultation uniquement",
    detail: "Accès en lecture seule à toutes les sections. Aucune modification possible.",
    accent: "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50",
    badge: "bg-zinc-100 text-zinc-600",
  },
];

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
            IIMPACT
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-950">
            Connexion
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Choisissez votre profil pour accéder au site.
          </p>
        </div>

        <div className="space-y-3">
          {profiles.map((profile) => (
            <form key={profile.id} action={login.bind(null, profile.id)}>
              <button
                type="submit"
                className={`w-full rounded-xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${profile.accent}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-950">
                    {profile.label}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${profile.badge}`}
                  >
                    {profile.description}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-600">{profile.detail}</p>
              </button>
            </form>
          ))}
        </div>
      </div>
    </main>
  );
}

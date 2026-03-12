import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMembershipResolution } from "@/lib/auth/get-current-membership";

export default async function OnboardingPage() {
  const resolution = await getCurrentMembershipResolution();

  if (resolution.status === "unauthenticated") {
    redirect("/login");
  }

  if (resolution.status === "single-membership") {
    redirect("/dashboard");
  }

  if (resolution.status === "multiple-memberships") {
    redirect("/select-business");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-12">
      <section className="w-full rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Completa tu onboarding
        </h1>
        <p className="mt-3 text-zinc-600">
          Tu usuario esta autenticado, pero todavia no pertenece a un negocio en
          ReturnOS. Pide a un administrador que te invite o crea tu negocio para
          continuar.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Volver a login
          </Link>
        </div>
      </section>
    </main>
  );
}

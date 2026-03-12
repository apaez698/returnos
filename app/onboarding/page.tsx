import { redirect } from "next/navigation";
import Link from "next/link";
import { createBusinessOwnerAction } from "@/app/onboarding/actions";
import { BusinessOnboardingForm } from "@/features/onboarding/components/business-onboarding-form";
import { OnboardingSteps } from "@/features/onboarding/components/onboarding-steps";
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
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12">
      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Bienvenido a ReturnOS
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
            Configura tu negocio en menos de 1 minuto
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Pensado para panaderias y cafeterias: crea tu negocio, te vinculamos
            como owner y te llevamos al dashboard.
          </p>

          <div className="mt-6">
            <BusinessOnboardingForm action={createBusinessOwnerAction} />
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-medium">Ya tienes una invitacion de equipo?</p>
            <p className="mt-1">
              Si un owner/admin te invito, acepta tu acceso aqui.
            </p>
            <Link
              href="/accept-invitation"
              className="mt-3 inline-flex rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Aceptar invitacion
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Como funciona
          </h2>
          <OnboardingSteps />
        </div>
      </section>
    </main>
  );
}

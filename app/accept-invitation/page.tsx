import { redirect } from "next/navigation";
import { AcceptInvitationForm } from "@/features/team/components/accept-invitation-form";
import { getCurrentMembershipResolution } from "@/lib/auth/get-current-membership";

interface AcceptInvitationPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitationPage({
  searchParams,
}: AcceptInvitationPageProps) {
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

  const params = await searchParams;

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-6 py-12">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          Invitacion de equipo
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
          Acepta tu acceso a ReturnOS
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Ingresa el token que te compartio el owner/admin para unirte al
          negocio.
        </p>

        <div className="mt-6">
          <AcceptInvitationForm initialToken={params.token ?? ""} />
        </div>
      </section>
    </main>
  );
}

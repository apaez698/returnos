import { redirect } from "next/navigation";
import { getCurrentMembershipResolution } from "@/lib/auth/get-current-membership";

export default async function SelectBusinessPage() {
  const resolution = await getCurrentMembershipResolution();

  if (resolution.status === "unauthenticated") {
    redirect("/login");
  }

  if (resolution.status === "no-memberships") {
    redirect("/onboarding");
  }

  if (resolution.status === "single-membership") {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-12">
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Seleccion de negocio requerida
        </h1>
        <p className="mt-3 text-zinc-600">
          Tu cuenta pertenece a multiples negocios. Para continuar, selecciona
          uno como contexto activo.
        </p>

        <ul className="mt-6 space-y-3">
          {resolution.memberships.map((membership) => (
            <li
              key={membership.businessId}
              className="rounded-lg border border-zinc-200 p-4"
            >
              <p className="font-medium text-zinc-900">
                {membership.business.name}
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                /r/{membership.business.slug} · rol:{" "}
                {membership.role ?? "staff"}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

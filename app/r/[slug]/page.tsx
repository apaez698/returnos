import { getBusinessBySlug } from "@/lib/businesses/queries";
import { registerPublicCustomerAction } from "./actions";
import { PublicRegistrationForm } from "@/components/registration/public-registration-form";

type RegistrationPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function RegistrationPage({
  params,
}: RegistrationPageProps) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
            🔍
          </div>
          <h1 className="mt-5 text-xl font-bold text-slate-800">
            Página no encontrada
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            El enlace que seguiste no corresponde a ningún negocio registrado.
            Pide al establecimiento que te comparta el enlace correcto.
          </p>
        </div>
      </main>
    );
  }

  const action = registerPublicCustomerAction.bind(null, slug);

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <div className="flex flex-col items-center px-6 pb-6 pt-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl shadow-md">
          🎁
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          {business.name}
        </h1>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
          Regístrate gratis y empieza a acumular puntos en cada visita.
        </p>
      </div>

      {/* Card */}
      <div className="mx-auto w-full max-w-md flex-1 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <PublicRegistrationForm
            businessName={business.name}
            action={action}
          />
        </div>
      </div>

      {/* Footer */}
      <p className="py-8 text-center text-xs text-slate-400">
        Programa de lealtad con ReturnOS
      </p>
    </main>
  );
}

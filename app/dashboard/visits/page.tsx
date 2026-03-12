import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { VisitForm } from "@/components/visits/visit-form";
import { RecentVisitsTable } from "@/components/visits/recent-visits-table";
import { getCustomersForCurrentBusiness } from "@/lib/customers/data";
import { getRecentVisitsForCurrentBusiness } from "@/lib/visits/data";
import { createVisitAction } from "./actions";

export default async function DashboardVisitsPage() {
  let customers: Awaited<ReturnType<typeof getCustomersForCurrentBusiness>> =
    [];
  let visits: Awaited<ReturnType<typeof getRecentVisitsForCurrentBusiness>> =
    [];
  let error: string | null = null;

  try {
    [customers, visits] = await Promise.all([
      getCustomersForCurrentBusiness(),
      getRecentVisitsForCurrentBusiness(),
    ]);
  } catch (err) {
    if (err instanceof Error) {
      error = err.message;
    } else {
      error = "No se pudo cargar el modulo de visitas.";
    }
  }

  return (
    <DashboardLayout pageTitle="Visitas">
      <div className="space-y-6">
        <section className="mb-8">
          <p className="text-slate-600">
            Registra visitas de clientes en caja y mantiene sus puntos siempre
            actualizados.
          </p>
        </section>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-medium">No se pudo cargar visitas</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {!error && customers.length === 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Primero agrega al menos un cliente para poder registrar visitas.
          </div>
        )}

        {!error && (
          <VisitForm customers={customers} action={createVisitAction} />
        )}

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Visitas recientes
          </h2>
          {error ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
              No se puede mostrar el listado de visitas en este momento.
            </div>
          ) : (
            <RecentVisitsTable visits={visits} />
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

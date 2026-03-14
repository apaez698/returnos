import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CustomerForm } from "@/components/customers/customer-form";
import { CustomersTable } from "@/components/customers/customers-table";
import { getCustomersForCurrentBusiness } from "@/lib/customers/data";
import { createCustomerAction } from "./actions";

export default async function DashboardCustomersPage() {
  let customers: Awaited<ReturnType<typeof getCustomersForCurrentBusiness>> =
    [];
  let error: string | null = null;

  try {
    customers = await getCustomersForCurrentBusiness();
  } catch (err) {
    if (err instanceof Error) {
      error = err.message;
    } else {
      error = "No se pudo cargar los clientes.";
    }
  }

  return (
    <DashboardLayout pageTitle="Clientes">
      <div className="space-y-6">
        {/* Introduction Section */}
        <section className="mb-8">
          <p className="dashboard-explainer text-slate-600">
            Gestiona los clientes de tu negocio. Puedes agregar clientes
            manualmente para rastrear sus visitas, recompensas y preferencias.
          </p>
        </section>

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-medium">No se puede acceder a los clientes</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* Customer Form Section */}
        {!error && <CustomerForm action={createCustomerAction} />}

        {/* Customer List Section */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Listado de clientes
          </h2>
          {error ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
              No se puede mostrar el listado de clientes en este momento.
            </div>
          ) : (
            <CustomersTable customers={customers} />
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

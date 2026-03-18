import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { InactiveCustomersList } from "@/components/customers/inactive-customers-list";
import { getCustomersWithPointsForCurrentBusiness } from "@/lib/customers/data";
import {
  getInactiveCustomers,
  type InactiveCustomer,
} from "@/lib/customers/inactivity";

export default async function DashboardInactiveCustomersPage() {
  let inactiveCustomers: InactiveCustomer[] = [];
  let error: string | null = null;

  try {
    const customers = await getCustomersWithPointsForCurrentBusiness();
    inactiveCustomers = getInactiveCustomers(customers);
  } catch (err) {
    if (err instanceof Error) {
      error = err.message;
    } else {
      error = "No se pudieron cargar los clientes inactivos.";
    }
  }

  const sortedInactiveCustomers = [...inactiveCustomers].sort((a, b) => {
    const daysA = a.daysSinceLastVisit ?? Number.POSITIVE_INFINITY;
    const daysB = b.daysSinceLastVisit ?? Number.POSITIVE_INFINITY;

    return daysB - daysA;
  });

  return (
    <DashboardLayout pageTitle="Clientes inactivos">
      <div className="space-y-6">
        <section>
          <p className="dashboard-explainer text-slate-600">
            Clientes que no han visitado en los últimos 14 días. Revísalos y
            vuelve a involucrarlos para aumentar la retención.
          </p>
        </section>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-medium">
              No se pudieron cargar los clientes inactivos
            </p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {!error && (
          <InactiveCustomersList customers={sortedInactiveCustomers} />
        )}
      </div>
    </DashboardLayout>
  );
}

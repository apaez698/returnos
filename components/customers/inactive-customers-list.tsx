"use client";

import { InactiveCustomer } from "@/lib/customers/inactivity";

interface InactiveCustomersListProps {
  customers: InactiveCustomer[];
}

export function InactiveCustomersList({
  customers,
}: InactiveCustomersListProps) {
  const sortedCustomers = [...customers].sort((a, b) => {
    const daysA = a.daysSinceLastVisit ?? Number.POSITIVE_INFINITY;
    const daysB = b.daysSinceLastVisit ?? Number.POSITIVE_INFINITY;

    return daysB - daysA;
  });

  if (customers.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-12 text-center">
        <p className="text-slate-600">
          No hay clientes inactivos. ¡Todos están comprometidos!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Cliente
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Teléfono
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Puntos
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Última Visita
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Días Inactivo
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {sortedCustomers.map((customer) => (
            <tr key={customer.customerId} className="hover:bg-slate-50">
              <td className="px-6 py-4">
                <p className="font-medium text-slate-900">{customer.name}</p>
              </td>
              <td className="px-6 py-4">
                <p className="text-slate-600">{customer.phone}</p>
              </td>
              <td className="px-6 py-4">
                <p className="text-slate-600">{customer.points}</p>
              </td>
              <td className="px-6 py-4">
                <p className="text-slate-600 text-sm">
                  {customer.lastVisitAt
                    ? new Date(customer.lastVisitAt).toLocaleDateString("es-ES")
                    : "Nunca"}
                </p>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800">
                  {customer.daysSinceLastVisit ?? "∞"} días
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

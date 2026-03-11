import { CustomerListItem } from "@/lib/customers/types";

interface CustomersTableProps {
  customers: CustomerListItem[];
}

function formatDate(dateInput: string | null): string {
  if (!dateInput) {
    return "-";
  }

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function CustomersTable({ customers }: CustomersTableProps) {
  if (customers.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Todavia no hay clientes registrados para este negocio.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-slate-700">
          <tr>
            <th className="px-4 py-3 font-semibold">Nombre</th>
            <th className="px-4 py-3 font-semibold">Telefono</th>
            <th className="px-4 py-3 font-semibold">Correo</th>
            <th className="px-4 py-3 font-semibold">Cumpleanos</th>
            <th className="px-4 py-3 font-semibold">Consentimiento</th>
            <th className="px-4 py-3 font-semibold">Ultima visita</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="px-4 py-3">{customer.name}</td>
              <td className="px-4 py-3">{customer.phone}</td>
              <td className="px-4 py-3">{customer.email || "-"}</td>
              <td className="px-4 py-3">{formatDate(customer.birthday)}</td>
              <td className="px-4 py-3">
                {customer.consent_marketing ? "Si" : "No"}
              </td>
              <td className="px-4 py-3">
                {formatDate(customer.last_visit_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
